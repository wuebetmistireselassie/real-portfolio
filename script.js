// This file defines the functions to build the portfolio and handle animations.

/**
 * Sets up the event listener for the "Art Gallery" button.
 */
function setupGalleryButton() {
    const openGalleryButton = document.getElementById('open-gallery-button');
    const firstGalleryImage = document.querySelector('#image-grid .gallery-link');

    if (openGalleryButton && firstGalleryImage) {
        // Remove any existing listener to prevent duplicates
        openGalleryButton.replaceWith(openGalleryButton.cloneNode(true));
        document.getElementById('open-gallery-button').addEventListener('click', (e) => {
            e.preventDefault();
            firstGalleryImage.click(); // Simulate a click on the first image to open the gallery
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

    if (imageCount === 0 && imageGrid) imageGrid.innerHTML = '<p>No designs to display yet.</p>';
    if (videoCount === 0 && videoGrid) videoGrid.innerHTML = '<p>No videos to display yet.</p>';
    if (documentCount === 0 && documentList) documentList.innerHTML = '<p>No documents to display yet.</p>';
    
    if (imageCount > 0) {
        // Initialize lightbox on the newly created links
        new SimpleLightbox('#image-grid .gallery-link', { captionsData: 'title', captionDelay: 250, captionPosition: 'bottom' });
        // Set up the gallery button now that the links exist
        setupGalleryButton();
    }
}

/**
 * Builds a preview of the portfolio for guests (not logged in).
 */
function buildGuestPortfolio() {
    const guestImageGrid = document.getElementById('guest-image-grid');
    if (!guestImageGrid) return;

    if (typeof portfolioItems === 'undefined' || portfolioItems.length === 0) {
        guestImageGrid.innerHTML = '<p>No projects have been added yet.</p>';
        return;
    }

    guestImageGrid.innerHTML = ''; 

    const guestItems = portfolioItems.filter(item => item.type === 'image').slice(0, 2);

    if (guestItems.length === 0) {
        guestImageGrid.innerHTML = '<p>No designs to display yet.</p>';
        return;
    }

    guestItems.forEach(item => {
        const imageItem = document.createElement('div');
        imageItem.className = 'portfolio-item';
        imageItem.innerHTML = `
            <img src="${item.url}" alt="${item.title}">
            <div class="portfolio-text-content">
                <p class="portfolio-title">${item.title}</p>
                <p class="portfolio-description">${item.description || 'No description available.'}</p>
            </div>
        `;
        guestImageGrid.appendChild(imageItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    buildGuestPortfolio();

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
