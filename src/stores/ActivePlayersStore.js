import {action, makeObservable, observable, toJS} from 'mobx';

class ActivePlayersStore {
  @observable activePlayers = [];
  @observable awaitTimeout = null;
  @observable invitation = null;

  constructor(AuthStore, socket) {
    makeObservable(this);

    this.AuthStore = AuthStore;
    this.socket = socket;

    this.socket.on('players:list', (data) => this.setActivePlayers(data));
    this.socket.on('players:invited', ({from, to}) => this.setInviter(from, to));
    this.socket.on('players:accepted', ({gameId}) => socket.emit('games:connect', gameId));

    for (const event of ['players:unavailable', 'players:cancelled', 'players:declined', 'players:accepted']) {
      this.socket.on(event, () => this.cancel());
    }

    for (const event of ['players:cancelled', 'players:declined', 'players:accepted']) {
      this.socket.on(event, () => this.removeInvitation());
    }
  }

  @action setActivePlayers(activePlayers) {
    this.activePlayers = activePlayers.filter(({id}) => id !== this.AuthStore.user?.id);
  }

  @action setInviter(from, to) {
    if (this.invitation) {
      this.socket.emit('players:unavailable', {from, to});

      return;
    }

    this.invitation = {from, to};
  }

  @action invite(userId) {
    this.socket.emit('players:invite', userId);

    this.awaitTimeout = setTimeout(
      () => {
        this.socket.emit('players:cancel', userId);
        this.awaitTimeout = null;
      },
      15000
    );
  }

  @action accept() {
    this.socket.emit('players:accept', this.invitation);
  }

  @action decline() {
    this.socket.emit('players:decline', this.invitation);
  }

  @action cancel() {
    if (this.awaitTimeout) {
      const timeout = toJS(this.awaitTimeout);

      this.awaitTimeout = null;

      clearTimeout(timeout);
    }
  }

  @action removeInvitation() {
    if (this.invitation) {
      this.invitation = null;
    }
  }
}

export default ActivePlayersStore;
