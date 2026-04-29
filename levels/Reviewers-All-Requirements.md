There are the main requirements that a submitted project needs checked by reviewers.
Trainees should **not** need to refer to this document, and should focus on completing each level one at a time.

1. It is deployed on GitHub pages
1. The site must fetch data from an API at `TVMaze.com`, **not** a JSON file
	1. The page should state somewhere that the data has (originally) come from [TVMaze.com](https://tvmaze.com/), and link back to that site. 
	1. During a visit to the website it should never fetch any URL more than once.
	1. The site should indicate when data is loading.
	1. If an error occurred loading the data, notify the user on the page (not only in the console)
1. Listing Shows - When the site starts, present a listing of all shows ("shows listing")
	1. For each show, display at least:
		1. name
		1. image
		1. summary
		1. genres
		1. status
		1. rating
		1. runtime
	1. When a show name is clicked, it should:
		1. Fetch and present episodes from that show
		1. Hide the "shows listing" view
		1. Enable episode search / select (see below)
	1. Have a navigation link or button to enable the user to return to the "shows listing"
		1. When this is clicked, the episodes listing should be hidden
	1. Ensure that the search and selector controls still work correctly when you switch from shows listing to episodes listing and back
1. Listing Episodes - When a show is selected, all episodes must be on the page shown for that given show, with at least:
	1. The name of the episode
	1. The combined season number and episode number into a zero-padded episode code: `S02E07` is correct, `S2E7` is incorrect.
	1. The medium-sized image for the episode
	1. The summary text of the episode
1. Select Shows - a `select` element to your page so the user can choose a show.
	1. When the user first loads the page, use the `fetch`ed list of available shows, and add an entry to the drop-down per show.
	1. When a user selects a show, display the episodes for that show after `fetch`ing the episode list.
	1. The select must list shows in alphabetical order, case-insensitive.
1. Select Episodes - a `select` drop-down which lets the user jump quickly to a particular episode:
	1. The select options are updated whenever a new show is selected, and this select isn't used otherwise
	1. The select input should list all episodes in the format: "S01E01 - Episode Title"
	1. When the user makes a selection, they should be taken directly to that episode on the page
1. Search Shows - When a user types a search term into the search box:
	1. Only shows whose summary **OR** name contains the search term should be displayed
	1. The search should be case-**in**sensitive
	1. The display should update **immediately** after each keystroke changes the input
	1. Display how many shows match the current search
	1. If the search box is cleared, **all** shows should be shown
1. Search Episodes - When a user types a search term into the search box:
	1. Only episodes whose summary **OR** name contains the search term should be displayed
	1. The search should be case-**in**sensitive
	1. The display should update **immediately** after each keystroke changes the input
	1. Display how many episodes match the current search
	1. If the search box is cleared, **all** episodes should be shown
  
