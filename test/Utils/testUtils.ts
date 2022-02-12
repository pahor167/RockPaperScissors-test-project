import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, web3 } from "hardhat";
import { RockPaperScissors } from "../../typechain";
import { PlayMoveEnum } from "./enums";

export function hashMove(secretPhrase: string, move: PlayMoveEnum) {
  const secretPhaseInBytes32StartGame = ethers.utils.hexZeroPad(
    web3.utils.fromUtf8(secretPhrase),
    32
  );
  return web3.utils.soliditySha3(
    { type: "uint8", value: `${move}` },
    { type: "bytes32", value: secretPhaseInBytes32StartGame }
  );
}

export async function checkBalance(
  rockPaperScissors: RockPaperScissors,
  player: SignerWithAddress,
  balanceOf: number,
  wageredBalance: number
) {
  expect(
    (
      await rockPaperScissors.connect(player).balanceOf(player.address)
    ).toNumber(),
    "player balanceOf is different than expected"
  ).to.equal(balanceOf);
  expect(
    (
      await rockPaperScissors.connect(player).wageredBalanceOf(player.address)
    ).toNumber(),
    "player wageredBalanceOf is different than expected"
  ).to.equal(wageredBalance);
}
