export default async({goTo, socket}) => {
  const removeInvitation = () => document.querySelector('.invitation')?.parentElement?.parentElement?.remove();
  const response = await fetch('/assets/svg/close.svg');
  const close = await response.text();
  const closeTemplate = document.createElement('template');

  closeTemplate.innerHTML = close;
  closeTemplate.content.firstElementChild.classList.add('modal__close-icon');

  socket.on(
    'players:invited',
    async({from, to}) => {
      if (document.querySelector('.invitation')) {
        socket.emit('players:unavailable', {from, to});

        return;
      }

      const modalTemplate = document.createElement('template');

      modalTemplate.innerHTML =
        `
          <div class="modal">
            <div class="modal__window">
              <div class="modal__header">
                <button class="modal__close">${closeTemplate.innerHTML}</button>
              </div>
              <h1 class="text text_title modal__title">${from.login} приглашает вас в игру!</h1>
              <form class="modal__content form invitation">
                <input
                  type="submit"
                  class="button button_primary form__submit modal__submit invitation__accept"
                  value="Принять"
                  >
                <input
                  type="submit"
                  class="button button_secondary form__submit modal__submit invitation__decline"
                  value="Отклонить"
                  >
              </form>
            </div>
          </div>
        `;

      const closeModal = (modal) => (event) => {
        event.preventDefault();
        event.stopPropagation();

        document.body.removeChild(modal);
      };
      const closeThis = closeModal(modalTemplate.content.firstElementChild);

      modalTemplate.content.querySelector('.modal__close').addEventListener(
        'click',
        closeThis
      );

      for (const btn of modalTemplate.content.querySelectorAll('.modal__submit')) {
        btn.addEventListener(
          'click',
          async(event) => {
            event.preventDefault();
            event.stopPropagation();

            const action = event.target.classList.contains('invitation__accept') ? 'accept' : 'decline';

            socket.emit(`players:${action}`, {from, to});
          }
        );
      }

      document.body.append(modalTemplate.content.firstElementChild);
    }
  );
  socket.on(
    'players:cancelled',
    removeInvitation
  );
  socket.on(
    'players:declined',
    removeInvitation
  );
  socket.on(
    'players:accepted',
    removeInvitation
  );
  socket.on(
    'players:accepted',
    ({gameId}) => goTo(`/game/${gameId}`)
  );
};
