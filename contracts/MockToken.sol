import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MockToken is ERC20 {
    constructor(address _mintTo) ERC20("Mock Token", "MTK") {
        _mint(_mintTo, 1000000 * (10 ** uint256(decimals())));
    }
}

