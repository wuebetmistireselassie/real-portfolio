// ===================================================================================
// YOUR PORTFOLIO DATABASE (FINAL SEO VERSION)
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
        altText: 'Bean & Bloom coffee shop logo design on branded stationery mockup.',
        brief: {
            challenge: 'To create a complete and cohesive brand identity for a modern coffee shop, ensuring the logo and its elements are versatile enough to work seamlessly across a wide range of real-world applications.',
            solution: 'The brand identity centers around a clever and clean logo that integrates two coffee beans and a leaf into a stylized "B." The solution demonstrates the logo’s versatility by applying it consistently across an entire brand ecosystem, including packaging, branded stationery, and essential customer-facing items like coffee cups and mugs.'
        },
        brandGuidelinesUrl: 'https://raw.githubusercontent.com/wuebetmistireselassie/documents/main/Bean_and_Bloom_Brand_Guidelines.pdf',
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755167320/Bean_and_Bloom_hfoasb.svg', altText: 'Full color vector logo for Bean & Bloom.' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755344715/Bean_and_Bloom_White_version_fwd60r.png', altText: 'White version of Bean & Bloom logo for dark backgrounds.' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755343786/Bean_and_Bloom_Coffee_Brand_Mockup_jedwwq.jpg', altText: 'Full stationery mockup for Bean & Bloom coffee brand.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755286184/bean-and-bloom-logo-mockup.jpg_nhrqkj.jpg', altText: 'Bean & Bloom logo on a professional business card mockup.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755344880/Bean_and_Bloom_coffee_shop_mockup_vuepvc.jpg', altText: 'Storefront sign mockup for Bean & Bloom coffee shop.' },
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755367015/Bean_and_Bloom_Design_Process_1_ntpmsz.png', altText: 'Bean & Bloom logo design process step 1: basic shapes in Illustrator.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755367081/Bean_and_Bloom_Design_Process_2_rqgtq1.png', altText: 'Bean & Bloom logo design process step 2: vector construction.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755367129/Bean_and_Bloom_Design_Process_3_ui1r9z.png', altText: 'Bean & Bloom logo design process step 3: vector outline.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755369056/Bean_and_Bloom_Design_Process_4_ixgvkk.png', altText: 'Bean & Bloom logo design process step 4: final colored mark.' },
        ]
    },
    {
        id: 'skypulse',
        title: 'SkyPulse Drones',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755336438/SkyPulse_Drones_Office_Mockup_mrqjlw.jpg',
        altText: 'SkyPulse Drones logo design on a modern office wall mockup.',
        brief: {
            challenge: 'To create a professional and high-tech brand identity for SkyPulse Drones that establishes them as a leader in the aerial technology sector.',
            solution: 'The brand identity was built around a modern, geometric drone icon that incorporates the company initials and a pulse wave. This is showcased in a high-end corporate lobby mockup, positioning the brand as a leading, established technology firm and conveying immediate trust and quality.'
        },
        brandGuidelinesUrl: 'https://raw.githubusercontent.com/wuebetmistireselassie/documents/main/SkyPulse_Brand_Guidelines.pdf',
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755082552/SkyPulse_z1vkr9.svg', altText: 'Full color vector logo for SkyPulse Drones.' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336807/SkyPylse_Drones_White_vesrion_moejta.png', altText: 'White version of SkyPulse Drones logo.' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336438/SkyPulse_Drones_Office_Mockup_mrqjlw.jpg', altText: '3D wall logo mockup for SkyPulse Drones.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336440/SkyPulse_Drones_Logo_in_Conference_Room_Mockup_kkg1rx.jpg', altText: 'SkyPulse logo in a corporate conference room.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755336439/SkyPulse_Drones_Large_City_Banner_Mockup_tvpppz.jpg', altText: 'SkyPulse logo on a large outdoor city banner.' },
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755369252/SkyPulse_Drones_1_wane29.png', altText: 'SkyPulse logo design process step 1: base shape.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755369386/SkyPulse_Drones_2_ylxxt1.png', altText: 'SkyPulse logo design process step 2: integrating elements.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755369448/SkyPulse_Drones_3_kqmsy1.png', altText: 'SkyPulse logo design process step 3: vector outline construction.' },
        ]
    },
    {
        id: 'techwave',
        title: 'TechWave Electronics',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755346107/TechWave_Smartphone_Clay_Mockup_qyv9tu.jpg',
        altText: 'TechWave Electronics logo design on a modern smartphone mockup.',
        brief: {
            challenge: 'To select a powerful hero image for the TechWave Electronics website that communicates a modern, high-tech brand identity.',
            solution: 'The strategic selection of a high-tech mockup that positions the brand as a leader in innovation. The chosen image, a minimalist clay smartphone, serves as a digital touchpoint, conveying a message of quality and trust in the digital age.'
        },
        brandGuidelinesUrl: 'https://raw.githubusercontent.com/wuebetmistireselassie/documents/main/TechWave_Brand_Guidelines.pdf',
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755346880/TechWave_Electronics_c6lf2v.png', altText: 'Full color logo for TechWave Electronics.' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755346986/White_version_bxbzte.png', altText: 'White version of TechWave Electronics logo.' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755346107/TechWave_Smartphone_Clay_Mockup_qyv9tu.jpg', altText: 'TechWave logo on a clay smartphone mockup.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755346108/TechWave_Electronics_shop_Free_iMac_Mockup_fve7eh.jpg', altText: 'TechWave Electronics logo on an iMac screen.' }
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755371139/TechWave_1_yaharz.png', altText: 'TechWave logo design process step 1.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755371140/TechWave_2_xvvvhz.png', altText: 'TechWave logo design process step 2.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755371140/TechWave_3_ufqss3.png', altText: 'TechWave logo design process step 3.' },
        ]
    },
    {
        id: 'leafinity',
        title: 'Leafinity Eco-Goods',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755353099/Leafinity_Eco-Goods_Wooden_Frame_Mockup_gaei5m.jpg',
        altText: 'Leafinity Eco-Goods logo design in a wooden frame mockup.',
        brief: {
            challenge: 'To create a minimalist and elegant brand identity for a sustainable goods company that not only conveys a message of environmental consciousness, but also positions the brand as a premium and artistic lifestyle choice.',
            solution: 'The logo skillfully merges a leaf with the infinity symbol to create a single, cohesive mark. The brand\'s visual identity successfully showcases this logo in a clean, artistic context, using a simple wooden frame and natural lighting to convey a message of authenticity and high quality.'
        },
        brandGuidelinesUrl: 'https://raw.githubusercontent.com/wuebetmistireselassie/documents/main/Leafinity_Brand_Guidelines.pdf',
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755348325/Leafinity_Eco-Goods_ufcvkm.png', altText: 'Full color logo for Leafinity Eco-Goods.' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755348356/Leafinity_Eco-Goods_White_version_eietmr.png', altText: 'White version of Leafinity Eco-Goods logo.' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755353099/Leafinity_Eco-Goods_Wooden_Frame_Mockup_gaei5m.jpg', altText: 'Leafinity logo in a wooden frame mockup.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755353099/Leafinity_Eco-Goods_Wooden_Stamp_Mockup_djfmts.jpg', altText: 'Leafinity logo on a wooden stamp mockup.' }
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755373521/Leafinity_Eco-Goods_1_pupy0c.png', altText: 'Leafinity logo design process step 1.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755373521/Leafinity_Eco-Goods_2_otwa1b.png', altText: 'Leafinity logo design process step 2.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755373522/Leafinity_Eco-Goods_3_wfvwmo.png', altText: 'Leafinity logo design process step 3.' },
        ]
    },
    {
        id: 'arstar',
        title: 'A&R Star Partners, LLP',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755351039/A_R_Star_Partners_Billboard_Mockup_om2hjo.jpg',
        altText: 'A&R Star Partners, LLP logo on a corporate billboard mockup.',
        brief: {
            challenge: 'To design a professional logo and establish a credible brand presence for a fictional professional services firm, ensuring the visual identity conveys trust, partnership, and excellence.',
            solution: 'The logo creatively merges a stylized "A" and "R" with an impactful star icon. The final brand application is showcased on a large-scale sign in a high-end corporate interior, effectively communicating the firm’s authority and prestige.'
        },
        brandGuidelinesUrl: 'https://raw.githubusercontent.com/wuebetmistireselassie/documents/main/A%20%26%20R%20Stars_Brand_Guidelines.pdf',
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755076464/ARStar_d3vtlb.png', altText: 'Full color logo for A&R Star Partners.' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755348560/A_R_Star_Partners_LLP_White_version_lcsmyd.png', altText: 'White version of A&R Star Partners logo.' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755351039/A_R_Star_Partners_Billboard_Mockup_om2hjo.jpg', altText: 'Billboard mockup for A&R Star Partners.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755351039/A_R_Star_Partners_Sign_Mockup_1_hidp3y.jpg', altText: 'Round outdoor sign mockup for A&R Star Partners.' },
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755375260/A_R_Star_Partners_1_w2xvge.png', altText: 'A&R Star Partners logo design process step 1.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755375261/A_R_Star_Partners_2_kmrolw.png', altText: 'A&R Star Partners logo design process step 2.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755375260/A_R_Star_Partners_3_cci0wa.png', altText: 'A&R Star Partners logo design process step 3.' },
        ]
    },
    {
        id: 'ironcore',
        title: 'IronCore Fitness',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755542035/IRONCORE_Business_Card_6_if2g8z.jpg',
        altText: 'IronCore Fitness logo on a modern black business card mockup.',
        brief: {
            challenge: 'The challenge was to launch a new, premium fitness brand in a competitive market. IronCore needed a powerful and modern logo that conveyed strength and professionalism, and was versatile enough for both gym apparel and corporate branding.',
            solution: 'The solution is a bold and minimalist brand identity. A simplified weight plate icon inside a modern hexagonal shield, paired with a powerful, solid font, creates a mark that communicates core strength and professionalism.'
        },
        brandGuidelinesUrl: 'https://raw.githubusercontent.com/wuebetmistireselassie/documents/main/IronCore%20_Brand_Guidelines.pdf',
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755542139/IronCore_Fitness_Gym_training_black_d1ex3p.png', altText: 'Full color logo for IronCore Fitness.' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755542139/IronCore_Fitness_Gym_training_white_bjtbxb.png', altText: 'White version of IronCore Fitness logo.' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755542035/IRONCORE_Business_Card_6_if2g8z.jpg', altText: 'Business card mockup for IronCore Fitness.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755542035/IRONECORE_T-Shirt_Mannequin_Mockup_2_kzfcug.jpg', altText: 'IronCore Fitness logo on a t-shirt mockup.' }
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755543943/IronCore_Fitness_Gym_training_1_djteii.png', altText: 'IronCore Fitness logo design process step 1.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755543945/IronCore_Fitness_Gym_training_2_tdlcv7.png', altText: 'IronCore Fitness logo design process step 2.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755543943/IronCore_Fitness_Gym_training_3_y3dsry.png', altText: 'IronCore Fitness logo design process step 3.' },
        ]
    },
    {
        id: 'unicombo',
        title: 'UniCombo App',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1755554301/UniCombo_Mackbook_Mockup_nok8ri.jpg',
        altText: 'UniCombo app logo on a MacBook screen mockup.',
        brief: {
            challenge: 'The challenge was to design a unique and memorable brand identity for "UniCombo," a new, all-in-one entertainment web app. The logo needed to be modern, vibrant, and instantly communicate the idea of "unlimited combinations" of entertainment, all available at the click of a button.',
            solution: 'The solution is a clever and dynamic logomark that visually fuses a "power on" symbol with an "infinity" loop, creating a unique shape that communicates "always-on, endless entertainment." A vibrant purple-to-blue gradient gives the brand a modern, digital-first feel.'
        },
        brandGuidelinesUrl: 'https://raw.githubusercontent.com/wuebetmistireselassie/documents/main/UniCombo_Brand_Guidelines.pdf',
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755554178/UniCombo_mobile_App_cjzwyr.png', altText: 'Full color logo for UniCombo app.' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1755554178/UniCombo_mobile_App_white_version_pfrhqc.png', altText: 'White version of UniCombo app logo.' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755554301/UniCombo_Mackbook_Mockup_nok8ri.jpg', altText: 'UniCombo logo on a MacBook mockup.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755554300/Unicombo_Smartphone_Mockup_i7elc4.jpg', altText: 'UniCombo logo on a smartphone screen mockup.' }
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755555875/UniCombo_1_kql7qs.png', altText: 'UniCombo logo design process step 1.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755555876/UniCombo_2_eipglo.png', altText: 'UniCombo logo design process step 2.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1755555875/UniCombo_3_rxsckk.png', altText: 'UniCombo logo design process step 3.' },
        ]
    },
    {
        id: 'moneyflow',
        title: 'Money Flow Digital Game Zone',
        category: 'logo',
        heroImage: 'https://res.cloudinary.com/dreresany/image/upload/v1756394636/Money_Flow_Digital_Game_Zone_App_Icon_Mockup_pjde75.jpg',
        altText: 'Money Flow app logo on a 3D app icon mockup.',
        brief: {
            challenge: 'To create a memorable logo for the "Money Flow" financial app that visually represents cash flow and works as a versatile app icon in both full-color and monochrome.',
            solution: 'The logo uses a central dollar sign ($) encircled by looping arrows to clearly symbolize financial circulation. Its versatility is demonstrated with both a vibrant, multi-color version for a modern feel and a clean, single-color version for simplicity. The mockups confirm the design works perfectly as a scalable and instantly recognizable app icon.'
        },
        brandGuidelinesUrl: 'https://raw.githubusercontent.com/wuebetmistireselassie/documents/main/Money%20Flow_Brand_Guidelines.pdf',
        logoVariations: [
            { type: 'full', url: 'https://res.cloudinary.com/dreresany/image/upload/v1756394686/Money_Flow_Digital_Game_Zone_kdooih.png', altText: 'Full color logo for Money Flow app.' },
            { type: 'white', url: 'https://res.cloudinary.com/dreresany/image/upload/v1756394686/white_version_mpithi.png', altText: 'White version of Money Flow app logo.' }
        ],
        mockupGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1756394636/Money_Flow_Digital_Game_Zone_App_Icon_Mockup_pjde75.jpg', altText: 'Money Flow logo on a colorful 3D app icon.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1756394637/Money_Flow_Digital_Game_Zone_Monocolor_App_Icon_Mockup_vl9wbr.jpg', altText: 'Monochrome version of the Money Flow app icon.' },
        ],
        processGallery: [
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1756395766/Money_Flow_1_venekp.png', altText: 'Money Flow logo design process step 1.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1756395766/Money_Flow_2_o7cnto.png', altText: 'Money Flow logo design process step 2.' },
            { url: 'https://res.cloudinary.com/dreresany/image/upload/v1756395766/Money_Flow_3_i69h0l.png', altText: 'Money Flow logo design process step 3.' },
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
