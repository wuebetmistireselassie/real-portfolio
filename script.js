// This script loads the project list from projects.js to build the gallery.
document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // These values are still needed to build the correct image URLs.
    const githubUsername = 'wuebmistireselassie'; 
    const repoName = 'real-portfolio'; 
    const folderPath = 'images'; // The folder where your images are stored.
    // ---------------------

    const portfolioGrid = document.getElementById('portfolio-grid');

    // Check if the projectFiles array exists from projects.js
    if (typeof projectFiles !== 'undefined' && projectFiles.length > 0) {
        // Clear the "Loading..." message
        portfolioGrid.innerHTML = ''; 

        // Create gallery items from the list
        projectFiles.forEach(fileName => {
            const item = document.createElement('div');
            item.className = 'portfolio-item';
            
            // Construct the full URL to the image file
            const imageUrl = `https://raw.githubusercontent.com/${githubUsername}/${repoName}/main/${folderPath}/${encodeURIComponent(fileName)}`;

            const link = document.createElement('a');
            link.href = imageUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            const image = document.createElement('img');
            image.src = imageUrl;
            image.alt = fileName;

            // Use the filename without extension as the caption
            const caption = document.createElement('p');
            caption.textContent = fileName.split('.').slice(0, -1).join('.');

            link.appendChild(image);
            link.appendChild(caption);
            item.appendChild(link);
            portfolioGrid.appendChild(item);
        });

    } else {
        // This message shows if projects.js is missing or empty
        portfolioGrid.innerHTML = '<p>No projects found. Please check the projects.js file.</p>';
        console.error("Error: 'projectFiles' array not found or is empty. Make sure projects.js is loaded correctly before this script.");
    }
});
