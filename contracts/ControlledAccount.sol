// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@account-abstraction/contracts/samples/SimpleAccount.sol';
import './Controller.sol';

contract ControlledAccount is SimpleAccount {
    Controller public controller;

    constructor(IEntryPoint anEntryPoint, address _controller) SimpleAccount(anEntryPoint) {
        controller = Controller(_controller);
    }
}
