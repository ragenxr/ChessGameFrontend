import nav from './nav.js';

export default async(goTo) => {
  const response = await fetch(
    '/api/statistics',
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  const {statistics} = await response.json();
  const template = document.createElement('template');

  template.innerHTML =
    `
      <main class="box container__content rating">
        <h1 class="text text_title box__header rating__title">Рейтинг игроков</h1>
        <table class="rating__table table">
          <tr class="table__row">
            <th class="text text_bold table__cell">Логин</th>
            <th class="text text_bold table__cell">Всего игр</th>
            <th class="text text_bold table__cell">Победы</th>
            <th class="text text_bold table__cell">Проигрыши</th>
            <th class="text text_bold table__cell">Процент побед</th>
          </tr>
          ${
            statistics
              .map(
                ({login, total, wins, loses, winRate}) =>
                  `
                    <tr class="table__cell">
                      <th class="text table__cell rating__login">${login}</th>
                      <th class="text table__cell">${total}</th>
                      <th class="text table__cell rating__wins">${wins}</th>
                      <th class="text table__cell rating__loses">${loses}</th>
                      <th class="text table__cell">${Math.round(winRate * 100)}%</th>
                    </tr>
                  `
              )
              .join('')
          }
        </table>
      </main>
    `;

  template.content.prepend(await nav(goTo));
  template.content.querySelector('.nav__link[href="/statistics"]').classList.add('nav__link_active');

  return template.content;
};
