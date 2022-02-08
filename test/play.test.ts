import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { RockPaperScissors, TestErc20 } from "../typechain";
import { RockPaperScissorsContract, TestErc20Contract } from "./Utils/Constants";
import { expectEvent } from "./Utils/EventHelpers";

describe("RockPaperScissors play tests", function () {

  enum PlayChoiceEnum { None = 0, Rock = 1, Paper = 2, Scissors = 3 };
  enum GameResult { Victory = 0, Draw = 1, Defeat = 2 };

  let testErc: TestErc20;
  let rockPaperScissors: RockPaperScissors;
  const betAmount = 10;

  let player: SignerWithAddress;
  let opponent: SignerWithAddress;

  before(async () => {
    [player, opponent] = await ethers.getSigners();
    console.log("******")
    console.log(`player: ${player.address}`);
    console.log(`opponent: ${opponent.address}`);
    console.log("******")
  });


  beforeEach(async () => {
    const TestErc = await ethers.getContractFactory(TestErc20Contract);
    testErc = await TestErc.deploy();
    await testErc.deployed();
    console.log("Approve sender: " + opponent.address);

    const RockPaperScissors = await ethers.getContractFactory(RockPaperScissorsContract);
    rockPaperScissors = await RockPaperScissors.deploy(testErc.address, betAmount);
    await rockPaperScissors.deployed();

    await testErc.connect(player).transfer(opponent.address, 1000);
  });


  it("Play insufficient balance", async function () {
    expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(0);

    await expect(rockPaperScissors.connect(player).play(PlayChoiceEnum.Paper, 10, opponent.address)).to.be.revertedWith("currentBalance >= _betAmount");
  });

  it("Play - other player didn't make a move yet ", async function () {
    const depositAmount = betAmount;

    const approveTx = await testErc.connect(player).approve(rockPaperScissors.address, depositAmount);
    await approveTx.wait();

    const depositTx = await rockPaperScissors.connect(player).deposit(depositAmount);
    const depositTxWait = await depositTx.wait();

    expectEvent(depositTxWait.events, "Deposit", player.address, depositAmount);

    expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(depositAmount);
    const playTx = await rockPaperScissors.connect(player).play(PlayChoiceEnum.Paper, betAmount, opponent.address);
    const playTxWait = await playTx.wait();

    expectEvent(playTxWait.events, "Play", player.address, opponent.address, PlayChoiceEnum.Paper);

    expect((await rockPaperScissors.connect(player).moveOf(player.address, opponent.address))).to.equal(PlayChoiceEnum.Paper);
    expect((await rockPaperScissors.connect(player).moveOf(opponent.address, player.address))).to.equal(PlayChoiceEnum.None);

    expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber(), "balanceOf is different than expected").to.equal(0);
    expect((await rockPaperScissors.connect(player).wageredBalanceOf(player.address)).toNumber(), "wageredBalanceOf is different than expected").to.equal(betAmount);
  });

  describe('play scenarios', () => {
    const tests = [
      
      { args: { playerPlayChoice: PlayChoiceEnum.Rock, opponentPlayChoice: PlayChoiceEnum.Rock }, expected: { playerBalance: betAmount, opponentBalance: betAmount, gameResult: GameResult.Draw } },
      { args: { playerPlayChoice: PlayChoiceEnum.Rock, opponentPlayChoice: PlayChoiceEnum.Paper }, expected: { playerBalance: 0, opponentBalance: betAmount * 2, gameResult: GameResult.Defeat } },
      { args: { playerPlayChoice: PlayChoiceEnum.Rock, opponentPlayChoice: PlayChoiceEnum.Scissors }, expected: { playerBalance: betAmount * 2, opponentBalance: 0, gameResult: GameResult.Victory } },

      { args: { playerPlayChoice: PlayChoiceEnum.Paper, opponentPlayChoice: PlayChoiceEnum.Rock }, expected: { playerBalance: betAmount * 2, opponentBalance: 0, gameResult: GameResult.Victory } },
      { args: { playerPlayChoice: PlayChoiceEnum.Paper, opponentPlayChoice: PlayChoiceEnum.Paper }, expected: { playerBalance: betAmount, opponentBalance: betAmount, gameResult: GameResult.Draw } },
      { args: { playerPlayChoice: PlayChoiceEnum.Paper, opponentPlayChoice: PlayChoiceEnum.Scissors }, expected: { playerBalance: 0, opponentBalance: betAmount * 2, gameResult: GameResult.Defeat } },

      { args: { playerPlayChoice: PlayChoiceEnum.Scissors, opponentPlayChoice: PlayChoiceEnum.Rock }, expected: { playerBalance: 0, opponentBalance: betAmount * 2, gameResult: GameResult.Defeat } },
      { args: { playerPlayChoice: PlayChoiceEnum.Scissors, opponentPlayChoice: PlayChoiceEnum.Paper }, expected: { playerBalance: betAmount * 2, opponentBalance: 0, gameResult: GameResult.Victory } },
      { args: { playerPlayChoice: PlayChoiceEnum.Scissors, opponentPlayChoice: PlayChoiceEnum.Scissors }, expected: { playerBalance: betAmount, opponentBalance: betAmount, gameResult: GameResult.Draw } },
    ];

    tests.forEach(({ args, expected }) => {
      it(`Play scenario Player: ${PlayChoiceEnum[args.playerPlayChoice]} Opponent: ${PlayChoiceEnum[args.opponentPlayChoice]}; Player expected balance: ${expected.playerBalance} Opponent expected balance: ${expected.opponentBalance}`, async () => {
        const depositAmount = betAmount;

        await testErc.connect(player).approve(rockPaperScissors.address, depositAmount);
        const depositPlayerTx = await rockPaperScissors.connect(player).deposit(depositAmount);
        const depositPlayerTxWait = await depositPlayerTx.wait();
        expectEvent(depositPlayerTxWait.events, "Deposit", player.address, depositAmount);
    
        await testErc.connect(opponent).approve(rockPaperScissors.address, depositAmount);
        const depositOpponentTx = await rockPaperScissors.connect(opponent).deposit(depositAmount);
        const depositOpponentTxWait = await depositOpponentTx.wait();
        expectEvent(depositOpponentTxWait.events, "Deposit", opponent.address, depositAmount);

        expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber()).to.equal(depositAmount);
        expect((await rockPaperScissors.connect(opponent).balanceOf(opponent.address)).toNumber()).to.equal(depositAmount);
        const playerPlayTx = await rockPaperScissors.connect(player).play(args.playerPlayChoice, betAmount, opponent.address);
        const playerPlayTxWait = await playerPlayTx.wait();
        expectEvent(playerPlayTxWait.events, "Play", player.address, opponent.address, args.playerPlayChoice);
    
        expect((await rockPaperScissors.connect(player).moveOf(player.address, opponent.address))).to.equal(args.playerPlayChoice);
        expect((await rockPaperScissors.connect(player).moveOf(opponent.address, player.address))).to.equal(PlayChoiceEnum.None);
    
        expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber(), "player balanceOf is different than expected").to.equal(0);
        expect((await rockPaperScissors.connect(player).wageredBalanceOf(player.address)).toNumber(), "player wageredBalanceOf is different than expected").to.equal(betAmount);
    
        expect((await rockPaperScissors.connect(opponent).balanceOf(opponent.address)).toNumber(), "opponent balanceOf is different than expected").to.equal(depositAmount);
        expect((await rockPaperScissors.connect(opponent).wageredBalanceOf(opponent.address)).toNumber(), "opponent wageredBalanceOf is different than expected").to.equal(0);
    
        const oponnentPlayTx = await rockPaperScissors.connect(opponent).play(args.opponentPlayChoice, betAmount, player.address);
        const oponnentPlayTxWait = await oponnentPlayTx.wait();
        expectEvent(oponnentPlayTxWait.events, "Play", opponent.address, player.address, args.opponentPlayChoice);
        expectEvent(oponnentPlayTxWait.events, "GameResultEvent", opponent.address, player.address, expected.gameResult);
    
        expect((await rockPaperScissors.connect(player).balanceOf(player.address)).toNumber(), "player balanceOf is different than expected").to.equal(expected.playerBalance);
        expect((await rockPaperScissors.connect(player).wageredBalanceOf(player.address)).toNumber(), "player wageredBalanceOf is different than expected").to.equal(0);
    
        expect((await rockPaperScissors.connect(opponent).balanceOf(opponent.address)).toNumber(), "opponent balanceOf is different than expected").to.equal(expected.opponentBalance);
        expect((await rockPaperScissors.connect(opponent).wageredBalanceOf(opponent.address)).toNumber(), "opponent wageredBalanceOf is different than expected").to.equal(0);
    
        expect((await rockPaperScissors.connect(player).moveOf(player.address, opponent.address))).to.equal(PlayChoiceEnum.None);
        expect((await rockPaperScissors.connect(player).moveOf(opponent.address, player.address))).to.equal(PlayChoiceEnum.None);
      });
    });
  });
});
