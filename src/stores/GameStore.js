import {action, computed, flow, makeObservable, observable} from 'mobx';
import Api from '../gateway/Api';
import Game from '../components/entity/chess'
import Square from '../components/entity/square'

class GameStore {
  @observable game = null;
  @observable gameState = null;
  @observable error = null;
  @observable draggedPieceTargetId = '';
  @observable playerTurnToMoveIsWhite = true;
  @observable whiteKingInCheck = false;
  @observable blackKingInCheck = false;
  timer = null;

  constructor(AuthStore, RouterStore, socket) {
    makeObservable(this);

    this.AuthStore = AuthStore;
    this.RouterStore = RouterStore;
    this.socket = socket;

    this.socket.on('games:connected', (game) => this.onConnected(game))
    this.socket.on('games:move-made', (move) => this.onMoveMade(move))
    this.socket.on('games:finished', ({winner, winPosition}) => this.onFinished(winner, winPosition));
    this.socket.on('games:already-finished', () => this.setError('Игра уже завершена'));
    this.socket.on('games:not-invited', () => this.setError('Вы не приглашены в эту игру'));
    this.socket.on('games:error', (error) => this.setError(error));
    this.socket.on('games:message', ({player, message}) => this.onReceive(player, message));
  }

  @action makeMove(selectedId, finalPosition) {
    this.socket.emit(
      'games:make-move',
      {
        nextPlayerColorToMove: !this.gameState?.thisPlayersColorIsWhite,
        playerColorThatJustMovedIsWhite: this.gameState?.thisPlayersColorIsWhite,
        selectedId: selectedId,
        finalPosition: finalPosition,
        gameId: this.game?.id
      }
    );
  }

  @action finishGame(color) {
    this.socket.emit(
      'games:finish-game',
      {
        gameId: this.game?.id,
        player: color
      }
    );
  }

  @action close() {
    this.game = null;
    this.gameState = null;
  }

  @action setError(error) {
    this.error = error;
  }

  @action clearError() {
    this.error = null;
  }

  @action send(message) {
    if (!this.game) {
      return;
    }

    this.socket.emit('games:message', this.game.id, message);
  }

  @action onConnected(game) {
    this.game = {...game, time: 0, finished: false, winner: null, winPosition: null};
    this.gameState = new Game(this.color);
    this.timer = setInterval(
      () => this.increment(),
      1000
    );

    this.fetchPlayerOneStat();
    this.fetchPlayerTwoStat();

    this.RouterStore.push(`/game/${this.game.id}`, {});
  }

  @action increment() {
    this.game.time = this.game.time + 1;
  }

  @action onMoveMade(move) {
    if(!this.game) {
      return;
    }

    if (move.playerColorThatJustMovedIsWhite !== this.color) {
      this.movePiece(move.selectedId, move.finalPosition, this.gameState, false);
      this.playerTurnToMoveIsWhite = !move.playerColorThatJustMovedIsWhite;
    }
  }

  @action movePiece = (selectedId, finalPosition, currentGame, isMyMove) => {
    let whiteKingInCheck = false;
    let blackKingInCheck = false;
    let blackCheckmated = false;
    let whiteCheckmated = false;
    const update = currentGame.movePiece(selectedId, finalPosition, isMyMove);

    if (update === "moved in the same position.") {
      this.revertToPreviousState(selectedId);

      return;
    }
    if (update === "user tried to capture their own piece") {
      this.revertToPreviousState(selectedId);

      return;
    }
    if (update === "invalid move") {
      this.revertToPreviousState(selectedId);

      return;
    }
    if (update === "b is in check" || update === "w is in check") {
      if(update[0] === "b") {
        blackKingInCheck = true;
      } else {
        whiteKingInCheck = true;
      }
    }
    if (update === "b has been checkmated" || update === "w has been checkmated") {
      if(update[0] === "b") {
        blackCheckmated = true;
      } else {
        whiteCheckmated = true;
      }
    }

    if (isMyMove) {
      this.makeMove(selectedId, finalPosition);
    }

    // this.props.playAudio();

    this.draggedPieceTargetId = '';
    this.gameState = currentGame;
    this.playerTurnToMoveIsWhite = !this.color;
    this.whiteKingInCheck = whiteKingInCheck;
    this.blackKingInCheck = blackKingInCheck;

    if (blackCheckmated) {
      this.finishGame(true);
    } else if (whiteCheckmated) {
      this.finishGame(false);
    }
  }

  @action revertToPreviousState = (selectedId) => {
    const oldGS = this.gameState;
    const oldBoard = oldGS.getBoard();
    const tmpGS = new Game(true);
    const tmpBoard = [];

    for (let i = 0; i < 8; i++) {
      tmpBoard.push([]);

      for (let j = 0; j < 8; j++) {
        if (oldBoard[i][j].getPieceIdOnThisSquare() === selectedId) {
          tmpBoard[i].push(new Square(j, i, null, oldBoard[i][j].canvasCoord));
        } else {
          tmpBoard[i].push(oldBoard[i][j]);
        }
      }
    }

    tmpGS.setBoard(tmpBoard);
    this.gameState = tmpGS;
    this.draggedPieceTargetId = '';

    setTimeout(() => {
      this.gameState = oldGS;
    });
  }

  @action setDragged(target) {
    this.draggedPieceTargetId = target;
  }

  @action onFinished(winner, winPosition) {
    if(!this.game) {
      return;
    }

    this.game.finished = true;
    this.game.winner = winner ? this.game.playerOne : this.game.playerTwo;

    clearInterval(this.timer);
  }

  @action clear() {
    this.game = null;
    this.gameState = null;
  }

  @action onReceive(player, message) {
    if(!this.game) {
      return;
    }

    if(!this.game.messages) {
      this.game.messages = [];
    }

    this.game.messages.unshift({player, message, date: new Date().toUTCString()});
  }

  @flow *fetchPlayerOneStat() {
    if(!this.game) {
      return;
    }

    this.game.playerOneStat = yield new Api(this.AuthStore.token)
      .get(`/api/statistics/${this.game.playerOneId}`);
  }

  @flow *fetchPlayerTwoStat() {
    if(!this.game) {
      return;
    }

    this.game.playerTwoStat = yield new Api(this.AuthStore.token)
      .get(`/api/statistics/${this.game.playerTwoId}`);
  }

  @computed get color() {
    return this.game?.playerOneId === this.AuthStore.user.id;
  }
}

export default GameStore;
