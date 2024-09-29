const currentUrl = window.location.href;
    
    if (currentUrl.endsWith('.html')) {
      const newUrl = currentUrl.replace('.html', '');
      window.history.pushState({}, "", newUrl);
}

function toggleMenu() {
    const menu = document.querySelector('.menu');
    const hamburger = document.querySelector('.hamburger');

    menu.classList.toggle('show');
    hamburger.classList.toggle('change');
}

function setActiveIndex(index) {
    const menu = document.querySelector('.menu');
    menu.setAttribute('data-active-index', index);
}