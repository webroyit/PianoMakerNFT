pragma solidity >=0.4.21 <0.7.0;

import "./ERC721Full.sol";

contract PianoMaker is ERC721Full {
  string[] public songs;

  constructor() ERC721Full("Piano Marker NFT", "PMNFT") public {}

  // Create a new unique token
  function mint(string memory _song) public {
    uint _id = songs.push(_song);

    // Call _mint() from ERC721Full
    _mint(msg.sender, _id);
  }
}