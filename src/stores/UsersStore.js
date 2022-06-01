import {flow, makeObservable, observable} from 'mobx';
import Api from '../utils/Api';

class UsersStore {
  users = [];

  constructor(AuthStore) {
    makeObservable(
      this,
      {
        users: observable,
        fetch: flow
      }
    );

    this.AuthStore = AuthStore;
  }

  *fetch() {
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

  *add(login) {
    this.users.push(
      yield new Api(this.AuthStore.token)
        .post('/api/users', {
          login,
          password: 'Passw0rd'
        })
    );
  }

  *setStatus(userId, status) {
    const user = this.users.find(({id}) => id === userId)

    if(!user) {
      return;
    }

    yield new Api(this.AuthStore.token)
      .put(`/api/users/${userId}`, {status});

    user.status = status;
    user.updatedAt = new Date().toUTCString();
  }

  *block(userId) {
    yield* this.setStatus(userId, 'deleted');
  }

  *unblock(userId) {
    yield* this.setStatus(userId, 'active');
  }

  get hasAccess() {
    return this.AuthStore.user?.rights?.some(({level, entity}) => entity === 'users' && Boolean(level & 1 << 0));
  }
}

export default UsersStore;
