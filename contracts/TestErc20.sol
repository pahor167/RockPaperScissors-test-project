pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";


contract TestErc20 is ERC20 {

    constructor() ERC20("TestERC", "terc") {
        console.log("Deploying test ERC20 sender: %s", msg.sender);
        _mint(msg.sender, 150000);
    }
}