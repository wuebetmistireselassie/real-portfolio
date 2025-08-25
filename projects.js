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
        // 👇 ADDED LINE
        brandGuidelinesPdf: 'URL/to/your/beanbloom-guidelines.pdf',
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
        // 👇 ADDED LINE
        brandGuidelinesPdf: 'URL/to/your/skypulse-guidelines.pdf',
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
        // 👇 ADDED LINE
        brandGuidelinesPdf: 'URL/to/your/techwave-guidelines.pdf',
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755346107/TechWave_Smartphone_Clay_Mockup_qyv9tu.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755346108/TechWave_Electronics_shop_Free_iMac_Mockup_fve7eh.jpg' }
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755371139/TechWave_1_yaharz.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755371140/TechWave_2_xvvvhz.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755371140/TechWave_3_ufqss3.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755371141/TechWave_4_tc3qyd.png' },
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
        // 👇 ADDED LINE
        brandGuidelinesPdf: 'URL/to/your/leafinity-guidelines.pdf',
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755353099/Leafinity_Eco-Goods_Wooden_Frame_Mockup_gaei5m.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755353099/Leafinity_Eco-Goods_Wooden_Stamp_Mockup_djfmts.jpg' }
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755373521/Leafinity_Eco-Goods_1_pupy0c.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755373521/Leafinity_Eco-Goods_2_otwa1b.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755373522/Leafinity_Eco-Goods_3_wfvwmo.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755373521/Leafinity_Eco-Goods_4_ylwbqe.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755373520/Leafinity_Eco-Goods_5_xifuqg.png' },
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
        // 👇 ADDED LINE
        brandGuidelinesPdf: 'URL/to/your/arstar-guidelines.pdf',
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755351039/A_R_Star_Partners_Billboard_Mockup_om2hjo.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755351039/A_R_Star_Partners_Sign_Mockup_1_hidp3y.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755351040/A_R_Star_Partners_Three_Banner_Flags_Mockup_a3f2p4.jpg' }
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755375260/A_R_Star_Partners_1_w2xvge.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755375261/A_R_Star_Partners_2_kmrolw.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755375260/A_R_Star_Partners_3_cci0wa.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755375260/A_R_Star_Partners_4_ihhhe5.png' },
        ]
    },
    {
        id: 'ironcore',
        title: 'IronCore Fitness center',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755542035/IRONCORE_Business_Card_6_if2g8z.jpg',
        brief: {
            challenge: 'The challenge was to launch a new, premium fitness brand in a competitive market. IronCore needed a powerful and modern logo that conveyed strength and professionalism, and was versatile enough for both gym apparel and corporate branding.',
            solution: 'The solution is a bold and minimalist brand identity. A simplified weight plate icon inside a modern hexagonal shield, paired with a powerful, solid font, creates a mark that communicates core strength and professionalism. The final design successfully positions IronCore Fitness as a premium leader in the industry.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755542139/IronCore_Fitness_Gym_training_black_d1ex3p.png' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755542139/IronCore_Fitness_Gym_training_white_bjtbxb.png' }
        ],
        // 👇 ADDED LINE
        brandGuidelinesPdf: 'URL/to/your/ironcore-guidelines.pdf',
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755542035/IRONCORE_Business_Card_6_if2g8z.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755542035/IRONECORE_T-Shirt_Mannequin_Mockup_2_kzfcug.jpg' }
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755543943/IronCore_Fitness_Gym_training_1_djteii.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755543945/IronCore_Fitness_Gym_training_2_tdlcv7.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755543943/IronCore_Fitness_Gym_training_3_y3dsry.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755543943/IronCore_Fitness_Gym_training_4_lztpl6.png' },
        ]
    },
    {
        id: 'unicombo',
        title: 'UniCombo Gaming Website',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755554301/UniCombo_Mackbook_Mockup_nok8ri.jpg',
        brief: {
            challenge: 'The challenge was to design a unique and memorable brand identity for "UniCombo," a new, all-in-one entertainment web app. The logo needed to be modern, vibrant, and instantly communicate the idea of "unlimited combinations" of entertainment, all available at the click of a button.',
            solution: 'The solution is a clever and dynamic logomark that visually fuses a "power on" symbol with an "infinity" loop, creating a unique shape that communicates "always-on, endless entertainment." A vibrant purple-to-blue gradient gives the brand a modern, digital-first feel that is energetic and trustworthy.'
        },
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755554178/UniCombo_mobile_App_cjzwyr.png' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755554178/UniCombo_mobile_App_white_version_pfrhqc.png' }
        ],
        // 👇 ADDED LINE
        brandGuidelinesPdf: 'URL/to/your/unicombo-guidelines.pdf',
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755554301/UniCombo_Mackbook_Mockup_nok8ri.jpg' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755554300/Unicombo_Smartphone_Mockup_i7elc4.jpg' }
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755555875/UniCombo_1_kql7qs.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755555876/UniCombo_2_eipglo.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755555875/UniCombo_3_rxsckk.png' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755555875/UniCombo_4_rzqr3v.png' },
        ]
    }
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
