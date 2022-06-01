import {action, makeObservable, observable, toJS} from 'mobx';

class ActivePlayersStore {
  activePlayers = [];
  awaitTimeout = null;
  invitation = null;

  constructor(AuthStore, socket) {
    makeObservable(
      this,
      {
        activePlayers: observable,
        awaitTimeout: observable,
        invitation: observable,
        setActivePlayers: action,
        setInviter: action,
        cancel: action,
        removeInvitation: action,
        invite: action,
        accept: action,
        decline: action
      }
    );

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

  setActivePlayers(activePlayers) {
    this.activePlayers = activePlayers.filter(({id}) => id !== this.AuthStore.user?.id);
  }

  setInviter(from, to) {
    if (this.invitation) {
      this.socket.emit('players:unavailable', {from, to});

      return;
    }

    this.invitation = {from, to};
  }

  invite(userId) {
    this.socket.emit('players:invite', userId);

    this.awaitTimeout = setTimeout(
      () => {
        this.socket.emit('players:cancel', userId);
        this.awaitTimeout = null;
      },
      15000
    );
  }

  accept() {
    this.socket.emit('players:accept', this.invitation);
  }

  decline() {
    this.socket.emit('players:decline', this.invitation);
  }

  cancel() {
    if (this.awaitTimeout) {
      const timeout = toJS(this.awaitTimeout);

      this.awaitTimeout = null;

      clearTimeout(timeout);
    }
  }

  removeInvitation() {
    if (this.invitation) {
      this.invitation = null;
    }
  }
}

export default ActivePlayersStore;
