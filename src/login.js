export default async(injectables) => {
  const template = document.createElement('template');

  template.innerHTML =
    `
      <main class="box box_sm box_centered container__content container__content_centered login">
        <img class="login__doge" src="/assets/img/doge.png" alt="Дог">
        <h1 class="text text_title login__title">Войдите в игру</h1>
        <form class="form login__form">
          <div class="input form__field">
            <input
              id="login-input"
              type="text"
              class="text input__textbox login__login"
              placeholder="Логин"
            >
          </div>
          <div class="input form__field">
            <input
              id="password-input"
              type="password"
              class="text input__textbox login__password"
              placeholder="Пароль"
            >
          </div>
          <input type="submit" class="button button_primary form__submit login__submit" value="Войти">
        </form>
      </main>
    `;

  template.content.querySelector('.login__submit').addEventListener(
    'click',
    async(event) => {
      event.preventDefault();
      event.stopPropagation();

      const loginInput = document.querySelector('.login__login');
      const passwordInput = document.querySelector('.login__password');
      const inputs = [loginInput, passwordInput];
      const messages = ['Введите логин', 'Введите пароль'];
      let success = true;

      for (const inputIdx in inputs) {
        const input = inputs[inputIdx];

        if (!input.value) {
          const errorMessage = messages[inputIdx];

          if (!input.nextElementSibling) {
            const messageElement = document.createElement('small');

            messageElement.innerHTML = errorMessage;
            messageElement.classList.add('input__error-message')
            input.after(messageElement);
          } else {
            input.nextElementSibling.innerHTML = errorMessage;
          }

          input.classList.add('input__textbox_errored');

          success = false;
        } else {
          if (loginInput.nextElementSibling) {
            input.nextElementSibling.remove();
          }

          input.classList.remove('input__textbox_errored');
        }
      }

      if (!success) {
        return;
      }

      const response = await fetch(
        '/api/auth/token',
        {
          method: 'POST',
          body: JSON.stringify({login: loginInput.value, password: passwordInput.value}),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const {token, error} = await response.json();

      if (!token) {
        alert(error);

        return;
      }

      const ref = localStorage.getItem('ref') || '/';

      injectables.user = JSON.parse(window.atob(token.split('.')[1])).sub;

      localStorage.setItem('token', token);
      localStorage.removeItem('ref');

      await injectables.goTo(ref);
    }
  );

  return template.content;
};
