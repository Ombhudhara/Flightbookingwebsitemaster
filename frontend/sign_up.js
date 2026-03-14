document.getElementById("sign-up-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const messageContainer = document.getElementById("message-container");
    messageContainer.innerHTML = ""; // Clear previous messages
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (!name || !email || !password || !confirmPassword) {
        messageContainer.innerHTML = '<p class="error-message">Please fill out all fields.</p>';
        return;
    }

    if (password !== confirmPassword) {
        messageContainer.innerHTML = '<p class="error-message">Passwords do not match.</p>';
        return;
    }

    // Call the backend API (updated to port 3002)
    fetch('http://localhost:3002/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            messageContainer.innerHTML = `<p class="success-message">${data.message}</p>`;
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            messageContainer.innerHTML = `<p class="error-message">${data.message}</p>`;
        }
    })
    .catch(error => {
        messageContainer.innerHTML = '<p class="error-message">Error connecting to server. Please try again.</p>';
        console.error('Error:', error);
    });
});