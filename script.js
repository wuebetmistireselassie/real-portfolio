document.addEventListener('DOMContentLoaded', () => {
    const imageGrid = document.getElementById('image-grid');
    const videoGrid = document.getElementById('video-grid');
    const documentList = document.getElementById('document-list');

    if (typeof portfolioItems === 'undefined' || portfolioItems.length === 0) {
        imageGrid.innerHTML = '<p>No projects found. Please check the projects.js file.</p>';
        videoGrid.innerHTML = '';
        documentList.innerHTML = '';
        return;
    }

    imageGrid.innerHTML = '';
    videoGrid.innerHTML = '';
    documentList.innerHTML = '';

    let imageCount = 0;
    let videoCount = 0;
    let documentCount = 0;

    portfolioItems.forEach(item => {
        switch (item.type) {
            case 'image':
                const imageItem = document.createElement('div');
                imageItem.className = 'portfolio-item';

                const imageLink = document.createElement('a');
                imageLink.href = item.url;
                imageLink.className = 'gallery-link'; // Class for lightbox

                const image = document.createElement('img');
                image.src = item.url;
                image.alt = item.title;

                const caption = document.createElement('p');
                caption.textContent = item.title;

                imageLink.appendChild(image);
                imageLink.appendChild(caption);
                imageItem.appendChild(imageLink);
                imageGrid.appendChild(imageItem);
                imageCount++;
                break;

            case 'video':
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';
                videoItem.innerHTML = `
                    <div class="video-embed-container">
                        <iframe 
                            src="${item.url}" 
                            title="${item.title}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>`;
                videoGrid.appendChild(videoItem);
                videoCount++;
                break;

            case 'document':
                const documentItem = document.createElement('div');
                documentItem.className = 'document-item';
                const documentLink = document.createElement('a');
                documentLink.href = item.url;
                documentLink.target = '_blank';
                documentLink.rel = 'noopener noreferrer';
                documentLink.textContent = item.title;
                documentItem.appendChild(documentLink);
                documentList.appendChild(documentItem);
                documentCount++;
                break;
        }
    });

    if (imageCount === 0) {
        imageGrid.innerHTML = '<p>No designs to display yet.</p>';
    }
    if (videoCount === 0) {
        videoGrid.innerHTML = '<p>No videos to display yet.</p>';
    }
    if (documentCount === 0) {
        documentList.innerHTML = '<p>No documents to display yet.</p>';
    }

    // Initialize the lightbox on all images
    if (imageCount > 0) {
        new SimpleLightbox('.gallery-link', {
            captionsData: 'alt',
            captionDelay: 250,
        });
    }
});
