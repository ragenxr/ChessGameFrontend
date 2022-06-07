import * as React from 'react';
import {observer} from 'mobx-react';
import {StoreContext} from '../../stores';
import cn from './styles.module.scss';

class Rating extends React.Component {
  static contextType = StoreContext;

  async componentDidMount() {
    if(!this.context.RatingStore.ratings?.length) {
      await this.context.RatingStore.fetch();
    }
  }

  render() {
    return (
      <main className={cn['rating']}>
        <h1 className="text text_title box__header">Рейтинг игроков</h1>
        <table className="table">
          <thead>
          <tr className="table__row">
            <th className="text text_bold table__cell">Логин</th>
            <th className="text text_bold table__cell">Всего игр</th>
            <th className="text text_bold table__cell">Победы</th>
            <th className="text text_bold table__cell">Проигрыши</th>
            <th className="text text_bold table__cell">Процент побед</th>
          </tr>
          </thead>
          <tbody>
          {
            this.context.RatingStore.ratings
              ?.map(
                (rating) => (
                  <tr key={rating.login} className="table__cell">
                    <th className={cn['rating__login']}>{rating.login}</th>
                    <th className="text table__cell">{rating.total}</th>
                    <th className={cn['rating__wins']}>{rating.wins}</th>
                    <th className={cn['rating__loses']}>{rating.loses}</th>
                    <th className="text table__cell">{Math.round(rating.winRate * 100)}%</th>
                  </tr>
                )
              )
          }
          </tbody>
        </table>
      </main>
    );
  }
}

export default observer(Rating);