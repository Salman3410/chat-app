import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase/firebaseConfig.js";


const loader =
  document.getElementById("loader");

const modeToggle =
  document.getElementById("modeToggle");

const logoutBtn =
  document.getElementById("logoutBtn");

const chatBtn =
  document.getElementById("chatBtn");

const quickChatBtn =
  document.getElementById("quickChatBtn");

const usernameDisplay =
  document.getElementById("usernameDisplay");

const friendCards =
  document.querySelectorAll(".friend-card");


// ==========================================
// AUTH CHECK
// ==========================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.replace(
        "login.html"
      );

      return;
    }


    try {

      const userRef =
        doc(
          db,
          "users",
          user.uid
        );

      const userSnapshot =
        await getDoc(userRef);


      if (userSnapshot.exists()) {

        const userData =
          userSnapshot.data();

        usernameDisplay.textContent =
          `👤 ${
            userData.username ||
            userData.displayName ||
            user.email
          }`;

      } else {

        usernameDisplay.textContent =
          `👤 ${user.email}`;

        console.warn(
          "Firestore profile not found:",
          user.uid
        );

      }

    } catch (error) {

      console.error(
        "Failed to load user profile:",
        error
      );

      usernameDisplay.textContent =
        `👤 ${user.email}`;

    } finally {

      hideLoader();

    }

  }
);


// ==========================================
// CHAT
// ==========================================

function openChat() {

  window.location.href =
    "chat.html";

}

chatBtn.addEventListener(
  "click",
  openChat
);

quickChatBtn.addEventListener(
  "click",
  openChat
);


// ==========================================
// PROFILES
// ==========================================

function openProfile(name) {

  window.location.href =
    `profile.html?name=${encodeURIComponent(name)}`;

}


friendCards.forEach(
  (card) => {

    const name =
      card.dataset.name;

    if (!name) {
      return;
    }

    card.addEventListener(
      "click",
      () => openProfile(name)
    );


    card.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          openProfile(name);

        }

      }
    );

  }
);


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
  "click",
  async () => {

    showLoader();

    try {

      await signOut(auth);

      /*
        No localStorage cleanup is needed
        for authentication anymore.

        Firebase handles the auth state.
      */

      window.location.replace(
        "login.html"
      );

    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

      hideLoader();

    }

  }
);


// ==========================================
// THEME
// ==========================================

function applyTheme() {

  const light =
    localStorage.getItem(
      "mode"
    ) === "light";

  document.body.classList.toggle(
    "light",
    light
  );

  modeToggle.textContent =
    light
      ? "🌙"
      : "☀️";

}

applyTheme();

modeToggle.addEventListener(
  "click",
  () => {

    const light =
      document.body.classList.toggle(
        "light"
      );

    localStorage.setItem(
      "mode",
      light
        ? "light"
        : "dark"
    );

    modeToggle.textContent =
      light
        ? "🌙"
        : "☀️";

  }
);


// ==========================================
// LOADER
// ==========================================

function showLoader() {

  if (!loader) {
    return;
  }

  loader.classList.add(
    "active"
  );

  loader.classList.remove(
    "hidden"
  );

}


function hideLoader() {

  if (!loader) {
    return;
  }

  loader.classList.add(
    "hidden"
  );

}
