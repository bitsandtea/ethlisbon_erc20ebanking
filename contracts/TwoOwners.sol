// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@account-abstraction/contracts/samples/SimpleAccount.sol';
import './Controller.sol';

contract TwoOwnerAccount is SimpleAccount {
    using ECDSA for bytes32;
    address public ownerOne;
    Controller public controller;

    constructor(IEntryPoint anEntryPoint, address _controller) SimpleAccount(anEntryPoint) {
        controller = Controller(_controller);
    }

    function initialize (
        address _ownerOne
        // one owner but there can be more
    ) public virtual initializer override{
        super._initialize(address(0));
        ownerOne = _ownerOne;
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256 validationData) {
        (userOp, userOpHash);
        require(controller.validate(userOp.callData), "failed validation");
        // TODO: raw call here, no decode to save the data.
        // (address token, address to, uint amount) = abi.decode(_data, (address, address, uint));
        // require(controller.call(address));

        bytes32 hash = userOpHash.toEthSignedMessageHash();

        (bytes memory signatureOne) = abi.decode(
            userOp.signature,
            (bytes)
        );

        address recoveryOne = hash.recover(signatureOne);

        bool ownerOneCheck = ownerOne == recoveryOne;

        if (ownerOneCheck) return 0;

        return SIG_VALIDATION_FAILED;
    }

    function encodeSignature(
        bytes memory signatureOne
    ) public pure returns (bytes memory) {
        return (abi.encode(signatureOne));
    }
}
