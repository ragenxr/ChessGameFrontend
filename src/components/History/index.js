import * as React from 'react';
import {observer} from 'mobx-react';
import {StoreContext} from '../../stores';
import CircleIcon from './circle.svg';
import CrossIcon from './cross.svg';
import trophyImg from './trophy.png';
import cn from './styles.module.scss';

class History extends React.Component {
  static contextType = StoreContext;

  async componentDidMount() {
    if(!this.context.GamesStore.games?.length) {
      await this.context.GamesStore.fetch();
    }
  }

  render() {
    return (
      <main className={cn['history']}>
        <h1 className="text text_title box__header">История игр</h1>
        <table className="table">
          <thead>
          <tr className="table__row">
            <th className="text text_bold table__cell">Игроки</th>
            <th className="text text_bold table__cell"/>
            <th className="text text_bold table__cell"/>
            <th className="text text_bold table__cell">Дата</th>
            <th className="text text_bold table__cell">Время игры</th>
          </tr>
          </thead>
          <tbody>
          {
            this.context.GamesStore.games
              ?.map(
                ({winner, playerOne, playerTwo, createdAt, finishedAt}) => (
                  <tr className="table__cell">
                    <th className={`${cn['history__player-two']} ${cn['player-row']}`}>
                      {<CircleIcon className={`${cn['player-row__icon']} ${cn['player-row__icon_circle']}`}/>}
                      {playerTwo}
                      {
                        winner === 2 &&
                        <img className={cn['history__trophy']} src={trophyImg} alt="Победитель"/>
                      }
                    </th>
                    <th className={cn['history__versus']}>против</th>
                    <th className={`${cn['history__player-two']} ${cn['player-row']}`}>
                      {<CrossIcon className={`${cn['player-row__icon']} ${cn['player-row__icon_cross']}`}/>}
                      {playerOne}
                      {
                        winner === 1 &&
                        <img className={cn['history__trophy']} src={trophyImg} alt="Победитель"/>
                      }
                    </th>
                    <th className="text table__cell">{new Date(createdAt).toDateString().slice(4)}</th>
                    <th className="text table__cell">
                      {
                        finishedAt ?
                          new Date(new Date(finishedAt) - new Date(createdAt)).toTimeString().slice(0, 8) :
                          new Date(createdAt).toTimeString().slice(0, 8)
                      }
                    </th>
                  </tr>
                )
              )
          }
          </tbody>
        </table>
      </main>
    )
  }
}

export default observer(History);
