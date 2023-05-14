// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AddressReputation.sol";

contract Controller is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant SPENDER_ROLE = keccak256("SPENDER");

    uint public transferTXCooldown; // time between transactions in seconds
    uint public minReputation;
    AddressReputation public reputationContract;

    mapping(address => mapping(address => uint)) public dailyLimits;
    mapping(address => mapping(address => uint)) public weeklyLimits;
    mapping(address => mapping(address => uint)) public monthlyLimits;

    mapping(address => uint) public lastTransaction;

    event DailyLimitSet(address indexed user, address indexed token, uint amount);
    event WeeklyLimitSet(address indexed user, address indexed token, uint amount);
    event MonthlyLimitSet(address indexed user, address indexed token, uint amount);
    event TransactionCooldownSet(uint cooldown);

    constructor(
        address _reputationContractAddress,
        uint _minReputation,
        uint _transferTXCooldown
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(SPENDER_ROLE, ADMIN_ROLE);
        reputationContract = AddressReputation(_reputationContractAddress);
        minReputation = _minReputation;
        transferTXCooldown = _transferTXCooldown;
    }

    function setMinReputation(uint _reputation) public onlyRole(ADMIN_ROLE) {
        minReputation = _reputation;
    }

    function setDailyLimit(
        address _user,
        address _token,
        uint _amount
    ) public onlyRole(ADMIN_ROLE) {
        dailyLimits[_user][_token] = _amount;
        emit DailyLimitSet(_user, _token, _amount);
    }

    function setWeeklyLimit(
        address _user,
        address _token,
        uint _amount
    ) public onlyRole(ADMIN_ROLE) {
        weeklyLimits[_user][_token] = _amount;
        emit WeeklyLimitSet(_user, _token, _amount);
    }

    function setMonthlyLimit(
        address _user,
        address _token,
        uint _amount
    ) public onlyRole(ADMIN_ROLE) {
        monthlyLimits[_user][_token] = _amount;
        emit MonthlyLimitSet(_user, _token, _amount);
    }

    function setTransactionCooldown(uint _cooldown) public onlyRole(ADMIN_ROLE) {
        transferTXCooldown = _cooldown;
        emit TransactionCooldownSet(_cooldown);
    }

    function setReputationContract(address _reputationContractAddress) public onlyRole(ADMIN_ROLE) {
        reputationContract = AddressReputation(_reputationContractAddress);
    }

    //set them in bulk

    function setBulk(
        address _token,
        uint _dailyLimit,
        uint _weeklyLimit,
        uint _monthlyLimit,
        uint _setMinReputation,
        uint _transferTXCooldown
    ) public onlyRole(ADMIN_ROLE) {
        setDailyLimit(msg.sender, _token, _dailyLimit);
        setWeeklyLimit(msg.sender, _token, _weeklyLimit);
        setMonthlyLimit(msg.sender, _token, _monthlyLimit);
        setMinReputation(_setMinReputation);
        setTransactionCooldown(_transferTXCooldown);
    }

    function addSpender(address _spender) public onlyRole(ADMIN_ROLE) {
        grantRole(SPENDER_ROLE, _spender);
    }

    function removeSpender(address _spender) public onlyRole(ADMIN_ROLE) {
        revokeRole(SPENDER_ROLE, _spender);
    }

    function getUserTokenSettings(address _user, address _token) public view returns (uint, uint, uint, uint, uint) {
        return (
            dailyLimits[_user][_token],
            weeklyLimits[_user][_token],
            monthlyLimits[_user][_token],
            minReputation,
            transferTXCooldown
        );
    }
    function checkLimit(
        address _user,
        address _token,
        uint _amount
    ) internal view {
        require(_amount <= dailyLimits[_user][_token], "Amount exceeds the daily limit");
        require(_amount <= weeklyLimits[_user][_token], "Amount exceeds the weekly limit");
        require(_amount <= monthlyLimits[_user][_token], "Amount exceeds the monthly limit");
    }

    function checkCooldown() internal view {
        require(block.timestamp >= lastTransaction[msg.sender] + transferTXCooldown, "Transaction cooldown in progress");
    }

    function validateReputation(address _addr) internal view {
        require(_addr != address(0), "Invalid address");
        require(reputationContract.getReputation(_addr) >= minReputation, "Insufficient reputation");
    }

    function validate(
        address _user,
        bytes calldata _data
    ) public view returns (bool) {
        (address token, address to, uint amount) = abi.decode(_data, (address, address, uint));

        checkLimit(_user, token, amount);
        checkCooldown();
        validateReputation(token);
        validateReputation(to);
        return true;
    }
}