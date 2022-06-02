import * as React from 'react';
import {observer} from 'mobx-react';
import {StoreContext} from '../../stores';
import {ReactComponent as LoaderIcon} from './loader.svg';
import cn from './styles.module.css';

class ActivePlayers extends React.Component {
  static contextType = StoreContext;

  render() {
    return (
      <>
        <main className="box app__content app__content_centered active-players">
          <div className="box__header">
            <h1 className="text text_title active-players__title">Список игроков</h1>
          </div>
          <table className="active-players__table table">
            <tbody>
            {
              this.context.ActivePlayersStore.activePlayers?.length ?
                this.context.ActivePlayersStore.activePlayers.map(
                  ({id, login, isFree}) => (
                    <tr key={id} className="table__row">
                      <th className={`text table__cell ${cn['active-players__login']}`}>{login}</th>
                      <th className="text table__cell active-players__status-wrapper">
                        <div
                          className={
                            [
                              cn['active-players__status'],
                              isFree ? cn['active-players__status_free'] : cn['active-players__status_busy']
                            ].join(' ')
                          }
                        >
                          {isFree ? 'Свободен' : 'В игре'}
                        </div>
                      </th>
                      <th className={`text table__cell ${cn['active-players__button']}`}>
                        <button
                          className={
                            [
                              'button',
                              'button_primary',
                              ...!isFree ? ['disabled'] : []
                            ].join(' ')
                          }
                          onClick={() => this.context.ActivePlayersStore.invite(id)}
                        >
                          Позвать играть
                        </button>
                      </th>
                    </tr>
                  )
                ) :
                <tr className="table__row">
                  <td className="table__cell">
                    <h3 className={cn['active-players__empty']}>Никто не онлайн</h3>
                  </td>
                </tr>
            }
            </tbody>
          </table>
        </main>
        {
          this.context.ActivePlayersStore.awaitTimeout &&
          <div className="modal loader">
            <LoaderIcon className="loader__icon"/>
          </div>
        }
      </>
    );
  }
}

export default observer(ActivePlayers);
