function initNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');
    const navbar = document.querySelector('.navbar');

    hamburger.addEventListener('click', () => {
        menu.classList.toggle('open');
        hamburger.classList.toggle('active');
    })

    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            hamburger.classList.remove('active');
        })
    })

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
    })

    const currentPage = location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.menu a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    })
}

fetch('nav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar-placeholder').innerHTML = html;
        initNavbar();
    });

fetch('footer.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('footer-placeholder').innerHTML = html;
    });

const productTabs = document.querySelectorAll('.product-tab');

productTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        productTabs.forEach(t => {
            t.classList.remove('btn-primary');
            t.classList.add('btn-secondary');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.remove('btn-secondary');
        tab.classList.add('btn-primary');
        tab.setAttribute('aria-selected', 'true');

        document.querySelectorAll('.product-panel').forEach(panel => {
            panel.hidden = panel.id !== tab.dataset.target;
        });
    });
})
