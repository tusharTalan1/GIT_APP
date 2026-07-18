const usernameInput = document.getElementById("username-input");
const searchBtn = document.getElementById("search-btn");
const errorMessage = document.getElementById("error-message");
const loadingMessage = document.getElementById("loading-message");

const profileCard = document.getElementById("profile-card");
const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileUsername = document.getElementById("profile-username");
const profileBio = document.getElementById("profile-bio");
const profileFollowers = document.getElementById("profile-followers");
const profileFollowing = document.getElementById("profile-following");
const profileRepos = document.getElementById("profile-repos");
const profileLocation = document.getElementById("profile-location");

const repoControls = document.getElementById("repo-controls");
const sortSelect = document.getElementById("sort-select");
const repoList = document.getElementById("repo-list");
const loadMoreBtn = document.getElementById("load-more-btn");

const modal = document.getElementById("repo-modal");
const modalClose = document.getElementById("modal-close");
const modalRepoName = document.getElementById("modal-repo-name");
const modalRepoDescription = document.getElementById("modal-repo-description");
const modalLanguages = document.getElementById("modal-languages");
const modalOpenIssues = document.getElementById("modal-open-issues");
const modalLicense = document.getElementById("modal-license");

let allRepos = [];
let currentPage = 1;
let currentUsername = "";

function saveToCache(key, data) {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

function getFromCache(key, maxAgeMs) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const entry = JSON.parse(raw);
  if (Date.now() - entry.timestamp > maxAgeMs) return null;
  return entry.data;
}

const CACHE_TIME = 10 * 60 * 1000; 


function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ---- API calls ----
async function fetchUserData(username) {
  const cacheKey = `user-${username}`;
  const cached = getFromCache(cacheKey, CACHE_TIME);
  if (cached) return cached;

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
  ]);

  if (userRes.status === 404) {
    const err = new Error("User not found");
    err.type = "NOT_FOUND";
    throw err;
  }
  if (userRes.status === 403 || reposRes.status === 403) {
    const err = new Error("Rate limit exceeded");
    err.type = "RATE_LIMIT";
    throw err;
  }
  if (!userRes.ok || !reposRes.ok) {
    const err = new Error("Unexpected error");
    err.type = "UNKNOWN";
    throw err;
  }

  const user = await userRes.json();
  const repos = await reposRes.json();
  const data = { user, repos };

  saveToCache(cacheKey, data);
  return data;
}

async function fetchRepoDetails(owner, repoName) {
  const cacheKey = `repo-${owner}-${repoName}`;
  const cached = getFromCache(cacheKey, CACHE_TIME);
  if (cached) return cached;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
  if (!res.ok) {
    const err = new Error("Could not load repo details");
    err.type = "UNKNOWN";
    throw err;
  }
  const repo = await res.json();

  const langRes = await fetch(repo.languages_url);
  const languages = langRes.ok ? await langRes.json() : {};

  const data = { repo, languages };
  saveToCache(cacheKey, data);
  return data;
}