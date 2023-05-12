//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./AddressReputation.sol";

contract Controller is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant SPENDER_ROLE = keccak256("SPENDER");
    uint public dailyLimit;
    uint public weeklyLimit;
    uint public monthlyLimit;
    uint public transferTXCooldown; //time between transactions in seconds
    uint public minReputation;
    AddressReputation public reputationContract;

    mapping(address => uint) public dailyLimits;
    mapping(address => uint) public weeklyLimits;
    mapping(address => uint) public monthlyLimits;

    uint lastTransaction;

    event DailyLimitSet(address indexed token, uint amount);
    event WeeklyLimitSet(address indexed token, uint amount);
    event MonthlyLimitSet(address indexed token, uint amount);
    event TransactionCooldownSet(uint cooldown);


    constructor(address _reputationContractAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(SPENDER_ROLE, ADMIN_ROLE);
        reputationContract = AddressReputation(_reputationContractAddress);
    }

    function setMinReputation(uint _reputation) public onlyRole(ADMIN_ROLE) {
        minReputation = _reputation;
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

    function checkLimit(address _token, uint _amount) internal view {
        require(_amount <= dailyLimits[_token], "Amount exceeds the daily limit");
        require(_amount <= weeklyLimits[_token], "Amount exceeds the weekly limit");
        require(_amount <= monthlyLimits[_token], "Amount exceeds the monthly limit");
    }

    function checkCooldown() internal view {
        require(block.timestamp >= lastTransaction + transferTXCooldown, "Transaction cooldown in progress");
    }

    function validateReputation(address _addr) internal view {
        require(_addr != address(0), "Invalid address");
        require(reputationContract.getReputation(_addr) >= minReputation, "Insufficient reputation");
    }

    function execute(bytes calldata _data) public {
        (address token, address to, uint amount) = abi.decode(_data, (address, address, uint));

        checkLimit(token, amount);
        checkCooldown();

        IERC20 tokenContract = IERC20(token);
        require(tokenContract.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        require(tokenContract.balanceOf(address(this)) >= amount, "Insufficient contract balance");

        // Perform the ERC20 token transfer
        tokenContract.transfer(to, amount);

        // Update last transaction timestamp
        lastTransaction = block.timestamp;
    }

}
