// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { RockPaperScissors, TestErc20 } from "../typechain";
// import { RockPaperScissorsContract, TestErc20Contract } from "./Utils/Constants";
// import { expectEvent } from "./Utils/EventHelpers";

// describe("RockPaperScissors withdraw tests", function () {

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
//     console.log("Approve player: " + player.address);

//     const RockPaperScissors = await ethers.getContractFactory(RockPaperScissorsContract);
//     rockPaperScissors = await RockPaperScissors.deploy(testErc.address, betAmount);
//     await rockPaperScissors.deployed();
//   });
  

//   it("Withdraw All sufficient balance", async function () {
//     const depositAmount = betAmount;

//     const approveTx = await testErc.connect(player).approve(rockPaperScissors.address, depositAmount);
//     await approveTx.wait();

//     const depositTx = await rockPaperScissors.connect(player).deposit(depositAmount);
//     await depositTx.wait();

//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(depositAmount);

//     const withdrawAllTx = await rockPaperScissors.widthdrawAll();
//     const withdrawAllTxWait = await withdrawAllTx.wait();

//     expectEvent(withdrawAllTxWait.events, "Withdraw", player.address, depositAmount);

//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(0);
//   });
//   it("Withdraw All insufficient balance", async function () {
//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(0);

//     await expect(rockPaperScissors.connect(player).widthdrawAll()).to.be.revertedWith("balance > 0");
//   });

//   it("Withdraw full balance", async function () {
//     const depositAmount = betAmount;

//     const approveTx = await testErc.connect(player).approve(rockPaperScissors.address, depositAmount);
//     await approveTx.wait();

//     const depositTx = await rockPaperScissors.connect(player).deposit(depositAmount);
//     await depositTx.wait();

//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(depositAmount);

//     const withdrawAllTx = await rockPaperScissors.widthdraw(betAmount);
//     const withdrawAllTxWait = await withdrawAllTx.wait();

//     expectEvent(withdrawAllTxWait.events, "Withdraw", player.address, depositAmount);

//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(0);
//   });

//   it("Withdraw part of balance", async function () {
//     const depositAmount = betAmount;
//     const amountToWidthdraw = depositAmount - 1;

//     const approveTx = await testErc.connect(player).approve(rockPaperScissors.address, depositAmount);
//     await approveTx.wait();

//     const depositTx = await rockPaperScissors.connect(player).deposit(depositAmount);
//     await depositTx.wait();

//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(depositAmount);

//     const withdrawAllTx = await rockPaperScissors.widthdraw(amountToWidthdraw);
//     const withdrawAllTxWait = await withdrawAllTx.wait();

//     expectEvent(withdrawAllTxWait.events, "Withdraw", player.address, amountToWidthdraw);

//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(depositAmount - amountToWidthdraw);
//   });

//   it("Withdraw more than balance", async function () {
//     const depositAmount = betAmount;

//     const approveTx = await testErc.connect(player).approve(rockPaperScissors.address, depositAmount);
//     await approveTx.wait();

//     const depositTx = await rockPaperScissors.connect(player).deposit(depositAmount);
//     await depositTx.wait();

//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(depositAmount);

//     await expect(rockPaperScissors.widthdraw(depositAmount + 1)).to.be.revertedWith("balance >= amount");

//     expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(depositAmount);
//   });
// });
