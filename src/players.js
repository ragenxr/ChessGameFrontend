import nav from './nav.js';

export default async(goTo) => {
  const responses = await Promise.all([
    fetch('/assets/svg/cancel.svg'),
    fetch('/assets/svg/close.svg'),
    fetch(
      '/api/users?fields=id,login,status,createdAt,updatedAt&limit=40&filters=status neq null',
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
  ]);
  const [cancel, close, users] = await Promise.all(responses.map(
    (response, idx) => idx !== 2 ? response.text() : response.json())
  )
  const cancelTemplate = document.createElement('template');

  cancelTemplate.innerHTML = cancel;
  cancelTemplate.content.firstElementChild.classList.add('button__icon', 'button__icon_secondary');

  const closeTemplate = document.createElement('template');

  closeTemplate.innerHTML = close;
  closeTemplate.content.firstElementChild.classList.add('modal__close-icon');

  const template = document.createElement('template');

  template.innerHTML =
    `
      <main class="box container__content players">
        <div class="box__header">
          <h1 class="text text_title players__title">Список игроков</h1>
          <button class="button button_primary players__add-new">Добавить игрока</button>
        </div>
        <table class="players__table table">
          <tr class="table__row">
            <th class="text text_bold table__cell">Логин</th>
            <th class="text text_bold table__cell">Статус</th>
            <th class="text text_bold table__cell">Создан</th>
            <th class="text text_bold table__cell">Изменен</th>
            <th class="text text_bold table__cell"></th>
          </tr>
          ${
            users 
              .map(
                ({id, login, status, createdAt = undefined, updatedAt = undefined}) =>
                  `
                    <tr class="table__cell">
                      <th class="text table__cell players__login">${login}</th>
                      <th class="text table__cell">
                        <div class="players__status players__status_${status}">
                          ${status === 'active' ? 'Активен' : 'Заблокирован'}
                        </div>
                      </th>
                      <th class="text table__cell">${new Date(createdAt).toDateString().slice(4)}</th>
                      <th class="text table__cell">${new Date(updatedAt).toDateString().slice(4)}</th>
                      <th class="text table__cell players__button">
                        <button
                          class="button button_secondary players__${status === 'active' ? 'block' : 'unblock'}"
                          data-id="${id}"
                        >
                          ${status === 'active' ? cancelTemplate.innerHTML : ''}
                          ${status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                        </button>
                      </th>
                    </tr>
                  `
              )
              .join('')
          }
        </table>
      </main>
    `;

  const btnHandler = async(event) => {
    const response = await fetch(
      `/api/users/${event.target.dataset.id}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify({
          status: event.target.classList.contains('players__block') ?
            'deleted' :
            'active'
        })
      }
    );

    if (response.status >= 400) {
      return;
    }

    const status = event.target.parentNode.parentNode.querySelector('.players__status');

    if (event.target.classList.contains('players__block')) {
      event.target.classList.remove('players__block');
      status.classList.remove('players__status_active');
      event.target.classList.add('players__unblock');
      status.classList.add('players__status_deleted');
      status.innerHTML = 'Заблокирован';
      event.target.innerHTML = 'Разблокировать';
    } else {
      event.target.classList.remove('players__unblock');
      status.classList.remove('players__status_deleted');
      event.target.classList.add('players__block');
      status.classList.add('players__status_active');
      status.innerHTML = 'Активен';
      event.target.innerHTML =
        `
            ${cancelTemplate.innerHTML}
            Заблокировать
          `;
    }
  };

  for (const btnWrapper of template.content.querySelectorAll('.players__button')) {
    btnWrapper.firstElementChild.addEventListener(
      'click',
      btnHandler
    );
  }

  const table = template.content.querySelector('.players__table');

  template.content.querySelector('.players__add-new').addEventListener(
    'click',
    () => {
      const modalTemplate = document.createElement('template');

      modalTemplate.innerHTML =
        `
          <div class="modal">
            <div class="modal__window">
              <div class="modal__header">
                <button class="modal__close">${closeTemplate.innerHTML}</button>
              </div>
              <h1 class="text text_title modal__title">Добавьте игрока</h1>
              <form class="modal__content form players-create">
                <div class="input form__field">
                  <label class="text text_bold input__label" for="create-user-login-input">Логин</label>
                  <input
                    id="create-user-login-input"
                    type="text"
                    class="text input__textbox players-create__login"
                    placeholder="Логин"
                  >
                </div>
                <input type="submit" class="button button_primary form__submit modal__submit" value="Добавить">
              </form>
            </div>
          </div>
        `;

      const closeModal = (modal) => () => {
        document.body.removeChild(modal);
      };
      const closeThis = closeModal(modalTemplate.content.firstElementChild);

      modalTemplate.content.querySelector('.modal__close').addEventListener(
        'click',
        closeThis
      );
      modalTemplate.content.querySelector('.modal__submit').addEventListener(
        'click',
        async(event) => {
          event.preventDefault();
          event.stopPropagation();

          const loginInput = document.querySelector('.players-create__login');

          if (!loginInput.value) {
            const errorMessage = 'Введите логин';

            if (!loginInput.nextElementSibling) {
              const messageElement = document.createElement('small');

              messageElement.innerHTML = errorMessage;
              messageElement.classList.add('input__error-message')
              loginInput.after(messageElement);
            } else {
              loginInput.nextElementSibling.innerHTML = errorMessage;
            }

            loginInput.classList.add('input__textbox_errored');

            return;
          } else {
            if (loginInput.nextElementSibling) {
              loginInput.nextElementSibling.remove();
            }

            loginInput.classList.remove('input__textbox_errored');
          }

          const response = await fetch(
            `/api/users`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              },
              method: 'POST',
              body: JSON.stringify({
                login: loginInput.value,
                password: 'Passw0rd'
              })
            }
          );

          if (response.status >= 400) {
            return;
          }

          const {id, login, status, createdAt, updatedAt} = await response.json();
          const rowTemplate = document.createElement('template');

          rowTemplate.innerHTML =
            `
              <tr class="table__cell">
                <th class="text table__cell players__login">${login}</th>
                <th class="text table__cell">
                  <div class="players__status players__status_${status}">
                    ${status === 'active' ? 'Активен' : 'Заблокирован'}
                  </div>
                </th>
                <th class="text table__cell">${new Date(createdAt).toDateString().slice(4)}</th>
                <th class="text table__cell">${new Date(updatedAt).toDateString().slice(4)}</th>
                <th class="text table__cell players__button">
                  <button
                    class="button button_secondary players__${status === 'active' ? 'block' : 'unblock'}"
                    data-id="${id}"
                  >
                    ${status === 'active' ? cancelTemplate.innerHTML : ''}
                    ${status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                  </button>
                </th>
              </tr>
            `;

          rowTemplate.content.querySelector('.players__button').firstElementChild.addEventListener(
            'click',
            btnHandler
          );
          table.append(rowTemplate.content);
          closeThis();
        }
      );

      document.body.append(modalTemplate.content.firstElementChild);
    }
  );

  template.content.prepend(await nav(goTo));
  template.content.querySelector('.nav__link[href="/players"]').classList.add('nav__link_active');

  return template.content;
};
