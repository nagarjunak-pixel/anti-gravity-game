document.addEventListener('DOMContentLoaded', () => {
    // --- TRAVEL DATA ---
    // Using the user's actual personal photos copied from iCloud Drive
    const travelData = [
        {
            id: 'south-africa',
            name: 'South Africa',
            continent: 'africa',
            continentLabel: 'Africa',
            date: 'January 2024',
            highlight: 'Table Mountain & Cape Peninsula Drive',
            type: 'Nature & Wildlife Expedition',
            heroImage: 'photos/south-africa.png',
            galleryImages: [
                'photos/PHOTO-2024-09-22-10-13-06.jpg',
                'photos/PHOTO-2024-09-22-10-13-06 2.jpg'
            ],
            snippet: 'The dramatic cliffs of Cape Point, roaring oceans, and rich wilderness safaris.',
            story: `
                <p>South Africa is a land of beautiful contrasts. Standing at Cape Point, where two oceans meet in a clash of white foam, the wind feels like it has travelled from Antarctica. The Table Mountain plateau rises majestically above Cape Town, casting a protective shadow over the harbor and colorful streets of Bo-Kaap.</p>
                <p>I spent days driving the Garden Route, encountering wild coastal stretches, dense yellowwood forests, and the vast karoo scrubland. Sitting by the campfire under the southern skies, listening to the distance call of jackals, was a reminder of the ancient, wild heart of this continent. It's a place that captures your soul and never quite lets go.</p>
            `
        },
        {
            id: 'switzerland',
            name: 'Switzerland',
            continent: 'europe',
            continentLabel: 'Europe',
            date: 'August 2023',
            highlight: 'Lauterbrunnen Valley & Jungfraujoch Pass',
            type: 'Alpine Trekking',
            heroImage: 'photos/15FC8FBB-BD67-4AA1-B3E3-7E8219AD2916.jpeg',
            galleryImages: [
                'photos/PHOTO-2024-09-22-10-13-06 3.jpg',
                'photos/PHOTO-2024-09-22-10-13-06 4.jpg'
            ],
            snippet: 'Lush green valleys, roaring alpine waterfalls, and massive snow-capped peaks.',
            story: `
                <p>Switzerland is almost impossibly beautiful. Walking through the Lauterbrunnen Valley, with its 72 waterfalls cascading down sheer limestone cliffs, you feel like you've walked into a legend. The sound of cowbells echoes across the high pastures, and the mountain air is so crisp and clean it feels like glass.</p>
                <p>I took the cogwheel train up to Jungfraujoch—the Top of Europe. Standing on the Aletsch Glacier, surrounded by monolithic peaks like the Eiger and the Mönch, the sheer scale of the Alps is breathtaking. It is a land of precise beauty and timeless wilderness, where the trails are perfectly manicured but lead into wild, snow-swept passes.</p>
            `
        },
        {
            id: 'france',
            name: 'France',
            continent: 'europe',
            continentLabel: 'Europe',
            date: 'May 2023',
            highlight: 'Eiffel Tower & Seine River sunset cruise',
            type: 'Cultural Exploration',
            heroImage: 'photos/PHOTO-2024-09-22-10-13-06.jpg',
            galleryImages: [
                'photos/PHOTO-2024-09-22-10-13-06 5.jpg',
                'photos/PHOTO-2024-09-22-10-13-06 6.jpg'
            ],
            snippet: 'Historic city boulevards, romantic riverbanks, and iconic art architecture.',
            story: `
                <p>Paris is a city designed for walking. Sitting outside a sidewalk café, watching the morning mist lift off the Seine, you realize that life here moves to a different rhythm. There is an appreciation for the fine detail—in the architecture, the food, and the quiet gardens like the Jardin du Luxembourg.</p>
                <p>Walking through Montmartre at dusk, the streets lit by soft lamps, the city feels like an open-air museum. Standing beneath the Eiffel Tower as it lights up at night, casting its golden glow across the Champ de Mars, remains one of my most cherished memories. It is a city that inspires romance and creative reflection.</p>
            `
        },
        {
            id: 'united-kingdom',
            name: 'United Kingdom',
            continent: 'europe',
            continentLabel: 'Europe',
            date: 'October 2023',
            highlight: 'London Eye & Tower Bridge Walk',
            type: 'Historical Journey',
            heroImage: 'photos/PHOTO-2024-09-22-10-13-06 3.jpg',
            galleryImages: [
                'photos/PHOTO-2024-09-22-10-13-06 7.jpg',
                'photos/PHOTO-2024-09-22-10-13-06 8.jpg'
            ],
            snippet: 'Victorian stone architectures, red double-decker buses, and misty river canals.',
            story: `
                <p>London has a weight to it that only centuries of global history can bring. Walking along the South Bank of the Thames, passing the Globe Theatre and the Tate Modern, you are constantly shifting between eras. The red phone boxes and black cabs add a classic charm to a city that is constantly reinventing itself.</p>
                <p>I spent an afternoon wandering through the British Museum, amazed by the sheer scale of the collection. At sunset, looking out from the London Eye as the city lit up below, the Parliament and Big Ben silhouetted against a purple sky, I felt the historical pulse of this historic capital.</p>
            `
        },
        {
            id: 'singapore',
            name: 'Singapore',
            continent: 'asia',
            continentLabel: 'Asia',
            date: 'February 2024',
            highlight: 'Gardens by the Bay & Marina Bay Sands',
            type: 'Modern Architecture',
            heroImage: 'photos/PHOTO-2024-09-22-10-13-06 5.jpg',
            galleryImages: [
                'photos/PHOTO-2024-09-22-10-13-06 9.jpg',
                'photos/PHOTO-2024-09-22-10-13-06.jpg'
            ],
            snippet: 'A futuristic city in a tropical garden, blending technology and conservation.',
            story: `
                <p>Singapore feels like a vision of the future. The Supertree Grove at Gardens by the Bay, with its vertical gardens rising like giant artificial trees, is a stunning synthesis of nature and technology. At night, when the light show begins and the trees glow to music, the park feels completely otherworldly.</p>
                <p>I loved the street food culture in Singapore—eating Laksa at a local Hawker Center, surrounded by a vibrant mix of cultures and languages. It is a city that is incredibly clean, safe, and efficient, representing how modern urban environments can co-exist with lush, tropical greenery.</p>
            `
        },
        {
            id: 'malaysia',
            name: 'Malaysia',
            continent: 'asia',
            continentLabel: 'Asia',
            date: 'March 2024',
            highlight: 'Petronas Twin Towers & Batu Caves',
            type: 'Cultural Exploration',
            heroImage: 'photos/PHOTO-2024-09-22-10-13-06 6.jpg',
            galleryImages: [
                'photos/PHOTO-2024-09-22-10-13-06 2.jpg',
                'photos/PHOTO-2024-09-22-10-13-06 3.jpg'
            ],
            snippet: 'Soaring skyscrapers, historic temples, and rich, multi-cultural cuisines.',
            story: `
                <p>Kuala Lumpur is a dynamic, growing metropolis. The Petronas Twin Towers, once the tallest buildings in the world, are a masterpiece of modern architecture. Looking at them from below, their chrome-and-glass skins reflecting the tropical sun, is an impressive sight.</p>
                <p>Just outside the city, climbing the 272 colorful steps to the Batu Caves, passing the massive golden statue of Lord Murugan, was a fascinating cultural experience. The limestone caves inside are massive, lit by shafts of sunlight filtering down from holes in the roof. It is a vibrant, welcoming country with a wonderful mix of Malay, Chinese, and Indian influences.</p>
            `
        },
        {
            id: 'thailand',
            name: 'Thailand',
            continent: 'asia',
            continentLabel: 'Asia',
            date: 'November 2023',
            highlight: 'Grand Palace & Bangkok Canals',
            type: 'Cultural Immersion',
            heroImage: 'photos/PHOTO-2024-09-22-10-13-06 7.jpg',
            galleryImages: [
                'photos/PHOTO-2024-09-22-10-13-06 4.jpg',
                'photos/PHOTO-2024-09-22-10-13-06 5.jpg'
            ],
            snippet: 'Ornate golden spires, chaotic canal markets, and serene Buddhist monasteries.',
            story: `
                <p>Bangkok is a city of high energy. In the canals, longtail boats zip past stilt houses, while on the roads, colorful tuk-tuks navigate through traffic with absolute confidence. The scent of lemongrass, chili, and street food fills the air, creating a sensory overload that is uniquely Thai.</p>
                <p>The Grand Palace remains one of the most ornate places I have ever visited. The complex details of the temples, covered in tiny pieces of colored glass and gold leaf, glow in the tropical heat. But inside the Wat Pho temple, in the presence of the massive Reclining Buddha, the city's chaos melts away into deep silence.</p>
            `
        },
        {
            id: 'indonesia',
            name: 'Indonesia',
            continent: 'asia',
            continentLabel: 'Asia',
            date: 'December 2023',
            highlight: 'Ubud Rice Terraces & Uluwatu Cliffs',
            type: 'Nature & Wellness',
            heroImage: 'photos/PHOTO-2024-09-22-10-13-06 8.jpg',
            galleryImages: [
                'photos/PHOTO-2024-09-22-10-13-06 6.jpg',
                'photos/PHOTO-2024-09-22-10-13-06 7.jpg'
            ],
            snippet: 'Lush green rice terraces, dramatic sea cliffs, and peaceful island retreats.',
            story: `
                <p>Bali has a spiritual, calm energy that is hard to put into words. Walking through the Tegallalang Rice Terraces in the early morning, before the crowds arrived, the terraced fields looked like green steps leading up to the sky, lit by soft rays of light filtering through coconut palms.</p>
                <p>At Uluwatu Temple, sitting on the edge of a cliff 70 meters above the roaring Indian Ocean, I watched the sunset while the traditional Kecak fire dance began. The rhythmic chanting of the dancers, combined with the sound of waves crashing against the rocks below, created a powerful, memorable atmosphere.</p>
            `
        },
        {
            id: 'netherlands',
            name: 'Netherlands',
            continent: 'europe',
            continentLabel: 'Europe',
            date: 'April 2023',
            highlight: 'Amsterdam Canals & Tulip Fields',
            type: 'Leisure & Biking',
            heroImage: 'photos/b70187bb-8e62-4728-ade5-a449c48e8085.JPG',
            galleryImages: [
                'photos/efc41660-1359-4776-bd11-23189810d0bc.JPG',
                'photos/PHOTO-2024-09-22-10-13-06.jpg'
            ],
            snippet: 'Charming canal houses, fields of blooming tulips, and a relaxed, bike-centric lifestyle.',
            story: `
                <p>Amsterdam is a city built on water and designed for leisure. Renting a bicycle and riding along the narrow streets, crossing ancient stone bridges over tree-lined canals, is the best way to experience the city. The tall, thin canal houses with their tilted fronts have a unique, historic charm.</p>
                <p>I visited the Keukenhof Gardens during the spring, where millions of tulips were in full bloom. The fields looked like vast, colorful carpets of red, yellow, and purple stretching out to the horizon. It is a country that is flat, beautiful, and deeply practical, celebrating simple pleasures like a warm stroopwafel beside a quiet canal.</p>
            `
        },
        {
            id: 'belgium',
            name: 'Belgium',
            continent: 'europe',
            continentLabel: 'Europe',
            date: 'May 2023',
            highlight: 'Bruges Historic Canal Walk & Brussels Grand Place',
            type: 'Historical & Gastronomy',
            heroImage: 'photos/efc41660-1359-4776-bd11-23189810d0bc.JPG',
            galleryImages: [
                'photos/b70187bb-8e62-4728-ade5-a449c48e8085.JPG',
                'photos/PHOTO-2024-09-22-10-13-06 2.jpg'
            ],
            snippet: 'Medieval stone towers, cobblestone streets, and the world\'s finest chocolate.',
            story: `
                <p>Walking through the medieval city of Bruges feels like stepping back in time. The cobblestone streets, old brick bridges, and winding canals are lined with gothic buildings that have stood for centuries. The Belfry tower dominates the market square, its bells ringing out across the rooftops.</p>
                <p>Belgium is a paradise for food lovers. I spent days tasting handmade chocolates, fresh waffles covered in strawberries, and exploring the historic Grand Place in Brussels, which is surrounded by guild halls decorated in gold leaf. It is a small country rich in history, art, and architectural details.</p>
            `
        }
    ];

    // --- DOM ELEMENTS ---
    const countriesGrid = document.getElementById('countries-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const journalDrawer = document.getElementById('journal-drawer');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    
    const drawerHeroImg = document.getElementById('drawer-hero-img');
    const drawerMetaContinent = document.getElementById('drawer-meta-continent');
    const drawerCountryName = document.getElementById('drawer-country-name');
    const drawerMetaDate = document.getElementById('drawer-meta-date');
    const drawerMetaHighlight = document.getElementById('drawer-meta-highlight');
    const drawerMetaType = document.getElementById('drawer-meta-type');
    const drawerStoryText = document.getElementById('drawer-story-text');
    const drawerGalleryGrid = document.getElementById('drawer-gallery-grid');

    // --- PORTFOLIO CARD RENDER ---
    function renderCountryCards(items) {
        countriesGrid.innerHTML = '';
        
        items.forEach((item, index) => {
            const card = document.createElement('article');
            card.className = 'country-card';
            card.dataset.continent = item.continent;
            card.style.animation = `fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s forwards`;
            
            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${item.heroImage}" alt="${item.name}" class="card-img" loading="lazy">
                    <div class="card-img-overlay"></div>
                </div>
                <div class="card-body">
                    <span class="card-continent">${item.continentLabel}</span>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-snippet">${item.snippet}</p>
                </div>
            `;
            
            card.addEventListener('click', () => openJournal(item));
            countriesGrid.appendChild(card);
        });
    }

    // --- DRAWER OPEN/CLOSE ---
    function openJournal(item) {
        // Set Image & Details
        drawerHeroImg.src = item.heroImage;
        drawerHeroImg.alt = item.name;
        drawerMetaContinent.textContent = item.continentLabel;
        drawerCountryName.textContent = item.name;
        drawerMetaDate.textContent = item.date;
        drawerMetaHighlight.textContent = item.highlight;
        drawerMetaType.textContent = item.type;
        drawerStoryText.innerHTML = item.story;

        // Render mini-gallery
        drawerGalleryGrid.innerHTML = item.galleryImages.map(img => `
            <div class="gallery-img-wrapper">
                <img src="${img}" alt="Snapshots of ${item.name}" loading="lazy">
            </div>
        `).join('');

        // Activate drawer classes
        journalDrawer.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent scrolling behind
    }

    function closeJournal() {
        journalDrawer.classList.remove('active');
        document.body.style.overflow = ''; // restore scrolling
    }

    // --- STATS COUNTER ANIMATION ---
    function animateCounters() {
        const counters = [
            { id: 'stat-countries', target: 72 },
            { id: 'stat-continents', target: 6 },
            { id: 'stat-cities', target: 340 },
            { id: 'stat-miles', target: 450 }
        ];

        counters.forEach(counter => {
            const el = document.getElementById(counter.id);
            if (!el) return;

            let current = 0;
            const target = counter.target;
            const duration = 1800; // ms
            const stepTime = Math.max(Math.floor(duration / target), 12);
            
            const timer = setInterval(() => {
                current += Math.ceil(target / (duration / stepTime));
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = current + (counter.id === 'stat-miles' ? 'k' : '');
            }, stepTime);
        });
    }

    // --- CONTINENT FILTERS ---
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active classes
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active to current click
            button.classList.add('active');

            const filterValue = button.dataset.filter;
            
            if (filterValue === 'all') {
                renderCountryCards(travelData);
            } else {
                const filtered = travelData.filter(item => item.continent === filterValue);
                renderCountryCards(filtered);
            }
        });
    });

    // --- EVENT TRIGGERS ---
    btnCloseDrawer.addEventListener('click', closeJournal);
    drawerOverlay.addEventListener('click', closeJournal);
    
    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && journalDrawer.classList.contains('active')) {
            closeJournal();
        }
    });

    // Initial setups
    renderCountryCards(travelData);
    animateCounters();
});
