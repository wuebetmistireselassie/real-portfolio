// This script reads the portfolioItems array from projects.js
// and dynamically builds the content for the "My Work" section.

document.addEventListener('DOMContentLoaded', () => {
    // Get the container elements from the HTML
    const imageGrid = document.getElementById('image-grid');
    const videoGrid = document.getElementById('video-grid');
    const documentList = document.getElementById('document-list');

    // Check if the portfolioItems array exists and is not empty
    if (typeof portfolioItems === 'undefined' || portfolioItems.length === 0) {
        imageGrid.innerHTML = '<p>No projects found. Please check the projects.js file.</p>';
        videoGrid.innerHTML = ''; // Hide loading message if no projects
        documentList.innerHTML = ''; // Hide loading message if no projects
        console.error("Error: 'portfolioItems' array not found or is empty.");
        return; // Stop the script
    }

    // Clear the "Loading..." messages
    imageGrid.innerHTML = '';
    videoGrid.innerHTML = '';
    documentList.innerHTML = '';

    // Create counters to see if any items of a type were found
    let imageCount = 0;
    let videoCount = 0;
    let documentCount = 0;

    // Loop through each item in the portfolioItems array
    portfolioItems.forEach(item => {
        // Use a switch statement to handle each item type
        switch (item.type) {
            case 'image':
                // Create the HTML for an image item
                const imageItem = document.createElement('div');
                imageItem.className = 'portfolio-item';

                const imageLink = document.createElement('a');
                imageLink.href = item.url;
                imageLink.target = '_blank';
                imageLink.rel = 'noopener noreferrer';

                const image = document.createElement('img');
                image.src = item.url; // Use the direct Cloudinary URL
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
                // Create the HTML for a video item
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';

                const videoTitle = document.createElement('h4');
                videoTitle.textContent = item.title;

                const videoEmbed = document.createElement('div');
                videoEmbed.className = 'video-embed-container'; // For styling
                videoEmbed.innerHTML = `
                    <iframe 
                        src="${item.url}" 
                        title="${item.title}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>`;
                
                videoItem.appendChild(videoTitle);
                videoItem.appendChild(videoEmbed);
                videoGrid.appendChild(videoItem);
                videoCount++;
                break;

            case 'document':
                // Create the HTML for a document link
                const documentItem = document.createElement('div');
                documentItem.className = 'document-item';

                const documentLink = document.createElement('a');
                documentLink.href = item.url;
                documentLink.target = '_blank';
                documentLink.rel = 'noopener noreferrer';
                // Add an icon for visual flair
                documentLink.innerHTML = `📄 ${item.title}`; 
                
                documentItem.appendChild(documentLink);
                documentList.appendChild(documentItem);
                documentCount++;
                break;
        }
    });

    // If no items of a certain type were found, display a message.
    if (imageCount === 0) {
        imageGrid.innerHTML = '<p>No designs to display yet.</p>';
    }
    if (videoCount === 0) {
        videoGrid.innerHTML = '<p>No videos to display yet.</p>';
    }
    if (documentCount === 0) {
        documentList.innerHTML = '<p>No documents to display yet.</p>';
    }
});
