// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { RockPaperScissors, TestErc20 } from "../typechain";
// import { RockPaperScissorsContract, TestErc20Contract } from "./Utils/Constants";
// import { expectEvent } from "./Utils/EventHelpers";

// describe("RockPaperScissors deposit tests", function () {

//   let testErc: TestErc20;
//   let rockPaperScissors: RockPaperScissors;
//   const betAmount = 10;

//   let player: SignerWithAddress;

//   before(async () => {
//     [player] = await ethers.getSigners();
//     console.log("******")
//     console.log("player: " + player.address);
//     console.log("******")
//   });

//   beforeEach(async () => {
//     const TestErc = await ethers.getContractFactory(TestErc20Contract);
//     testErc = await TestErc.deploy();
//     await testErc.deployed();    
//     console.log("Approve sender: " + player.address);

//     const RockPaperScissors = await ethers.getContractFactory(RockPaperScissorsContract);
//     rockPaperScissors = await RockPaperScissors.deploy(testErc.address, betAmount);
//     await rockPaperScissors.deployed();
//   });
  
//   it("Deposit below bet amount", async function () {
//     const depositAmount = betAmount - 1;

//     const approveTx = await testErc.connect(player).approve(rockPaperScissors.address, depositAmount);
//     await approveTx.wait();

//     await expect(rockPaperScissors.connect(player).deposit(depositAmount)).to.be.revertedWith("amount >= _betAmount");

//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(0);
//   });

//   it("Deposit bet amount", async function () {
//     const depositAmount = betAmount;

//     const approveTx = await testErc.connect(player).approve(rockPaperScissors.address, depositAmount);
//     await approveTx.wait();

//     const depositTx = await rockPaperScissors.connect(player).deposit(depositAmount);
//     const depositTxWait = await depositTx.wait();

//     expectEvent(depositTxWait.events, "Deposit", player.address, depositAmount);

//     expect((await rockPaperScissors.connect(player)._balances(player.address)).toNumber()).to.equal(depositAmount);
//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(depositAmount);

//   });

//   it("Deposit above bet amount", async function () {
//     const depositAmount = betAmount + 1;

//     const approveTx = await testErc.connect(player).approve(rockPaperScissors.address, depositAmount);
//     await approveTx.wait();

//     const depositTx = await rockPaperScissors.connect(player).deposit(depositAmount);
//     const depositTxWait = await depositTx.wait();

//     expectEvent(depositTxWait.events, "Deposit", player.address, depositAmount);

//     expect((await rockPaperScissors.connect(player)._balances(player.address)).toNumber()).to.equal(depositAmount);
//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(depositAmount);
    
//   });
// });
