import * as React from 'react';
import {observer} from 'mobx-react';
import {StoreContext} from '../../stores';
import CrossIcon from '../History/cross.svg';
import CircleIcon from '../History/circle.svg';
import CloseLogo from '../Players/close.svg';
import SendIcon from './send.svg';
import cn from './styles.module.scss';

@observer
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
        <div className={cn['game']}>
          <aside className={cn['game__players']}>
            <h1 className="text text_title">Игроки</h1>
            <div className={cn['game__player-stat']}>
              {
                this.context.GameStore.game?.playerOne &&
                <>
                  <CrossIcon className={`${cn['game__player-icon']} ${cn['game__player-icon_cross']}`}/>
                  <div className={cn['player-stat']}>
                    <p className={cn['player-stat__name']}>{this.context.GameStore.game?.playerOne}</p>
                    <small className={cn['player-stat__win-rate']}>
                      {
                        this.context.GameStore.game?.playerOneStat?.winRate &&
                        `${Math.round(this.context.GameStore.game?.playerOneStat?.winRate * 100)}%`
                      }
                    </small>
                  </div>
                </>
              }
            </div>
            <div className={cn['game__player-stat']}>
              {
                this.context.GameStore.game?.playerTwo &&
                <>
                  <CrossIcon className={`${cn['game__player-icon']} ${cn['game__player-icon_circle']}`}/>
                  <div className={cn['player-stat']}>
                    <p className={cn['player-stat__name']}>{this.context.GameStore.game?.playerTwo}</p>
                    <small className={cn['player-stat__win-rate']}>
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
          <div className={cn['game__info']}>
            <div className={cn['game__timer']}>
              {
                this.context.GameStore.game?.time ?
                  new Date(this.context.GameStore.game.time * 1000)
                    .toUTCString()
                    .match(/\d\d:\d\d:\d\d/)[0] :
                  '00:00:00'
              }
            </div>
            <main className={cn['game__field']}>
              {
                this.context.GameStore.field.map(
                  (value, idx) =>
                    <div
                      key={idx}
                      className={
                        [
                          cn['game__cell'],
                          ...this.context.GameStore.game?.winPosition?.includes(idx) ?
                            [
                              this.context.GameStore.game.winner === this.context.GameStore.game.playerOne ?
                                cn['game__cell_cross-win'] :
                                cn['game__cell_circle-win']
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
                              className={
                                [
                                  cn['game__player-icon'],
                                  cn['game__player-icon_cross'],
                                  cn['game__player-icon_field-size']
                                ].join(' ')
                              }
                            /> :
                            <CircleIcon
                              className={
                                [
                                  cn['game__player-icon'],
                                  cn['game__player-icon_circle'],
                                  cn['game__player-icon_field-size']
                                ].join(' ')
                              }
                            />
                        )
                      }
                    </div>
                )
              }
            </main>
          </div>
          <aside className={`${cn['game__chat']} ${cn['chat']}`}>
            <div className={cn['chat__messages']}>
              {
                this.context.GameStore.game?.messages?.length ?
                  this.context.GameStore.game.messages.map(
                    ({date, player, message}) =>
                      <div
                        key={date}
                        className={
                          [
                            cn['chat__message'],
                            player === this.context.GameStore.game.playerOne ?
                              cn['chat__message_left'] :
                              cn['chat__message_right']
                          ].join(' ')
                        }
                      >
                        <div className={cn['chat__message-header']}>
                          <p
                            className={
                              [
                                cn['chat__sender-name'],
                                player === this.context.GameStore.game.playerOne ?
                                  cn['chat__sender-name_left'] :
                                  cn['chat__sender-name_right']
                              ].join(' ')
                            }
                          >
                            {player}
                          </p>
                          <p>{date.match(/(\d\d:\d\d):\d\d/)[1]}</p>
                        </div>
                        <p>{message}</p>
                      </div>
                  ) :
                  <div className={cn['chat__placeholder']}>Сообщений еще нет</div>
              }
            </div>
            <div className={cn['chat__send']}>
              <div className={cn['chat__send-input']}>
                <input
                  className="input__textbox"
                  placeholder="Сообщение..."
                  value={this.state.message}
                  onChange={(e) => this.setState({message: e.target.value})}
                />
              </div>
              <button
                className={cn['chat__send-btn']}
                onClick={(e) => {
                  e.preventDefault();

                  if(!this.state.message) {
                    return;
                  }

                  this.context.GameStore.send(this.state.message);

                  this.setState({message: ''});
                }}
              >
                <SendIcon className={cn['chat__send-icon']}/>
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

export default Game;
