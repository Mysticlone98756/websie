document.addEventListener('DOMContentLoaded', function () {
    fetch('../menu.html')
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);
        })
        .then(() => {
            const script = document.createElement('script');
            script.src = '../menu.js';
            document.body.appendChild(script);
        });
});
