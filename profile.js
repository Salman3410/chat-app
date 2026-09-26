import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase/firebaseConfig.js";


// ==========================================
// DOM
// ==========================================

const loader =
  document.getElementById("loader");

const profileBox =
  document.getElementById("profile");

const usernameDisplay =
  document.getElementById(
    "usernameDisplay"
  );

const backBtn =
  document.getElementById("backBtn");


// ==========================================
// URL PROFILE
// ==========================================

const params =
  new URLSearchParams(
    window.location.search
  );

const profileName =
  params.get("name");


// ==========================================
// BASIC CHECK
// ==========================================

if (!profileName) {

  renderNotFound(
    "No profile was selected."
  );

  hideLoader();
}


// ==========================================
// FIREBASE AUTH CHECK
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

      // ------------------------------------
      // LOAD CURRENT USER
      // ------------------------------------

      const currentUserRef =
        doc(
          db,
          "users",
          user.uid
        );

      const currentUserSnapshot =
        await getDoc(
          currentUserRef
        );


      if (
        currentUserSnapshot.exists()
      ) {

        const currentUserData =
          currentUserSnapshot.data();

        usernameDisplay.textContent =
          `👤 ${
            currentUserData.username ||
            currentUserData.displayName ||
            user.email
          }`;

      } else {

        usernameDisplay.textContent =
          `👤 ${user.email}`;

      }


      // ------------------------------------
      // LOAD SELECTED PROFILE
      // ------------------------------------

      if (!profileName) {
        return;
      }

      await loadProfile(
        profileName
      );

    } catch (error) {

      console.error(
        "❌ Profile loading failed:",
        error
      );

      renderNotFound(
        "Unable to load this profile."
      );

    } finally {

      hideLoader();

    }

  }
);


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile(
  username
) {

  console.log(
    "Loading profile:",
    username
  );


  const usersRef =
    collection(
      db,
      "users"
    );


  const profileQuery =
    query(
      usersRef,
      where(
        "username",
        "==",
        username
      )
    );


  const snapshot =
    await getDocs(
      profileQuery
    );


  // ----------------------------------------
  // NOT FOUND
  // ----------------------------------------

  if (snapshot.empty) {

    console.warn(
      "Profile not found:",
      username
    );

    renderNotFound(
      `${username} does not exist.`
    );

    return;
  }


  // ----------------------------------------
  // PROFILE DATA
  // ----------------------------------------

  const profileDoc =
    snapshot.docs[0];

  const profileData =
    profileDoc.data();


  renderProfile(
    profileData,
    profileDoc.id
  );

}


// ==========================================
// RENDER PROFILE
// ==========================================

function renderProfile(
  profile,
  uid
) {

  const username =
    profile.username ||
    profile.displayName ||
    "Unknown User";


  const displayName =
    profile.displayName ||
    username;


  const role =
    profile.role ||
    "3Chat Member";


  const bio =
    profile.bio ||
    "No bio available.";


  const status =
    profile.status ||
    "offline";


  const avatar =
    profile.avatar ||
    "";


  const hobbies =
    Array.isArray(profile.hobbies)
      ? profile.hobbies
      : [];


  const skills =
    Array.isArray(profile.skills)
      ? profile.skills
      : [];


  // ----------------------------------------
  // STATUS
  // ----------------------------------------

  const statusClass =
    getStatusClass(status);

  const statusLabel =
    getStatusLabel(status);


  // ----------------------------------------
  // AVATAR
  // ----------------------------------------

  const avatarHTML =
    avatar
      ? `
        <img
          src="${escapeHTML(avatar)}"
          alt="${escapeHTML(displayName)}"
          class="profile-avatar"
        />
      `
      : `
        <div
          class="profile-avatar avatar-placeholder"
          role="img"
          aria-label="${escapeHTML(displayName)} avatar"
        >
          ${getAvatarEmoji(username)}
        </div>
      `;


  // ----------------------------------------
  // HOBBIES
  // ----------------------------------------

  const hobbiesHTML =
    hobbies.length > 0
      ? hobbies
          .map(
            (hobby) => `
              <div class="detail-card">

                <div class="detail-label">
                  Hobby
                </div>

                <p class="detail-text">
                  ${escapeHTML(hobby)}
                </p>

              </div>
            `
          )
          .join("")
      : `
          <div class="detail-card">

            <div class="detail-label">
              Hobbies
            </div>

            <p class="detail-text">
              No hobbies added yet.
            </p>

          </div>
        `;


  // ----------------------------------------
  // SKILLS
  // ----------------------------------------

  const skillsHTML =
    skills.length > 0
      ? skills
          .map(
            (skill) => `
              <span class="skill-tag">
                ${escapeHTML(skill)}
              </span>
            `
          )
          .join("")
      : `
          <span class="skill-tag">
            No skills added
          </span>
        `;


  // ----------------------------------------
  // PROFILE HTML
  // ----------------------------------------

  profileBox.innerHTML = `

    <div class="profile-hero">

      <div class="avatar-wrapper">

        ${avatarHTML}

        <span
          class="online-dot ${statusClass}"
          title="${escapeHTML(statusLabel)}"
        ></span>

      </div>


      <h1 class="profile-name">

        ${getAvatarEmoji(username)}

        ${escapeHTML(displayName)}

      </h1>


      <p class="profile-role">
        ${escapeHTML(role)}
      </p>


      <p class="profile-bio">
        ${escapeHTML(bio)}
      </p>

    </div>


    <div class="profile-details">

      ${hobbiesHTML}

    </div>


    <section class="skills-section">

      <h3 class="section-title">
        Skills & Interests
      </h3>

      <div class="skills">

        ${skillsHTML}

      </div>

    </section>


    <div class="profile-actions">

      <button
        id="sendMessageBtn"
        class="send-message-btn"
        type="button"
      >
        💬 Open Group Chat
      </button>

    </div>

  `;


  // ======================================
  // OPEN GROUP CHAT
  // ======================================

  const sendMessageBtn =
    document.getElementById(
      "sendMessageBtn"
    );


  if (sendMessageBtn) {

    sendMessageBtn.addEventListener(
      "click",
      () => {

        /*
          We currently have one group chat:
          group_3chat

          No localStorage is needed.
        */

        window.location.href =
          "chat.html";

      }
    );

  }

}


// ==========================================
// STATUS
// ==========================================

function getStatusClass(
  status
) {

  switch (
    String(status).toLowerCase()
  ) {

    case "online":
      return "online";

    case "busy":
      return "busy";

    case "sleeping":
      return "sleeping";

    default:
      return "";

  }

}


function getStatusLabel(
  status
) {

  switch (
    String(status).toLowerCase()
  ) {

    case "online":
      return "Online";

    case "busy":
      return "Busy";

    case "sleeping":
      return "Sleeping";

    default:
      return "Offline";

  }

}


// ==========================================
// AVATAR
// ==========================================

function getAvatarEmoji(
  username
) {

  const emojiMap = {

    Sam: "🐧",

    Arsh: "🦸",

    Mohsin: "🤖"

  };

  return (
    emojiMap[username] ||
    "👤"
  );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
  value
) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ==========================================
// NOT FOUND
// ==========================================

function renderNotFound(
  message
) {

  if (!profileBox) {
    return;
  }

  profileBox.innerHTML = `

    <div class="profile-not-found">

      <h1>
        Profile not found ❌
      </h1>

      <p>
        ${escapeHTML(message)}
      </p>

    </div>

  `;

}


// ==========================================
// BACK
// ==========================================

if (backBtn) {

  backBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "index.html";

    }
  );

}


// ==========================================
// LOADER
// ==========================================

function hideLoader() {

  if (!loader) {
    return;
  }

  loader.classList.add(
    "hidden"
  );

  setTimeout(() => {

    loader.style.display =
      "none";

  }, 300);

}


if (loader) {
  loader.classList.add("active");
}
