import nav from './nav.js';

export default async({goTo, socket}) => {
  const responses = await Promise.all([
    fetch('/assets/svg/cross.svg'),
    fetch('/assets/svg/circle.svg'),
    fetch('/assets/svg/send.svg')
  ]);
  const [cross, circle, send] = await Promise.all(responses.map((response) => response.text()));

  const observer = new MutationObserver(
    () => {
      if (document.contains(content)) {
        const match = location.pathname.match(/\/game\/(\d+)/);

        if (match) {
          socket.emit('games:connect', match[1]);
        }

        observer.disconnect();
      }
    }
  );

  observer.observe(document, {childList: true, subtree: true});

  const circleTemplate = document.createElement('template');
  circleTemplate.innerHTML = circle;
  circleTemplate.content.firstElementChild.classList.add('game__player-icon', 'game__player-icon_circle');
  const circleNode = circleTemplate.content.firstElementChild;

  const crossTemplate = document.createElement('template');
  crossTemplate.innerHTML = cross;
  crossTemplate.content.firstElementChild.classList.add('game__player-icon', 'game__player-icon_cross');
  const crossNode = crossTemplate.content.firstElementChild;

  const sendTemplate = document.createElement('template');
  sendTemplate.innerHTML = send;
  sendTemplate.content.firstElementChild.classList.add('chat__send-icon');

  const template = document.createElement('template');

  template.innerHTML =
    `
      <div class="container__content game">
        <aside class="box game__players">
          <h1 class="text text_title">Игроки</h1>
          <div class="game__player-stat">
            <div>
              <p class="text player-stat__name"></p>
              <small class="text player-stat__win-rate"></small>
            </div>
          </div>
          <div class="game__player-stat">
            <div>
              <p class="text player-stat__name"></p>
              <small class="text player-stat__win-rate"></small>
            </div>
          </div>
        </aside>
        <div class="game__info">
          <div class="text game__timer">
            00:00:00
          </div>
          <main class="game__field tic-tac-toe-field">
            <div class="tic-tac-toe-field__cell"></div>
            <div class="tic-tac-toe-field__cell"></div>
            <div class="tic-tac-toe-field__cell"></div>
            <div class="tic-tac-toe-field__cell"></div>
            <div class="tic-tac-toe-field__cell"></div>
            <div class="tic-tac-toe-field__cell"></div>
            <div class="tic-tac-toe-field__cell"></div>
            <div class="tic-tac-toe-field__cell"></div>
            <div class="tic-tac-toe-field__cell"></div>
          </main>
        </div>
        <aside class="game__chat chat">
          <div class="chat__messages">
            <div class="text chat__placeholder">Сообщений еще нет</div>
          </div>
          <div class="chat__send">
            <div class="input">
              <input class="input__textbox chat__send-input" placeholder="Сообщение...">
            </div>
            <button class="button button_primary chat__send-btn">
              ${sendTemplate.innerHTML}
            </button>
          </div>
        </aside>
      </div>
    `;

  let game = null;
  const content = template.content.querySelector('.game');
  const timer = template.content.querySelector('.game__timer');
  const ticTacToeField = template.content.querySelector('.tic-tac-toe-field');
  const cells = template.content.querySelectorAll('.tic-tac-toe-field__cell');
  const timerRefresher = setInterval(
    () => {
      if (!game) {
        timer.innerHTML = '00:00:00';
      } else {
        timer.innerHTML = new Date(new Date(new Date().toUTCString()) - new Date(game.createdAt))
          .toUTCString()
          .match(/\d\d:\d\d:\d\d/)[0];
      }
    },
    1000
  );
  const newGoTo = (newLocation) => {
    clearInterval(timerRefresher);
    socket.off('games:connected', onConnected);
    socket.off('games:move-made', onMoveMade);
    socket.off('games:finished', onFinished);
    socket.off('games:already-finished', onAlreadyFinished);
    socket.off('games:not-invited', onNotInvited);
    socket.off('games:error', onError);
    socket.off('games:message', onReceive);
    goTo(newLocation);
  };
  const onConnected = (gameFromRequest) => {
    game = gameFromRequest;

    timer.innerHTML = new Date(new Date(new Date().toUTCString()) - new Date(game.createdAt))
      .toUTCString()
      .match(/\d\d:\d\d:\d\d/)[0];

    const playerStats = content.querySelectorAll('.game__player-stat');

    for (const playerStatIdx in playerStats) {
      if (Number.isNaN(Number(playerStatIdx))) {
        continue;
      }

      const playerStat = playerStats[playerStatIdx];
      playerStat.prepend(Number(playerStatIdx) === 0 ? crossTemplate.content : circleTemplate.content);
      playerStat.querySelector('.player-stat__name').innerHTML = Number(playerStatIdx) === 0 ?
        game.playerOne :
        game.playerTwo;

      fetch(
        `/api/statistics/${Number(playerStatIdx) === 0 ? game.playerOneId : game.playerTwoId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
        .then(
          (response) => response.json()
            .then(({winRate}) => {
              playerStat.querySelector('.player-stat__win-rate').innerHTML =
                `${Math.round(winRate * 100)}%`;
            })
        );
    }

    for (const {position, number} in game.moves) {
      if (!position || !number) {
        continue;
      }

      cells[Number(position)].append(
        number % 2 === 1 ?
          crossTemplate.content :
          circleTemplate.content
      );
      cells[Number(position)].firstElementChild.classList.add('game__player-icon_field-size');
    }
  };
  const onMoveMade = ({position, player}) => {
    const symbol = (player === 1 ? crossNode : circleNode).cloneNode(true);

    symbol.classList.add('game__player-icon_field-size');

    cells[Number(position)].append(symbol);
  };
  const onFinished = ({winner, winPosition}) => {
    if (winner) {
      if (winPosition) {
        for (const cell of winPosition) {
          cells[cell].classList.add(
            winner === 1 ?
              'tic-tac-toe-field__cell_cross-win' :
              'tic-tac-toe-field__cell_circle-win'
          );
        }
      }

      alert(`${winner === 1 ? game.playerOne : game.playerTwo} победил!`);
    } else {
      alert('Ничья!');
    }

    newGoTo('/');
  };
  const onAlreadyFinished = () => {
    alert('Игра уже завершена!');
    newGoTo('/');
  };
  const onNotInvited = () => {
    alert('Вы не приглашены в эту игру!');
    newGoTo('/');
  };
  const onError = (error) => {
    alert(error);
  };
  const onReceive = ({player, message}) => {
    const direction = player === game.playerOne ? 'left' : 'right';
    const messageTemplate = document.createElement('template');

    messageTemplate.innerHTML =
      `
        <div class="chat__message chat__message_${direction}">
          <div class="chat__message-header">
            <p class="chat__sender-name chat__sender-name_${direction}">${player}</p>
            <p class="chat__send-time">${new Date().toUTCString().match(/(\d\d:\d\d):\d\d/)[1]}</p>
          </div>
          <p class="chat__message-text">${message}</p>
        </div>
      `;

    content
      .querySelector('.chat__placeholder')
      ?.remove();

    content
      .querySelector('.chat__messages')
      .prepend(messageTemplate.content);
  }

  socket.on('games:connected', onConnected);
  socket.on('games:move-made', onMoveMade);
  socket.on('games:finished', onFinished);
  socket.on('games:already-finished', onAlreadyFinished);
  socket.on('games:not-invited', onNotInvited);
  socket.on('games:error', onError);
  socket.on('games:message', onReceive);

  ticTacToeField.addEventListener(
    'click',
    (event) => {
      if (!event.target.closest('.tic-tac-toe-field__cell') || !game) {
        return;
      }

      socket.emit('games:make-move', game.id, Array.from(ticTacToeField.children).indexOf(event.target));
    }
  );

  content
    .querySelector('.chat__send-btn')
    .addEventListener(
      'click',
      () => {
        const message = content.querySelector('.chat__send-input').value;

        if (!message) {
          return;
        }

        socket.emit('games:message', game.id, message);

        content.querySelector('.chat__send-input').value = '';
      }
    );

  template.content.prepend(await nav({
    goTo: newGoTo,
    socket
  }));
  template.content.querySelector('.nav__link[href="/game"]').classList.add('nav__link_active');

  return template.content;
};
