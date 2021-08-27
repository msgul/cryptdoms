// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Cryptdom {

    struct kingdom{
        string kingdom_name;
        uint8 r;
        uint8 g;
        uint8 b;
        uint8 is_created;
    }

    address owner;
    uint8 constant land_size = 10;
    
    address[land_size ** 2] ownedBy;
    mapping (address => kingdom) owner_kingdom;
    uint rand_nonce = 0;

    constructor() {
        owner = msg.sender;
    }

    modifier is_owner(){
        require(owner == msg.sender);
        _;
    }

    modifier land_owner(uint8 land_id) {
        require(ownedBy[land_id] == msg.sender, "This land does not belong to you!");
        _;
    }

    function rand_mod(uint modulus) internal returns(uint) {
        rand_nonce += 1;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, rand_nonce))) % modulus;
    }

    function is_neighbour(uint8 p1, uint8 p2) pure internal returns(bool) {
        if(p1 == p2 + 1 && p1 % land_size != 0)
            return true;
        if(p1 == p2 - 1 && p2 % land_size != 0)
            return true;
        if(p1 == p2 - land_size || p2 == p1 - land_size)
            return true;

        return false;
    }

    function buy_land(uint8 land_id, string memory kingdom_name, uint8 r, uint8 g, uint8 b) public payable {
        require(msg.value == 10, "You need to pay 10 WEI to buy a land!");
        require(ownedBy[land_id] == address(0), "You can only buy unowned lands!");
        
        if (owner_kingdom[msg.sender].is_created == 0){
            owner_kingdom[msg.sender].is_created = 1;
            owner_kingdom[msg.sender].kingdom_name = kingdom_name;
            owner_kingdom[msg.sender].r = r;
            owner_kingdom[msg.sender].g = g;
            owner_kingdom[msg.sender].b = b;
        }
        
        ownedBy[land_id] = msg.sender;
    }

    function attack_land(uint8 my_land_id, uint8 land_id) public land_owner(my_land_id) {
        require(is_neighbour(my_land_id, land_id), "You can only attack your neighbour lands!");
        address enemy = ownedBy[land_id];
        uint result = rand_mod(100);
        if(result > 45)
            ownedBy[land_id] = msg.sender;
        else
            ownedBy[my_land_id] = enemy;
    }

    function view_map() public view returns(address[] memory) {
        address[] memory map = new address[](land_size ** 2);
        for(uint8 i=0; i < land_size ** 2; i++) {
            map[i] = ownedBy[i];
        }
        return map;
    }
}