// Function to open the forms (login or register)
function openForm(formId) {
  document.getElementById(`${formId}-form`).style.display = "block";
}
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
// Function to close the forms (login or register)
function closeForm(formId) {
  document.getElementById(`${formId}-form`).style.display = "none";
}

// Show login form based on URL parameters
const urlParams = new URLSearchParams(window.location.search);
const showLoginPopup = urlParams.get("show_login_popup");
if (showLoginPopup === "true") {
  openForm("login");
}
// Submit the message and show the pop-up


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
  }, 500); // Match the animation duration (0.5s)
}

