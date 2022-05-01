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
  }
};

const handleRoute = async(location) => {
  const {importer, title, styleSheet} = routes[location];
  if (!document.head.querySelector(`link[href="${styleSheet}"]`)) {
    const cssLink = document.createElement('link');

    cssLink.rel = 'stylesheet';
    cssLink.type = 'text/css';
    cssLink.href = styleSheet;

    document.head.append(cssLink);
  }

  document.querySelector('.container').innerHTML = '';
  document.head.querySelector('title').textContent = title;

  if (!routes[location].pageLoader) {
    const {default: loader} = await importer();

    routes[location].pageLoader = loader;
  }

  const {pageLoader} = routes[location];
  const page = await pageLoader(async(newLocation) => {
    await handleRoute(newLocation);

    window.history.pushState({}, '', newLocation);
  });

  document.querySelector('.container').append(page);
};

window.onload = async() => {
  await handleRoute(window.location.pathname);
};
