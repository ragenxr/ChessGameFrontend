import * as React from 'react';
import {observer} from 'mobx-react';
import {StoreContext} from '../../stores';
import './styles.css';

class Rating extends React.Component {
  static contextType = StoreContext;

  async componentDidMount() {
    if(!this.context.RatingStore.ratings?.length) {
      await this.context.RatingStore.fetch();
    }
  }

  render() {
    return (
      <main className="box app__content app__content_centered rating">
        <h1 className="text text_title box__header rating__title">Рейтинг игроков</h1>
        <table className="rating__table table">
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
                    <th className="text table__cell rating__login">{rating.login}</th>
                    <th className="text table__cell">{rating.total}</th>
                    <th className="text table__cell rating__wins">{rating.wins}</th>
                    <th className="text table__cell rating__loses">{rating.loses}</th>
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