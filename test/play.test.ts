import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, web3 } from "hardhat";
import { expect } from "chai";

import { RockPaperScissors, TestErc20 } from "../typechain";
import { RockPaperScissorsContract, TestErc20Contract } from "./Utils/constants";
import { expectEvent } from "./Utils/eventHelpers";
import { delay } from "./Utils/delay";
import { PlayMoveEnum } from "./enums";
import { checkBalance, hashMove } from "./Utils/testUtils";
import BN from "bn.js";

describe("RockPaperScissors play tests", function () {

  const MAX_UINT256 = new BN("2").pow(new BN("256").sub(new BN("1")));

  let testErc: TestErc20;
  let rockPaperScissors: RockPaperScissors;
  const betAmount = 10000000;

  let playerA: SignerWithAddress;
  let playerB: SignerWithAddress;
  let playerC: SignerWithAddress;

  before(async () => {
    [playerA, playerB, playerC] = await ethers.getSigners();
    console.log("******")
    console.log(`playerA: ${playerA.address}`);
    console.log(`playerB: ${playerB.address}`);
    console.log(`playerC: ${playerC.address}`);
    console.log("******")
  });


  beforeEach(async () => {
    const TestErc = await ethers.getContractFactory(TestErc20Contract);
    testErc = await TestErc.deploy();
    await testErc.deployed();

    const RockPaperScissors = await ethers.getContractFactory(RockPaperScissorsContract);
    rockPaperScissors = await RockPaperScissors.deploy(testErc.address, betAmount);
    await rockPaperScissors.deployed();

    await testErc.connect(playerA).transfer(playerB.address, betAmount * 10);
    await testErc.connect(playerA).transfer(playerC.address, betAmount * 10);
  });


  // it("Play insufficient balance", async function () {
  //   expect((await rockPaperScissors.connect(playerA).balanceOf(playerA.address)).toNumber()).to.equal(0);
  //   const myPlayHashed = hashMove("secretPhase", PlayMoveEnum.Paper);
  //   await expect(rockPaperScissors.connect(playerA).startPublicGame(myPlayHashed as string)).to.be.revertedWith("balance >= betAmount");
  // });

  // it("Play - return money to playerA after deadline - playerB didn't respond ", async function () {
  //   const depositAmount = betAmount;

  //   await testErc.connect(playerA).approve(rockPaperScissors.address, MAX_UINT256.toString());
  //   const depositPlayerATx = await rockPaperScissors.connect(playerA).deposit(depositAmount);
  //   const depositPlayerATxWait = await depositPlayerATx.wait();
  //   expectEvent(depositPlayerATxWait.events, "Deposit", playerA.address, depositAmount);

  //   await testErc.connect(playerB).approve(rockPaperScissors.address, MAX_UINT256.toString());
  //   const depositplayerBTx = await rockPaperScissors.connect(playerB).deposit(depositAmount);
  //   const depositplayerBTxWait = await depositplayerBTx.wait();
  //   expectEvent(depositplayerBTxWait.events, "Deposit", playerB.address, depositAmount);

  //   expect((await rockPaperScissors.connect(playerA).balanceOf(playerA.address)).toNumber()).to.equal(depositAmount);
  //   expect((await rockPaperScissors.connect(playerB).balanceOf(playerB.address)).toNumber()).to.equal(depositAmount);

  //   const secretPhase = "mysecret";
  //   const playerAMoveHashed = hashMove(secretPhase, PlayMoveEnum.Rock);

  //   await rockPaperScissors.connect(playerA).setGameDeadlineInSeconds(1);

  //   const playerAPlayTx = await rockPaperScissors.connect(playerA).startPrivateGame(playerAMoveHashed as string, playerB.address);
  //   const playerAPlayTxWait = await playerAPlayTx.wait();

  //   const event = expectEvent(playerAPlayTxWait.events, "GameStarted", playerA.address, playerB.address);
  //   const gameId = event?.args?.gameId;

  //   await delay(2000);

  //   await checkBalance(rockPaperScissors, playerA, 0, betAmount);
  //   await checkBalance(rockPaperScissors, playerB, depositAmount, 0);

  //   const revealTx = await rockPaperScissors.connect(playerC).revealAfterDeadline(gameId);
  //   const revealTxWait = await revealTx.wait();

  //   expectEvent(revealTxWait.events, "GameRevealedAfterDeadline", playerA.address, playerB.address, gameId);

  //   await checkBalance(rockPaperScissors, playerA, betAmount, 0);
  //   await checkBalance(rockPaperScissors, playerB, depositAmount, 0);
  // });


  // it("Play - try to reavealAfterDeadline before deadline ", async function () {
  //   const depositAmount = betAmount;

  //   await testErc.connect(playerA).approve(rockPaperScissors.address, MAX_UINT256.toString());
  //   const depositPlayerATx = await rockPaperScissors.connect(playerA).deposit(depositAmount);
  //   const depositPlayerATxWait = await depositPlayerATx.wait();
  //   expectEvent(depositPlayerATxWait.events, "Deposit", playerA.address, depositAmount);

  //   await testErc.connect(playerB).approve(rockPaperScissors.address, MAX_UINT256.toString());
  //   const depositplayerBTx = await rockPaperScissors.connect(playerB).deposit(depositAmount);
  //   const depositplayerBTxWait = await depositplayerBTx.wait();
  //   expectEvent(depositplayerBTxWait.events, "Deposit", playerB.address, depositAmount);

  //   expect((await rockPaperScissors.connect(playerA).balanceOf(playerA.address)).toNumber()).to.equal(depositAmount);
  //   expect((await rockPaperScissors.connect(playerB).balanceOf(playerB.address)).toNumber()).to.equal(depositAmount);

  //   const secretPhase = "mysecret";
  //   const playerAMoveHashed = hashMove(secretPhase, PlayMoveEnum.Rock);

  //   const playerAPlayTx = await rockPaperScissors.connect(playerA).startPrivateGame(playerAMoveHashed as string, playerB.address);
  //   const playerAPlayTxWait = await playerAPlayTx.wait();

  //   const event = expectEvent(playerAPlayTxWait.events, "GameStarted", playerA.address, playerB.address);
  //   const gameId = event?.args?.gameId;

  //   await delay(2000);

  //   await checkBalance(rockPaperScissors, playerA, 0, betAmount);
  //   await checkBalance(rockPaperScissors, playerB, depositAmount, 0);

  //   await expect(rockPaperScissors.revealAfterDeadline(gameId)).to.be.revertedWith("game.deadline < block.timestamp");
  // });

  // it("Play - return money to playerA after deadline - playerB responded ", async function () {
  //   const depositAmount = betAmount;

  //   await testErc.connect(playerA).approve(rockPaperScissors.address, depositAmount);
  //   const depositPlayerATx = await rockPaperScissors.connect(playerA).deposit(depositAmount);
  //   const depositPlayerATxWait = await depositPlayerATx.wait();
  //   expectEvent(depositPlayerATxWait.events, "Deposit", playerA.address, depositAmount);

  //   await testErc.connect(playerB).approve(rockPaperScissors.address, depositAmount);
  //   const depositplayerBTx = await rockPaperScissors.connect(playerB).deposit(depositAmount);
  //   const depositplayerBTxWait = await depositplayerBTx.wait();
  //   expectEvent(depositplayerBTxWait.events, "Deposit", playerB.address, depositAmount);

  //   await checkBalance(rockPaperScissors, playerA, depositAmount, 0);
  //   await checkBalance(rockPaperScissors, playerB, depositAmount, 0);

  //   const secretPhase = "mysecret";

  //   const playerAMoveHashed = hashMove(secretPhase, PlayMoveEnum.Paper);

  //   await rockPaperScissors.connect(playerA).setGameDeadlineInSeconds(1);

  //   const playerAPlayTx = await rockPaperScissors.connect(playerA).startPrivateGame(playerAMoveHashed as string, playerB.address);
  //   const playerAPlayTxWait = await playerAPlayTx.wait();

  //   const event = expectEvent(playerAPlayTxWait.events, "GameStarted", playerA.address, playerB.address);
  //   const gameId = event?.args?.gameId;

  //   const oponnentPlayTx = await rockPaperScissors.connect(playerB).respond(gameId, PlayMoveEnum.Paper);
  //   const oponnentPlayTxWait = await oponnentPlayTx.wait();
  //   expectEvent(oponnentPlayTxWait.events, "GameResponded", playerA.address, playerB.address, gameId, PlayMoveEnum.Paper);

  //   await delay(2000);

  //   await checkBalance(rockPaperScissors, playerA, 0, betAmount);
  //   await checkBalance(rockPaperScissors, playerB, 0, depositAmount);

  //   const revealTx = await rockPaperScissors.connect(playerC).revealAfterDeadline(gameId);
  //   const revealTxWait = await revealTx.wait();

  //   expectEvent(revealTxWait.events, "GameRevealedAfterDeadline", playerA.address, playerB.address, gameId);

  //   await checkBalance(rockPaperScissors, playerA, 0, 0);
  //   await checkBalance(rockPaperScissors, playerB, 2 * depositAmount, 0);
  // });

  describe('play scenarios', () => {
    const tests = [

      // { args: { playerAMove: PlayMoveEnum.Rock, playerBMove: PlayMoveEnum.Rock }, expected: { playerABalance: betAmount, playerBBalance: betAmount, winner: () => 0 } },
      // { args: { playerAMove: PlayMoveEnum.Rock, playerBMove: PlayMoveEnum.Paper }, expected: { playerABalance: 0, playerBBalance: betAmount * 2, winner: () => playerB.address } },
      { args: { playerAMove: PlayMoveEnum.Rock, playerBMove: PlayMoveEnum.Scissors }, expected: { playerABalance: betAmount * 2, playerBBalance: 0, winner: () => playerA.address } },

      // { args: { playerAMove: PlayMoveEnum.Paper, playerBMove: PlayMoveEnum.Rock }, expected: { playerABalance: betAmount * 2, playerBBalance: 0, winner: () => playerA.address } },
      // { args: { playerAMove: PlayMoveEnum.Paper, playerBMove: PlayMoveEnum.Paper }, expected: { playerABalance: betAmount, playerBBalance: betAmount, winner: () => 0 } },
      // { args: { playerAMove: PlayMoveEnum.Paper, playerBMove: PlayMoveEnum.Scissors }, expected: { playerABalance: 0, playerBBalance: betAmount * 2, winner: () => playerB.address } },

      // { args: { playerAMove: PlayMoveEnum.Scissors, playerBMove: PlayMoveEnum.Rock }, expected: { playerABalance: 0, playerBBalance: betAmount * 2, winner: () => playerB.address } },
      // { args: { playerAMove: PlayMoveEnum.Scissors, playerBMove: PlayMoveEnum.Paper }, expected: { playerABalance: betAmount * 2, playerBBalance: 0, winner: () => playerA.address } },
      // { args: { playerAMove: PlayMoveEnum.Scissors, playerBMove: PlayMoveEnum.Scissors }, expected: { playerABalance: betAmount, playerBBalance: betAmount, winner: () => 0 } },
    ];

    tests.forEach(({ args, expected }) => {
      it(`Play scenario PlayerA: ${PlayMoveEnum[args.playerAMove]} playerB: ${PlayMoveEnum[args.playerBMove]}; PlayerA expected balance: ${expected.playerABalance} playerB expected balance: ${expected.playerBBalance}`, async () => {
        const depositAmount = betAmount;

        await testErc.connect(playerA).approve(rockPaperScissors.address, depositAmount);
        const depositPlayerATx = await rockPaperScissors.connect(playerA).deposit(depositAmount);
        const depositPlayerATxWait = await depositPlayerATx.wait();
        expectEvent(depositPlayerATxWait.events, "Deposit", playerA.address, depositAmount);

        await testErc.connect(playerB).approve(rockPaperScissors.address, depositAmount);
        const depositplayerBTx = await rockPaperScissors.connect(playerB).deposit(depositAmount);
      const depositplayerBTxWait = await depositplayerBTx.wait();
        expectEvent(depositplayerBTxWait.events, "Deposit", playerB.address, depositAmount);

        await checkBalance(rockPaperScissors, playerA, depositAmount, 0);
        await checkBalance(rockPaperScissors, playerB, depositAmount, 0);

        const secretPhase = "mysecret";
        const playerAMoveHashed = hashMove(secretPhase, args.playerAMove);

        const playerAPlayTx = await rockPaperScissors.connect(playerA).startPrivateGame(playerAMoveHashed as string, playerB.address);
        const playerAPlayTxWait = await playerAPlayTx.wait();
        console.log(`playerAPlayTxWait gas: ${playerAPlayTxWait.gasUsed}`);

        const event = expectEvent(playerAPlayTxWait.events, "GameStarted", playerA.address, playerB.address);
        const gameId = event?.args?.gameId;

        await checkBalance(rockPaperScissors, playerA, 0, betAmount);
        await checkBalance(rockPaperScissors, playerB, depositAmount, 0);

        const oponnentPlayTx = await rockPaperScissors.connect(playerB).respond(gameId, args.playerBMove);
        const oponnentPlayTxWait = await oponnentPlayTx.wait();
        expectEvent(oponnentPlayTxWait.events, "GameResponded", playerA.address, playerB.address, gameId, args.playerBMove);

        const secretPhaseInBytes32 = ethers.utils.hexZeroPad(web3.utils.fromUtf8(secretPhase), 32);
        const revealTx = await rockPaperScissors.connect(playerA).reveal(secretPhaseInBytes32, gameId);
        const revealTxWait = await revealTx.wait();

        expectEvent(revealTxWait.events, "GameRevealed", playerA.address, playerB.address, gameId, expected.winner());

        await checkBalance(rockPaperScissors, playerA, expected.playerABalance, 0);
        await checkBalance(rockPaperScissors, playerB, expected.playerBBalance, 0);
      });
    });
  });

  // it(`Game with 0 bet amount`, async () => {
  //   await rockPaperScissors.connect(playerA).setBetAmount(0);

  //   expect((await rockPaperScissors.connect(playerA).balanceOf(playerA.address)).toNumber()).to.equal(0);
  //   expect((await rockPaperScissors.connect(playerB).balanceOf(playerB.address)).toNumber()).to.equal(0);

  //   const secretPhase = "mysecret";
  //   const playerAMoveHashed = hashMove(secretPhase, PlayMoveEnum.Rock);

  //   const playerAPlayTx = await rockPaperScissors.connect(playerA).startPrivateGame(playerAMoveHashed as string, playerB.address);
  //   const playerAPlayTxWait = await playerAPlayTx.wait();

  //   const event = expectEvent(playerAPlayTxWait.events, "GameStarted", playerA.address, playerB.address);
  //   const gameId = event?.args?.gameId;

  //   await checkBalance(rockPaperScissors, playerA, 0, 0);
  //   await checkBalance(rockPaperScissors, playerB, 0, 0);

  //   const oponnentPlayTx = await rockPaperScissors.connect(playerB).respond(gameId, PlayMoveEnum.Scissors);
  //   const oponnentPlayTxWait = await oponnentPlayTx.wait();
  //   expectEvent(oponnentPlayTxWait.events, "GameResponded", playerA.address, playerB.address, gameId, PlayMoveEnum.Scissors);

  //   const secretPhaseInBytes32 = ethers.utils.hexZeroPad(web3.utils.fromUtf8(secretPhase), 32);
  //   const revealTx = await rockPaperScissors.connect(playerA).reveal(secretPhaseInBytes32, gameId);
  //   const revealTxWait = await revealTx.wait();

  //   expectEvent(revealTxWait.events, "GameRevealed", playerA.address, playerB.address, gameId, playerA.address);

  //   await checkBalance(rockPaperScissors, playerA, 0, 0);
  //   await checkBalance(rockPaperScissors, playerB, 0, 0);
  // });

  // it(`3 players, public game, reuse won balance`, async () => {
  //   const depositAmount = betAmount;

  //   await testErc.connect(playerA).approve(rockPaperScissors.address, depositAmount);
  //   const depositPlayerATx = await rockPaperScissors.connect(playerA).deposit(depositAmount);
  //   const depositPlayerATxWait = await depositPlayerATx.wait();
  //   expectEvent(depositPlayerATxWait.events, "Deposit", playerA.address, depositAmount);

  //   await testErc.connect(playerB).approve(rockPaperScissors.address, depositAmount);
  //   const depositplayerBTx = await rockPaperScissors.connect(playerB).deposit(depositAmount);
  //   const depositplayerBTxWait = await depositplayerBTx.wait();
  //   expectEvent(depositplayerBTxWait.events, "Deposit", playerB.address, depositAmount);

  //   await testErc.connect(playerC).approve(rockPaperScissors.address, depositAmount);
  //   const depositplayerCTx = await rockPaperScissors.connect(playerC).deposit(depositAmount);
  //   const depositplayerCTxWait = await depositplayerCTx.wait();
  //   expectEvent(depositplayerCTxWait.events, "Deposit", playerC.address, depositAmount);

  //   await checkBalance(rockPaperScissors, playerA, depositAmount, 0);
  //   await checkBalance(rockPaperScissors, playerB, depositAmount, 0);
  //   await checkBalance(rockPaperScissors, playerC, depositAmount, 0);

  //   const secretPhase = "mysecret";
  //   const playerAMoveHashed = hashMove(secretPhase, PlayMoveEnum.Rock);

  //   const playerAPlayTx = await rockPaperScissors.connect(playerA).startPublicGame(playerAMoveHashed as string);
  //   const playerAPlayTxWait = await playerAPlayTx.wait();

  //   const event = expectEvent(playerAPlayTxWait.events, "GameStarted", playerA.address, 0);
  //   const gameId = event?.args?.gameId;

  //   await checkBalance(rockPaperScissors, playerA, 0, betAmount);
  //   await checkBalance(rockPaperScissors, playerB, depositAmount, 0);
  //   await checkBalance(rockPaperScissors, playerC, depositAmount, 0);

  //   const oponnentPlayTx = await rockPaperScissors.connect(playerB).respond(gameId, PlayMoveEnum.Scissors);
  //   const oponnentPlayTxWait = await oponnentPlayTx.wait();
  //   expectEvent(oponnentPlayTxWait.events, "GameResponded", playerA.address, playerB.address, gameId, PlayMoveEnum.Scissors);

  //   const secretPhaseInBytes32 = ethers.utils.hexZeroPad(web3.utils.fromUtf8(secretPhase), 32);
  //   const revealTx = await rockPaperScissors.connect(playerA).reveal(secretPhaseInBytes32, gameId);
  //   const revealTxWait = await revealTx.wait();

  //   expectEvent(revealTxWait.events, "GameRevealed", playerA.address, playerB.address, gameId, playerA.address);

  //   await checkBalance(rockPaperScissors, playerA, 2 * betAmount, 0);
  //   await checkBalance(rockPaperScissors, playerB, 0, 0);
  //   await checkBalance(rockPaperScissors, playerC, depositAmount, 0);

  //   const withdrawTx = await rockPaperScissors.connect(playerA).widthdraw(betAmount);

  //   const secretPhaseWithC = "mysecretWithC";
  //   const playerAMoveHashedWithC = hashMove(secretPhaseWithC, PlayMoveEnum.Paper);

  //   const playerAPlayTxWithC = await rockPaperScissors.connect(playerA).startPublicGame(playerAMoveHashedWithC as string);
  //   const playerAPlayTxWaitWithC = await playerAPlayTxWithC.wait();

  //   const eventWithC = expectEvent(playerAPlayTxWaitWithC.events, "GameStarted", playerA.address, 0);
  //   const gameIdWithC = eventWithC?.args?.gameId;

  //   await checkBalance(rockPaperScissors, playerA, 0, depositAmount);
  //   await checkBalance(rockPaperScissors, playerB, 0, 0);
  //   await checkBalance(rockPaperScissors, playerC, depositAmount, 0);

  //   const oponnentPlayCTx = await rockPaperScissors.connect(playerC).respond(gameIdWithC, PlayMoveEnum.Scissors);
  //   const oponnentPlayCTxWait = await oponnentPlayCTx.wait();
  //   expectEvent(oponnentPlayCTxWait.events, "GameResponded", playerA.address, playerC.address, gameIdWithC, PlayMoveEnum.Scissors);

  //   await checkBalance(rockPaperScissors, playerA, 0, depositAmount);
  //   await checkBalance(rockPaperScissors, playerB, 0, 0);
  //   await checkBalance(rockPaperScissors, playerC, 0, depositAmount);

  //   const secretPhaseInBytes32WithC = ethers.utils.hexZeroPad(web3.utils.fromUtf8(secretPhaseWithC), 32);
  //   const revealWithCTx = await rockPaperScissors.connect(playerA).reveal(secretPhaseInBytes32WithC, gameIdWithC);
  //   const revealWithCTxWait = await revealWithCTx.wait();

  //   expectEvent(revealWithCTxWait.events, "GameRevealed", playerA.address, playerC.address, gameIdWithC, playerC.address);

  //   await checkBalance(rockPaperScissors, playerA, 0, 0);
  //   await checkBalance(rockPaperScissors, playerB, 0, 0);
  //   await checkBalance(rockPaperScissors, playerC, 2 * depositAmount, 0);

  // });
});
