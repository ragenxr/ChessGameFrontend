import * as React from 'react';
import {io} from 'socket.io-client';
import AuthStore from './AuthStore';
import ActivePlayersStore from './ActivePlayersStore';
import RatingStore from './RatingStore';
import UsersStore from './UsersStore';
import GamesStore from './GamesStore';
import {reaction} from 'mobx';
import GameStore from './GameStore';
import RouterStore from './RouterStore';
import {createBrowserHistory} from 'history';

export const StoreContext = React.createContext(null);
export class Store {
  socket;
  history;
  RouterStore;
  AuthStore;
  RatingStore;
  UsersStore;
  GamesStore;
  GameStore;
  ActivePlayersStore;

  constructor() {
    this.history = createBrowserHistory();
    this.RouterStore = new RouterStore(this.history);
    this.AuthStore = new AuthStore();
    this.RatingStore = new RatingStore(this.AuthStore);
    this.UsersStore = new UsersStore(this.AuthStore);
    this.GamesStore = new GamesStore(this.AuthStore);

    this.socket = io(
      'ws://localhost:12321',
      {
        transports: ['websocket'],
        query: {
          token: this.AuthStore?.token
        }
      }
    );

    this.socket.io.on(
      'reconnect_attempt',
      () => {
        this.socket.io.opts.query.token = this.AuthStore?.token;
      }
    );

    reaction(
      () => this.AuthStore.token,
      () => {
        this.socket.disconnect();
        this.socket.connect();
      }
    );

    this.ActivePlayersStore = new ActivePlayersStore(this.AuthStore, this.socket);
    this.GameStore = new GameStore(this.AuthStore, this.RouterStore, this.socket);
  }
}
