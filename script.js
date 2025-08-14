// This file defines the functions to build the portfolio and handle animations.

// A variable to hold the gallery instance so we can control it.
let lightbox;

/**
 * Sets up the event listener for the "Art Gallery" button.
 */
function setupGalleryButton() {
    const openGalleryButton = document.getElementById('open-gallery-button');
    if (openGalleryButton && lightbox) {
        openGalleryButton.replaceWith(openGalleryButton.cloneNode(true));
        document.getElementById('open-gallery-button').addEventListener('click', (e) => {
            e.preventDefault();
            lightbox.open();
        });
    }
}

/**
 * Builds the full portfolio for logged-in users.
 */
function buildPortfolio() {
    const imageGrid = document.getElementById('image-grid');
    const documentList = document.getElementById('document-list');
    const videoGrid = document.getElementById('video-grid');

    if (typeof portfolioItems === 'undefined' || portfolioItems.length === 0) {
        if (imageGrid) imageGrid.innerHTML = '<p>No projects have been added yet.</p>';
        return;
    }

    if (imageGrid) imageGrid.innerHTML = '';
    if (videoGrid) videoGrid.innerHTML = '';
    if (documentList) documentList.innerHTML = '';

    let imageCount = 0, videoCount = 0, documentCount = 0;

    portfolioItems.forEach(item => {
        switch (item.type) {
            case 'image':
                const imageItem = document.createElement('div');
                imageItem.className = 'portfolio-item';
                imageItem.innerHTML = `
                    <a href="${item.url}" class="gallery-link" title="${item.title}: ${item.description || ''}">
                        <img src="${item.url}" alt="${item.title}">
                        <div class="portfolio-text-content">
                            <p class="portfolio-title">${item.title}</p>
                            <p class="portfolio-description">${item.description || 'No description available.'}</p>
                        </div>
                    </a>`;
                imageGrid.appendChild(imageItem);
                imageCount++;
                break;
            case 'video':
                // Video and document items remain the same
                break;
            case 'document':
                // Video and document items remain the same
                break;
        }
    });

    if (imageCount > 0) {
        lightbox = new SimpleLightbox('#image-grid .gallery-link', { captionsData: 'title', captionDelay: 250, captionPosition: 'bottom' });
        setupGalleryButton();
    }
}

/**
 * Builds a preview of the portfolio for guests.
 */
function buildGuestPortfolio() {
    const guestImageGrid = document.getElementById('guest-image-grid');
    if (!guestImageGrid) return;
    if (typeof portfolioItems === 'undefined' || portfolioItems.length === 0) return;

    guestImageGrid.innerHTML = '';
    const guestItems = portfolioItems.filter(item => item.type === 'image').slice(0, 2);

    guestItems.forEach(item => {
        const imageItem = document.createElement('div');
        imageItem.className = 'portfolio-item';
        imageItem.innerHTML = `
            <img src="${item.url}" alt="${item.title}">
            <div class="portfolio-text-content">
                <p class="portfolio-title">${item.title}</p>
                <p class="portfolio-description">${item.description || 'No description available.'}</p>
            </div>`;
        guestImageGrid.appendChild(imageItem);
    });
}

/**
 * Creates and animates the futuristic particle background.
 */
function createDynamicBackground() {
    const backgroundContainer = document.getElementById('dynamic-background');
    if (!backgroundContainer) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'background-canvas';
    backgroundContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let particles = [];
    const particleCount = 70;
    const maxDistance = 120;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 1.5 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 242, 234, 0.8)';
            ctx.fill();
        }
    }

    function init() {
        resizeCanvas();
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 242, 234, ${1 - distance / maxDistance})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        requestAnimationFrame(animate);
    }

    init();
    animate();
    window.addEventListener('resize', init);
}


document.addEventListener('DOMContentLoaded', () => {
    // Replace the old background div with a new one for the canvas
    const oldBg = document.querySelector('.background-effects');
    if (oldBg) oldBg.id = 'dynamic-background';
    
    buildGuestPortfolio();
    createDynamicBackground(); // Start the new background animation
});
