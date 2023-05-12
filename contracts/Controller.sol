//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RoleBasedContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant SPENDER_ROLE = keccak256("SPENDER");
    uint public dailyLimit;
    uint public weeklyLimit;
    uint public monthlyLimit;

    event DailyLimitSet(uint amount);
    event WeeklyLimitSet(uint amount);
    event MonthlyLimitSet(uint amount);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(SPENDER_ROLE, ADMIN_ROLE);
    }

    function setDailyLimit(uint _amount) public onlyRole(ADMIN_ROLE) {
        dailyLimit = _amount;
        emit DailyLimitSet(_amount);
    }

    function setWeeklyLimit(uint _amount) public onlyRole(ADMIN_ROLE) {
        weeklyLimit = _amount;
        emit WeeklyLimitSet(_amount);
    }

    function setMonthlyLimit(uint _amount) public onlyRole(ADMIN_ROLE) {
        monthlyLimit = _amount;
        emit MonthlyLimitSet(_amount);
    }

    function addSpender(address _spender) public onlyRole(ADMIN_ROLE) {
        grantRole(SPENDER_ROLE, _spender);
    }

    function removeSpender(address _spender) public onlyRole(ADMIN_ROLE) {
        revokeRole(SPENDER_ROLE, _spender);
    }

    function addBlacklist(address _blacklist) public onlyRole(ADMIN_ROLE) {
        grantRole(DEFAULT_ADMIN_ROLE, _blacklist);
    }

    function removeBlacklist(address _blacklist) public onlyRole(ADMIN_ROLE) {
        revokeRole(DEFAULT_ADMIN_ROLE, _blacklist);
    }

    function addWhitelist(address _whitelist) public onlyRole(ADMIN_ROLE) {
        grantRole(DEFAULT_ADMIN_ROLE, _whitelist);
    }

    function removeWhitelist(address _whitelist) public onlyRole(ADMIN_ROLE) {
        revokeRole(DEFAULT_ADMIN_ROLE, _whitelist);
    }
}
