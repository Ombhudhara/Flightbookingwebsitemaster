document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  checkLoginStatus();
  
  // Get user data
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  if (!isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }
  
  const userData = JSON.parse(localStorage.getItem('user'));
  if (!userData || !userData.id) {
    window.location.href = 'login.html';
    return;
  }
  
  // Fetch user's bookings
  fetchUserBookings(userData.id);
});

function fetchUserBookings(userId) {
  fetch(`http://localhost:3000/api/bookings/user/${userId}`)
    .then(response => response.json())
    .then(bookings => {
      document.getElementById('loading').classList.add('hidden');
      
      if (bookings.length === 0) {
        document.getElementById('no-bookings').classList.remove('hidden');
      } else {
        displayBookings(bookings);
        document.getElementById('bookings-list').classList.remove('hidden');
      }
    })
    .catch(error => {
      console.error('Error fetching bookings:', error);
      document.getElementById('loading').innerHTML = `
        <p class="text-red-500">Error loading bookings. Please try again later.</p>
      `;
    });
}

function displayBookings(bookings) {
  const bookingsList = document.getElementById('bookings-list');
  bookingsList.innerHTML = '';
  
  bookings.forEach(booking => {
    const departureDate = new Date(booking.departureDate).toLocaleDateString();
    const arrivalDate = new Date(booking.arrivalDate).toLocaleDateString();
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString();
    
    const bookingCard = document.createElement('div');
    bookingCard.className = 'bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition';
    bookingCard.innerHTML = `
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h3 class="font-bold text-lg">${booking.from} to ${booking.to}</h3>
          <p class="text-gray-600">
            <span class="font-medium">${booking.flightDetails?.airline || 'Airline'}</span> - 
            <span>${booking.flightDetails?.id || 'Flight ID'}</span>
          </p>
        </div>
        <div class="mt-2 md:mt-0">
          <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            ${booking.ticketType}
          </span>
          <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">
            ${booking.numTickets} Ticket${booking.numTickets > 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Departure:</strong> ${departureDate}</p>
          <p><strong>Arrival:</strong> ${arrivalDate}</p>
          <p><strong>Booked On:</strong> ${bookingDate}</p>
        </div>
        <div>
          <p><strong>Price:</strong> ₹${booking.flightDetails?.price || 'N/A'}/ticket</p>
          <p><strong>Total:</strong> ₹${(booking.flightDetails?.price || 0) * booking.numTickets}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
        </div>
      </div>
      
      <div class="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <button class="text-blue-500 hover:text-blue-700 mr-4" 
                onclick="viewBookingDetails('${booking._id}')">
          View Details
        </button>
      </div>
    `;
    
    bookingsList.appendChild(bookingCard);
  });
}

function viewBookingDetails(bookingId) {
  // In a real application, you might fetch detailed booking information
  // or redirect to a detailed view page
  alert(`Viewing details for booking ${bookingId}`);
  // Example: window.location.href = `booking-details.html?id=${bookingId}`;
}

// Function to check if user is logged in (same as other pages)
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

// Function to handle user logout (same as other pages)
function logoutUser() {
  localStorage.removeItem('user');
  localStorage.removeItem('userLoggedIn');
  window.location.href = "main.html";
}