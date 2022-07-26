import * as React from 'react';
import {observer} from 'mobx-react';
import {StoreContext} from '../../stores';
import KingBIcon from './ChessKingB.png';
import KingWIcon from './ChessKingW.png';
import trophyImg from './trophy.png';
import cn from './styles.module.scss';

@observer
class History extends React.Component {
  static contextType = StoreContext;

  async componentDidMount() {
    {
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
                    <img className={cn['player-row__icon']} src={KingBIcon} alt='Черные'/>
                      {playerTwo}
                      {
                        winner === 2 &&
                        <img className={cn['history__trophy']} src={trophyImg} alt="Победитель"/>
                      }
                    </th>
                    <th className={cn['history__versus']}>против</th>
                    <th className={`${cn['history__player-two']} ${cn['player-row']}`}>
                    <img className={cn['player-row__icon']} src={KingWIcon} alt='Белые'/>
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

export default History;
