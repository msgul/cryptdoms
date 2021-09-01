// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Cryptdoms {

    struct kingdom{
        string kingdomName;
        uint8 r;
        uint8 g;
        uint8 b;
        uint8 isCreated;
        uint224 balance;
    }

    address owner;
    uint8 constant landSize = 10;
    
    address[landSize ** 2] ownedBy;
    mapping (address => kingdom) ownerToKingdom;
    uint randNonce = 0;

    /* 
     * Consideration - Should it be able to receive ETH? 
     * This contract currently unable to receive ETH through send
     */ 

    constructor() {
        owner = msg.sender;
    }

    modifier isOwner(){
        require(owner == msg.sender);
        _;
    }

    modifier landOwner(uint landId) {
        require(ownedBy[landId] == msg.sender, "This land does not belong to you!");
        _;
    }

    function randMod(uint modulus) internal returns(uint) {
        randNonce += 1;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % modulus;
    }

    function _isNeighbour(uint p1, uint p2) pure internal returns(bool) {
        if(p1 == p2 + 1 && p1 % landSize != 0)
            return true;
        if(p1 == p2 - 1 && p2 % landSize != 0)
            return true;
        if(p1 == p2 - landSize || p2 == p1 - landSize)
            return true;

        return false;
    }

    function buyLand(uint landId, string memory kingdomName, uint8 r, uint8 g, uint8 b) public payable {
        require(landId < landSize ** 2 , "Please provide legit land id!");
        require(msg.value == 10, "You need to pay 10 WEI to buy a land!");
        require(ownedBy[landId] == address(0), "You can only buy unowned lands!");
        
        if (ownerToKingdom[msg.sender].isCreated == 0){
            ownerToKingdom[msg.sender].isCreated = 1;
            ownerToKingdom[msg.sender].kingdomName = kingdomName;
            ownerToKingdom[msg.sender].r = r;
            ownerToKingdom[msg.sender].g = g;
            ownerToKingdom[msg.sender].b = b;
        }
        
        ownedBy[landId] = msg.sender;
    }

    function attackLand(uint myLandId, uint landId) public landOwner(myLandId) {
        require(myLandId < landSize ** 2 && landId < landSize ** 2, "Please provide legit land id!");
        require(_isNeighbour(myLandId, landId), "You can only attack your neighbour lands!");
        address enemy = ownedBy[landId];
        uint result = randMod(100);
        if(result > 45)
            ownedBy[landId] = msg.sender;
        else
            ownedBy[myLandId] = enemy;
    }

    // Do we want to withdraw only a portion of the balance or all of it?
    function withdrawBalance(uint amount) public payable{
        require(ownerToKingdom[msg.sender].balance >= amount, "You cannot withdraw an amount that is more than you have!");
        ownerToKingdom[msg.sender].balance -= uint224(amount);
        (bool success, ) = msg.sender.call{value:amount}("");
        require(success, "Withdraw failed.");
    }
    

    // temporary deposit balance for kingdoms 
    function depositBalance(uint amount) public payable{
        require(msg.value == amount, "Amount and value is not equal!");
        ownerToKingdom[msg.sender].balance += uint224(amount);        
    }

    /* ----- View Functions ----- */

    function viewMap() public view returns(address[] memory) {
        address[] memory map = new address[](landSize ** 2);
        for(uint i=0; i < landSize ** 2; i++) {
            map[i] = ownedBy[i];
        }
        return map;
    }

    function getLandsByOwner() public view returns(uint[] memory) {
        uint size = 0;
        for(uint i=0; i < landSize ** 2; i++) {
            if(ownedBy[i] == msg.sender){
                size++;
            }
        }

        uint[] memory lands = new uint[](size) ;
        uint index = 0;
        for(uint i=0; i < landSize ** 2; i++) {
            if(ownedBy[i] == msg.sender){
                lands[index] = i;
                index++;
            }
        }
        return lands;
    }

    function getKingdom() public view returns(kingdom memory) {
        return ownerToKingdom[msg.sender];
    }

    function getKingdomByAddress(address _address) public view returns(kingdom memory) {
        kingdom memory userKingdom = ownerToKingdom[_address];
        return userKingdom;
    }

    function getKingdomByLand(uint landId) public view returns(kingdom memory) {
        kingdom memory userKingdom = ownerToKingdom[ownedBy[landId]];
        delete(userKingdom.balance);
        return userKingdom;
    }
}