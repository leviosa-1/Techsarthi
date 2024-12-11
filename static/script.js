// Open and Close Forms
function openForm(formId) {
  document.getElementById(`${formId}-form`).style.display = "block";
}

function closeForm(formId) {
  document.getElementById(`${formId}-form`).style.display = "none";
}

// Close forms when clicking outside the form
window.onclick = function (event) {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  if (event.target === registerForm) registerForm.style.display = "none";
  if (event.target === loginForm) loginForm.style.display = "none";
};

// Check for the "show_login_popup" query parameter
const urlParams = new URLSearchParams(window.location.search);
const showLoginPopup = urlParams.get("show_login_popup");
if (showLoginPopup === "true") {
  openForm("login"); // Automatically open the login form
}


// Save the user name when registering
function saveName() {
  const name = document.getElementById("name").value;
  if (name) {
    localStorage.setItem("userName", name);
  }
}

// Typing animation for the user name
document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("userName") || "User";
  const userNameElement = document.getElementById("user-name");

  let i = 0;
  function typeWriter() {
    if (i < userName.length) {
      userNameElement.textContent += userName.charAt(i);
      i++;
      setTimeout(typeWriter, 250); // Adjust typing speed here
    }
  }
  typeWriter();
});

// Submit the message and show the pop-up
function submitMessage() {
  const message = document.getElementById("message-box").value;
  if (message.trim() === "") {
    alert("Please enter a message before submitting!");
    return;
  }

  // Show the message pop-up
  const popup = document.getElementById("message-popup");
  popup.style.display = "flex";

  // Clear the textarea
  document.getElementById("message-box").value = "";
}

// Close the message pop-up
function closePopup() {
  const popup = document.getElementById("message-popup");
  popup.style.display = "none";
}

// Auto-hide flash messages after a few seconds
document.addEventListener("DOMContentLoaded", () => {
  const flashMessages = document.querySelectorAll(".flash-message");
  flashMessages.forEach((message) => {
    message.style.display = "block";
    setTimeout(() => {
      message.style.display = "none";
    }, 4000); // Adjust time as needed
  });
});

// Fetch and display live coordinates
async function refreshCoordinates() {
  const response = await fetch("/receive", { method: "POST" });
  const data = await response.json();
  document.getElementById("coordinates").innerText = `Latitude: ${data.latitude}, Longitude: ${data.longitude}`;
}

// Auto-refresh coordinates every 5 seconds
setInterval(refreshCoordinates, 5000);

// Send message to the backend
async function sendMessage() {
  const message = document.getElementById("message-input").value;
  if (!message) {
    alert("Please enter a message!");
    return;
  }

  try {
    const response = await fetch("/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const result = await response.json();
    alert(result.message);
  } catch (error) {
    console.error("Error sending message:", error);
    alert("An error occurred while sending the message.");
  }
}
