// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AddressReputation is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    mapping(address => uint) public reputations;

    event ReputationSet(address indexed account, uint reputation);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setReputation(address _address, uint _reputation) public onlyRole(ADMIN_ROLE) {
        require(_reputation >= 0 && _reputation <= 100, "Invalid reputation value");
        reputations[_address] = _reputation;
        emit ReputationSet(_address, _reputation);
    }

    function getReputation(address _address) public view returns (uint) {
        return reputations[_address];
    }
}
