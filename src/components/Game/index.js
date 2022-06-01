import * as React from 'react';
import {observer} from 'mobx-react';
import {StoreContext} from '../../stores';
import {ReactComponent as CrossIcon} from '../History/cross.svg';
import {ReactComponent as CircleIcon} from '../History/circle.svg';
import {ReactComponent as CloseLogo} from '../Players/close.svg';
import {ReactComponent as SendIcon} from './send.svg';
import './styles.css';

class Game extends React.Component {
  static contextType = StoreContext;

  constructor(props) {
    super(props);

    this.state = {
      message: ''
    };
  }


  render() {
    return (
      <>
        <div className="app__content game">
          <aside className="box game__players">
            <h1 className="text text_title">Игроки</h1>
            <div className="game__player-stat">
              {
                this.context.GameStore.game?.playerOne &&
                <>
                  <CrossIcon className="game__player-icon game__player-icon_cross"/>
                  <div>
                    <p className="text player-stat__name">{this.context.GameStore.game?.playerOne}</p>
                    <small className="text player-stat__win-rate">
                      {
                        this.context.GameStore.game?.playerOneStat?.winRate &&
                        `${Math.round(this.context.GameStore.game?.playerOneStat?.winRate * 100)}%`
                      }
                    </small>
                  </div>
                </>
              }
            </div>
            <div className="game__player-stat">
              {
                this.context.GameStore.game?.playerTwo &&
                <>
                  <CircleIcon className="game__player-icon game__player-icon_circle"/>
                  <div>
                    <p className="text player-stat__name">{this.context.GameStore.game?.playerTwo}</p>
                    <small className="text player-stat__win-rate">
                      {
                        this.context.GameStore.game?.playerTwoStat?.winRate &&
                        `${Math.round(this.context.GameStore.game?.playerTwoStat?.winRate * 100)}%`
                      }
                    </small>
                  </div>
                </>
              }
            </div>
          </aside>
          <div className="game__info">
            <div className="text game__timer">
              {
                this.context.GameStore.game?.time ?
                  new Date(this.context.GameStore.game.time * 1000)
                    .toUTCString()
                    .match(/\d\d:\d\d:\d\d/)[0] :
                  '00:00:00'
              }
            </div>
            <main className="game__field tic-tac-toe-field">
              {
                this.context.GameStore.field.map(
                  (value, idx) =>
                    <div
                      key={idx}
                      className={
                        [
                          'tic-tac-toe-field__cell',
                          ...this.context.GameStore.game?.winPosition?.includes(idx) ?
                            [
                              this.context.GameStore.game.winner === this.context.GameStore.game.playerOne ?
                                'tic-tac-toe-field__cell_cross-win' :
                                'tic-tac-toe-field__cell_circle-win'
                            ] :
                            []
                        ].join(' ')
                      }
                      onClick={() => this.context.GameStore.makeMove(idx)}
                    >
                      {
                        value &&
                        (
                          value === 'X' ?
                            <CrossIcon
                              className="game__player-icon game__player-icon_cross game__player-icon_field-size"
                            /> :
                            <CircleIcon
                              className="game__player-icon game__player-icon_circle game__player-icon_field-size"
                            />
                        )
                      }
                    </div>
                )
              }
            </main>
          </div>
          <aside className="game__chat chat">
            <div className="chat__messages">
              {
                this.context.GameStore.game?.messages?.length ?
                  this.context.GameStore.game.messages.map(
                    ({date, player, message}) =>
                      <div
                        key={date}
                        className={
                          [
                            'chat__message',
                            player === this.context.GameStore.game.playerOne ?
                              'chat__message_left' :
                              'chat__message_right'
                          ].join(' ')
                        }
                      >
                        <div className="chat__message-header">
                          <p
                            className={
                              [
                                'chat__sender-name',
                                player === this.context.GameStore.game.playerOne ?
                                  'chat__sender-name_left' :
                                  'chat__sender-name_right'
                              ].join(' ')
                            }
                          >
                            {player}
                          </p>
                          <p className="chat__send-time">{date.match(/(\d\d:\d\d):\d\d/)[1]}</p>
                        </div>
                        <p className="chat__message-text">{message}</p>
                      </div>
                  ) :
                  <div className="text chat__placeholder">Сообщений еще нет</div>
              }
            </div>
            <div className="chat__send">
              <div className="input chat__send-input">
                <input
                  className="input__textbox"
                  placeholder="Сообщение..."
                  value={this.state.message}
                  onChange={(e) => this.setState({message: e.target.value})}
                />
              </div>
              <button
                className="button button_primary chat__send-btn"
                onClick={(e) => {
                  e.preventDefault();

                  if(!this.state.message) {
                    return;
                  }

                  this.context.GameStore.send(this.state.message);

                  this.setState({message: ''});
                }}
              >
                <SendIcon className="chat__send-icon"/>
              </button>
            </div>
          </aside>
        </div>
        {
          this.context.GameStore.error &&
          <div className="modal">
            <div className="modal__window">
              <div className="modal__header">
                <button
                  className="modal__close"
                  onClick={() => this.context.GameStore.clearError()}
                >
                  <CloseLogo/>
                </button>
              </div>
              <h1 className="text text_title modal__title">Ошибка</h1>
              <div className="modal__content error-modal">
                {this.context.GameStore.error}
              </div>
            </div>
          </div>
        }
        {
          this.context.GameStore.game?.finished &&
          <div className="modal">
            <div className="modal__window">
              <div className="modal__header">
                <button
                  className="modal__close"
                  onClick={() => this.context.GameStore.clear()}
                >
                  <CloseLogo/>
                </button>
              </div>
              <h1 className="text text_title modal__title">Игра окончена</h1>
              <div className="modal__content error-modal">
                {
                  this.context.GameStore.game.winner ?
                    `Победил ${this.context.GameStore.game.winner}!` :
                    'Ничья!'
                }
              </div>
            </div>
          </div>
        }
      </>
    )
  }
}

export default observer(Game);
