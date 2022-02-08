// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RockPaperScissors {

    IERC20 public erc20Instance;

    enum PlayChoice { None, Rock, Paper, Scissors}
    enum GameResult { Victory, Draw, Defeat }
    uint256 public _betAmount;

    mapping(address=>uint256) public _balances;
    mapping(address=>uint256) public _wageredBalances;
    mapping(address=>mapping(address=>PlayChoice)) public _plays;

    event Deposit (address sender, uint256 amount);
    event Withdraw (address sender, uint256 amount);
    event Play(address player, address opponent, PlayChoice playChoice);
    event GameResultEvent(address player, address opponent, GameResult gameResult);

    constructor(address erc20Address, uint256 betAmount) {
        erc20Instance = IERC20(erc20Address);
        _betAmount = betAmount;
    }

    function deposit(uint256 amount) public payable {
        require(amount >= _betAmount, "amount is less than betAmount");
        
        _balances[msg.sender] = _balances[msg.sender] + amount;

        erc20Instance.transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount);
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

     function wageredBalanceOf(address account) public view returns (uint256) {
        return _wageredBalances[account];
    }

    function moveOf(address player, address opponent) public view returns (PlayChoice) {
        return _plays[player][opponent];
    }

    function widthdrawAll() public {
        uint256 balance = _balances[msg.sender];
        require(balance > 0, "balance > 0");
        unchecked {
            _balances[msg.sender] = 0;
        }
        erc20Instance.transfer(msg.sender, balance);

        emit Withdraw(msg.sender, balance);
    }

    function widthdraw(uint256 amount) public {
        uint256 balance = _balances[msg.sender];
        require(balance >= amount, "balance >= amount");
        unchecked {
            _balances[msg.sender] = balance - amount;
        }
        erc20Instance.transfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }

    function play(PlayChoice playChoice, uint256 wagerAmount, address opponent) public {
        require(playChoice != PlayChoice.None, "playChoice != PlayChoice.None");
        require(wagerAmount >= _betAmount, "wagerAmount >= _betAmount");
        uint256 currentBalance = _balances[msg.sender];
        require(currentBalance >= _betAmount, "currentBalance >= _betAmount");
        require(_plays[msg.sender][opponent] == PlayChoice.None, "_plays[msg.sender][opponent] == PlayChoice.None");
        
        uint256 wageredBalance = _wageredBalances[msg.sender];
        unchecked {
            _balances[msg.sender] = currentBalance - _betAmount;
        }
        _wageredBalances[msg.sender] = wageredBalance + _betAmount;

        PlayChoice opponentPlay = _plays[opponent][msg.sender];

        emit Play(msg.sender, opponent, playChoice);
        if (opponentPlay == PlayChoice.None) {
            _plays[msg.sender][opponent] = playChoice;
            return;
        } else {
            if (playChoice == opponentPlay) {
                draw(opponent);
            } else if (playChoice == PlayChoice.Paper) {
                if (opponentPlay == PlayChoice.Rock) {
                    defeat(opponent);
                } else if (opponentPlay == PlayChoice.Scissors) {
                    victory(opponent);
                }
            } else if (playChoice == PlayChoice.Rock) {
                if (opponentPlay == PlayChoice.Paper) {
                    victory(opponent);
                } else if (opponentPlay == PlayChoice.Scissors) {
                    defeat(opponent);
                }
            } else if (playChoice == PlayChoice.Scissors) {
                if (opponentPlay == PlayChoice.Paper) {
                    defeat(opponent);
                } else if (opponentPlay == PlayChoice.Rock) {
                    victory(opponent);
                } 
            }
        }
    }

    function draw(address opponent) private {
        _balances[msg.sender] = _balances[msg.sender] + _betAmount;
        _balances[opponent] = _balances[opponent] + _betAmount;
        resetPlay(opponent);
        emit GameResultEvent(msg.sender, opponent, GameResult.Draw);
    }

    function defeat(address opponent) private {
        _balances[msg.sender] = _balances[msg.sender] + 2 * _betAmount;
        resetPlay(opponent);
        emit GameResultEvent(msg.sender, opponent, GameResult.Defeat);
    }

    function victory(address opponent) private {
        _balances[opponent] = _balances[opponent] + 2 * _betAmount;
        resetPlay(opponent);
        emit GameResultEvent(msg.sender, opponent, GameResult.Victory);
    }

    function resetPlay(address opponent) private {
        uint256 wageredBalanceSender =  _wageredBalances[msg.sender];
        require (wageredBalanceSender >= _betAmount, "wageredBalanceSender >= _betAmount");
        unchecked{
            _wageredBalances[msg.sender] = wageredBalanceSender - _betAmount;
        }
        uint256 opponentWageredBalance = _wageredBalances[opponent];
        require(opponentWageredBalance >= _betAmount, "opponentWageredBalance >= _betAmount");
        unchecked{
            _wageredBalances[opponent] =  opponentWageredBalance - _betAmount;
        }

        _plays[msg.sender][opponent] = PlayChoice.None;
        _plays[opponent][msg.sender] = PlayChoice.None;
    }
}