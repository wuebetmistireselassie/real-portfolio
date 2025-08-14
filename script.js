// This file defines the functions to build the portfolio and handle animations.

/**
 * Builds the portfolio for logged-in users.
 * This function is called by auth.js after a successful login.
 */
function buildPortfolio() {
    const imageGrid = document.getElementById('image-grid');
    const documentList = document.getElementById('document-list');
    const videoGrid = document.getElementById('video-grid');

    // Check if the portfolio data exists
    if (typeof portfolioItems === 'undefined' || portfolioItems.length === 0) {
        if (imageGrid) imageGrid.innerHTML = '<p>No projects have been added yet.</p>';
        return;
    }

    // Clear any "Loading..." messages
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
                    <a href="${item.url}" class="gallery-link" title="${item.title}">
                        <img src="${item.url}" alt="${item.title}">
                        <p>${item.title}</p>
                    </a>`;
                imageGrid.appendChild(imageItem);
                imageCount++;
                break;

            case 'video':
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';
                videoItem.innerHTML = `<h4>${item.title}</h4><div class="video-embed-container"><iframe src="${item.url}" title="${item.title}" frameborder="0" allowfullscreen></iframe></div>`;
                videoGrid.appendChild(videoItem);
                videoCount++;
                break;

            case 'document':
                const docItem = document.createElement('div');
                docItem.className = 'document-item';
                docItem.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>`;
                documentList.appendChild(docItem);
                documentCount++;
                break;
        }
    });

    if (imageCount === 0) imageGrid.innerHTML = '<p>No designs to display yet.</p>';
    if (videoCount === 0) videoGrid.innerHTML = '<p>No videos to display yet.</p>';
    if (documentCount === 0) documentList.innerHTML = '<p>No documents to display yet.</p>';
    
    // Initialize Lightbox AFTER images are on the page
    if (imageCount > 0) {
        new SimpleLightbox('.gallery-link', { captionsData: 'title', captionDelay: 250 });
    }
}

/**
 * Builds a preview of the portfolio for guests (not logged in).
 * Shows the first 2 items.
 */
function buildGuestPortfolio() {
    const guestImageGrid = document.getElementById('guest-image-grid');
    if (!guestImageGrid) return; // Exit if the element doesn't exist

    // Check if the portfolio data exists
    if (typeof portfolioItems === 'undefined' || portfolioItems.length === 0) {
        guestImageGrid.innerHTML = '<p>No projects have been added yet.</p>';
        return;
    }

    guestImageGrid.innerHTML = ''; // Clear existing content

    // Get only the first 2 image items for the preview
    const guestItems = portfolioItems.filter(item => item.type === 'image').slice(0, 2);

    if (guestItems.length === 0) {
        guestImageGrid.innerHTML = '<p>No designs to display yet.</p>';
        return;
    }

    guestItems.forEach(item => {
        const imageItem = document.createElement('div');
        imageItem.className = 'portfolio-item';
        // Note: We don't initialize a lightbox here, it's a simple preview
        imageItem.innerHTML = `
            <img src="${item.url}" alt="${item.title}">
            <p>${item.title}</p>
        `;
        guestImageGrid.appendChild(imageItem);
    });
}


// This runs when the page content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Build the guest portfolio immediately so visitors see it
    buildGuestPortfolio();

    // Randomize droplets for the background animation
    const dropletContainer = document.querySelector('.background-effects');
    if (dropletContainer) {
        for (let i = 0; i < 20; i++) {
            const droplet = document.createElement('div');
            droplet.className = 'droplet';
            const size = Math.random() * 15 + 5;
            const delay = Math.random() * -20;
            const duration = Math.random() * 10 + 15;
            const position = Math.random() * 98;
            droplet.style.width = `${size}px`;
            droplet.style.height = `${size}px`;
            droplet.style.left = `${position}vw`;
            droplet.style.animationDelay = `${delay}s`;
            droplet.style.animationDuration = `${duration}s`;
            dropletContainer.appendChild(droplet);
        }
    }
});
