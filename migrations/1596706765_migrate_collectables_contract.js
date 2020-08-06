const Collectables = artifacts.require('Collectables')

module.exports = function(_deployer) {
  _deployer.deploy(Collectables, 'MyCollectableToken', 'MCT')
};
