const render = (data, container, template, creator) => {
  container.textContent = ""; // remember we clear up first
  const fragment = data.map((item) => creator(template, item));
  container.append(...fragment);
};

export {render};
