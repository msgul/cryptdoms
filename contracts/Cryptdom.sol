// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Cryptdom {

    struct kingdom{
        string kingdomName;
        uint8 r;
        uint8 g;
        uint8 b;
        uint8 isCreated;
    }

    address owner;
    uint8 constant landSize = 10;
    
    address[landSize ** 2] ownedBy;
    mapping (address => kingdom) ownerToKingdom;
    uint randNonce = 0;

    constructor() {
        owner = msg.sender;
    }

    modifier isOwner(){
        require(owner == msg.sender);
        _;
    }

    modifier landOwner(uint8 landId) {
        require(ownedBy[landId] == msg.sender, "This land does not belong to you!");
        _;
    }

    function randMod(uint modulus) internal returns(uint) {
        randNonce += 1;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % modulus;
    }

    function _isNeighbour(uint8 p1, uint8 p2) pure internal returns(bool) {
        if(p1 == p2 + 1 && p1 % landSize != 0)
            return true;
        if(p1 == p2 - 1 && p2 % landSize != 0)
            return true;
        if(p1 == p2 - landSize || p2 == p1 - landSize)
            return true;

        return false;
    }

    function buyLand(uint8 landId, string memory kingdomName, uint8 r, uint8 g, uint8 b) public payable {
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

    function attackLand(uint8 myLandId, uint8 landId) public landOwner(myLandId) {
        require(myLandId < landSize ** 2 && landId < landSize ** 2, "Please provide legit land id!");
        require(_isNeighbour(myLandId, landId), "You can only attack your neighbour lands!");
        address enemy = ownedBy[landId];
        uint result = randMod(100);
        if(result > 45)
            ownedBy[landId] = msg.sender;
        else
            ownedBy[myLandId] = enemy;
    }

    function viewMap() public view returns(address[] memory) {
        address[] memory map = new address[](landSize ** 2);
        for(uint8 i=0; i < landSize ** 2; i++) {
            map[i] = ownedBy[i];
        }
        return map;
    }
}