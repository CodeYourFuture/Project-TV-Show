const render = (stateKey, container, template, creator) => {
  container.textContent = ""; // remember we clear up first
  const fragment = stateKey.map((data) => creator(template, data));
  container.append(...fragment);
};

export {render};
