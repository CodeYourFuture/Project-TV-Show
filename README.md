# TV Show Explorer

A responsive web app for finding TV shows and exploring their episodes. It uses the [TVmaze API](https://www.tvmaze.com/api) to display show details and episode information, with search and filtering built in using vanilla JavaScript.

This project was developed as part of a collaborative CodeYourFuture learning exercise, starting from the [CodeYourFuture Project-TV-Show repository](https://github.com/CodeYourFuture/Project-TV-Show).

## Features

- Browse TV shows with posters, descriptions, genres, ratings, status and runtime.
- Search the loaded shows by title, genre or description.
- Select a show to view its episodes, then search or filter the episode list.
- See the number of matching shows and episodes as filters change.
- Reuse previously requested API responses during the session to avoid unnecessary requests.
- Responsive layouts for desktop and mobile, with keyboard-accessible controls.

## Built with

HTML, CSS and JavaScript (DOM manipulation, Fetch API and asynchronous functions). TV show and episode data come from the TVmaze API.

## Running locally

No build step or package installation is needed. Clone the repository and serve the project folder with a simple local web server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. An internet connection is required for the TVmaze API calls.

## How it works

The app loads a catalogue of shows from TVmaze and renders the results as cards. Search terms and dropdown selections filter the data already loaded in the browser. Selecting a show fetches its episodes; subsequent visits can reuse the cached request.

The initial catalogue is limited to the results returned by the app's current API request, so it is not a search of every show in TVmaze. Availability of show information and images depends on the external API.

## Deployment

The app is hosted on **Vercel**. The verified public deployment URL can be added here when available.

## Project background and credits

This repository is a **fork of CodeYourFuture's Project-TV-Show starter project** and was developed as a learning and collaboration exercise. The original repository contains the course milestones and review instructions. This README describes the app in its current form rather than reproducing those instructions.

TV show and episode information is provided by [TVmaze](https://www.tvmaze.com/).
