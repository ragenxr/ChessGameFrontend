import {action, autorun, computed, flow, makeObservable, observable} from 'mobx';

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
    const response = yield fetch(
      '/api/auth/token',
      {
        method: 'POST',
        body: JSON.stringify({login, password}),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const {token, error} = yield response.json();

    if (!token) {
      throw new Error(error);
    }

    this.token = token;
  }

  @action logout() {
    this.token = null;
  }

  @computed get user() {
    if (!this.token) {
      return null;
    }

    return JSON.parse(window.atob(this.token.split('.')[1])).sub;
  }

  @computed get isLoggedIn() {
    return Boolean(this.token);
  }
}

export default AuthStore;
