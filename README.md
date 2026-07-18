# GitHub Profile Explorer

A vanilla JavaScript app to search any GitHub user and explore their profile and repositories — built using the GitHub REST API.

## Features

-  Search any GitHub username (search button, Enter key, or live debounced typing)
-  View profile info — avatar, name, bio, followers, following, public repo count, location
-  Browse repositories, sortable by stars or last updated
-  Click any repo to view details — languages used, open issues, license
-  "Load more" pagination for users with many repos
-  Client-side caching (10-minute expiry) to avoid unnecessary API calls
-  Clear error handling for invalid usernames, rate limits, and network issues

## Built with

- HTML, CSS, vanilla JavaScript (no frameworks)
- [GitHub REST API](https://docs.github.com/en/rest) (unauthenticated requests, 60/hour limit)
- `localStorage` for caching

## How it works

1. Enter a GitHub username and search
2. The app fetches the user's profile and repo list in parallel
3. Repos are rendered as cards, sortable by stars or last updated
4. Clicking a repo card opens a modal with its languages, open issues, and license — fetched on demand
5. Repeated searches within 10 minutes serve cached data instead of hitting the API again

## Running locally

Clone the repo and open `index.html` in a browser (or use a tool like VS Code's Live Server extension):

```bash
git clone https://github.com/tusharTalan1/GIT_APP.git
cd <your-repo-name>
```

No build step or dependencies required — it's plain HTML/CSS/JS.

## Notes

- Uses GitHub's unauthenticated API, limited to 60 requests/hour per IP. No personal access token is used, so no `.env` setup is needed.
- Rate limit errors are shown clearly in the UI if the limit is hit.
