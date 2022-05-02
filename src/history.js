import nav from './nav.js';

export default async(goTo) => {
  const responses = await Promise.all([
    fetch('/assets/svg/cross.svg'),
    fetch('/assets/svg/circle.svg')
  ]);
  const [cross, circle] = await Promise.all(responses.map(
    (response, idx) => idx !== 2 ? response.text() : response.json())
  );
  const games = [
    {
      winner: 1,
      playerOne: 'Naruto',
      playerTwo: 'Sasuke',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      winner: null,
      playerOne: 'Sasuke',
      playerTwo: 'Naruto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      winner: 2,
      playerOne: 'Sasuke',
      playerTwo: 'Naruto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      winner: 2,
      playerOne: 'Sasuke',
      playerTwo: 'Naruto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      winner: 2,
      playerOne: 'Naruto',
      playerTwo: 'Sasuke',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  const circleTemplate = document.createElement('template');
  circleTemplate.innerHTML = circle;
  circleTemplate.content.firstElementChild.classList.add('history__player-two-icon');

  const crossTemplate = document.createElement('template');
  crossTemplate.innerHTML = cross;
  crossTemplate.content.firstElementChild.classList.add('history__player-one-icon');

  const template = document.createElement('template');

  template.innerHTML =
    `
      <main class="box container__content history">
        <h1 class="text text_title box__header history__title">История игр</h1>
        <table class="history__table table">
          <tr class="table__row">
            <th class="text text_bold table__cell">Игроки</th>
            <th class="text text_bold table__cell"></th>
            <th class="text text_bold table__cell"></th>
            <th class="text text_bold table__cell">Дата</th>
            <th class="text text_bold table__cell">Время игры</th>
          </tr>
          ${
            games 
              .map(
                ({winner, playerOne, playerTwo, createdAt, finishedAt}) =>
                  `
                    <tr class="table__cell">
                      <th class="text table__cell history__player-two">
                        ${circleTemplate.innerHTML}
                        ${playerTwo}
                        ${winner === 2 ?
                          '<img class="history__trophy" src="/assets/img/trophy.png" alt="Победитель">' :
                          ''
                        }
                      </th>
                      <th class="text table__cell history__versus">против</th>
                      <th class="text table__cell history__player-one">
                        ${crossTemplate.innerHTML}
                        ${playerOne}
                        ${winner === 1 ?
                          '<img class="history__trophy" src="/assets/img/trophy.png" alt="Победитель">' :
                          ''
                        }
                      </th>
                      <th class="text table__cell">${new Date(createdAt).toDateString().slice(4)}</th>
                      <th class="text table__cell">
                        ${
                          finishedAt ?
                            new Date(new Date(finishedAt) - new Date(createdAt)).toTimeString().slice(0, 8) :
                            new Date(createdAt).toTimeString().slice(0, 8)
                        }
                      </th>
                    </tr>
                  `
              )
              .join('')
          }
        </table>
      </main>
    `;

  template.content.prepend(await nav(goTo));
  template.content.querySelector('.nav__link[href="/history"]').classList.add('nav__link_active');

  return template.content;
};
