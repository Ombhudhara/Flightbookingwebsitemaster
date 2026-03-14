let airportsData = [];
const dropdown = document.getElementById('airportDropdown');

// Fetch the OpenFlights airport data
async function loadAirports() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat');
        const text = await response.text();
        
        // Parse the CSV-like data
        airportsData = text.split('\n').map(line => {
            const fields = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // Split by comma, handling quoted fields
            return {
                name: fields[1] ? fields[1].replace(/"/g, '') : '',
                city: fields[2] ? fields[2].replace(/"/g, '') : '',
                country: fields[3] ? fields[3].replace(/"/g, '') : '',
                iata: fields[4] ? fields[4].replace(/"/g, '') : ''
            };
        }).filter(airport => airport.name && airport.iata !== '\\N'); // Filter out invalid entries
    } catch (error) {
        console.error('Error fetching airport data:', error);
    }
}

// Populate the dropdown with airport options
function populateDropdown(airports) {
    dropdown.innerHTML = ''; // Clear existing options
    airports.slice(0, 50).forEach(airport => { // Limit to 50 for performance
        const option = document.createElement('option');
        option.value = `${airport.name} (${airport.iata})`;
        option.textContent = `${airport.name} (${airport.iata}) - ${airport.city}, ${airport.country}`;
        dropdown.appendChild(option);
    });
    dropdown.style.display = airports.length > 0 ? 'block' : 'none';
}

// Search function triggered by typing
function searchAirports() {
    const query = document.getElementById('searchInput').value.toLowerCase();

    // Hide dropdown and clear it if query is too short
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

    // Show and populate dropdown only when typing starts and matches are found
    populateDropdown(filteredAirports);
}

// Handle selection from dropdown
function selectAirport() {
    const selectedValue = dropdown.value;
    document.getElementById('searchInput').value = selectedValue;
    dropdown.style.display = 'none'; // Hide dropdown after selection
    // No "Selected" text displayed
}

// Load airports when the page loads (but don't show dropdown yet)
window.onload = loadAirports;