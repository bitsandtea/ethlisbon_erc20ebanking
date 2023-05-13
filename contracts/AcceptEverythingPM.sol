//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import '@account-abstraction/contracts/core/BasePaymaster.sol';

contract AcceptEverythingPM is BasePaymaster {


    constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) payable{
        _entryPoint.depositTo{value : msg.value}(address(this));
    }

    function _validatePaymasterUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 maxCost)
    internal virtual override returns (bytes memory context, uint256 validationData)
    {
        return ("", 0);
    }
    
}
