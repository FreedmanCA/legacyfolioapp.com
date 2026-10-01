const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

// Guard check: Only run the navigation toggle if both elements exist in the DOM
if (menuToggle && navLinks) {
    const focusableSelector = 'a[href], button:not([disabled])';

    function getFocusableItems() {
        return Array.from(navLinks.querySelectorAll(focusableSelector));
    }

    function openMenu() {
        try {
            menuToggle.classList.add('open');
            navLinks.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');

            const items = getFocusableItems();
            if (items.length) {
                items[0].focus();
            }

            document.addEventListener('keydown', handleMenuKeydown);

            // Lock scroll last, only once everything above has succeeded.
            document.body.classList.add('scroll-locked');
        } catch (err) {
            console.error('Failed to open menu:', err);
            closeMenu();
        }
    }

    function closeMenu() {
        try {
            menuToggle.classList.remove('open');
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.removeEventListener('keydown', handleMenuKeydown);
            menuToggle.focus();
        } finally {
            // Always unlock scroll, even if something above threw.
            document.body.classList.remove('scroll-locked');
        }
    }

    function handleMenuKeydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeMenu();
            return;
        }

        if (event.key === 'Tab') {
            const items = getFocusableItems();
            if (!items.length) return;

            const first = items[0];
            const last = items[items.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    }

    menuToggle.addEventListener('click', () => {
        if (menuToggle.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // If the viewport grows past the mobile breakpoint while the menu is
    // open, the hamburger button is hidden by CSS, leaving no way to close
    // it. Reset menu state on the breakpoint crossing. Matches the
    // max-width: 768px overlay breakpoint in shared.css.
    const desktopQuery = window.matchMedia('(min-width: 769px)');
    desktopQuery.addEventListener('change', (event) => {
        if (event.matches && menuToggle.classList.contains('open')) {
            closeMenu();
        }
    });
}