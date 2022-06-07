import {action, makeObservable, observable, observe, toJS} from 'mobx';

class RouterStore {
  @observable location = null;

  constructor(history) {
    makeObservable(this);

    this.history = history;

    const unsubscribeFromHistory = history.listen(({location}) => {
      this.updateLocation(location);
    });

    this.updateLocation(history.location);

    history.subscribe = (listener) => {
      const onStoreChange = () => {
        listener(toJS(this.location), history.action);
      };

      const unsubscribeFromStore = observe(this, 'location', onStoreChange, false);

      listener(this.location, history.action);

      return unsubscribeFromStore;
    };
    history.unsubscribe = unsubscribeFromHistory;
  }

  @action updateLocation(location) {
    this.location = location;
  }

  push = (location, state) => {
    this.history.push(location, state);
  }

  replace = (location, state) => {
    this.history.replace(location, state);
  }

  go = (n) => {
    this.history.go(n);
  }

  goBack = () => {
    this.history.goBack();
  }

  goForward = () => {
    this.history.goForward();
  }

  createHref = (to) => {
    this.history.createHref(to);
  }
}

export default RouterStore;
