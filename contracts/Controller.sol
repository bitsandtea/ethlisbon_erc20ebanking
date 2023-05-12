//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RoleBasedContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant SPENDER_ROLE = keccak256("SPENDER");
    uint public dailyLimit;
    uint public weeklyLimit;
    uint public monthlyLimit;
    uint public transferTXCooldown; //time between transactions in seconds

    mapping(address => uint) public dailyLimits;
    mapping(address => uint) public weeklyLimits;
    mapping(address => uint) public monthlyLimits;

    mapping(address => uint) public lastTransaction;


    event DailyLimitSet(address indexed token, uint amount);
    event WeeklyLimitSet(address indexed token, uint amount);
    event MonthlyLimitSet(address indexed token, uint amount);
    event TransactionCooldownSet(uint cooldown);


    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(SPENDER_ROLE, ADMIN_ROLE);
    }

    function setDailyLimit(address _token, uint _amount) public onlyRole(ADMIN_ROLE) {
        dailyLimits[_token] = _amount;
        emit DailyLimitSet(_token, _amount);
    }

    function setWeeklyLimit(address _token, uint _amount) public onlyRole(ADMIN_ROLE) {
        weeklyLimits[_token] = _amount;
        emit WeeklyLimitSet(_token, _amount);
    }

    function setMonthlyLimit(address _token, uint _amount) public onlyRole(ADMIN_ROLE) {
        monthlyLimits[_token] = _amount;
        emit MonthlyLimitSet(_token, _amount);
    }

    function setTransactionCooldown(uint _cooldown) public onlyRole(ADMIN_ROLE) {
        transferTXCooldown = _cooldown;
        emit TransactionCooldownSet(_cooldown);
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
