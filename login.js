import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  auth
} from "./firebase/firebaseConfig.js";


// ==========================================
// DOM
// ==========================================

const loginForm =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const togglePassword =
  document.getElementById("togglePassword");

const loginBtn =
  document.getElementById("loginBtn");

const loginMessage =
  document.getElementById("loginMessage");


// ==========================================
// EXISTING SESSION CHECK
// ==========================================

onAuthStateChanged(
  auth,
  (user) => {

    if (user) {

      window.location.replace(
        "index.html"
      );

    }

  }
);


// ==========================================
// PASSWORD TOGGLE
// ==========================================

togglePassword.addEventListener(
  "click",
  () => {

    const isPassword =
      passwordInput.type === "password";

    passwordInput.type =
      isPassword
        ? "text"
        : "password";

    togglePassword.textContent =
      isPassword
        ? "🙈"
        : "👁";

    togglePassword.setAttribute(
      "aria-label",
      isPassword
        ? "Hide password"
        : "Show password"
    );

  }
);


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    clearLoginMessage();

    const email =
      emailInput.value
        .trim()
        .toLowerCase();

    const password =
      passwordInput.value;


    if (!email) {

      showLoginError(
        "Please enter your email."
      );

      emailInput.focus();

      return;
    }


    if (!password) {

      showLoginError(
        "Please enter your password."
      );

      passwordInput.focus();

      return;
    }


    setLoginLoading(true);


    try {

      const credential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


      console.log(
        "✅ Firebase authentication successful"
      );

      console.log(
        "UID:",
        credential.user.uid
      );

      console.log(
        "Email:",
        credential.user.email
      );


      showLoginSuccess(
        "Login successful! Opening 3Chat..."
      );


      setTimeout(() => {

        window.location.replace(
          "index.html"
        );

      }, 400);


    } catch (error) {

      console.error(
        "❌ Firebase login error:",
        error
      );


      switch (error.code) {

        case "auth/invalid-credential":

          showLoginError(
            "Incorrect email or password."
          );

          break;


        case "auth/invalid-email":

          showLoginError(
            "Please enter a valid email."
          );

          break;


        case "auth/user-not-found":

          showLoginError(
            "No account exists with this email."
          );

          break;


        case "auth/wrong-password":

          showLoginError(
            "Incorrect password."
          );

          break;


        case "auth/user-disabled":

          showLoginError(
            "This account has been disabled."
          );

          break;


        case "auth/too-many-requests":

          showLoginError(
            "Too many attempts. Try again later."
          );

          break;


        default:

          showLoginError(
            "Login failed. Please try again."
          );

      }


    } finally {

      setLoginLoading(false);

    }

  }
);


// ==========================================
// UI HELPERS
// ==========================================

function showLoginError(message) {

  loginMessage.textContent =
    `⚠️ ${message}`;

  loginMessage.style.color =
    "#ff6d8d";

}


function showLoginSuccess(message) {

  loginMessage.textContent =
    `✅ ${message}`;

  loginMessage.style.color =
    "#66f2a4";

}


function clearLoginMessage() {

  loginMessage.textContent = "";

}


function setLoginLoading(loading) {

  loginBtn.disabled =
    loading;


  if (loading) {

    loginBtn.innerHTML = `
      <span>Signing in...</span>
      <span class="button-arrow">↗</span>
    `;

  } else {

    loginBtn.innerHTML = `
      <span>Enter 3Chat</span>
      <span class="button-arrow">→</span>
    `;

  }

}
