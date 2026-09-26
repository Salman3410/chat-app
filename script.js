// ==========================================
// 3CHAT HOME PAGE
// ==========================================

// ==========================================
// DOM ELEMENTS
// ==========================================

const loader = document.getElementById("loader");

const modeToggle = document.getElementById("modeToggle");

const logoutBtn = document.getElementById("logoutBtn");

const chatBtn = document.getElementById("chatBtn");

const quickChatBtn = document.getElementById("quickChatBtn");

const usernameDisplay = document.getElementById("usernameDisplay");

const friendCards = document.querySelectorAll(".friend-card");

// ==========================================
// AUTH CHECK
// ==========================================

const loggedInUser = localStorage.getItem("loggedInUser");

if (!loggedInUser) {
  window.location.href = "login.html";
}

// ==========================================
// USER DISPLAY
// ==========================================

if (usernameDisplay) {
  usernameDisplay.textContent = `👤 ${loggedInUser}`;
}

// ==========================================
// FRIEND DATA
// ==========================================

const friendStatuses = {
  Sam: {
    status: "Online",
    className: "online",
  },

  Arsh: {
    status: "Busy",
    className: "busy",
  },

  Mohsin: {
    status: "Sleeping",
    className: "sleeping",
  },
};

// ==========================================
// FLOATING EMOJIS
// ==========================================

const emojis = ["😂", "🔥", "⚡", "🎉", "😎", "💥"];

let emojiInterval = null;

function createEmoji() {
  const emoji = document.createElement("div");

  emoji.className = "emoji";

  emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  emoji.style.left = `${Math.random() * 100}vw`;

  emoji.style.animationDuration = `${4 + Math.random() * 4}s`;

  emoji.style.fontSize = `${18 + Math.random() * 14}px`;

  emoji.style.animationDelay = `${Math.random() * 1.5}s`;

  document.body.appendChild(emoji);

  setTimeout(() => {
    emoji.remove();
  }, 9000);
}

// Create a few initially
for (let i = 0; i < 3; i++) {
  setTimeout(createEmoji, i * 700);
}

// Continue creating them,
// but less aggressively than before.
emojiInterval = setInterval(createEmoji, 1800);

// ==========================================
// OPEN GROUP CHAT
// ==========================================

function openChat() {
  showLoader();

  setTimeout(() => {
    window.location.href = "chat.html";
  }, 250);
}

if (chatBtn) {
  chatBtn.addEventListener("click", openChat);
}

if (quickChatBtn) {
  quickChatBtn.addEventListener("click", openChat);
}

// ==========================================
// OPEN PROFILE
// ==========================================

function openProfile(name) {
  if (!name) {
    return;
  }

  showLoader();

  setTimeout(() => {
    window.location.href = `profile.html?name=${encodeURIComponent(name)}`;
  }, 250);
}

// ==========================================
// FRIEND CARDS
// ==========================================

friendCards.forEach((card) => {
  const name = card.dataset.name;

  if (!name) {
    return;
  }

  // Click
  card.addEventListener("click", () => {
    openProfile(name);
  });

  // Keyboard accessibility
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      openProfile(name);
    }
  });
});

// ==========================================
// UPDATE FRIEND STATUS
// ==========================================

function renderFriendStatuses() {
  friendCards.forEach((card) => {
    const name = card.dataset.name;

    const statusData = friendStatuses[name];

    if (!statusData) {
      return;
    }

    const statusElement = card.querySelector(".status");

    if (!statusElement) {
      return;
    }

    const dot = statusElement.querySelector(".status-dot");

    // Remove old status classes
    statusElement.classList.remove("online", "busy", "sleeping");

    // Add current status
    statusElement.classList.add(statusData.className);

    /*
      Keep the existing dot and only
      update the text around it.
    */
    if (dot) {
      statusElement.innerHTML = "";

      statusElement.appendChild(dot);

      statusElement.appendChild(document.createTextNode(statusData.status));
    } else {
      statusElement.textContent = statusData.status;
    }
  });
}

// Render once
renderFriendStatuses();

// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    showLoader();

    localStorage.removeItem("loggedInUser");

    localStorage.removeItem("currentChatFriend");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 250);
  });
}

// ==========================================
// THEME
// ==========================================

function applyTheme() {
  const savedMode = localStorage.getItem("mode");

  const isLight = savedMode === "light";

  document.body.classList.toggle("light", isLight);

  if (modeToggle) {
    modeToggle.textContent = isLight ? "🌙" : "☀️";
  }
}

applyTheme();

if (modeToggle) {
  modeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light");

    localStorage.setItem("mode", isLight ? "light" : "dark");

    modeToggle.textContent = isLight ? "🌙" : "☀️";
  });
}

// ==========================================
// LOADER
// ==========================================

function showLoader() {
  if (!loader) {
    return;
  }

  loader.classList.remove("hidden");

  loader.classList.add("active");
}

function hideLoader() {
  if (!loader) {
    return;
  }

  loader.classList.add("hidden");

  loader.classList.remove("active");
}

// ==========================================
// INITIAL PAGE LOAD
// ==========================================

showLoader();

window.addEventListener("load", () => {
  setTimeout(() => {
    hideLoader();
  }, 350);
});
