// ===================================================================================
// YOUR PORTFOLIO DATABASE
// ===================================================================================

const profileInfo = {
    imageUrl: 'https://res.cloudinary.com/dreresany/image/upload/v1755173247/My_Reality_wiyus6.png'
};

const designs = [
    {
        id: 'leafinity',
        title: 'Leafinity',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/Leafinity_1_ya5std.png',
        brief: {
            challenge: 'Represents a fictional company focused on nature and sustainability. The name combines "Leaf" and "Infinity" to suggest endless nature.',
            solution: 'This logo merges a leaf with the infinity symbol to create a single, cohesive mark. The design is simple, elegant, and conveys a message of environmental longevity.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/Leafinity_1_ya5std.png' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/Leafinity_white.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/Leafinity_mockup_1.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/Leafinity_mockup_2.jpg' }
        ]
    },
    {
        id: 'skypulse',
        title: 'SkyPulse Logo',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755336438/SkyPulse_Drones_Office_Mockup_mrqjlw.jpg',
        brief: {
            challenge: 'A modern logo for a fictional tech or aviation company. The name implies data signals ("Pulse") and cloud computing ("Sky").',
            solution: 'The design cleverly integrates the letters "S" and "P" into the body of a drone. The pulse line running through the center is a great way to visually represent "Pulse."'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755082552/SkyPulse_z1vkr9.svg' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755082552/SkyPulse_white.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755082552/SkyPulse_drone_mockup.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755082552/SkyPulse_card_mockup.jpg' }
        ]
    },
    {
        id: 'techwave',
        title: 'TechWave Electronics',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755166018/TechWave_Electronics_nq7ful.png',
        brief: {
            challenge: 'This logo for a fictional electronics brand uses "TechWave" to suggest modern technology and a flow of innovation.',
            solution: 'The logo directly represents the brand name with a solid vertical bar for "Tech" and a wave for "Wave." It is simple, memorable, and visually interesting.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755166018/TechWave_Electronics_nq7ful.png' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755166018/TechWave_white.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755166018/TechWave_mockup_1.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755166018/TechWave_mockup_2.jpg' }
        ]
    },
    {
        id: 'arstar',
        title: 'ARStar Logo',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/ARStar_d3vtlb.png',
        brief: {
            challenge: 'Designed for a fictional company in the Augmented Reality (AR) or entertainment space, suggesting a leading, high-quality brand.',
            solution: 'The logo combines an "A" and an "R" into a star shape, directly referencing the "AR" and "Star" in the name. The design is dynamic and modern.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/ARStar_d3vtlb.png' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/ARStar_white.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/ARStar_mockup_1.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/ARStar_mockup_2.jpg' }
        ]
    },
    {
        id: 'beanbloom',
        title: 'Bean & Bloom Logo',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755286184/bean-and-bloom-logo-mockup.jpg_nhrqkj.jpg',
        brief: {
            challenge: 'A professional mockup demonstrating the Bean & Bloom logo on a business card, showcasing its application in a real-world branding scenario.',
            solution: 'The design itself is a stylized "B" which also incorporates a coffee bean shape. The two "B"s from "Bean & Bloom" are cleverly intertwined.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755286184/bean-and-bloom-logo-mockup.jpg_nhrqkj.jpg' },
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755286184/bean-and-bloom-logo-mockup.jpg_nhrqkj.jpg' },
        ]
    },
];

const services = [
    {
        id: 'powerpoint',
        title: 'PowerPoint Presentation Design'
    },
    {
        id: 'word',
        title: 'Microsoft Word Document Formatting'
    },
    {
        id: 'excel',
        title: 'Microsoft Excel Tasks (Data Entry, Formulas, Formatting)'
    },
    {
        id: 'files',
        title: 'File Conversion (PDF, SVG, PNG, etc.)'
    },
    {
        id: 'admin',
        title: 'Data Entry & Administrative Support'
    },
    {
        id: 'excel-sample',
        title: 'SkyPulse Interactive Dashboard Sample (Excel)',
        url: 'https://res.cloudinary.com/dreresany/raw/upload/v1755082552/Interactive_Dashboard_bzwcms.xlsx'
    },
    {
        id: 'ppt-sample',
        title: 'SkyPulse (PPTX)',
        url: 'https://docs.google.com/presentation/d/1fGQv90tWiE67GIt3YMXQHENtppNDjnAQ/edit?usp=drive_link&ouid=106245665520969369871&rtpof=true&sd=true'
    }
];

const allProjects = [...designs, ...services];
