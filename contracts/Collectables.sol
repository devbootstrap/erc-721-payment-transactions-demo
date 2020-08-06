pragma solidity >= 0.5.0 < 0.7.0;

import '@openzeppelin/contracts/token/ERC721/ERC721Metadata.sol';

contract Collectables is ERC721Metadata {

  struct CollectableInfo {
    string name;
    uint256 price;
  }

  mapping(uint256 => CollectableInfo) public tokenIdToCollectableInfo;

  uint256[] tokenIds;

  constructor(string memory _name, string memory _symbol)
    ERC721Metadata(_name, _symbol) public {}

  function createCollectable( uint256 _tokenId,
                              string memory _name,
                              uint256 _price) public {
    CollectableInfo memory collectable = CollectableInfo({
      name: _name,
      price: _price
    });
    tokenIdToCollectableInfo[_tokenId] = collectable;
    tokenIds.push(_tokenId);
    _mint(msg.sender, _tokenId);
  }

  // Function that allows you to convert an address into a payable address
  function _make_payable(address x) internal pure returns (address payable) {
      return address(uint160(x));
  }

  function buyCollectable(uint256 _tokenId) public payable {
    address ownerAddress = ownerOf(_tokenId);
    uint256 collectablePrice = tokenIdToCollectableInfo[_tokenId].price;
    require(msg.sender != ownerAddress, 'You already own this collectable!');
    require(msg.value > collectablePrice, "You need to have enough Ether");
    _transferFrom(ownerAddress, msg.sender, _tokenId);
    address payable ownerAddressPayable = _make_payable(ownerAddress);
    ownerAddressPayable.transfer(collectablePrice);
    // return change!
    if(msg.value > collectablePrice) {
        msg.sender.transfer(msg.value - collectablePrice);
    }
  }

  function getCollectableTokenIds() public view returns(uint256[] memory) {
    return tokenIds;
  }

  function getCollectableItem(uint256 _tokenId) public view returns (string memory name,
                                                       uint256 price,
                                                       address owner) {
    return (tokenIdToCollectableInfo[_tokenId].name,
            tokenIdToCollectableInfo[_tokenId].price,
            ownerOf(_tokenId));
  }
}
