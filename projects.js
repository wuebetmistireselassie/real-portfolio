// ===================================================================================
// YOUR PORTFOLIO DATABASE
// ===================================================================================

const profileInfo = {
    imageUrl: 'https://res.cloudinary.com/dreresany/image/upload/v1755173247/My_Reality_wiyus6.png'
};

const designs = [
   {
        id: 'beanbloom',
        title: 'Bean & Bloom Logo',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755343786/Bean_and_Bloom_Coffee_Brand_Mockup_jedwwq.jpg',
        brief: {
            challenge: 'A professional mockup demonstrating the Bean & Bloom logo on a business card, showcasing its application in a real-world branding scenario.',
            solution: 'The design itself is a stylized "B" which also incorporates a coffee bean shape. The two "B"s from "Bean & Bloom" are cleverly intertwined.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755167320/Bean_and_Bloom_hfoasb.svg' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755344715/Bean_and_Bloom_White_version_fwd60r.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755343786/Bean_and_Bloom_Coffee_Brand_Mockup_jedwwq.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755286184/bean-and-bloom-logo-mockup.jpg_nhrqkj.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755344880/Bean_and_Bloom_coffee_shop_mockup_vuepvc.jpg' },
        ]
    },
    {
        id: 'skypulse',
        title: 'SkyPulse Logo',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755336438/SkyPulse_Drones_Office_Mockup_mrqjlw.jpg',
        brief: {
            challenge: 'To select a powerful and impactful hero image for the SkyPulse Drones website that effectively communicates the brand\'s professional and high-tech identity and makes a memorable first impression.',
            solution: 'The strategic selection of a hero image that transcends a simple product photo. The chosen image, a high-end corporate lobby, positions the brand not just as a drone company, but as a leading, established technology firm. This image serves as the website\'s welcoming \'front door,\' immediately conveying a message of quality and trust, and creating a strong \'wow\' factor that is both aspirational and professional.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755082552/SkyPulse_z1vkr9.svg' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336807/SkyPylse_Drones_White_vesrion_moejta.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336438/SkyPulse_Drones_Office_Mockup_mrqjlw.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336440/SkyPulse_Drones_Logo_in_Conference_Room_Mockup_kkg1rx.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336439/SkyPulse_Drones_Large_City_Banner_Mockup_tvpppz.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336439/SkyPulse_Drones_Square_Signboard_Mockup_atztth.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336438/SkyPulse_Drones_Business_Card_Mockup_kqxcql.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336437/SkyPulse_Drones_MacBook_Mockup_yednal.jpg' }
        ]
    },
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
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755082554/SkyPulse_uapeed.png' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336807/SkyPylse_Drones_White_vesrion_moejta.png' }
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
            challenge: 'To select a powerful and impactful hero image for the SkyPulse Drones website that effectively communicates the brand\'s professional and high-tech identity and makes a memorable first impression.',
            solution: 'The strategic selection of a hero image that transcends a simple product photo. The chosen image, a high-end corporate lobby, positions the brand not just as a drone company, but as a leading, established technology firm. This image serves as the website\'s welcoming \'front door,\' immediately conveying a message of quality and trust, and creating a strong \'wow\' factor that is both aspirational and professional.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755082552/SkyPulse_z1vkr9.svg' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336807/SkyPylse_Drones_White_vesrion_moejta.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336438/SkyPulse_Drones_Office_Mockup_mrqjlw.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336440/SkyPulse_Drones_Logo_in_Conference_Room_Mockup_kkg1rx.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336439/SkyPulse_Drones_Large_City_Banner_Mockup_tvpppz.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336439/SkyPulse_Drones_Square_Signboard_Mockup_atztth.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336438/SkyPulse_Drones_Business_Card_Mockup_kqxcql.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336437/SkyPulse_Drones_MacBook_Mockup_yednal.jpg' }
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
