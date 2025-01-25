const API_URL = "http://localhost:4567";
const ACCOUNTS_URL = `${API_URL}/accounts`;

const isMobileDevice = () => {
  return /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
};

function removeParam(parameter) {
  var url = document.location.href;
  var urlparts = url.split("?");

  if (urlparts.length >= 2) {
    var urlBase = urlparts.shift();
    var queryString = urlparts.join("?");

    var prefix = encodeURIComponent(parameter) + "=";
    var pars = queryString.split(/[&;]/g);
    for (var i = pars.length; i-- > 0; )
      if (pars[i].lastIndexOf(prefix, 0) !== -1) pars.splice(i, 1);
    url = pars.length ? urlBase + "?" + pars.join("&") : urlBase;
    window.history.pushState("", document.title, url); // added this line to push the new url directly to url bar .
  }
  return url;
}

const fetchAccounts = async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const loginParam = params.get("login"); // Gets the value of the "name" parameter
    if (loginParam) {
      console.log(loginParam);
      removeParam("login");
      toastr.success("Login Successful", "", { timeOut: 1000 });
    }
    checkForToken();
    const token = localStorage.getItem("token");
    const response = await fetch(ACCOUNTS_URL, {
      headers: {
        token,
      },
    });
    if (response.status === 401) {
      doLogout();
    }
    const accounts = await response.json();
    renderAccounts(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
  }
};

const toggleMoreActions = (id) => {
  const moreActions = document.getElementById(`more-actions-${id}`);
  moreActions.style.display =
    moreActions.style.display === "block" ? "none" : "block";
};

const renderAccounts = (accounts) => {
  const accountsDiv = document.getElementById("accounts");
  accountsDiv.innerHTML = "";
  accounts.forEach((account, index) => {
    const accountDiv = document.createElement("div");
    accountDiv.className = "account";
    accountDiv.id = `account-${account.id}`;
    accountDiv.setAttribute("draggable", true);
    accountDiv.setAttribute("data-index", index); // Track original order

    addDragAndTouchListeners(accountDiv, account.id);

    accountDiv.innerHTML = `
            <span 
                class="draggable-name" 
                style="color: ${account.color}; line-break: anywhere"
            >
                ${account.name}
            </span>
            <div class="totp-display" id="totp-${account.id}" style="display: none;"></div>
        <div class="actions">
          <div class="timer-container">
            <svg class="circle-timer" width="40" height="40">
              <circle cx="20" cy="20" r="18" stroke="#3498db" stroke-width="4" fill="none" />
            </svg>
            <span class= "countdown" id="countdown-${account.id}">29</span>
          </div>
          <button class="icon copy" onclick="copyToClipboard('${account.id}')">Copy</button>
          <button class="icon non-mobile show-totp" onclick="toggleTotp('${account.id}')"><i class="show-otp-i fas fa-eye"></i></button>
          <button class="icon non-mobile delete" onclick="openDeleteModal('${account.id}')"><i class="fas fa-trash"></i></button>
          <button class="icon non-mobile edit" onclick="openEditModal('${account.id}')"><i class="fas fa-pencil"></i></button>
        </div>
        <div class="ellipsis" onclick="toggleMoreActions('${account.id}')">...</div>
        <div class="more-actions" id="more-actions-${account.id}">
          <button onclick="toggleMoreActions('${account.id}'); toggleTotp('${account.id}')">Show/Hide</button>
          <button onclick="toggleMoreActions('${account.id}'); openEditModal('${account.id}')">Edit</button>
          <button onclick="toggleMoreActions('${account.id}'); openDeleteModal('${account.id}')">Delete</button>
        </div>
        <div class="timer" id="timer-${account.id}"></div>
      `;

    accountsDiv.appendChild(accountDiv);
    initTimer(account.id);
  });
};

const addAccount = async () => {
  const name = document.getElementById("addName").value;
  const color = document.getElementById("addColor").value;
  const secret = document.getElementById("addSecret").value;
  if (!name || !secret) {
    document.getElementById("addErrorMessage").style.display = "block";
    document.getElementById("addErrorMessage").textContent =
      "Please fill required fields";
    return;
  }
  const token = localStorage.getItem("token");
  const response = await fetch(ACCOUNTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", token },
    body: JSON.stringify({ name, color, secret }),
  });
  if (response.ok) {
    await fetchAccounts();
    document.getElementById("addName").value = "";
    document.getElementById("addSecret").value = "";
    document.getElementById("addSecret").disabled = false;
    document.getElementById("addModal").style.display = "none";
    document.getElementById("addErrorMessage").textContent = "";
  } else if (response.status === 401) {
    doLogout();
  } else {
    document.getElementById("addErrorMessage").style.display = "block";
    document.getElementById("addErrorMessage").textContent =
      "Error adding account";
  }
};

const deleteAccount = async () => {
  const id = document.getElementById("deleteAccountId").value;
  const token = localStorage.getItem("token");
  const response = await fetch(`${ACCOUNTS_URL}/${id}`, {
    method: "DELETE",
    headers: {
      token,
    },
  });
  if (response.ok) {
    fetchAccounts();
    document.getElementById("deleteModal").style.display = "none";
  }
  if (response.status === 401) {
    doLogout();
  }
};

const openEditModal = (id) => {
  document.getElementById("editModal").style.display = "block";
  const token = localStorage.getItem("token");
  fetch(`${ACCOUNTS_URL}/${id}`, {
    headers: {
      token,
    },
  })
    .then((response) => response.json())
    .then((account) => {
      document.getElementById("editName").value = account.name;
      document.getElementById("editColor").value = account.color;
      document.getElementById("editColorButton").style.backgroundColor =
        account.color;
      document.getElementById("saveChanges").onclick = () => saveChanges(id);
    });
};
const openAddModal = () => {
  document.getElementById("addModal").style.display = "block";
};
const openDeleteModal = (id) => {
  document.getElementById("deleteAccountId").value = id;
  document.getElementById("deleteModal").style.display = "block";
};

const saveChanges = async (id) => {
  const name = document.getElementById("editName").value;
  const color = document.getElementById("editColor").value;
  const token = localStorage.getItem("token");
  const response = await fetch(`${ACCOUNTS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", token },
    body: JSON.stringify({ name, color }),
  });
  if (response.ok) {
    fetchAccounts();
    document.getElementById("editModal").style.display = "none";
  }
  if (response.status === 401) {
    doLogout();
  }
};

const fetchOtp = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${ACCOUNTS_URL}/${id}/totp`, {
    headers: {
      token,
    },
  });
  if (response.status === 401) {
    doLogout();
  }
  return await response.json();
};

const toggleTotp = async (id) => {
  const totpDiv = document.getElementById(`totp-${id}`);
  const viewButton = document.querySelector(`#account-${id} .show-otp-i`);
  if (totpDiv.style.display === "none") {
    const account = await fetchOtp(id);
    totpDiv.textContent = account.token;
    totpDiv.style.display = "block";
    viewButton.classList.remove("fa-eye");
    viewButton.classList.add("fa-eye-slash");
    setTimeout(() => {
      totpDiv.style.display = "none";
      viewButton.classList.add("fa-eye");
      viewButton.classList.remove("fa-eye-slash");
    }, 2000);
  } else {
    totpDiv.style.display = "none";
    viewButton.classList.add("fa-eye");
    viewButton.classList.remove("fa-eye-slash");
  }
};

const copyToClipboard = async (id) => {
  const account = await fetchOtp(id);
  navigator.clipboard.writeText(account.token).then(() => {
    const copyButton = document.querySelector(`#account-${id} .copy`);
    copyButton.classList.add("copied");
    copyButton.textContent = "Copied";
    setTimeout(() => {
      copyButton.classList.remove("copied");
      copyButton.textContent = "Copy";
    }, 2000);
  });
};

if (window.location.href.includes("index")) {
  console.log("index html set");
  document.getElementById("addAccount").addEventListener("click", openAddModal);
  document
    .getElementById("closeDeleteModalNo")
    .addEventListener(
      "click",
      () => (document.getElementById("deleteModal").style.display = "none"),
    );

  // Modal functionality
  document.getElementById("closeModal").onclick = () =>
    (document.getElementById("editModal").style.display = "none");
  document.getElementById("closeDeleteModal").onclick = () =>
    (document.getElementById("deleteModal").style.display = "none");
  document.getElementById("addCloseModal").onclick = () =>
    (document.getElementById("addModal").style.display = "none");
  document.getElementById("closeUploadModal").onclick = () =>
    (document.getElementById("uploadModal").style.display = "none");
  document.getElementById("openUploadModal").onclick = () =>
    (document.getElementById("uploadModal").style.display = "block");

  document.getElementById("addColorButton").onclick = () => {
    document.getElementById("addColor").click();
  };
  document.getElementById("addColor").oninput = (event) => {
    document.getElementById("addColorButton").style.backgroundColor =
      event.target.value;
  };
  document.getElementById("editColorButton").onclick = () => {
    document.getElementById("editColor").click();
  };
  document.getElementById("editColor").oninput = (event) => {
    document.getElementById("editColorButton").style.backgroundColor =
      event.target.value;
  };
}
const initTimer = (accountId) => {
  const countdownElement = document.getElementById(`countdown-${accountId}`);
  const circle = document.querySelector(
    `#account-${accountId} .circle-timer circle`,
  ); // Ensure correct selector

  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference;

  const totalTime = 29; // Total time for the countdown in seconds

  function getRemainingTime() {
    const now = new Date();
    const currentSecond = now.getSeconds(); // Get current second of the minute
    const milliseconds = now.getMilliseconds(); // Get current milliseconds
    const remainingTime = totalTime - (currentSecond % 30); // 1st or 31st second gives 29, 30th or 0 gives 0
    const fractionalSecond = (1000 - milliseconds) / 1000; // Fractional part of the current second
    return remainingTime + fractionalSecond; // Add fractional second to make it smooth
  }

  function updateSeconds() {
    const remainingTime = Math.floor(getRemainingTime()); // Round down to nearest second
    countdownElement.textContent = remainingTime; // Update the countdown display

    setTimeout(updateSeconds, 1000); // Update every second
  }

  function updateCircle() {
    const remainingTime = getRemainingTime(); // Get the remaining time including fractional part
    const progress = remainingTime / totalTime; // Progress as a fraction (0 to 1)

    const offset = circumference * (1 - progress); // Reverse offset calculation to decrease
    circle.style.strokeDashoffset = offset;

    setTimeout(updateCircle, 100); // Update every 100ms for smooth progress
  }

  updateSeconds();
  updateCircle();
};

let draggedElement = null;

const addDragAndTouchListeners = (accountDiv, accountId) => {
  if (!isMobileDevice()) {
    accountDiv.ondragstart = (event) => onDragStart(event, accountId);
    accountDiv.ondragover = (event) => event.preventDefault();
    accountDiv.ondrop = (event) => onDrop(event, accountId);
  } else {
    // Disable drag-and-drop on mobile
    accountDiv.ontouchstart = null;
    accountDiv.ontouchmove = null;
    accountDiv.ontouchend = null;
  }
};

const onDragStart = (event, accountId) => {
  draggedElement = document.getElementById(`account-${accountId}`);
  event.dataTransfer.effectAllowed = "move";
};

const onDrop = (event, targetAccountId) => {
  event.preventDefault();

  const targetElement = document.getElementById(`account-${targetAccountId}`);
  const parent = document.getElementById("accounts");

  parent.insertBefore(draggedElement, targetElement.nextSibling);
  updateAccountOrder();
};

const updateAccountOrder = async () => {
  try {
    const accountsDiv = document.getElementById("accounts");
    const accountIds = Array.from(accountsDiv.children).map((child) =>
      child.id.replace("account-", ""),
    );
    console.log({ order: accountIds });

    await fetch(`${ACCOUNTS_URL}/reorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token"),
      },
      body: JSON.stringify({ order: accountIds }),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    alert("Error updating order");
  }
};

// console.log({ order: accountIds })

const doLogin = async (email, password) => {
  return await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
};
const doRegister = async (email, password) => {
  return await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("Service Worker registration failed: ", registrationError);
      });
  });
}
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
    // Prevent the default prompt
    event.preventDefault();
    deferredPrompt = event;

    // Show a custom install button in your UI
    const installButton = document.getElementById("installPWA");
    installButton.style.display = "block";

    installButton.addEventListener("click", () => {
        // Show the native install prompt
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
                console.log("User accepted the PWA install prompt");
            } else {
                console.log("User dismissed the PWA install prompt");
            }
            deferredPrompt = null;
        });
    });
});