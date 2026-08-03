//You can edit ALL of the code here

const episodeList = {
  id: 4952,
  url: "http://www.tvmaze.com/episodes/4952/game-of-thrones-1x01-winter-is-coming",
  name: "Winter is Coming",
  season: 1,
  number: 1,
  airdate: "2011-04-17",
  airtime: "21:00",
  airstamp: "2011-04-18T01:00:00+00:00",
  runtime: 60,
  image: {
    medium:
      "http://static.tvmaze.com/uploads/images/medium_landscape/1/2668.jpg",
    original:
      "http://static.tvmaze.com/uploads/images/original_untouched/1/2668.jpg",
  },
  summary:
    "<p>Lord Eddard Stark, ruler of the North, is summoned to court by his old friend, King Robert Baratheon, to serve as the King's Hand. Eddard reluctantly agrees after learning of a possible threat to the King's life. Eddard's bastard son Jon Snow must make a painful decision about his own future, while in the distant east Viserys Targaryen plots to reclaim his father's throne, usurped by Robert, by selling his sister in marriage.</p>",
  _links: {
    self: {
      href: "http://api.tvmaze.com/episodes/4952",
    },
  },
};

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const card = episodeList.map((episode) => createDramaCard(episode));
  rootElem.append(...card);
}

window.onload = setup;

//Purpose: Put the episode objects  into the root
//grab the root and then you put it insides : function 1: put the object insides the root

function createChildElement(parentElement, tagName, textContent) {
  const element = document.createElement(tagName);
  element.textContent = textContent;
  parentElement.append(element);
  return element;
}

function createDramaCard(episode) {
  const card = document.createElement("section");
  card.classList.add("drama-card");

  const formattedSeason = String(episode.season).padStart(2, "0");
  const formattedNumber = String(episode.number).padStart(2, "0");
  const episodeCode = `S${formattedSeason}E${formattedNumber}`;

  const smallcard = document.createElement("div");
  smallcard.classList.add("small-card");
  createChildElement(smallcard, "h3", `${episode.name} - ${episodeCode}`);
  card.append(smallcard);

  const img = document.createElement("img");
  img.src = episode.image ? episode.image.medium : "";
  card.append(img);

  const summaryElem = document.createElement("div");
  summaryElem.innerHTML = episode.summary;
  card.append(summaryElem);

  return card;
}

//build a function;
//put the template insides
//loop it

// Grab one from th
// create a space and put the information inside.
//create a card and put the data type inside
