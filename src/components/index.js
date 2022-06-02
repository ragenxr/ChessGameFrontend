import * as React from 'react';
import {Routes, Navigate, Route, Router} from 'react-router';
import {observer} from 'mobx-react';
import {StoreContext} from '../stores';
import './styles.css';
import Rating from './Rating';
import Players from './Players';
import History from './History';
import Login from './Login';
import ActivePlayers from './ActivePlayers';
import Game from './Game';
import Navbar from './Navbar';
import {ReactComponent as CloseIcon} from './Players/close.svg';

class App extends React.Component {
  static contextType = StoreContext;

  render() {
    const routes = [
      {
        path: '/game/:id',
        getParam: () => this.context.GameStore.game?.id,
        title: 'Игровое поле',
        component: <Game/>
      },
      {
        path: '/game',
        title: null,
        component: <Game/>
      },
      {
        path: '/rating',
        title: 'Рейтинг',
        component: <Rating/>
      },
      {
        path: '/active',
        title: 'Активные игроки',
        component: <ActivePlayers/>
      },
      {
        path: '/history',
        title: 'История игр',
        component: <History/>
      },
      {
        path: '/players',
        title: 'Список игроков',
        component: <Players/>
      }
    ];

    return (
      <Router location={this.context.RouterStore.location} navigator={this.context.RouterStore.history}>
        <div className="app">
          <Routes>
            <Route index element={<Navigate to="/rating" replace/>}/>
            <Route path="login" element={<Login/>}/>
            {
              routes.map(
                ({path, component}) => (
                  <Route key={path} path={path} element={
                    true ?
                      <>
                        <Navbar routes={routes}/>
                        {component}
                      </> :
                      <Navigate to="/login" state={{from: path}} replace/>
                  }/>
                )
              )
            }
          </Routes>
          {
            this.context.ActivePlayersStore.invitation &&
            <div className="modal">
              <div className="modal__window">
                <div className="modal__header">
                  <button
                    className="modal__close"
                    onClick={() => this.context.ActivePlayersStore.decline()}
                  >
                    <CloseIcon className="modal__close-icon"/>
                  </button>
                </div>
                <h1 className="text text_title modal__title">
                  {this.context.ActivePlayersStore.invitation?.from?.login} приглашает вас в игру!
                </h1>
                <form className="modal__content form invitation">
                  <input
                    type="submit"
                    className="button button_primary form__submit modal__submit"
                    value="Принять"
                    onClick={(e) => {
                      e.preventDefault();

                      this.context.ActivePlayersStore.accept()
                    }}
                  />
                  <input
                    type="submit"
                    className="button button_secondary form__submit modal__submit"
                    value="Отклонить"
                    onClick={(e) => {
                      e.preventDefault();

                      this.context.ActivePlayersStore.decline()
                    }}
                  />
                </form>
              </div>
            </div>
          }
        </div>
      </Router>
    );
  }
}


export default observer(App);
