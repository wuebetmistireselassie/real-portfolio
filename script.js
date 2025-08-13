document.addEventListener('DOMContentLoaded', () => {
    // Portfolio loading logic
    const imageGrid = document.getElementById('image-grid');
    const videoGrid = document.getElementById('video-grid');
    const documentList = document.getElementById('document-list');

    if (typeof portfolioItems !== 'undefined' && portfolioItems.length > 0) {
        imageGrid.innerHTML = '';
        videoGrid.innerHTML = '';
        documentList.innerHTML = '';

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
                    // This section remains for future use if you add videos
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
        
        if (imageCount > 0) {
            new SimpleLightbox('.gallery-link', { captionsData: 'title', captionDelay: 250 });
        }
    } else {
        imageGrid.innerHTML = '<p>No projects have been added yet.</p>';
    }
    
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
