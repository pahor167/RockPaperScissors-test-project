pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestErc20 is ERC20 {
    constructor() ERC20("TestERC", "terc") {
        _mint(msg.sender, 1500000000000);
    }
}
