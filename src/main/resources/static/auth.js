document.getElementById('registerBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            window.location.href = "/game";
        } else {
            const error = await response.text();
            document.getElementById('message').textContent = error;
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            window.location.href = "/game";
        } else {
            const error = await response.text();
            document.getElementById('message').textContent = error;
        }
    } catch (error) {
        console.error("Error:", error);
    }
});
