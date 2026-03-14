document.getElementById("sign-in-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const messageContainer = document.getElementById("message-container");
    messageContainer.innerHTML = ""; // Clear previous messages
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        messageContainer.innerHTML = '<p class="error-message">Please fill out all fields.</p>';
        return;
    }

    // Call the backend API (updated to port 3002)
    fetch('http://localhost:3002/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            messageContainer.innerHTML = `<p class="success-message">${data.message}</p>`;
            
            // Store user data in localStorage
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('userLoggedIn', 'true');
            
            // Redirect to main page after a short delay
            setTimeout(() => {
                window.location.href = "main.html";
            }, 1000);
        } else {
            // Show error message with signup suggestion if user not found
            if (data.message === 'User not found. Please sign up first.') {
                messageContainer.innerHTML = `<p class="error-message">${data.message} <a href="sign_up.html" class="text-orange-500 hover:text-orange-400">Sign Up here</a></p>`;
            } else {
                messageContainer.innerHTML = `<p class="error-message">${data.message}</p>`;
            }
        }
    })
    .catch(error => {
        messageContainer.innerHTML = '<p class="error-message">Error connecting to server. Please try again.</p>';
        console.error('Error:', error);
    });
});