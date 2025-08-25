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
        projectPage.innerHTML = `<section><div class="section-container"><h2>Project Not Found</h2><p>The project you're looking for does not exist.</p></div></section>`;
        homePage.classList.add('hidden');
        projectPage.classList.remove('hidden');
        return;
    }
    
    const logoVariationsHTML = project.logoVariations.map(variation => {
        let classes = 'logo-system-item';
        let labelText = variation.type.charAt(0).toUpperCase() + variation.type.slice(1) + ' Version';

        if (variation.type === 'white') {
            classes += ' logo-display-dark-bg';
        }

        return `
            <div class="${classes}">
                <img src="${variation.url}" alt="${project.title} ${variation.type} Logo">
                <p>${labelText}</p>
            </div>
        `;
    }).join('');

    // ✅ --- NEW: Create a dedicated section for the download link ---
    let brandGuidelinesSectionHTML = '';
    if (project.brandGuidelinesPdf) {
        brandGuidelinesSectionHTML = `
            <div class="project-section brand-guidelines-section">
                <h3>Brand Guidelines</h3>
                <p>Download the official brand guidelines to see the complete visual identity system.</p>
                <a href="${project.brandGuidelinesPdf}" class="btn" download>Download PDF</a>
            </div>
        `;
    }

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
                
                ${brandGuidelinesSectionHTML}

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
    window.scrollTo(0, 0);

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
        renderHomePage();
    }
}

// Event Listeners and Initial Load
document.addEventListener('DOMContentLoaded', () => {
    setProfilePicture();
    handleRouting();
    window.addEventListener('hashchange', handleRouting);

    const logoEl = document.querySelector('.logo-name');
    if (logoEl) {
        logoEl.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '#home';
        });
    }
});
