// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SilkRoad is ReentrancyGuard {
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;
    

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        uint percent;
        address payable seller;
        address payable manifacturer;
        address payable buyer;
        bool sold;
        bool dConfirm;
        bool mConfirm;
        bool bConfirm;
    }

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer,
        bool dConfirm,
        bool mConfirm
    );

    mapping(uint => Item) public items;

    constructor(uint _feePercent){
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function makeItem(IERC721 _nft, uint _tokenId, uint _price, uint _percent) external nonReentrant{
        require(_price > 0, "Price must be greater than zero");
        itemCount ++;
        
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            _percent,
            payable(msg.sender),
            payable(address(0)),
            payable(address(0)),
            false,
            false,
            false,
            false
        );

        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint _itemId) external payable nonReentrant{
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "Item does not exist");
        require(msg.value >= _totalPrice, "Not enough ether to cover item price and market fee");
        require(!item.sold, "Item already sold");
        item.buyer = payable(msg.sender);
        item.sold = true;
    }

    function confirmDesigner(uint _itemId) external{
        Item storage item = items[_itemId];
        item.dConfirm = true;
    }

    function confirmManifacturer(uint _itemId) external{
        Item storage item = items[_itemId];
        item.mConfirm = true;
        item.manifacturer = payable(msg.sender);
    }
    function confirmBuyer(uint _itemId) external{
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        item.bConfirm = true;
        item.seller.transfer(getPercentage(_itemId));
        item.manifacturer.transfer(item.price - getPercentage(_itemId));
        feeAccount.transfer(_totalPrice - item.price);
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        
        emit Bought(_itemId, address(item.nft), item.tokenId, item.price, item.seller, msg.sender, item.dConfirm, item.mConfirm);

    }

    function getTotalPrice(uint _itemId) view public returns(uint){
        return(items[_itemId].price *(100 + feePercent)/100);
    }
    
    function getPercentage(uint _itemId) view public returns(uint){
        return(items[_itemId].percent * items[_itemId].price / 100);
    }
}