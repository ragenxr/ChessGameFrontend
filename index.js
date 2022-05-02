const routes = {
  '/statistics': {
    importer: () => import('/src/statistics.js'),
    title: 'Рейтинг | Tic Tac Toe',
    styleSheet: '/assets/css/statistics.css'
  },
  '/history': {
    importer: () => import('/src/history.js'),
    title: 'История игр | Tic Tac Toe',
    styleSheet: '/assets/css/history.css'
  },
  '/players': {
    importer: () => import('/src/players.js'),
    title: 'Список игроков | Tic Tac Toe',
    styleSheet: '/assets/css/players.css'
  },
  '/404': {
    importer: () => import('/src/404.js'),
    title: 'Страница не найдена | Tic Tac Toe',
    styleSheet: '/assets/css/404.css'
  },
};

const handleRoute = async(location) => {
  const route = routes[location] || routes['/404'];
  const {importer, title, styleSheet} = route;
  if (!document.head.querySelector(`link[href="${styleSheet}"]`)) {
    const cssLink = document.createElement('link');

    cssLink.rel = 'stylesheet';
    cssLink.type = 'text/css';
    cssLink.href = styleSheet;

    document.head.append(cssLink);
  }

  document.querySelector('.container').innerHTML = '';
  document.head.querySelector('title').textContent = title;

  if (!route.pageLoader) {
    const {default: loader} = await importer();

    route.pageLoader = loader;
  }

  const {pageLoader} = route;
  const page = await pageLoader(async(newLocation) => {
    await handleRoute(newLocation);

    window.history.pushState({}, '', newLocation);
  });

  document.querySelector('.container').append(page);
};

window.onload = async() => {
  window.addEventListener('popstate', async() => {
    await handleRoute(window.location.pathname);
  });

  await handleRoute(window.location.pathname);
};
