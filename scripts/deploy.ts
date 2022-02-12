import { ethers } from "hardhat";

async function main() {
  const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
  const testUSDC = "0xb7a4F3E9097C08dA09517b5aB877F7a917224ede";
  const betAmount = 1000;
  const rps = await RockPaperScissors.deploy(testUSDC, betAmount);

  await rps.deployed();

  console.log("RockPaperScissors deployed to:", rps.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
