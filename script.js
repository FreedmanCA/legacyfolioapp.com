// ==========================================
// 1. CAROUSEL COMPONENT (GUARDED)
// ==========================================
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const windowEl = document.querySelector('.carousel-window');
const dotsContainer = document.getElementById('carouselDots');
const carouselStatus = document.getElementById('carouselStatus');
const carouselItems = document.querySelectorAll('.carousel-item');

// Guard check: Only run carousel logic if all vital carousel elements exist on the page
if (windowEl && dotsContainer && prevBtn && nextBtn && carouselItems.length > 0) {
    
    // Dynamically create dots
    carouselItems.forEach((item, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        if (index === 0) {
            dot.classList.add('active');
            dot.setAttribute('aria-current', 'true');
        }

        // Native Apple-style smooth scrolling directly to the exact item
        dot.addEventListener('click', () => {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });

        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.carousel-dot');

    function moveCarousel(direction) {
        // Measure the actual rendered item width and track gap instead of
        // hardcoding a value that has to be kept in sync with the CSS.
        const firstItem = carouselItems[0];
        const itemWidth = firstItem.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(windowEl.querySelector('.carousel-track')).columnGap) || 0;
        const scrollAmount = itemWidth + gap;

        if (direction === 'next') {
            windowEl.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
            windowEl.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    }

    // Update Arrows visibility
    function updateArrows() {
        if (windowEl.scrollLeft <= 5) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        if (Math.ceil(windowEl.scrollLeft + windowEl.clientWidth) >= windowEl.scrollWidth - 5) {
            nextBtn.classList.add('hidden');
        } else {
            nextBtn.classList.remove('hidden');
        }
    }

    windowEl.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    window.addEventListener('load', updateArrows);

    prevBtn.addEventListener('click', () => moveCarousel('prev'));
    nextBtn.addEventListener('click', () => moveCarousel('next'));

    // Center-Calculation Logic for flawless dot synchronization on all screen sizes
    function updateDots() {
        // Find the exact pixel center of the visible carousel window
        const windowCenter = windowEl.getBoundingClientRect().left + (windowEl.clientWidth / 2);
        let closestIndex = 0;
        let minDistance = Infinity;

        // Check every image to see which one's center is closest to the window's center
        carouselItems.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.left + (itemRect.width / 2);
            const distance = Math.abs(windowCenter - itemCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        // Update the dots to match the closest image
        dots.forEach((dot, index) => {
            if (index === closestIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.classList.remove('active');
                dot.removeAttribute('aria-current');
            }
        });

        // Announce the current slide to screen readers
        if (carouselStatus) {
            const heading = carouselItems[closestIndex].querySelector('h3');
            const label = heading ? heading.textContent : `Slide ${closestIndex + 1}`;
            carouselStatus.textContent = `Showing ${closestIndex + 1} of ${carouselItems.length}: ${label}`;
        }
    }

    // Listen for scrolling and resizing to keep dots perfectly synced
    windowEl.addEventListener('scroll', updateDots);
    window.addEventListener('resize', updateDots);
    window.addEventListener('load', updateDots);
}


// ==========================================
// 2. NATIVE DIALOG LIGHTBOX COMPONENT (GUARDED)
// ==========================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const galleryTriggers = document.querySelectorAll('.gallery-trigger');

// Track whether the most recent interaction was keyboard-driven,
// so focus-return only shows a visible outline for keyboard users.
let usingKeyboard = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        usingKeyboard = true;
        // Clear any leftover suppression so a genuine keyboard Tab
        // into a trigger always shows the focus ring again.
        galleryTriggers.forEach(t => t.classList.remove('suppress-focus-ring'));
    }
});
document.addEventListener('mousedown', () => {
    usingKeyboard = false;
});

// Guard check: Only run lightbox logic if the lightbox dialog elements actually exist
if (lightbox && lightboxImg && galleryTriggers.length > 0) {

    let lastFocusedTrigger = null;

    // Open lightbox on trigger activation (click or keyboard)
    galleryTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            try {
                const img = trigger.querySelector('img');
                lightboxImg.src = img.src;
                lightboxImg.alt = img.dataset.fullAlt || '';
                lastFocusedTrigger = trigger;
                lightbox.showModal();

                // Lock scroll last, only once everything above has succeeded.
                document.body.classList.add('scroll-locked');
            } catch (err) {
                console.error('Failed to open lightbox:', err);
                document.body.classList.remove('scroll-locked');
            }
        });
    });

    // One tap anywhere on the enlarged image or the backdrop closes it.
    // The image opens fitted to the screen.
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxImg) {
            lightbox.close();
        }
    });

    // Restore scroll and return focus when closed (handles ESC key automatically)
    lightbox.addEventListener('close', () => {
        try {
            if (lastFocusedTrigger) {
                lastFocusedTrigger.classList.toggle('suppress-focus-ring', !usingKeyboard);
                lastFocusedTrigger.focus();
            }
        } finally {
            // Always unlock scroll, even if something above threw.
            document.body.classList.remove('scroll-locked');
        }
    });
}
