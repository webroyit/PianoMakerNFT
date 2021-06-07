import React, { Component } from 'react';
import Web3 from 'web3';

import './App.css';
import PianoMaker from './abis/PianoMaker.json';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      contract: null,
      totalSupply: 0,
      songs: []
    }
  }
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
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
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    const networkData = PianoMaker.networks[networkId];

    if (networkData) {
      const abi = PianoMaker.abi;
      const address = networkData.address;

      // Get a copy of the smart contract
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract: contract });

      const totalSupply = await contract.methods.totalSupply().call();
      this.setState({ totalSupply: totalSupply });

      // Load Songs
      for (let i = 1; i <= totalSupply; i++) {
        const song = await contract.methods.songs(i - 1).call();
        this.setState({ songs: [...this.state.songs, song] });
      }

      console.log(this.state.songs);
    }
    else {
      window.alert('Smart contract not deployed to detected network.');
    }
    
  }

  mint = (song) => {
    console.log(song);
    let temp = JSON.stringify(song);
    this.state.contract.methods.mint(temp).send({ from: this.state.account })
      .once('recepit', (receipt) => {
        this.setState({ songs: [...this.state.songs, temp] });
      });
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-primary flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="/"
          >
            PianoMakerNFT
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>

        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Song List</h1>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => this.mint(window.songs)}
                >
                  Mint Song as NFT
                </button>
              </div>
            </main>
          </div>

          <div className="row text-center">
            { this.state.songs.map((song, key) => {
              return(
                <div key={key} className="col-md-3 mb-3">
                  <button className="btn btn-success">
                    Song #{key + 1}
                  </button>
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
