document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // These values MUST match your GitHub details exactly.
    const githubUsername = 'wuebmistireselassie'; 
const repoName = 'real-portfolio'; 
const folderPath = 'images';
    // ---------------------

    const portfolioGrid = document.getElementById('portfolio-grid');
    const apiUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${folderPath}`;

    // Function to fetch and display portfolio items
    async function loadPortfolio() {
        try {
            const response = await fetch(apiUrl);

            // Handle API errors like "Not Found"
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status} - ${response.statusText}. Check the 'apiUrl' in your script.`);
            }

            const files = await response.json();
            
            // Clear the "Loading..." message
            portfolioGrid.innerHTML = ''; 

            // Filter for files that are images
            const imageFiles = files.filter(file => 
                file.type === 'file' && /\.(jpe?g|png|gif|svg)$/i.test(file.name)
            );

            if (imageFiles.length === 0) {
                portfolioGrid.innerHTML = '<p>No projects found. Make sure your images are in the correct folder on GitHub.</p>';
                return;
            }

            // Create gallery items for each image file
            imageFiles.forEach(file => {
                const item = document.createElement('div');
                item.className = 'portfolio-item';
                
                const link = document.createElement('a');
                link.href = file.download_url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';

                const image = document.createElement('img');
                image.src = file.download_url;
                image.alt = file.name;

                const caption = document.createElement('p');
                caption.textContent = file.name.split('.').slice(0, -1).join('.');

                link.appendChild(image);
                link.appendChild(caption);
                item.appendChild(link);
                portfolioGrid.appendChild(item);
            });

        } catch (error) {
            console.error('Failed to load portfolio:', error);
            portfolioGrid.innerHTML = `<p style="color: red;">Error: Could not load portfolio items. Please double-check that the GitHub username, repository name, and folder path are correct in the script.js file.</p>`;
        }
    }

    // Run the function to load the portfolio
    loadPortfolio();
});
