// You can edit ALL of the code here

const showsLink = "https://api.tvmaze.com/shows"; // TVMaze API endpoint that returns all TV shows

const episodesMessage = document.getElementById("message1"); // Element used to display episode loading/error messages
const showsMessage = document.getElementById("message2"); // Element used to display show loading/error messages
const searchContainer = document.querySelector(".search-container"); // Container that holds search input and dropdowns
const rootElem = document.getElementById("root"); // Main container where show cards or episode cards are displayed
const searchInput = document.getElementById("search-input"); // Search box used for both show search and episode search
const episodeCount = document.getElementById("episode-count"); // Displays episode filtering count
// Example: Displaying 5/73 episodes
const searchLabel = document.getElementById("search-label"); // Label displayed on the shows page
// Example: "Filtering for"
const showCount = document.getElementById("show-count"); // Displays number of matching shows
// Example: Found 12 shows


//Stores episodes that we already fetched from the API, Level 400
// Key = showId
// Value = array of episodes
// Prevents fetching the same show twice
let cachedEpisodes = {};

// Store all shows fetched during setup(),so they can be displayed again when the user 
// returns to the shows listing, i.e front page
let allShows = [];

// Tracks whether the user is viewing shows or episodes; i.e on front page or 2nd page
let currentView = "shows";

// Store the fetched episodes of the currently selected show
// Used for searching and filtering episodes
let currentEpisodes = [];

// Shared error message shown when episode fetch fails
const EPISODE_ERROR =
  "Error: Episodes not found. Try again later...";
// Shared error message shown when show fetch fails
const SHOW_ERROR =
  "Error: Show not found. Try again later...";

// Reusable helper function for episode codes, Example: season: 1, episode: 1 -> S01E01
function formatEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")}`;
}

// Reusable helper function which creates the API URL for a specific show's episodes
function getEpisodeUrl(showId) {
  return `https://api.tvmaze.com/shows/${showId}/episodes`;
}

//Reusable helper function for removing loading and error messages from the page
function clearMessages() {
  episodesMessage.textContent = ""; // loading/error message disappears after episode arrives
  showsMessage.textContent = ""; // loading/error message disappears after show arrives
}

// Level 500: Reusable helper function: Search TV shows by name, genre or summary and return only the matching shows
function searchShows(searchTerm, allShows) {
  const matchingShows = [];
  searchTerm = searchTerm.toLowerCase();
  for(const show of allShows){ //go through each show from all shows
    if(show.name.toLowerCase().includes(searchTerm) || show.genres.toString().toLowerCase().includes(searchTerm) || (show.summary || "").toLowerCase().includes(searchTerm)){
    matchingShows.push(show);
    }
  } 
  return matchingShows; // returns an array containing only the matching shows
}

// Level 200: Reusable helper function: Search episodes by name or summary and return only the matching episodes
function searchEpisodes(searchTerm, currentEpisodes) {
  const matchingEpisodes = []; // Store episodes that match the search text
  searchTerm = searchTerm.toLowerCase(); //convert search text to lowercase
  for(const episode of currentEpisodes){ //go through each episode from current episodes
    if(episode.name.toLowerCase().includes(searchTerm) || (episode.summary || "").toLowerCase().includes(searchTerm)){
    matchingEpisodes.push(episode); // Store matching episode into matchingEpisodes = [];
    }
  } 
  return matchingEpisodes; // returns an array containing only the matching episodes
}


//==================== SETUP ====================
// Runs once when the page loads and Fetches all TV shows from the API
async function setup() {
  episodesMessage.textContent = "Loading episodes..."; //shows this message when episode data is loading
  showsMessage.textContent = "Loading shows..."; //shows this message when shows data is loading

  try { //Level 400
    // Try to fetch and display show data. If anything fails, moves to catch()
    const showsResponse = await fetch(showsLink); // Send request to TVMaze API for all shows
    const shows = await showsResponse.json(); //API sends the data in JSON format then convert 
    // shows data is a normal Javascript array object
    allShows = shows; // Store the fetched all shows globally so they can be 
    // displayed again later(e.g. when user clicks "Show all shows")

    // Sort shows alphabetically by name, ignoring case, Level 400
    shows.sort(function (show1, show2) {
      return show1.name.toLowerCase().localeCompare(show2.name.toLowerCase()); // Convert both names to lowercase
      // then compare alphabetically
    });

    makePageForShows(shows); // Display all TV shows as cards on the front page
    makeShowSelector(shows); // Create dropdown containing all shows

    // Data loaded successfully, remove loading messages
    clearMessages(); 

  } catch (error) { // Runs if fetching or processing data fails, i.e error handling
    console.error(error);
    
    episodesMessage.textContent = EPISODE_ERROR; //shows error message
    showsMessage.textContent = SHOW_ERROR;
  }

}

// ==================== Level-100 DISPLAY EPISODES ==================== 
// Creates and displays episode cards for every episode
// in the provided episode list
function makePageForEpisodes(episodeList) {

  // Hide the "Filtering for" label while viewing episodes on the 2nd page
  searchLabel.style.display = "none";
  //Hide the text "no. of shows found" after found filtered shows, on the 2nd page
  showCount.textContent = "";

  // change the search box to search episodes when viewing episodes on the 2nd page
  searchInput.placeholder = "Search episodes...";

  // user is currently viewing episodes on the 2nd page
  currentView = "episodes";

  rootElem.innerHTML = ""; //Clear the old episode cards before creating and displaying the new episode cards
  const episodeCards = []; //this will further use for episode search, episode selector, show all episodes button

  // Creating episode cards
  for (const episode of episodeList) { // Create one card for one episode
    const card = document.createElement("section"); // Create a card container for one episode
    card.classList.add("episode-card"); // Add CSS class for episode styling

    const episodeName = document.createElement("h2"); // Create heading for episode title
    episodeName.textContent = `${episode.name} - ${formatEpisodeCode(episode)}`; // Display episode title and code
    // Example: Winter Is Coming - S01E01
    card.append(episodeName); // Add heading to episode card

    const image = document.createElement("img"); // Create episode image element
    image.src = episode.image?.medium || ""; // Use episode image if available
    image.alt = `Episode image for ${episode.name}`; // Alternative text shown if image cannot load
    card.append(image); //Add image to episode card

    const summary = document.createElement("div"); // Create container for episode summary
    summary.innerHTML = episode.summary; // Display episode summary returned by API
    card.append(summary); // Add summary to episode card

    episodeCards.push(card); // Save card reference for later filtering
    rootElem.append(card); //display completes episode card on the page
  }

 // Hide show selector
 const showContainer = document.getElementById("show-container");
  if (showContainer) {
    showContainer.style.display = "none";
  }

 // Show episode controls
  const episodeContainer = document.getElementById("episode-container");
  if (episodeContainer) {
    episodeContainer.style.display = "";
  }

  return episodeCards; 
  
} 

// ==================== Level-200 MAKE EPISODE SELECTOR ====================
//episode selector taken out of makepage for episodes
function makeEpisodeSelector(episodeList, episodeCards) {

  // Find the existing episode container
  let episodeContainer = document.getElementById("episode-container");

  // Create it only if it doesn't exist
  if (!episodeContainer) {
    episodeContainer = document.createElement("div");
    episodeContainer.id = "episode-container";
    searchContainer.append(episodeContainer);
  }

  // Clear the old episode selector before adding the new one
  episodeContainer.innerHTML = "";

  //rootElem.innerHTML = "" deletes old episode cards.
  // currentCards is updated to point to the newly created cards.
  let currentCards = episodeCards;

  // Create a new episode selector dropdown
  const selectEpisodeList = document.createElement("select");
  selectEpisodeList.id = "episode-selector";
 
  // Add episodes to the episode selector dropdown -level 200 /300
  // Add episodes to the episode selector dropdown for the currently selected show
  for (const episode of episodeList) {
    const option = document.createElement("option");
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    option.value = episode.id; //Each option stores its episode ID. i.e 4952
    selectEpisodeList.append(option); //Add curent option to the dropdown
  }

  // Add dropdown to the page, create label, Level 200
  const episodeLabel = document.createElement("label");
  episodeLabel.textContent = "Select an episode: ";
  episodeLabel.htmlFor = "episode-selector";
  
  //Create "show all episodes" button, Level 200
  const backButton = document.createElement("button");
  backButton.textContent = "Show all episodes";
  backButton.id = "back-button";

  //Create "back to show/Show all shows" button, Level 500
  const backToShowButton = document.createElement("button");
  backToShowButton.textContent = "Show all shows";
  backToShowButton.id = "back-to-shows-button";
  
// Add all episode controls to the episode container
  episodeContainer.append(
  episodeLabel,
  selectEpisodeList,
  backButton,
  backToShowButton
);


  // What happens when an episode is selected fron episode selector dropdown- Level 200/300
  selectEpisodeList.addEventListener("change", function () {
  const selectedId = Number(selectEpisodeList.value); //Store only selected ID from the all episodes 
  // when the user selected an option from the dropdown

  const selectedEpisode = episodeList.find(function (episode) { //Look through every episode. Level 200/300
  //If episode.id equals selectedId, return that episode object.
      return episode.id === selectedId;
  });

  // Clear any active search filter so we're working with the full list again
   searchInput.value = "";

  // Re-render(create & display) all episode cards fresh, and update currentCards so every
  // other handler (like backButton) stays pointed at currentCards
   currentCards = makePageForEpisodes(episodeList);


  //Hide all episode cards. Level 200/300
   for (const card of currentCards) {
      card.style.display = "none";
  }
  
   //For displaying selected episode card. Level 200/300
    const index = episodeList.indexOf(selectedEpisode); //Store the index of selected card
    currentCards[index].style.display = ""; //Display only the selected episode card
   

  });

  // Shows all episodes again (Bonus part , Level 200)
  backButton.addEventListener("click", function () {

    //Re-render(create & display) all episode cards fresh, and update currentCards
    currentCards = makePageForEpisodes(episodeList);

     // Clear search as well
    searchInput.value = "";

    episodeCount.textContent =
      `Displaying ${episodeList.length}/${episodeList.length} episodes`; // Displaying 73/73 episodes

  });

  // Reset episode controls and return to the shows listing on FRONT PAGE, Level 500
  backToShowButton.addEventListener("click", function () { //user back to show button clicked
  searchInput.value = ""; //clear episode search
  episodeCount.textContent = ""; //clear episode count

  makePageForShows(allShows); //display all TV shows again on front page
  makeShowSelector(allShows); //Show selector becomes full again on front page
}); 
}

// ==================== LEVEL 300- LOAD EPISODES BY FETCHING API ====================
// Fetch episodes for the selected show from TVMaze API
async function loadEpisodes(showId) { 

//Clear input when switching between shows and episodes
 searchInput.value = "";

  // Check if we already fetched this show's episodes, Level 400
  if (cachedEpisodes[showId]) {
    const episodes = cachedEpisodes[showId];
    currentEpisodes = episodes; // Save the episodes of the selected show for searching and filtering
    const episodeCards = makePageForEpisodes(episodes);
    makeEpisodeSelector(episodes, episodeCards);

    return episodeCards;
  }

  try { //Level-300 / If not fetched, i.e first time loading
    const response = await fetch(getEpisodeUrl(showId)); // Request episode data from TVMaze API
    const episodes = await response.json(); // Convert JSON format into JavaScript objects
    currentEpisodes = episodes; // Stored the fetched episodes of the selected show for searching and filtering
    
    // Store the episodes so we don't fetch the same URL again
    cachedEpisodes[showId] = episodes;

    // fill the episode dropdown, Level-300
    const episodeCards = makePageForEpisodes(episodes); // Display episode cards on the page
    makeEpisodeSelector(episodes, episodeCards); // Create episode selector dropdown

    return episodeCards; //Returned created card
  } catch (error) { // Error handling; Display error message if fetch fails. Level 300
    episodesMessage.textContent = EPISODE_ERROR;
  }
}

// ==================== Level 400 SHOW SELECTOR ====================
// Create dropdown containing all available shows
function makeShowSelector(shows) {

// Find the existing show container, show container keeps show selector dropdown and show dropdown label
let showContainer = document.getElementById("show-container");

// Create it only if show container doesn't exist, Level 400
if (!showContainer) {
  showContainer = document.createElement("div");
  showContainer.id = "show-container";
  searchContainer.append(showContainer); //Add the show container in to the search container
}

// Clear old show from dropdown before showing a new show
showContainer.innerHTML = "";

//Create new show dropdown for show list, Level 400
  const selectShowList = document.createElement("select"); 
  selectShowList.id = "show-selector";

  const showLabel = document.createElement("label"); //Create show dropdown label
  showLabel.textContent = "Select a show: ";
  showLabel.htmlFor = "show-selector";

  //Add entries to the dropdown, Level 400
  shows.forEach((show) => { //Create option for each show from all shows in dropdown
    const option = document.createElement("option");

    option.textContent = show.name; //Set each show text
    option.value = show.id; //Store each show ID

    selectShowList.append(option); //Add option to the dropdown
  });

  //What happens when a user clicks one show in dropdown, Level 400
  selectShowList.addEventListener("change", async () => {
    const showId = Number(selectShowList.value); //Get the selected show ID

      searchInput.value = ""; //Clear the old search when switching shows
      episodeCount.textContent = ""; //Clear the previous episode count

    episodesMessage.textContent = "Loading episodes..."; //Show this message when episodes data is loading for a
    //selected show. Level 300 / 400

    // Load episodes using the cache, Level 400
    await loadEpisodes(showId);

    episodesMessage.textContent = ""; // Remove loading message once data arrives. Level 300 /400
  });

  // Add the show label and show selector dropdown inside the show container, Level 400
  showContainer.append(showLabel, selectShowList); 
}

// ==================== LEVEL 500 DISPLAY SHOWS ON THE FRONT PAGE ====================
// Create and display show cards on the front page
function makePageForShows(showList) {
  
  // Show the "Filtering for" label on the shows listing page, i.e front page
  searchLabel.style.display = "";

  // change the search box to search shows on the front page
  searchInput.placeholder = "Search shows...";

 //Shows the text if no. of shows found after filtering on front page
  showCount.textContent = `Found ${showList.length} shows`;

  // User is currently viewing the shows listing on front page
  currentView = "shows";
  
  rootElem.innerHTML = ""; // Clear any existing content before displaying show cards

  //Creating show cards for FRONT PAGE
  for (const show of showList) { //Creates one card per show
    const card = document.createElement("section");
    card.classList.add("show-card");

    const showName = document.createElement("h2"); 
    showName.textContent = show.name;

    showName.style.cursor = "pointer"; //Shows hand cursor when mouse is over the show name; tells the user, you can click this
   
    //What happens when user clicks on a show name
    showName.addEventListener("click", async function () { //when the user clicks show name, Load that show's episodes
      await loadEpisodes(show.id);
    });

    const image = document.createElement("img"); //6 show information according to requirement 1
    image.src = show.image.medium;
    image.alt = `Show image for ${show.name}`;

    const genres = document.createElement("p");
    genres.textContent = `Genres: ${show.genres.join(", ")}`;

    const status = document.createElement("p");
    status.textContent = `Status: ${show.status}`;

    const rating = document.createElement("p");
    rating.textContent = `Rating: ${show.rating.average}`;

    const runtime = document.createElement("p");
    runtime.textContent = `Runtime: ${show.runtime} minutes`;

    const summary = document.createElement("div");
    summary.innerHTML = show.summary;

    
//For Organizing the show information nicely before displaying it on the front page, according to the
// Level 500 given layout
 
// Container for rating, genres, status and runtime
const showInfo = document.createElement("div");
showInfo.classList.add("show-info"); // Apply CSS styling to the show information section

showInfo.append( // Add show details inside the showInfo container
  rating,
  genres,
  status,
  runtime
);

summary.classList.add("summary"); // Apply CSS styling to the show summary section

card.append( // Build the complete show card
  showName,
  image,
  summary,
  showInfo
);

 rootElem.append(card); //Add the completed card inside the page container (root). Display the finished card on the page
  }

  // Hide episode controls
  const episodeContainer = document.getElementById("episode-container");
  if (episodeContainer) {
    episodeContainer.style.display = "none";
  }

  // Show show selector
  const showContainer = document.getElementById("show-container");
  if (showContainer) {
    showContainer.style.display = "";
  }

}

// ====================Level 200/ 500 SEARCH FOR BOTH SHOWS & EPISODES (Globar search listener) ==================== 
// Run every time the user types in the search box
  searchInput.addEventListener("input", function () {

  const searchTerm = searchInput.value; // Get the current search text

 if (currentView === "shows") { // If the user is on the shows listing page/ front page, Level 500
    const matchingShows = searchShows(searchTerm, allShows); // Find all shows that match the search text, Level 500
    makePageForShows(matchingShows); // Redisplay only the matching shows
    makeShowSelector(matchingShows); //Display only matching shows in dropdown
}
else if (currentView === "episodes") { // If the user is viewing episodes
    const matchingEpisodes = searchEpisodes(searchTerm, currentEpisodes); // Find all episodes that match the search text
    
    episodeCount.textContent =
    `Displaying ${matchingEpisodes.length}/${currentEpisodes.length} episodes`; //For displaying text
    // i.e Displaying 1/33 episodes
    
    makePageForEpisodes(matchingEpisodes); // Redisplay only the matching episodes
}

});


window.onload = setup;
