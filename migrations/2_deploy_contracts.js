const PianoMaker = artifacts.require("PianoMaker");

module.exports = function (deployer) {
  deployer.deploy(PianoMaker);
};