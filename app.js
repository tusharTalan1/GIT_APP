
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