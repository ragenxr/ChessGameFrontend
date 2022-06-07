import {action, autorun, computed, flow, makeObservable, observable} from 'mobx';
import Api from '../utils/Api';

class AuthStore {
  @observable token = localStorage.getItem('token');

  constructor() {
    makeObservable(this);

    autorun(
      () => {
        if (this.token) {
          localStorage.setItem('token', this.token);
        } else {
          localStorage.removeItem('token');
        }
      }
    );
  }

  @flow *getToken(login, password) {
    const {token} = yield new Api().post(
      '/api/auth/token',
      {login, password}
    );

    if (token) {
      this.token = token;
    }
  }

  @action logout() {
    this.token = null;
  }

  @computed get user() {
    if (!this.token) {
      return null;
    }

    const [, encodedPayload,] = this.token.split('.');

    if (!encodedPayload) {
      return null;
    }

    try {
      return JSON.parse(window.atob(encodedPayload)).sub;
    } catch(e) {
      return null
    }
  }

  @computed get isLoggedIn() {
    return Boolean(this.user);
  }
}

export default AuthStore;
