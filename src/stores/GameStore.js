import {action, computed, flow, makeObservable, observable} from 'mobx';
import Api from '../utils/Api';

class GameStore {
  @observable game = null;
  @observable error = null;
  timer = null;

  constructor(AuthStore, RouterStore, socket) {
    makeObservable(this);

    this.AuthStore = AuthStore;
    this.RouterStore = RouterStore;
    this.socket = socket;

    this.socket.on('games:connected', (game) => this.onConnected(game))
    this.socket.on('games:move-made', ({position}) => this.onMoveMade(position))
    this.socket.on('games:finished', ({winner, winPosition}) => this.onFinished(winner, winPosition));
    this.socket.on('games:already-finished', () => this.setError('Игра уже завершена'));
    this.socket.on('games:not-invited', () => this.setError('Вы не приглашены в эту игру'));
    this.socket.on('games:error', (error) => this.setError(error));
    this.socket.on('games:message', ({player, message}) => this.onReceive(player, message));
  }

  @action makeMove(position) {
    this.socket.emit('games:make-move', this.game.id, position);
  }

  @action close() {
    this.game = null;
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

  @action onMoveMade(position) {
    if(!this.game) {
      return;
    }

    this.game.moves.push({position, number: this.game.moves.length + 1});
  }

  @action onFinished(winner, winPosition) {
    if(!this.game) {
      return;
    }

    this.game.finished = true;
    this.game.winner = winner.symbol === 'X' ? this.game.playerOne : this.game.playerTwo;
    this.game.winPosition = winPosition;

    clearInterval(this.timer);
  }

  @action clear() {
    this.game = null;
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

  @computed get field() {
    if(!this.game) {
      return Array.from({length: 3 * 3});
    }

    const size = this.game?.size || 3;

    return this.game.moves.reduce(
      (field, {position, number}) => Object.values({
        ...Object.fromEntries(Object.entries(field)),
        [position]: number % 2 === 1 ? 'X' : 'O'
      }),
      Array.from({length: size * size})
    );
  }
}

export default GameStore;
