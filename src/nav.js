export default async({goTo, socket, user}, {goToPreHook} = {}) => {
  const responses = await Promise.all([
    fetch('/assets/svg/cross.svg'),
    fetch('/assets/svg/circle.svg'),
    fetch('/assets/svg/exit.svg')
  ]);
  const [cross, circle, exit] = await Promise.all(responses.map((response) => response.text()));
  const template = document.createElement('template');

  template.innerHTML =
    `
      <nav class="nav">
        <div class="nav__icons">
          ${cross}
          ${circle}
          ${cross}
          ${circle}
        </div>
        <div class="nav__links">
          <a class="text text_bold nav__link" href="/game">Игровое поле</a>
          <a class="text text_bold nav__link" href="/statistics">Рейтинг</a>
          <a class="text text_bold nav__link" href="/active-players">Активные игроки</a>
          <a class="text text_bold nav__link" href="/history">История игр</a>
          ${
            user.rights.some(({level, entity}) => entity === 'users' && Boolean(level & 1 << 0)) ?
              '<a class="text text_bold nav__link" href="/players">Список игроков</a>' :
              ''
          }
        </div>
        <div class="nav__exit">
          <a class="nav__exit-link">${exit}</a>
        </div>
      </nav>
    `;

  for (const link of template.content.querySelector('.nav__links').children) {
    link.addEventListener(
      'click',
      async(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (goToPreHook) {
          await goToPreHook();
        }

        await goTo(event.target.getAttribute('href'));
      }
    );
  }

  template.content.querySelector('.nav__exit-link').addEventListener(
    'click',
    async(event) => {
      event.preventDefault();
      event.stopPropagation();

      localStorage.removeItem('token');

      socket.io.opts.query.token = '';

      socket.disconnect();
      socket.connect();

      if (goToPreHook) {
        await goToPreHook();
      }

      await goTo('/login');
    }
  );

  for (const icon of template.content.querySelector('.nav__icons').children) {
    icon.classList.add('nav__icon');
  }

  return template.content;
};
