# RockPaperScissors test project

You will create a smart contract named `RockPaperScissors` whereby:  
Alice and Bob can play the classic game of rock, paper, scissors using ERC20 (of your choosing). ***It is possible to use any ERC20 which needs to be provided in contructor***   
  
- [x] To enroll, each player needs to deposit the right token amount, possibly zero.  
    ***Bet amount is being set in contructor and owner of the contract is able to change it later on.***
- [x] To play, each Bob and Alice need to submit their unique move.  
    ***Player that starts the game needs to submit their move in hashed format so other players are not able to read the move from blockchain. (Example in tests)***
- [x] The contract decides and rewards the winner with all token wagered.  

There are many ways to implement this, so we leave that up to you.  
  
## Stretch Goals
Nice to have, but not necessary.
- [x] Make it a utility whereby any 2 people can decide to play against each other.  
- [x] Reduce gas costs as much as possible.

    ***I did try to optimize the gas cost as much as possible with two exceptions:***
    1. ***Since owner can change bet amount even after the deployment of the contract, it is neccessary to keep the copy of betAmount (uint256) in every game struct record. If this option would be dropped, gas cost of StartGame transaction would drop another ~30 000 gas units.***
    2. ***It would be possible to save ~2 000 gas units if variables "playerB", "deadline", "playerBMove", "gameState" would be manually stored into new uint256 varible with help of bitwise operations. For readability purposes of this test project I decided not to do that. Explanation and howto can be found here https://medium.com/@novablitz/storing-structs-is-costing-you-gas-774da988895e***
  
- [x] Let players bet their previous winnings.  
- How can you entice players to play, knowing that they may have their funds stuck in the contract if they face an uncooperative player?  
  ***Few ideas would be:***

   1. ***We could stake players' funds similar to PoolTogether and award them with staking rewards.***
   2. ***We could incentivize players with potential platform token.***
   3. ***We could introduce lottery with tickets that would be dependant on amount and time of locked players funds (in such case game contract should have some fee from each game that would go to lottery pool)***
- [x] Include any tests using Hardhat.

    ***Please check "test" folder***
  
Now fork this repo and do it!
  
When you're done, please send an email to zak@slingshot.finance (if you're not applying through Homerun) with a link to your fork or join the [Slingshot Discord channel](https://discord.gg/JNUnqYjwmV) and let us know.  
  
Happy hacking!
