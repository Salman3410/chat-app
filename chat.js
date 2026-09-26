import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import { auth, db } from "./firebase/firebaseConfig.js";

const CHAT_ID = "group_3chat";

const loader = document.getElementById("loader");
const backBtn = document.getElementById("backBtn");
const modeToggle = document.getElementById("modeToggle");
const usernameDisplay = document.getElementById("usernameDisplay");

const chatContainer = document.getElementById("chat-container");

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const characterCount = document.getElementById("characterCount");
const sendBtn = document.getElementById("sendBtn");
const sendText = document.querySelector(".send-text");
const sendIcon = document.querySelector(".send-icon");

const notificationContainer = document.getElementById("notification-container");

let currentUser = null;
let currentUserData = null;

let firstSnapshot = true;

const messageElements = new Map();

let editingMessageId = null;
let editingOriginalText = "";

/* ==========================================
   AUTH
========================================== */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  currentUser = user;

  try {
    await loadCurrentUser(user);
    await verifyChatExists();
    startMessageListener();

    hideLoader();
  } catch (error) {
    console.error("❌ Chat initialization failed:", error);

    showNotification(error.message || "Unable to load the conversation.");

    hideLoader();
  }
});

/* ==========================================
   LOAD CURRENT USER
========================================== */

async function loadCurrentUser(user) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    currentUserData = snapshot.data();

    usernameDisplay.textContent = `👤 ${
      currentUserData.username || currentUserData.displayName || user.email
    }`;
  } else {
    currentUserData = {
      username: user.email,
      displayName: user.email,
    };

    usernameDisplay.textContent = `👤 ${user.email}`;
  }
}

/* ==========================================
   VERIFY GROUP CHAT
========================================== */

async function verifyChatExists() {
  const chatRef = doc(db, "chats", CHAT_ID);
  const snapshot = await getDoc(chatRef);

  if (!snapshot.exists()) {
    throw new Error("3Chat conversation was not found.");
  }

  const chatData = snapshot.data();

  if (
    !Array.isArray(chatData.participants) ||
    !chatData.participants.includes(currentUser.uid)
  ) {
    throw new Error("You are not a participant in this conversation.");
  }
}

/* ==========================================
   MESSAGE LISTENER
========================================== */

function startMessageListener() {
  const messagesRef = collection(db, "chats", CHAT_ID, "messages");

  const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

  onSnapshot(
    messagesQuery,
    (snapshot) => {
      if (snapshot.empty) {
        renderEmptyChat();
      }

      snapshot.docChanges().forEach((change) => {
        const messageId = change.doc.id;
        const messageData = change.doc.data();

        if (change.type === "added") {
          renderMessage(messageId, messageData);

          if (!firstSnapshot && messageData.senderId !== currentUser.uid) {
            playNotificationSound();
          }
        }

        if (change.type === "modified") {
          renderMessage(messageId, messageData);
        }

        if (change.type === "removed") {
          removeMessage(messageId);
        }
      });

      firstSnapshot = false;

      scrollToBottom();
    },
    (error) => {
      console.error("❌ Message listener error:", error);

      showNotification("Unable to sync messages in real time.");
    },
  );
}

/* ==========================================
   RENDER MESSAGE
========================================== */

function renderMessage(messageId, message) {
  const existingRow = messageElements.get(messageId);

  if (existingRow) {
    existingRow.remove();
    messageElements.delete(messageId);
  }

  const isOwnMessage = message.senderId === currentUser.uid;

  const row = document.createElement("div");

  row.className = `message-row ${isOwnMessage ? "you" : "friend"}`;

  const bubble = document.createElement("div");

  bubble.className = "message-bubble";

  /* ----------------------------------------
     SENDER
  ---------------------------------------- */

  const sender = document.createElement("div");

  sender.className = "message-sender";

  sender.textContent = message.senderName || message.senderId || "Unknown";

  /* ----------------------------------------
     MESSAGE TEXT
  ---------------------------------------- */

  const text = document.createElement("p");

  text.className = "message-text";

  text.textContent = message.text || "";

  /* ----------------------------------------
     META
  ---------------------------------------- */

  const meta = document.createElement("div");

  meta.className = "message-meta";

  const time = document.createElement("span");

  time.textContent = formatTimestamp(message.timestamp);

  meta.appendChild(time);

  if (message.edited) {
    const edited = document.createElement("span");

    edited.className = "edited-label";

    edited.textContent = "edited";

    meta.appendChild(edited);
  }

  /* ----------------------------------------
     OWN MESSAGE ACTIONS
  ---------------------------------------- */

  if (isOwnMessage) {
    const actions = document.createElement("div");

    actions.className = "message-actions";

    /* EDIT */

    const editButton = document.createElement("button");

    editButton.type = "button";

    editButton.className = "message-action edit";

    editButton.textContent = "✎";

    editButton.title = "Edit message";

    editButton.setAttribute("aria-label", "Edit message");

    editButton.addEventListener("click", () => {
      startEditingMessage(messageId, message.text || "");
    });

    /* DELETE */

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className = "message-action delete";

    deleteButton.textContent = "×";

    deleteButton.title = "Delete message";

    deleteButton.setAttribute("aria-label", "Delete message");

    deleteButton.addEventListener("click", () => {
      deleteMessage(messageId);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    bubble.appendChild(actions);
  }

  bubble.appendChild(sender);
  bubble.appendChild(text);
  bubble.appendChild(meta);

  row.appendChild(bubble);

  chatContainer.appendChild(row);

  messageElements.set(messageId, row);
}

/* ==========================================
   EMPTY CHAT
========================================== */

function renderEmptyChat() {
  if (messageElements.size > 0) {
    return;
  }

  if (document.querySelector(".empty-chat")) {
    return;
  }

  const empty = document.createElement("div");

  empty.className = "empty-chat";

  const icon = document.createElement("div");

  icon.className = "empty-chat-icon";
  icon.textContent = "💬";

  const heading = document.createElement("h2");

  heading.textContent = "No messages yet";

  const paragraph = document.createElement("p");

  paragraph.textContent = "Start the chaos. Send the first message.";

  empty.appendChild(icon);
  empty.appendChild(heading);
  empty.appendChild(paragraph);

  chatContainer.appendChild(empty);
}

/* ==========================================
   SEND / UPDATE MESSAGE
========================================== */

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  if (text.length > 1000) {
    showNotification("Message cannot exceed 1000 characters.");
    return;
  }

  if (editingMessageId) {
    await updateMessage(editingMessageId, text);
    return;
  }

  await sendMessage(text);
});

/* ==========================================
   SEND NEW MESSAGE
========================================== */

async function sendMessage(text) {
  setComposerLoading(true);

  try {
    const messagesRef = collection(db, "chats", CHAT_ID, "messages");

    await addDoc(messagesRef, {
      senderId: currentUser.uid,

      senderName:
        currentUserData.username ||
        currentUserData.displayName ||
        currentUser.email,

      text,

      type: "text",

      edited: false,

      timestamp: serverTimestamp(),
    });

    const chatRef = doc(db, "chats", CHAT_ID);

    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    });

    messageInput.value = "";

    updateCharacterCount();

    scrollToBottom();
  } catch (error) {
    console.error("❌ Send message failed:", error);

    showNotification("Message could not be sent.");
  } finally {
    setComposerLoading(false);
    messageInput.focus();
  }
}

/* ==========================================
   START EDITING
========================================== */

function startEditingMessage(messageId, text) {
  editingMessageId = messageId;
  editingOriginalText = text;

  messageInput.value = text;

  messageInput.placeholder = "Edit your message...";

  sendText.textContent = "Update";
  sendIcon.textContent = "✓";

  chatForm.classList.add("editing");

  updateCharacterCount();

  messageInput.focus();

  /* Put cursor at the end */
  messageInput.setSelectionRange(
    messageInput.value.length,
    messageInput.value.length,
  );
}

/* ==========================================
   UPDATE EXISTING MESSAGE
========================================== */

async function updateMessage(messageId, newText) {
  /* Nothing changed */
  if (newText === editingOriginalText) {
    cancelEditing();
    return;
  }

  setComposerLoading(true);

  try {
    const messageRef = doc(db, "chats", CHAT_ID, "messages", messageId);

    await updateDoc(messageRef, {
      text: newText,
      edited: true,
    });

    showNotification("Message updated.");

    cancelEditing();
  } catch (error) {
    console.error("❌ Edit message failed:", error);

    showNotification("Message could not be updated.");
  } finally {
    setComposerLoading(false);

    messageInput.focus();
  }
}

/* ==========================================
   CANCEL EDITING
========================================== */

function cancelEditing() {
  editingMessageId = null;
  editingOriginalText = "";

  messageInput.value = "";

  messageInput.placeholder = "Type something chaotic...";

  sendText.textContent = "Send";
  sendIcon.textContent = "↑";

  chatForm.classList.remove("editing");

  updateCharacterCount();
}

/* ==========================================
   ESCAPE = CANCEL EDIT
========================================== */

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && editingMessageId) {
    cancelEditing();

    showNotification("Edit cancelled.");

    return;
  }

  /* Enter sends message */

  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();

    chatForm.requestSubmit();
  }
});

/* ==========================================
   DELETE MESSAGE
========================================== */

async function deleteMessage(messageId) {
  const confirmed = window.confirm("Delete this message?");

  if (!confirmed) {
    return;
  }

  try {
    const messageRef = doc(db, "chats", CHAT_ID, "messages", messageId);

    await deleteDoc(messageRef);

    if (editingMessageId === messageId) {
      cancelEditing();
    }

    showNotification("Message deleted.");
  } catch (error) {
    console.error("❌ Delete message failed:", error);

    showNotification("Message could not be deleted.");
  }
}

/* ==========================================
   CHARACTER COUNT
========================================== */

messageInput.addEventListener("input", updateCharacterCount);

function updateCharacterCount() {
  characterCount.textContent = `${messageInput.value.length}/1000`;
}

/* ==========================================
   COMPOSER LOADING
========================================== */

function setComposerLoading(isLoading) {
  sendBtn.disabled = isLoading;
  messageInput.disabled = isLoading;
}

/* ==========================================
   REMOVE MESSAGE
========================================== */

function removeMessage(messageId) {
  const element = messageElements.get(messageId);

  if (!element) {
    return;
  }

  element.remove();

  messageElements.delete(messageId);

  if (messageElements.size === 0) {
    renderEmptyChat();
  }
}

/* ==========================================
   TIMESTAMP
========================================== */

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "";
  }

  const date =
    typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ==========================================
   NOTIFICATION SOUND
========================================== */

function playNotificationSound() {
  const audio = new Audio("sounds/ping.mp3");

  audio.volume = 0.35;

  audio.play().catch(() => {
    /* Browser may block autoplay */
  });
}

/* ==========================================
   NOTIFICATION
========================================== */

function showNotification(message) {
  const notification = document.createElement("div");

  notification.className = "notification";

  notification.textContent = message;

  notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3200);
}

/* ==========================================
   SCROLL
========================================== */

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  });
}

/* ==========================================
   BACK BUTTON
========================================== */

backBtn.addEventListener("click", () => {
  window.location.replace("index.html");
});

/* ==========================================
   THEME
========================================== */

const savedMode = localStorage.getItem("mode");

if (savedMode === "light") {
  document.body.classList.add("light");
  modeToggle.textContent = "🌙";
} else {
  modeToggle.textContent = "☀️";
}

modeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light");

  localStorage.setItem("mode", isLight ? "light" : "dark");

  modeToggle.textContent = isLight ? "🌙" : "☀️";
});

/* ==========================================
   LOADER
========================================== */

function hideLoader() {
  loader.classList.add("hidden");
}
