import {action, autorun, computed, flow, makeObservable, observable} from 'mobx';

class AuthStore {
  token = localStorage.getItem('token');

  constructor() {
    makeObservable(
      this,
      {
        token: observable,
        getToken: flow,
        logout: action,
        user: computed,
        isLoggedIn: computed
      }
    );

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

  *getToken(login, password) {
    const response = yield fetch(
      'http://localhost:12321/api/auth/token',
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

  logout() {
    this.token = null;
  }

  get user() {
    if (!this.token) {
      return null;
    }

    return JSON.parse(window.atob(this.token.split('.')[1])).sub;
  }

  get isLoggedIn() {
    return Boolean(this.token);
  }
}

export default AuthStore;
