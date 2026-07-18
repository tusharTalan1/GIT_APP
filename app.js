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

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.remove("hide");
}

function hideError() {
  errorMessage.classList.add("hide");
}

function renderProfile(user) {
  profileAvatar.src = user.avatar_url;
  profileName.textContent = user.name || user.login;
  profileUsername.textContent = `@${user.login}`;
  profileBio.textContent = user.bio || "";
  profileFollowers.textContent = user.followers;
  profileFollowing.textContent = user.following;
  profileRepos.textContent = user.public_repos;
  profileLocation.textContent = user.location ? `📍 ${user.location}` : "";
  profileCard.classList.remove("hide");
}

function sortRepos(repos, sortBy) {
  const copy = [...repos];
  if (sortBy === "stars") {
    copy.sort((a, b) => b.stargazers_count - a.stargazers_count);
  } else {
    copy.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }
  return copy;
}

const REPOS_PER_PAGE = 10;

function renderRepoList() {
  const sorted = sortRepos(allRepos, sortSelect.value);
  const visible = sorted.slice(0, currentPage * REPOS_PER_PAGE);

  repoList.innerHTML = "";
  visible.forEach(repo => {
    const card = document.createElement("div");
    card.classList.add("repo-card");

    const title = document.createElement("h3");
    title.textContent = repo.name;

    const desc = document.createElement("p");
    desc.textContent = repo.description || "No description";

    const meta = document.createElement("div");
    meta.classList.add("repo-meta");
    meta.innerHTML = `
      <span>⭐ ${repo.stargazers_count}</span>
      <span>${repo.language || "—"}</span>
      <span>Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
    `;

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(meta);

    card.addEventListener("click", () => openRepoModal(repo));

    repoList.appendChild(card);
  });

  loadMoreBtn.classList.toggle("hide", visible.length >= sorted.length);
  repoControls.classList.remove("hide");
}