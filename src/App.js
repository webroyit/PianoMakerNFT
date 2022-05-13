import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import PianoMaker from './abis/PianoMaker.json';
import UAuth from '@uauth/js';

const contract_address = "";
const key = "";

const ud = new UAuth({
  clientID: "",
  scope: 'openid email wallet',
  redirectUri: "http://localhost:3000/",
})

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      contract: null,
      songs: [],
      userData: {}
    }
  }
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    await this.loadNFTs();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    //this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    const networkData = PianoMaker.networks[networkId];

    if (networkData) {
      const abi = PianoMaker.abi;
      const address = networkData.address;

      // Get a copy of the smart contract
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract: contract });
    }
    else {
      window.alert('Smart contract not deployed to detected network.');
    }
    
  }

  async loadNFTs(){
    let data = await fetch(`https://api.covalenthq.com/v1/42/tokens/${contract_address}/nft_token_ids/?quote-currency=USD&format=JSON&key=${key}`);
    data = await data.json();
    console.log(data);
    let songs = data.data.items;
    console.log(songs);
    
    // Load Songs
    for (let i = 0; i < songs.length; i++) {
      let song = await this.state.contract.methods.songs(+songs[i].token_id - 1).call();
      song = JSON.parse(song);
      let song_data = {};
      song_data.value = song.map(s => s.key);
      song_data.notes = "";
      song_data.value.forEach(s => {
        song_data.notes += s + " ";
      });
      this.setState({ songs: [...this.state.songs, song_data] });
    }

    console.log(this.state.songs);
  }

  mint = (song) => {
    console.log(song);
    let temp = JSON.stringify(song);
    this.state.contract.methods.mint(temp).send({ from: this.state.account })
      .once('recepit', (receipt) => {
        this.setState({ songs: [...this.state.songs, temp] });
      });
  }

  loginUD = async () => {
		const user = await ud.loginWithPopup();
    this.setState({ account: user.idToken.sub});
	}
  

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-warning flex-md-nowrap p-0 shadow">
          <div className='container'>
            <a
                className="navbar-brand col-sm-3 col-md-2 mr-0"
                href="/"
              >
                <img className="logo" src="/logo.png" alt="logo" />
              </a>
              <ul className="navbar-nav px-3">
                <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                  <small className="text-white h5"><span id="account">{this.state.account}</span></small>
                </li>
              </ul>
            </div>  
        </nav>

        <div className="container mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1 className="card-title mt-3">Song List</h1>
                {this.state.account
                  ? (
                    <button
                      className="btn btn-warning btn-lg"
                      onClick={() => this.mint(window.songs)}
                    >
                      Mint Song as NFT
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={this.loginUD.bind(this)}
                    >
                      Login Unstoppable Domain 
                    </button>
                  )}
              </div>
            </main>
          </div>

          <div className="row text-center">
            { this.state.account && this.state.songs.map((song, key) => {
              return(
                <div key={key} className="col-md-3 mb-3 mt-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 class="card-title">Song #{key + 1}</h5>
                      <p className='mb-0'><u>Notes</u></p>
                      <p>{song.notes}</p>
                      <a href="#" class="btn btn-warning">Play</a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <hr />
        </div>
      </div>
    );
  }
}

export default App;
