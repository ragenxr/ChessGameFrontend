import {flow, makeObservable, observable} from 'mobx';
import Api from '../gateway/Api';

class GamesStore {
  @observable games = [];

  constructor(AuthStore) {
    makeObservable(this);

    this.AuthStore = AuthStore;
  }

  @flow *fetch() {
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
