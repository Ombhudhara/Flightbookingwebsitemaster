
// User authentication state management
let currentUser = null;

// Check if user is logged in on page load
function checkLoginStatus() {
  const savedUser = localStorage.getItem('currentUser');
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const authSection = document.getElementById('auth-section');

  if (!authSection) {
    console.error('Auth section not found in DOM');
    return;
  }

  if (isLoggedIn && savedUser) {
    currentUser = JSON.parse(savedUser);
    authSection.innerHTML = `
      <select id="countrySelect">
        <option value="">Country</option>
      </select>
      <span class="user-name" style="color: black; margin-right: 10px;">${currentUser.name}</span>
      <button class="btn-1" onclick="logoutUser()">Logout</button>
    `;
    populateCountries();
  } else {
    currentUser = null;
    authSection.innerHTML = `
      <select id="countrySelect">
        <option value="">Country</option>
      </select>
      <a href="login.html" id="loginLink"><button class="btn-1" id="loginBtn">Login</button></a>
      <a href="sign_up.html" id="signupLink"><button class="btn-2" id="signupBtn">Sign Up</button></a>
    `;
    populateCountries();
  }
}

// Handle user logout
function logoutUser() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userLoggedIn');
  window.location.href = 'main.html';
}

// Country Data
async function populateCountries() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const countries = await response.json();
    const select = document.getElementById('countrySelect');
    if (!select) return;
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.cca2.toLowerCase();
      option.textContent = `${country.flag} ${country.name.common}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
  }
}

// Swap Fields
function swapFields() {
  const input1 = document.getElementById("input1");
  const input2 = document.getElementById("input2");
  if (!input1 || !input2) {
    console.error("One or both input elements not found!");
    return;
  }
  const temp = input1.value;
  input1.value = input2.value;
  input2.value = temp;
}

// Airport Data
let airportsData = [];
async function loadAirports() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat');
    const text = await response.text();
    airportsData = text.split('\n').map(line => {
      const fields = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
      return {
        name: fields[1] ? fields[1].replace(/"/g, '') : '',
        city: fields[2] ? fields[2].replace(/"/g, '') : '',
        country: fields[3] ? fields[3].replace(/"/g, '') : '',
        iata: fields[4] ? fields[4].replace(/"/g, '') : ''
      };
    }).filter(airport => airport.name && airport.iata !== '\\N');
  } catch (error) {
    console.error('Error fetching airport data:', error);
  }
}

function populateDropdown(dropdownId, airports) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  dropdown.innerHTML = '';
  airports.slice(0, 50).forEach(airport => {
    const option = document.createElement('option');
    option.value = `${airport.name} (${airport.iata})`;
    option.textContent = `${airport.name} (${airport.iata}) - ${airport.city}, ${airport.country}`;
    dropdown.appendChild(option);
  });
  dropdown.style.display = airports.length > 0 ? 'block' : 'none';
}

function searchAirports(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;

  const query = input.value.toLowerCase();
  if (query.length < 2) {
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    return;
  }
  const filteredAirports = airportsData.filter(airport => 
    airport.name.toLowerCase().includes(query) || 
    airport.city.toLowerCase().includes(query)
  );
  if (filteredAirports.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  populateDropdown(dropdownId, filteredAirports);
}

function selectAirport(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;

  const selectedValue = dropdown.value;
  input.value = selectedValue;
  dropdown.style.display = 'none';
}

// Flight Data
const sampleFlights = [
  { airline: "Air India", flightNumber: "AI302", departureTime: "08:30", arrivalTime: "10:45", price: 12500, duration: "2h 15m", stops: 0 },
  { airline: "IndiGo", flightNumber: "6E423", departureTime: "10:15", arrivalTime: "12:45", price: 8900, duration: "2h 30m", stops: 0 },
  { airline: "SpiceJet", flightNumber: "SG721", departureTime: "13:20", arrivalTime: "16:10", price: 9750, duration: "2h 50m", stops: 1 },
  { airline: "Vistara", flightNumber: "UK835", departureTime: "16:45", arrivalTime: "19:00", price: 14200, duration: "2h 15m", stops: 0 },
  { airline: "GoAir", flightNumber: "G8439", departureTime: "19:30", arrivalTime: "22:15", price: 7800, duration: "2h 45m", stops: 1 }
];

// Create Flights Container
function createFlightsContainer() {
  const flightsContainer = document.getElementById('flights-container');
  if (!flightsContainer) {
    console.error('Flights container not found in DOM');
    return null;
  }
  return flightsContainer;
}

// Handle Search Flights
function handleSearchFlights() {
  const departureInput = document.getElementById('input1')?.value;
  const arrivalInput = document.getElementById('input2')?.value;
  const departureDate = document.querySelector('input[name="dep"]')?.value;
  const arrivalDate = document.querySelector('input[name="arr"]')?.value;
  const ticketsCount = document.querySelector('input[name="tic"]')?.value;
  const ticketType = document.getElementById('ticket_type')?.value;

  if (!departureInput || !arrivalInput || !departureDate || !ticketsCount || !ticketType) {
    alert('Please fill all the required fields');
    return;
  }

  const flightsContainer = createFlightsContainer();
  if (!flightsContainer) return;

  flightsContainer.innerHTML = `
    <h2 style="color: #F76641; font-size: 24px; margin-bottom: 15px;">Available Flights</h2>
    <p style="color: #737373; margin-bottom: 20px;">
      ${departureInput} to ${arrivalInput} | ${formatDate(departureDate)} | ${ticketsCount} passenger(s) | ${formatTicketType(ticketType)}
    </p>
    <div style="height: 1px; background-color: #e0e0e0; margin-bottom: 20px;"></div>
    <div style="margin-bottom: 20px; text-align: center;">
      <label for="flight-select" style="font-weight: bold; margin-right: 10px;">Select a flight:</label>
      <select id="flight-select" style="padding: 10px; border-radius: 50px; border: 1px solid #bababa; width: 80%; background-color: #fffbe3;">
        <option value="" selected disabled>Choose a flight from the list below</option>
        ${sampleFlights.map((flight, index) => `
          <option value="${index}">${flight.airline} ${flight.flightNumber} - ${flight.departureTime} to ${flight.arrivalTime} - ₹${flight.price}</option>
        `).join('')}
      </select>
    </div>
    <div id="flight-details" style="display: none;"></div>
    <div style="text-align: center;">
      <button id="book-now-btn" style="display: none; background-color: #F76641; color: black; border: none; border-radius: 50px; padding: 10px 30px; font-family: 'Inter, sans-serif'; font-size: 16px; margin-top: 20px; cursor: pointer;">Book Now</button>
    </div>
  `;
  flightsContainer.style.display = 'block';

  const flightSelect = document.getElementById('flight-select');
  if (flightSelect) {
    flightSelect.addEventListener('change', function() {
      showFlightDetails(this.value);
    });
  }

  flightsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show Flight Details
function showFlightDetails(flightIndex) {
  const detailsContainer = document.getElementById('flight-details');
  const bookButton = document.getElementById('book-now-btn');
  if (!detailsContainer || !bookButton) return;

  if (flightIndex === '') {
    detailsContainer.style.display = 'none';
    bookButton.style.display = 'none';
    return;
  }

  const flight = sampleFlights[flightIndex];
  const ticketsCount = document.querySelector('input[name="tic"]').value;
  const totalPrice = flight.price * parseInt(ticketsCount);

  detailsContainer.innerHTML = `
    <div style="border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; margin-top: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div style="font-size: 22px; font-weight: bold;">${flight.airline}</div>
        <div style="font-size: 18px;">${flight.flightNumber}</div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <div style="font-size: 24px; font-weight: bold;">${flight.departureTime}</div>
          <div style="color: #737373;">${document.getElementById('input1').value.split(' ')[0]}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="color: #737373;">${flight.duration}</div>
          <div style="width: 150px; height: 2px; background-color: #e0e0e0; position: relative; margin: 10px 0;">
            <div style="position: absolute; left: 0; top: -4px; width: 8px; height: 8px; border-radius: 50%; background-color: #F76641;"></div>
            <div style="position: absolute; right: 0; top: -4px; width: 8px; height: 8px; border-radius: 50%; background-color: #F76641;"></div>
          </div>
          <div style="color: #737373;">${flight.stops === 0 ? 'Direct' : flight.stops + ' Stop'}</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: bold;">${flight.arrivalTime}</div>
          <div style="color: #737373;">${document.getElementById('input2').value.split(' ')[0]}</div>
        </div>
      </div>
      <div style="height: 1px; background-color: #e0e0e0; margin: 15px 0;"></div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="color: #737373; margin-bottom: 5px;">Price per passenger</div>
          <div style="font-size: 20px; font-weight: bold;">₹${flight.price.toLocaleString()}</div>
        </div>
        <div>
          <div style="color: #737373; margin-bottom: 5px;">Total for ${ticketsCount} passenger(s)</div>
          <div style="font-size: 24px; font-weight: bold; color: #F76641;">₹${totalPrice.toLocaleString()}</div>
        </div>
      </div>
    </div>
  `;
  detailsContainer.style.display = 'block';
  bookButton.style.display = 'block';

  bookButton.onmouseover = () => {
    bookButton.style.backgroundColor = 'black';
    bookButton.style.color = '#F76641';
    bookButton.style.transform = 'scale(1.05)';
    bookButton.style.transition = '0.2s';
  };
  bookButton.onmouseout = () => {
    bookButton.style.backgroundColor = '#F76641';
    bookButton.style.color = 'black';
    bookButton.style.transform = 'scale(1)';
  };

  setupBookingButton();
}

// Setup Booking Button with Login Check
function setupBookingButton() {
  const bookButton = document.getElementById('book-now-btn');
  if (bookButton) {
    bookButton.addEventListener('click', async function() {
      const flightSelect = document.getElementById('flight-select');
      const selectedFlightIndex = flightSelect.value;
      
      if (!selectedFlightIndex) {
        alert('Please select a flight first.');
        return;
      }
      
      const selectedFlight = sampleFlights[selectedFlightIndex];
      const departureCity = document.getElementById('input1').value.split(' ')[0];
      const arrivalCity = document.getElementById('input2').value.split(' ')[0];
      const departureDate = document.querySelector('input[name="dep"]').value;
      const arrivalDate = departureDate; // Adjust if you add arrival date input
      const numTickets = document.querySelector('input[name="tic"]').value;
      const ticketType = document.getElementById('ticket_type').value;
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const userId = currentUser ? (currentUser.userId || currentUser.email) : 'guest';
const userEmail = currentUser ? currentUser.email : '';

const bookingData = {
  flight: `${selectedFlight.airline} ${selectedFlight.flightNumber}`,
  departure: departureCity,
  arrival: arrivalCity,
  departureDate: departureDate,
  arrivalDate: arrivalDate,
  tickets: parseInt(numTickets),
  ticketType: formatTicketType(ticketType),
  userId: userId, // This is "chapladhananjay@gmail.com"
  price: selectedFlight.price * parseInt(numTickets),
  email: userEmail
};
      
      try {
        console.log('Sending booking data:', bookingData);
        
        const response = await fetch('http://localhost:3002/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          alert('Booking successful! A confirmation email has been sent to your registered email address.');
          console.log('Booking response:', responseData);
          window.location.reload(); // Reload page after booking
        } else {
          alert('Booking failed. Please try again. ' + responseData.message);
        }
      } catch (error) {
        console.error('Error during booking:', error);
        alert('Network error. Please check your connection and try again.');
      }
    });
  } else {
    console.error('Book Now button not found in the DOM');
  }
}

// Helper Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatTicketType(type) {
  const types = { 'economy': 'Economy Class', 'business': 'Business Class', 'first_class': 'First Class' };
  return types[type] || type;
}

// Initialize on Page Load
document.addEventListener('DOMContentLoaded', async function() {
  await loadAirports();
  await populateCountries();
  checkLoginStatus();

  const searchButton = document.getElementById('btn');
  if (searchButton) {
    searchButton.removeEventListener('click', handleSearchFlights); // Prevent duplicate listeners
    searchButton.addEventListener('click', handleSearchFlights);
  }

  // Add event listeners for swap button and inputs
  const swapBtn = document.getElementById('swap-btn');
  if (swapBtn) {
    swapBtn.addEventListener('click', swapFields);
  }

  const input1 = document.getElementById('input1');
  const dropdown1 = document.getElementById('airportDropdown1');
  if (input1 && dropdown1) {
    input1.addEventListener('keyup', () => searchAirports('input1', 'airportDropdown1'));
    dropdown1.addEventListener('change', () => selectAirport('input1', 'airportDropdown1'));
  }

  const input2 = document.getElementById('input2');
  const dropdown2 = document.getElementById('airportDropdown2');
  if (input2 && dropdown2) {
    input2.addEventListener('keyup', () => searchAirports('input2', 'airportDropdown2'));
    dropdown2.addEventListener('change', () => selectAirport('input2', 'airportDropdown2'));
  }
});

function handleSuccessfulLogin(userData) {
  currentUser = userData;
  localStorage.setItem('currentUser', JSON.stringify(userData)); // Ensure email is included
  updateUIForLoggedInUser();
  window.location.href = 'main.html';
}