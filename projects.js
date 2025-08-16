// ===================================================================================
// YOUR PORTFOLIO DATABASE
// ===================================================================================

const profileInfo = {
    imageUrl: 'https://res.cloudinary.com/dreresany/image/upload/v1755173247/My_Reality_wiyus6.png'
};

const designs = [
    {
        id: 'beanbloom',
        title: 'Bean & Bloom Coffee Shop',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755343786/Bean_and_Bloom_Coffee_Brand_Mockup_jedwwq.jpg',
        brief: {
            challenge: 'To create a complete and cohesive brand identity for a modern coffee shop, ensuring the logo and its elements are versatile enough to work seamlessly across a wide range of real-world applications.',
            solution: 'The brand identity centers around a clever and clean logo that integrates two coffee beans and a leaf into a stylized "B." The solution demonstrates the logo’s versatility by applying it consistently across an entire brand ecosystem, including packaging (coffee bags and paper bags), branded stationery (business cards and clipboards), and essential customer-facing items like coffee cups and mugs.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755167320/Bean_and_Bloom_hfoasb.svg' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755344715/Bean_and_Bloom_White_version_fwd60r.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755343786/Bean_and_Bloom_Coffee_Brand_Mockup_jedwwq.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755286184/bean-and-bloom-logo-mockup.jpg_nhrqkj.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755344880/Bean_and_Bloom_coffee_shop_mockup_vuepvc.jpg' },
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755367015/Bean_and_Bloom_Design_Process_1_ntpmsz.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755367081/Bean_and_Bloom_Design_Process_2_rqgtq1.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755367129/Bean_and_Bloom_Design_Process_3_ui1r9z.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755369056/Bean_and_Bloom_Design_Process_4_ixgvkk.png' },
        ]
    },
    {
        id: 'skypulse',
        title: 'SkyPulse Drones',
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
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755369252/SkyPulse_Drones_1_wane29.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755369386/SkyPulse_Drones_2_ylxxt1.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755369448/SkyPulse_Drones_3_kqmsy1.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755369447/SkyPulse_Drones_4_wdao9b.png' },
        ]
    },
    {
        id: 'techwave',
        title: 'TechWave Electronics',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755346107/TechWave_Smartphone_Clay_Mockup_qyv9tu.jpg',
        brief: {
            challenge: 'To select a powerful hero image for the TechWave Electronics website that communicates a modern, high-tech brand identity.',
            solution: 'The strategic selection of a high-tech mockup that positions the brand as a leader in innovation. The chosen image, a minimalist clay smartphone, serves as a digital touchpoint, conveying a message of quality and trust in the digital age.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755346880/TechWave_Electronics_c6lf2v.png' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755346986/White_version_bxbzte.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755346107/TechWave_Smartphone_Clay_Mockup_qyv9tu.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755346108/TechWave_Electronics_shop_Free_iMac_Mockup_fve7eh.jpg' }
        ],
        processGallery: [
            { url: 'https://placehold.co/800x600/2d3436/ffffff?text=Replace+Me' },
        ]
    },
    {
        id: 'leafinity',
        title: 'Leafinity Eco-Goods',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755353099/Leafinity_Eco-Goods_Wooden_Frame_Mockup_gaei5m.jpg',
        brief: {
            challenge: 'To create a minimalist and elegant brand identity for a sustainable goods company that not only conveys a message of environmental consciousness, but also positions the brand as a premium and artistic lifestyle choice.',
            solution: 'The logo skillfully merges a leaf with the infinity symbol to create a single, cohesive mark. The brand\'s visual identity successfully showcases this logo in a clean, artistic context, using a simple wooden frame and natural lighting to convey a message of authenticity and high quality. The chosen hero image positions the brand as an aspirational, eco-conscious statement, rather than just a product line.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755348325/Leafinity_Eco-Goods_ufcvkm.png' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755348356/Leafinity_Eco-Goods_White_version_eietmr.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755353099/Leafinity_Eco-Goods_Wooden_Frame_Mockup_gaei5m.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755353099/Leafinity_Eco-Goods_Wooden_Stamp_Mockup_djfmts.jpg' }
        ],
        processGallery: [
            { url: 'https://placehold.co/800x600/2d3436/ffffff?text=Replace+Me' },
        ]
    },
    {
        id: 'arstar',
        title: 'A&R Star Partners, LLP',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755351039/A_R_Star_Partners_Billboard_Mockup_om2hjo.jpg',
        brief: {
            challenge: 'To design a professional logo and establish a credible brand presence for a fictional professional services firm, ensuring the visual identity conveys trust, partnership, and excellence.',
            solution: 'The logo creatively merges a stylized "A" and "R" with a separate, impactful star icon, directly referencing the firm\'s name. The final brand application is showcased on a large-scale sign in a high-end corporate interior, effectively communicating the firm’s authority and prestige, and giving clients immediate confidence in its professional stature.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/ARStar_d3vtlb.png' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755348560/A_R_Star_Partners_LLP_White_version_lcsmyd.png' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755351039/A_R_Star_Partners_Billboard_Mockup_om2hjo.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755351039/A_R_Star_Partners_Sign_Mockup_1_hidp3y.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755351040/A_R_Star_Partners_Three_Banner_Flags_Mockup_a3f2p4.jpg' }
        ],
        processGallery: [
            { url: 'https://placehold.co/800x600/2d3436/ffffff?text=Replace+Me' },
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
