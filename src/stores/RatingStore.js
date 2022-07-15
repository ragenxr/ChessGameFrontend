import {flow, makeObservable, observable} from 'mobx';
import Api from '../gateway/Api';

class RatingStore {
  @observable ratings = [];

  constructor(AuthStore) {
    makeObservable(this);

    this.AuthStore = AuthStore;
  }

  @flow *fetch() {
    const result = yield new Api(this.AuthStore.token)
      .get(
        '/api/statistics',
        {
          limit: 1000
        }
      );

    if (result)  {
      this.ratings = result.statistics;
    }
  }
}

export default RatingStore;
