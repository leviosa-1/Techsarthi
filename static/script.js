// Function to open the forms (login or register)
function openForm(formId) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const backdrop = document.getElementById("form-backdrop");

  if (formId === "login") {
    loginForm.style.display = "block";
    registerForm.style.display = "none"; // Hide the other form
  } else if (formId === "register") {
    registerForm.style.display = "block";
    loginForm.style.display = "none"; // Hide the other form
  }

  backdrop.style.display = "block"; // Show the backdrop
}

// Function to close the forms (login or register)
function closeForm(formId) {
  const backdrop = document.getElementById("form-backdrop");

  if (formId === "login") {
    document.getElementById("login-form").style.display = "none";
  } else if (formId === "register") {
    document.getElementById("register-form").style.display = "none";
  }

  // Hide the backdrop when closing the form
  backdrop.style.display = "none";
}


// Send message to the backend
async function sendMessage() {
  const message = document.getElementById('message-input').value;

  if (message.trim() === "") {
      alert("Please enter a message before submitting!");
      return;
  }

  try {
      // Send the message to the server
      const response = await fetch('/send', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message })
      });

      // Parse the server's response
      const result = await response.json();

      if (response.ok) {
          // Show the message pop-up
          const popup = document.getElementById("message-popup");
          popup.style.display = "flex";

          // Clear the input field
          document.getElementById('message-input').value = "";
      } else {
          // Show the error message from the server
          alert("Failed to send message: " + (result.error || "Unknown error"));
      }
  } catch (error) {
      // Handle fetch or network errors
      alert("Failed to send message due to a network error: " + error.message);
  }
}

// Check if the login popup should be shown
const showLoginPopup = JSON.parse(document.getElementById('show-login-popup').textContent);
if (showLoginPopup) {
  openForm("login");
} else {
  closeForm("login");
}

// Typing effect for the user's name on the homepage
document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("userName") || "User"; // Default to 'User' if no name is saved
  const userNameElement = document.getElementById("user-name");
  let i = 0;

  function typeWriter() {
    if (i < userName.length) {
      userNameElement.textContent += userName.charAt(i);
      i++;
      setTimeout(typeWriter, 250); // Adjust typing speed here
    }
  }

  typeWriter(); // Start the typing animation
});

// Function to update the location on the message page (if applicable)
function updateLocation(latitude, longitude) {
  // Example using OpenStreetMap or Google Maps to update location on a map
  const map = L.map('map').setView([latitude, longitude], 13); // Assuming you're using Leaflet for maps

  // Adding OpenStreetMap tile layer to the map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Add a marker at the given latitude and longitude
  L.marker([latitude, longitude]).addTo(map)
    .bindPopup('Your current location')
    .openPopup();
}

// Function to show the popup
function showPopup() {
  const popup = document.getElementById('message-popup');
  popup.style.display = 'block';
}

// Function to close the popup
function closePopup() {
  const popup = document.getElementById('message-popup');
  popup.style.display = 'none';
}
// Example of using a function to populate a message box or map with live data
document.getElementById('location-button').addEventListener('click', function() {
  // Fetch new coordinates or other data when the user clicks
  const newLatitude = 17.781006;  // Replace with actual dynamic data
  const newLongitude = 83.372903;  // Replace with actual dynamic data
  updateLocation(newLatitude, newLongitude);
});

// Handling dynamic content such as user data (if user logs in)
document.addEventListener("DOMContentLoaded", () => {
  // Assuming user is logged in and user data is available
  const userName = sessionStorage.getItem("userName") || "Guest";  // Retrieve username stored in session
  const userEmail = sessionStorage.getItem("userEmail") || "Not logged in";  // Retrieve email or other user info

  if (userName !== "Guest") {
    document.getElementById('welcome-message').textContent = `Welcome back, ${userName}!`;
    document.getElementById('user-info').textContent = `Email: ${userEmail}`;
  }
});

// Handling logout functionality
function logout() {
  sessionStorage.clear();  // Clear user session data
  window.location.href = "/";  // Redirect to home page after logout
}

// Adding logout event listener (if a logout button exists in your UI)
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}

function toggleMenu() {
  const menu = document.querySelector('.menu');
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

function openInfo() {
  const infoModal = document.getElementById('info-modal');
  infoModal.classList.remove('closing'); // Remove closing animation class
  infoModal.classList.add('active'); // Add active class for slide-in animation
  infoModal.style.display = 'flex'; // Ensure modal is visible
}

function closeInfo() {
  const infoModal = document.getElementById('info-modal');
  infoModal.classList.remove('active'); // Remove active animation class
  infoModal.classList.add('closing'); // Add closing animation class
  setTimeout(() => {
      infoModal.style.display = 'none'; // Hide the modal after animation
  }, 500); // Match the animation duration (0.5s)
}

