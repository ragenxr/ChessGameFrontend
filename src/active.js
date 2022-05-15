import nav from './nav.js';
import loader from './loader.js';

export default async({goTo, socket}) => {
  const template = document.createElement('template');

  template.innerHTML =
    `
      <main class="box container__content active-players">
        <div class="box__header">
          <h1 class="text text_title active-players__title">Список игроков</h1>
        </div>
        <table class="active-players__table table">
          <tbody>
            <tr class="table__row">
              <td class="table__cell">
                <h3 class="text text_title active-players__empty">Никто не онлайн</h3>
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    `;
  const table = template.content.querySelector('.active-players__table tbody');
  const usersToSockets = {};
  const clearLoader = () => document.querySelector('.loader')?.remove();
  const handleInvite = async(event) => {
    event.preventDefault();
    event.stopPropagation();

    const loaderComponent = await loader();

    document.body.append(loaderComponent);

    socket.emit('players:invite', Number(event.target.parentElement.parentElement.dataset.id))

    setTimeout(
      () => {
        socket.emit('players:cancel', Number(event.target.parentElement.parentElement.dataset.id))
      },
      15000);
  };
  const playersListHandler = (usersFromServer) => {
    const {sub: thisId} = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
    const users = usersFromServer.filter(({id}) => id !== thisId);
    const rows = table.querySelectorAll('.table__row');
    const ids = users.map(({id}) => id);
    const existIds = Array.from(rows).map(({dataset: {id}}) => id);

    for (const idx in ids) {
      const id = ids[idx];
      const {login, isFree, socketIds} = users[idx];
      const existIdx = existIds.findIndex((existId) => existId === id);

      if (existIdx !== -1) {
        const row = rows[existIdx];

        row.children[1].innerHTML =
          `
            <div class="active-players__status active-players__status_${isFree ? 'free' : 'busy'}">
              ${isFree ? 'Свободен' : 'В игре'}
            </div>
          `;

        row.children[2].children[0].toggleAttribute('disabled', isFree);
      } else {
        const rowTemplate = document.createElement('template');

        rowTemplate.innerHTML =
          `
            <tr class="table__row" data-id="${id}">
              <th class="text table__cell active-players__login">${login}</th>
              <th class="text table__cell active-players__status-wrapper">
                <div class="active-players__status active-players__status_${isFree ? 'free' : 'busy'}">
                  ${isFree ? 'Свободен' : 'В игре'}
                </div>
              </th>
              <th class="text table__cell active-players__button">
                <button
                  class="button button_primary active-players__invite"
                  ${!isFree ? 'disabled' : ''}
                >
                  Позвать играть
                </button>
              </th>
            </tr>
          `;

        rowTemplate.content
          .querySelector('.active-players__invite')
          .addEventListener('click', handleInvite);

        table.append(rowTemplate.content);
      }

      usersToSockets[id] = socketIds;
    }

    const removeList = [];

    for (const existIdx in existIds) {
      const existId = existIds[existIdx];
      const idx = ids.findIndex((id) => existId === id);

      if (idx === -1) {
        removeList.push(rows[existIdx]);
      }
    }

    for (const target of removeList) {
      target.remove();
    }

    if (ids.length) {
      table.querySelector('.active-players__empty')?.remove();
    } else {
      const emptyTemplate = document.createElement('template');

      emptyTemplate.innerHTML =
        `
          <tr class="table__row">
            <td class="table__cell">
              <h3 class="text text_title active-players__empty">Никто не онлайн</h3>
            </td>
          </tr>
        `;

      table.append(emptyTemplate.content);
    }
};

  socket.on('players:list', playersListHandler);
  socket.on('players:unavailable', clearLoader);
  socket.on('players:cancelled', clearLoader);
  socket.on('players:declined', clearLoader);
  socket.on('players:accepted', clearLoader);

  template.content.prepend(
    await nav(
      {
        goTo: async (location) => {
          socket.off('players:list', playersListHandler);
          await goTo(location);
        },
        socket
      }
    )
  );
  template.content.querySelector('.nav__link[href="/active-players"]').classList.add('nav__link_active');

  return template.content;
};
