// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract RockPaperScissors is Ownable {

    IERC20 public erc20Instance;

    struct Game {
        // player that started the game
        uint256 betAmount;
        address playerA;
        address playerB;
        bytes32 playerAMove;
        uint48 deadline;
        GameMove playerBMove;
        GameState gameState;
    }

    // enums
    enum GameMove { None, Rock, Paper, Scissors}
    enum GameState { Started, Responded, Completed, PassedDeadline }

    // settable parameters
    uint256 public _betAmount;
    uint32 public _gameDeadlineInSeconds = 10800;

    mapping(address=>uint256) public _balances;
    mapping(address=>uint256) public _wageredBalances;
    mapping(bytes32=>Game) _games;

    event Deposit (address sender, uint256 amount);
    event Withdraw (address sender, uint256 amount);
    event GameStarted(address playerA, address playerB, bytes32 gameId);
    event GameResponded(address playerA, address playerB, bytes32 gameId, GameMove gameMoves);
    event GameRevealed(address playerA, address playerB, bytes32 gameId, address winner);
    event GameRevealedAfterDeadline(address playerA, address playerB, bytes32 gameId);

    constructor(address erc20Address, uint256 betAmount) {
        erc20Instance = IERC20(erc20Address);
        _betAmount = betAmount;
    }

    function deposit(uint256 amount) public {
        require(amount >= _betAmount, "amount >= _betAmount");
        
        _balances[msg.sender] = _balances[msg.sender] + amount;

        erc20Instance.transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount);
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
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

    /** @dev
      * @param hashedMove expects keccak256(abi.encode(GameMove, secretPhrase)
      */
    function startPublicGame(bytes32 hashedMove) public {
        startGame(hashedMove, address(0));
    }

    /** @dev
      * @param hashedMove expects keccak256(abi.encode(GameMove, secretPhrase)
      * @param playerB opponent for private game
      */
    function startPrivateGame(bytes32 hashedMove, address playerB) public {
        require(hashedMove.length > 0, "hashedMove.length > 0");
        require(playerB != address(0), "playerB != address(0)");
        startGame(hashedMove, playerB);
    }

    /** @dev
      * @param gameId can be retrieved from GameStarted event
      * @param move play move
      */
    function respond(bytes32 gameId, GameMove move) public {
       require(move != GameMove.None, "move != GameMove.None");
       Game memory game = gameValidForResponse(gameId);
       wager(game.betAmount);

        game.playerB = msg.sender;
        game.gameState = GameState.Responded;
        game.playerBMove = move;
        _games[gameId] = game;
        emit GameResponded(game.playerA, game.playerB, gameId, move);
    }

    /** @dev this method can be called only by player that knows secret phase for particular game (usually player that started the game - playerA)
      * @param secretPhrase secret phase that was used for starting the game (part of hashed parameter "hashedMove" of function startPublicGame or startPrivateGame)
      * @param gameId can be retrieved from GameStarted event
      */
    function reveal(bytes32 secretPhrase, bytes32 gameId) public {
        Game memory game = _games[gameId];
        require(game.playerAMove != 0, "game.playerAMove != 0");
        require(game.playerA == msg.sender, "game.playerA == msg.sender");
        require(game.playerBMove != GameMove.None, "game.playerBMove != GameMove.None");
        require(game.gameState == GameState.Responded, "game.gameState == GameState.Responded");

        // rock
        bool moveDecoded = decodeMove(GameMove.Rock, secretPhrase, game.playerAMove);
        address winner;
        if (moveDecoded) {
            winner = evaluate(GameMove.Rock, game.playerBMove, game.playerA, game.playerB, game.betAmount);
        }

        // paper
        if (!moveDecoded) {
            moveDecoded = decodeMove(GameMove.Paper, secretPhrase, game.playerAMove);
            if (moveDecoded) {
                winner = evaluate(GameMove.Paper, game.playerBMove, game.playerA, game.playerB, game.betAmount);
            }
        }

        // scissors
        if (!moveDecoded) {
            moveDecoded = decodeMove(GameMove.Scissors, secretPhrase, game.playerAMove);
            if (moveDecoded) {
                winner = evaluate(GameMove.Scissors, game.playerBMove, game.playerA, game.playerB, game.betAmount);
            }
        }

        if (!moveDecoded) {
            revert("Secret phrase decode failed");
        }

        game.gameState = GameState.Completed;
        _games[gameId] = game;
        emit GameRevealed(game.playerA, game.playerB, gameId, winner);
    }

     /** @dev 
       * Game is initialized with a deadline, once the deadline is breached, anyone can request evaluation of the game.
       * If there was no response to the game, all money is returned to playerA
       * If playerB responded to the game, automatically after deadline playerB is the winner.
       * @param gameId play move
       */
     function revealAfterDeadline(bytes32 gameId) public {
        Game memory game = _games[gameId];
        require(game.gameState != GameState.Completed, "game.gameState != GameState.Completed");
        require(game.gameState != GameState.PassedDeadline, "game.gameState != GameState.PassedDeadline");
        require(game.deadline < block.timestamp, "game.deadline < block.timestamp");

        if (game.gameState == GameState.Started) {
            // returning money to playerA
            updateWageredBalances(game.playerA, address(0), game.betAmount);

            _balances[game.playerA] = _balances[game.playerA] + game.betAmount;
        } else {
            // by deafult playerB is the winner
            updateWageredBalances(game.playerA, game.playerB, game.betAmount);
            _balances[game.playerB] = _balances[game.playerB] + game.betAmount * 2;
        }

        game.gameState = GameState.PassedDeadline;
        _games[gameId] = game;

        emit GameRevealedAfterDeadline(game.playerA, game.playerB, gameId);
    }

    function setBetAmount(uint256 betAmount) public onlyOwner {
        _betAmount = betAmount;
    }

    function setGameDeadlineInSeconds(uint32 gameDeadlineInSeconds) public onlyOwner {
        _gameDeadlineInSeconds = gameDeadlineInSeconds;
    }

    function decodeMove(GameMove move, bytes32 secretPhrase, bytes32 hashedMove) private pure returns(bool) {
        bytes32 hashed = keccak256(abi.encodePacked(move, secretPhrase));
        return hashed == hashedMove;
    }

    function wageredBalanceOf(address account) public view returns (uint256) {
        return _wageredBalances[account];
    }

    function evaluate(GameMove playerAMove, GameMove playerBMove, address playerA, address playerB, uint256 betAmount) private returns(address) {
        if (playerAMove == playerBMove) {
            return draw(playerA, playerB, betAmount);
        } else if (playerAMove == GameMove.Paper) {
            if (playerBMove == GameMove.Rock) {
                return defeat(playerA, playerB, betAmount);
            } else if (playerBMove == GameMove.Scissors) {
                return victory(playerA, playerB, betAmount);
            }
        } else if (playerAMove == GameMove.Rock) {
            if (playerBMove == GameMove.Paper) {
                return victory(playerA, playerB, betAmount);
            } else if (playerBMove == GameMove.Scissors) {
                return defeat(playerA, playerB, betAmount);
            }
        } else if (playerAMove == GameMove.Scissors) {
            if (playerBMove == GameMove.Paper) {
                return defeat(playerA, playerB, betAmount);
            } else if (playerBMove == GameMove.Rock) {
                return victory(playerA, playerB, betAmount);
            } 
        }

        revert("unable to evaluate game");
    }

    function draw(address playerA, address playerB, uint256 betAmount) private returns(address) {
        _balances[playerA] = _balances[playerA] + betAmount;
        _balances[playerB] = _balances[playerB] + betAmount;
        updateWageredBalances(playerA, playerB, betAmount);
        return address(0);
    }

    function defeat(address playerA, address playerB, uint256 betAmount) private returns(address) {
        _balances[playerA] = _balances[playerA] + 2 * betAmount;
        updateWageredBalances(playerA, playerB, betAmount);
        return playerA;
    }

    function victory(address playerA, address playerB, uint256 betAmount) private returns(address) {
        _balances[playerB] = _balances[playerB] + 2 * betAmount;
        updateWageredBalances(playerA, playerB, betAmount);
        return playerB;
    }

    function updateWageredBalances(address playerA, address playerB, uint256 betAmount) private {
        if (betAmount == 0) {
            return;
        }
        
        uint256 wageredBalanceSender =  _wageredBalances[playerA];
        require (wageredBalanceSender >= betAmount, "wageredBalanceSender >= betAmount");
        unchecked{
            _wageredBalances[playerA] = wageredBalanceSender - betAmount;
        }

        if (playerB == address(0)) {
            return;
        }

        uint256 playerBWageredBalance = _wageredBalances[playerB];
        require(playerBWageredBalance >= betAmount, "playerBWageredBalance >= betAmount");
        unchecked{
            _wageredBalances[playerB] =  playerBWageredBalance - betAmount;
        }
    }

    function wager(uint256 betAmount) private {
         uint256 currentBalance = _balances[msg.sender];
        require(currentBalance >= betAmount, "balance >= betAmount");
        uint256 wageredBalance = _wageredBalances[msg.sender];
        unchecked {
            _balances[msg.sender] = currentBalance - betAmount;
        }
        _wageredBalances[msg.sender] = wageredBalance + betAmount;
    }

    function gameValidForResponse(bytes32 gameId) private view returns (Game memory) {
        Game memory game = _games[gameId];
        require(game.playerAMove != 0, "game.playerAMove != 0");
        require(game.playerB == address(0) || game.playerB == msg.sender);
        return game;
    }

    function startGame(bytes32 hashedMove, address playerB) private {
        wager(_betAmount);
        bytes32 gameId = keccak256(abi.encodePacked(msg.sender, hashedMove, block.number));
        Game memory game = Game({
            playerA: msg.sender,
            playerB: playerB,
            betAmount: _betAmount,
            playerAMove: hashedMove,
            gameState: GameState.Started,
            playerBMove: GameMove.None,
            deadline: uint48(block.timestamp + _gameDeadlineInSeconds)
        });

        _games[gameId] = game;
        emit GameStarted(msg.sender, playerB, gameId);
    }
}