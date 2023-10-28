// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract AuctionContract {
    address public owner;
    uint constant DURATION = 1 days;
    uint fee = 10;

    struct Auction {
        address seller;
        uint startingPrice;
        uint finalPrice;
        uint startingAt;
        uint endingAt;
        uint discount;
        string item;
        bool stopped;
    }

    Auction[] public aucArray;

    event AuctionCreated(uint index, string itemName, uint startingPrice, uint duration);
    event AuctionEnded(uint index, uint finalPrice, address winner);

    constructor(){
        owner = payable(msg.sender);
    }

    function createAuc(uint _startingPrice, uint _duration, uint _discount, string memory _item) external {
        uint duration = _duration == 0 ? DURATION : _duration;
        require(_startingPrice >= _discount * duration, "not enought time to sell!");
        
        Auction memory newAuc = Auction({
            seller: payable(msg.sender),
            startingPrice: _startingPrice,
            finalPrice: 0,
            startingAt: block.timestamp,
            endingAt: block.timestamp + duration,
            discount: _discount,
            item: _item,
            stopped: false
        });
        aucArray.push(newAuc);

        emit AuctionCreated(aucArray.length - 1, _item, _startingPrice, _duration);
    }

    
    function getPrice(uint index) public view returns (uint) {
        uint discount = aucArray[index].discount;
        uint duration = block.timestamp - aucArray[index].startingAt;
        return aucArray[index].startingPrice - duration * discount;
    }

    function buyItem(uint index) external payable {
        Auction storage cAuc = aucArray[index];
        require(!cAuc.stopped, "the auction is stopped!");
        require(block.timestamp < cAuc.endingAt, "ended!");
        uint curPrice = getPrice(index);
        require(msg.value >= curPrice, "not enoght payed");
        
        cAuc.stopped = true;
        cAuc.finalPrice = curPrice;
        uint refund = msg.value - curPrice;
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }

        payable(cAuc.seller).transfer(curPrice - ((curPrice * fee) / 100));

        emit AuctionEnded(aucArray.length - 1, curPrice, msg.sender);

    }

    function withdraw() payable public {
        require(msg.sender == owner, "you're not the owner!");
        payable(owner).transfer(address(this).balance);
    }
}