document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  checkLoginStatus();
  
  // Get booking data from localStorage (passed from booking page)
  const bookingData = JSON.parse(localStorage.getItem('latestBooking'));
  
  if (bookingData) {
    displayBookingDetails(bookingData);
  } else {
    // No booking data found, show message
    document.getElementById('booking-details').innerHTML = `
      <div class="text-center p-4">
        <p class="text-lg text-gray-600">No booking information found.</p>
        <p class="mt-2">Please go back to the homepage to make a booking.</p>
      </div>
    `;
  }
  
  // Add event listeners
  document.getElementById('return-home').addEventListener('click', function() {
    window.location.href = 'main.html';
  });
  
  document.getElementById('view-all-bookings').addEventListener('click', function() {
    window.location.href = 'my-bookings.html';
  });
});

function displayBookingDetails(booking) {
  const detailsContainer = document.getElementById('booking-details');
  
  const formattedDeparture = new Date(booking.departureDate).toLocaleDateString();
  const formattedArrival = new Date(booking.arrivalDate).toLocaleDateString();
  
  detailsContainer.innerHTML = `
    <div class="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
      <p class="text-green-700 font-bold">Booking Successful!</p>
      <p class="text-green-700">Your flight has been booked successfully.</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-gray-50 p-4 rounded">
        <h3 class="font-bold mb-2">Flight Details</h3>
        <p><strong>Flight:</strong> ${booking.flightDetails.airline} ${booking.flightDetails.id}</p>
        <p><strong>From:</strong> ${booking.from}</p>
        <p><strong>To:</strong> ${booking.to}</p>
        <p><strong>Departure:</strong> ${formattedDeparture} at ${booking.flightDetails.departureTime}</p>
        <p><strong>Arrival:</strong> ${formattedArrival} at ${booking.flightDetails.arrivalTime}</p>
        <p><strong>Duration:</strong> ${booking.flightDetails.duration}</p>
      </div>
      
      <div class="bg-gray-50 p-4 rounded">
        <h3 class="font-bold mb-2">Booking Information</h3>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Number of Tickets:</strong> ${booking.numTickets}</p>
        <p><strong>Ticket Type:</strong> ${booking.ticketType}</p>
        <p><strong>Price per Ticket:</strong> ₹${booking.flightDetails.price}</p>
        <p><strong>Total Amount:</strong> ₹${booking.numTickets * booking.flightDetails.price}</p>
        <p><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toLocaleString()}</p>
      </div>
    </div>
  `;
}

// Function to check if user is logged in (same as main.html)
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const authSection = document.getElementById('auth-section');
  
  if (isLoggedIn) {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (userData) {
      // Replace login/signup buttons with user info and logout button
      authSection.innerHTML = `
        <select id="countrySelect">
          <option value="">Country</option>
        </select>
        <span class="user-name" style="color: white; margin-right: 10px;">Welcome, ${userData.name}</span>
        <button class="btn-1" id="logoutBtn" onclick="logoutUser()">Logout</button>
      `;
    }
  } else {
    // Show default login/signup buttons
    authSection.innerHTML = `
      <select id="countrySelect">
        <option value="">Country</option>
      </select>
      <a href="login.html" id="loginLink"><button class="btn-1" id="loginBtn">Login</button></a>
      <a href="sign_up.html" id="signupLink"><button class="btn-2" id="signupBtn">Sign Up</button></a>
    `;
  }
}

// Function to handle user logout (same as main.html)
function logoutUser() {
  // Clear user data from localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('userLoggedIn');
  
  // Redirect to main page
  window.location.href = "main.html";
}