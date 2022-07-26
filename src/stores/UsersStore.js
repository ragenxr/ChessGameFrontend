import {computed, flow, makeObservable, observable} from 'mobx';
import Api from '../gateway/Api';

class UsersStore {
  @observable users = [];

  constructor(AuthStore) {
    makeObservable(this);

    this.AuthStore = AuthStore;
  }

  @flow *fetch() {
    this.users = yield new Api(this.AuthStore.token)
      .get(
        '/api/users',
        {
          fields: ['id', 'login', 'status', 'createdAt', 'updatedAt'],
          filters: ['status neq null'],
          sort: 'createdAt',
          limit: 1000
        }
      );
  }

  @flow *add(login) {
    this.users.push(
      yield new Api(this.AuthStore.token)
        .post('/api/users', {
          login,
          password: 'Passw0rd'
        })
    );
  }

  @flow *setStatus(userId, status) {
    const user = this.users.find(({id}) => id === userId)

    if(!user) {
      return;
    }
    
    const res = yield new Api(this.AuthStore.token)
    .put(`/api/users/${userId}`, {status});

    if (!res) {
    return;
    }
   
    user.status = status;
    user.updatedAt = new Date().toUTCString();
  }

  @flow *block(userId) {
    yield* this.setStatus(userId, 'deleted');
  }

  @flow *unblock(userId) {
    yield* this.setStatus(userId, 'active');
  }

  @computed get hasAccess() {
    return this.AuthStore.user?.rights?.some(({level, entity}) => entity === 'users' && Boolean(level & 1 << 0));
  }
}

export default UsersStore;
