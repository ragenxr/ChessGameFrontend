export default async() => {
  const response = await fetch('/assets/svg/loader.svg');
  const loader = await response.text();
  const template = document.createElement('template');
  const loaderTemplate = document.createElement('template');

  loaderTemplate.innerHTML = loader;
  loaderTemplate.content.firstElementChild.classList.add('loader__icon');
  template.innerHTML =
    `
      <div class="modal loader">
        ${loaderTemplate.innerHTML}
      </div>
    `;

  return template.content;
};
