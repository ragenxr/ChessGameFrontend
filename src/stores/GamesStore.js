import {flow, makeObservable, observable} from 'mobx';
import Api from '../utils/Api';

class GamesStore {
  games = [];

  constructor(AuthStore) {
    makeObservable(
      this,
      {
        games: observable,
        fetch: flow
      }
    );

    this.AuthStore = AuthStore;
  }

  *fetch() {
    this.games = yield new Api(this.AuthStore.token)
      .get(
        '/api/games',
        {
          fields: ['id', 'winner', 'playerOne', 'playerTwo', 'createdAt', 'finishedAt'],
          sort: 'createdAt',
          limit: 1000
        }
      );
  }
}

export default GamesStore;
