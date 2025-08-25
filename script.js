/**
 * Sets the profile picture in the header from a profileInfo object.
 */
function setProfilePicture() {
    const profilePicElement = document.getElementById('profile-picture');
    if (profilePicElement && typeof profileInfo !== 'undefined' && profileInfo.imageUrl) {
        profilePicElement.src = profileInfo.imageUrl;
    } else {
        if (profilePicElement) profilePicElement.style.display = 'none';
    }
}

/**
 * Renders the initial homepage with design and service grids.
 */
function renderHomePage() {
    const appContainer = document.getElementById('app-container');
    const homePage = document.getElementById('home-page');
    const projectPage = document.getElementById('project-page');
    
    if (appContainer && homePage && projectPage) {
        homePage.classList.remove('hidden');
        projectPage.classList.add('hidden');
    }

    const designsGrid = document.getElementById('designs-grid');
    if (designsGrid) {
        designsGrid.innerHTML = '';
        designs.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'portfolio-item';
            itemElement.dataset.id = item.id;
            itemElement.innerHTML = `
                <a href="#projects/${item.id}">
                    <img src="${item.heroImage}" alt="${item.title}">
                    <div class="portfolio-text-content">
                        <p class="portfolio-title">${item.title}</p>
                    </div>
                </a>
            `;
            designsGrid.appendChild(itemElement);
        });
    }

    const servicesList = document.getElementById('services-list');
    if (servicesList) {
        servicesList.innerHTML = '';
        services.forEach(item => {
            const itemElement = document.createElement('li');
            if (item.url) {
                 itemElement.innerHTML = `
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                `;
            } else {
                itemElement.textContent = item.title;
            }
            servicesList.appendChild(itemElement);
        });
    }
}

/**
 * Renders a specific project page based on the ID.
 * @param {string} projectId The ID of the project to render.
 */
function renderProjectPage(projectId) {
    const appContainer = document.getElementById('app-container');
    const homePage = document.getElementById('home-page');
    const projectPage = document.getElementById('project-page');
    const project = designs.find(item => item.id === projectId);

    if (!project) {
        // Handle project not found
        projectPage.innerHTML = `<section><div class="section-container"><h2>Project Not Found</h2><p>The project you're looking for does not exist.</p></div></section>`;
        homePage.classList.add('hidden');
        projectPage.classList.remove('hidden');
        return;
    }
    
    // ✅ CODE BELOW IS THE ONLY PART THAT HAS BEEN CHANGED ✅
    // Dynamically build the logo variations
    const logoVariationsHTML = project.logoVariations.map(variation => {
        let classes = 'logo-system-item';
        if (variation.type === 'white') {
            classes += ' logo-display-dark-bg';
        }

        // Check if this is the white logo and if a PDF link exists
        let downloadLinkHTML = '';
        if (variation.type === 'white' && project.brandGuidelinesPdf) {
            downloadLinkHTML = `
                <a href="${project.brandGuidelinesPdf}" class="brand-guidelines-download" download>
                    Download brand guidelines pdf
                </a>
            `;
        }

        return `
            <div class="${classes}">
                <img src="${variation.url}" alt="${project.title} ${variation.type} Logo">
                <p>${variation.type} Version</p>
                ${downloadLinkHTML}
            </div>
        `;
    }).join('');
    // ✅ END OF CHANGED CODE ✅

    // Dynamically build the design process gallery (if it exists)
    let processGalleryHTML = '';
    if (project.processGallery && project.processGallery.length > 0) {
        const processImagesHTML = project.processGallery.map(processItem => `
            <img src="${processItem.url}" alt="${project.title} Design Process">
        `).join('');

        processGalleryHTML = `
            <div class="project-section">
                <h3>The Design Process</h3>
                <div class="process-gallery">
                    ${processImagesHTML}
                </div>
            </div>
        `;
    }

    const projectContent = `
        <button id="back-to-home" class="back-button">← Back to All Projects</button>
        <img class="project-hero" src="${project.heroImage}" alt="${project.title} Hero Image">
        <section>
            <div class="section-container project-content">
                <h2 class="project-title">${project.title}</h2>
                <div class="project-brief">
                    <p><strong>The Challenge:</strong> ${project.brief.challenge}</p>
                    <p><strong>The Solution:</strong> ${project.brief.solution}</p>
                </div>
                
                <div class="project-section">
                    <h3>Logo System</h3>
                    <div class="logo-system-grid">
                        ${logoVariationsHTML}
                    </div>
                </div>

                <div class="project-section">
                    <h3>Real-World Mockups</h3>
                    <div class="mockup-gallery">
                        ${project.mockupGallery.map(mockup => `
                            <img src="${mockup.url}" alt="${project.title} Mockup">
                        `).join('')}
                    </div>
                </div>

                ${processGalleryHTML}

            </div>
        </section>
    `;

    projectPage.innerHTML = projectContent;
    homePage.classList.add('hidden');
    projectPage.classList.remove('hidden');
    window.scrollTo(0, 0); // Scroll to top of the page

    // Add event listener for the back button
    document.getElementById('back-to-home').addEventListener('click', () => {
        window.location.hash = '#home';
    });
}

/**
 * Handles the routing logic based on the URL hash.
 */
function handleRouting() {
    const hash = window.location.hash;
    if (hash === '' || hash === '#home') {
        renderHomePage();
    } else if (hash.startsWith('#projects/')) {
        const projectId = hash.split('/')[1];
        renderProjectPage(projectId);
    } else {
        renderHomePage(); // Fallback to home page if hash is invalid
    }
}

// Event Listeners and Initial Load
document.addEventListener('DOMContentLoaded', () => {
    setProfilePicture();
    handleRouting();
    window.addEventListener('hashchange', handleRouting);

    // Make the logo name in header a "home" button
    const logoEl = document.querySelector('.logo-name');
    if (logoEl) {
        logoEl.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#home';
            });
    }
});
