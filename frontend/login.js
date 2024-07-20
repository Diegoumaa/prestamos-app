document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    fetch('/login', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Inicio de sesión exitoso") {
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message);
        }
    });
});
