// This file now contains the functions to build the portfolio and handle animations.
// It will be called by auth.js after a successful login.

function buildPortfolio() {
    const imageGrid = document.getElementById('image-grid');
    const documentList = document.getElementById('document-list');
    const videoGrid = document.getElementById('video-grid');

    // Check if the portfolio data exists
    if (typeof portfolioItems === 'undefined' || portfolioItems.length === 0) {
        if (imageGrid) imageGrid.innerHTML = '<p>No projects have been added yet.</p>';
        return; // Stop if there's no data
    }

    // Clear any "Loading..." messages
    if (imageGrid) imageGrid.innerHTML = '';
    if (videoGrid) videoGrid.innerHTML = '';
    if (documentList) documentList.innerHTML = '';

    let imageCount = 0;
    let videoCount = 0;
    let documentCount = 0;

    // Loop through the projects and build the HTML
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
                // This section is ready for when you add videos
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';
                videoItem.innerHTML = `
                    <h4>${item.title}</h4>
                    <div class="video-embed-container">
                        <iframe src="${item.url}" title="${item.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>`;
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

    // Add placeholder text if a category is empty
    if (imageCount === 0) imageGrid.innerHTML = '<p>No designs to display yet.</p>';
    if (videoCount === 0) videoGrid.innerHTML = '<p>No videos to display yet.</p>';
    if (documentCount === 0) documentList.innerHTML = '<p>No documents to display yet.</p>';

    // IMPORTANT: Initialize the lightbox AFTER the images have been added to the page
    if (imageCount > 0) {
        new SimpleLightbox('.gallery-link', {
            captionsData: 'title',
            captionDelay: 250,
        });
    }
}

// This function can still run when the page loads to set up animations
document.addEventListener('DOMContentLoaded', () => {
    // Droplet Animation Randomizer
    document.querySelectorAll('.droplet').forEach(droplet => {
        const size = Math.random() * 15 + 5;
        const delay = Math.random() * -20;
        const duration = Math.random() * 10 + 15;
        const position = Math.random() * 98;
        droplet.style.width = `${size}px`;
        droplet.style.height = `${size}px`;
        droplet.style.left = `${position}vw`;
        droplet.style.animationDelay = `${delay}s`;
        droplet.style.animationDuration = `${duration}s`;
    });
});
