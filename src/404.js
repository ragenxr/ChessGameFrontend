export default async(goTo) => {
  const template = document.createElement('template');

  template.innerHTML =
    `
      <div class="box container__content error-404">
        <h1 class="text text_title error-404__code">404</h1>
        <h2 class="text text_title">Страница не найдена</h2>
        <button class="button button_secondary error-404__back">Назад</button>
      </div>
    `;

  template.content.querySelector('.error-404__back').addEventListener(
    'click',
    () => {
      window.history.back();
    }
  );

  return template.content;
};
