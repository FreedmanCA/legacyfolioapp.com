// ==========================================
// NATIVE DIALOG LIGHTBOX COMPONENT (GUARDED)
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
                // Show the largest version, not the smaller one the page picked for this screen
                lightboxImg.src = img.dataset.fullSrc || img.currentSrc || img.src;
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
