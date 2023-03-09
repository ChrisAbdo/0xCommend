var NFT = artifacts.require('NFT');
var Commend = artifacts.require('Commend');

module.exports = async function (deployer) {
  await deployer.deploy(Commend);
  const commend = await Commend.deployed();
  await deployer.deploy(NFT, commend.address);
};