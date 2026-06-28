// The Rising Stars - Consolidated Client Trek Database
const TREKS_DATA = [
  // ==========================================
  // --- MAHARASHTRA ZONE (6 Treks) -----------
  // ==========================================
  {
    id: "kalsubai",
    name: "Kalsubai Peak Sunrise Trek",
    zone: "maharashtra",
    zoneLabel: "Maharashtra",
    difficulty: "Moderate",
    duration: "1 Day / 1 Night",
    elevation: "5,400 ft",
    groupSize: "15-20",
    price: "₹1,499",
    description: "Conquer the highest peak of Maharashtra and experience a breathtaking sunrise above a blanket of clouds.",
    longDescription: "Kalsubai Peak is the highest point in Maharashtra, standing at an elevation of 5,400 feet. The trek offers a mix of easy-to-climb iron ladders, rocky patches, and beautiful grassy slopes. From the summit, you get a 360-degree panoramic view of the Sahyadri ranges, Bhandardara dam, and surrounding forts like Alang, Madan, and Kulang. Reaching the temple at the summit just in time for sunrise is a spiritual and adventurous highlight.",
    tags: ["Peak", "Sunrise", "Sahyadris"],
    bestSeason: "June to February (Monsoon for lush greenery, Winter for cool climate)",
    meetingPoint: "Kasara Railway Station (10:00 PM)",
    mapCoords: { x: 155, y: 405 },
    gallery: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1 - 10:00 PM", title: "Meeting & Travel", desc: "Gather at Kasara station, board local transfer vehicles to Bari Village (Base Camp)." },
      { day: "Day 2 - 02:00 AM", title: "Base Camp & Briefing", desc: "Reach Bari, rest for a while, and start the night climb after a safety briefing and tea." },
      { day: "Day 2 - 06:00 AM", title: "The Summit Sunrise", desc: "Conquer the peak! Pay respects at Kalsubai temple and witness a legendary golden sunrise above the clouds." },
      { day: "Day 2 - 08:30 AM", title: "Descent & Breakfast", desc: "Begin descent back to Bari. Enjoy piping hot local Maharashtrian breakfast (Poha & Chai) at the base." },
      { day: "Day 2 - 01:00 PM", title: "Return Journey", desc: "Travel back to Kasara station with lifelong memories and group photos." }
    ],
    inclusions: ["Kasara to Base travel", "Local Breakfast & Lunch", "First Aid Support", "Expert Trek Leaders", "Forest entry charges"],
    exclusions: ["Dinner on Day 1", "Personal mineral water", "Anything not mentioned in inclusions"]
  },
  {
    id: "sandhan",
    name: "Sandhan Valley Full Descent",
    zone: "maharashtra",
    zoneLabel: "Maharashtra",
    difficulty: "Challenging",
    duration: "2 Days / 1 Night",
    elevation: "3,000 ft",
    groupSize: "12-15",
    price: "₹2,799",
    description: "Walk through the 'Valley of Shadows'—a massive water-carved canyon with rappelling and pool wading.",
    longDescription: "Sandhan Valley is one of the greatest canyons in the Sahyadri mountains. It is a brilliant water-carved valley about 200 feet deep and 2.5 km long. Surrounded by mighty forts like Alang, Madan, and Kulang, this trek involves descending through deep narrow crevices, wading through chest-deep cold water pools, and technical rappelling down multiple vertical rock faces. Sleep under the starlit sky at the base camp near the river bed.",
    tags: ["Waterfall", "Valley", "Rappelling"],
    bestSeason: "November to May (Strictly closed during Monsoons for safety)",
    meetingPoint: "Kasara Railway Station (11:00 PM)",
    mapCoords: { x: 145, y: 415 },
    gallery: [
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800",
      "https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1", title: "Journey to Samrad", desc: "Travel from Kasara to Samrad Village. Overnight stay in a village home." },
      { day: "Day 2 - 06:00 AM", title: "Canyon Descent Starts", desc: "Enter the valley. Wade through cold water pools and cross rocky boulders under narrow shadowed walls." },
      { day: "Day 2 - 11:00 AM", title: "Rappelling Thrill", desc: "Rappel down the 45-ft vertical rock patch with certified safety gear and anchors." },
      { day: "Day 2 - 05:00 PM", title: "Base Camping", desc: "Reach the beautiful wide valley base. Enjoy a fresh village dinner around a cozy bonfire under millions of stars." },
      { day: "Day 3 - 07:00 AM", title: "Dehne Trek & Return", desc: "Hike towards Dehne village, have breakfast, and board private buses back to Asangaon station." }
    ],
    inclusions: ["Tented camping", "Technical rappelling gear & guides", "All meals (local veg)", "Trek permits", "Kasara to Dehne transfers"],
    exclusions: ["Personal backpack carrying", "Extra snacks/beverages", "Travel up to Kasara"]
  },
  {
    id: "andharban",
    name: "Andharban Dark Forest Trek",
    zone: "maharashtra",
    zoneLabel: "Maharashtra",
    difficulty: "Easy",
    duration: "1 Day",
    elevation: "2,160 ft",
    groupSize: "20-25",
    price: "₹1,350",
    description: "Hike through a dense, dark evergreen forest canopy punctuated by misty valleys and waterfalls.",
    longDescription: "Andharban literally translates to 'Dark Forest'. This trek is an absolute favorite during the monsoons. It is a complete descent trek starting from Pimpri dam and ending at Bhira dam (the source of Kundalika river). The entire trail passes through thick, closed-canopy jungle where sunlight rarely touches the ground. The route runs along cliff edges looking over the Devkund waterfall valley and is constantly bathed in heavy mist and roaring streams.",
    tags: ["Jungle", "Waterfall", "Mist"],
    bestSeason: "July to September (Peak Monsoon experience)",
    meetingPoint: "Pune (Shivajinagar) - 05:00 AM / Mumbai (Pritam Hotel Dadar) - 04:00 AM",
    mapCoords: { x: 135, y: 435 },
    gallery: [
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800",
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800",
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1 - 04:30 AM", title: "Travel to Pimpri", desc: "Depart early in private AC buses from Dadar/Pune with breakfast served on board." },
      { day: "Day 1 - 08:30 AM", title: "Enter the Jungle", desc: "Arrive at the trailhead. Safety briefing and start the hike into the dense forest canopy." },
      { day: "Day 1 - 12:00 PM", title: "Valley Viewpoint", desc: "Reach the gorgeous ridge looking down at the Kundalika Valley and the distant Devkund waterfalls." },
      { day: "Day 1 - 03:00 PM", title: "Bhira Dam Descent", desc: "Walk out of the forest down to Bhira village. Change clothes and enjoy a delicious hot lunch." },
      { day: "Day 1 - 05:00 PM", title: "Return Journey", desc: "Board the bus and travel back to Mumbai/Pune, reaching by late evening." }
    ],
    inclusions: ["AC Travel (Mumbai/Pune to-and-fro)", "Morning Breakfast & Local Lunch", "Expert Guides & Safety Gear", "Forest Department Permits"],
    exclusions: ["Personal change room toiletries", "Insurance", "Any personal shopping"]
  },
  {
    id: "hemalkasa",
    name: "Hemalkasa Forest Trail",
    zone: "mp",
    zoneLabel: "Madhya Pradesh",
    difficulty: "Moderate",
    duration: "2 Days / 1 Night",
    elevation: "1,100 ft",
    groupSize: "10-12",
    price: "₹3,499",
    description: "Explore the deep Eastern forests of Maharashtra, home to pristine tribal villages and rare wildlife sanctuaries.",
    longDescription: "The Hemalkasa Forest Trail is a unique wilderness and social exploration in the far eastern Gadchiroli district. Trek through dense deciduous sal and teak woodlands populated by indigenous Gond tribes. Visit the renowned Lok Biradari Prakalp animal orphanage and sanctuary, founded by Dr. Prakash Amte, where leopards, bears, and crocodiles co-exist. Camp near tranquil forest streams and experience the raw flora and fauna of Central India's most isolated jungle.",
    tags: ["Jungle", "Wildlife", "Culture"],
    bestSeason: "October to March (Comfortable winter weather, excellent bird activity)",
    meetingPoint: "Nagpur Junction Railway Station (07:00 AM)",
    mapCoords: { x: 285, y: 360 },
    gallery: [
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800",
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1", title: "Nagpur to Hemalkasa Offroad", desc: "Meet at Nagpur, drive through dense forest roads to Hemalkasa base. Pitch tents along the Bandia River." },
      { day: "Day 2 - 06:00 AM", title: "Tiger-Cat Forest Scramble", desc: "Wake up early. Go on a guided jungle walk with local Madia Gond trackers. Spot wild deer and giant woodpeckers." },
      { day: "Day 2 - 12:00 PM", title: "Amte Sanctuary Visit", desc: "Visit the animal orphanage project. Witness wild animals living in open harmony. Share traditional tribal lunch." },
      { day: "Day 2 - 04:30 PM", title: "Return Ride", desc: "Board the jeeps back to Nagpur, enjoying a spectacular sunset over the Gadchiroli forest canopy." }
    ],
    inclusions: ["Nagpur to base SUV transport", "Jungle camping & meals", "Local tribal tracker fees", "Project entry permits"],
    exclusions: ["Train/Flight tickets to Nagpur", "Camera fees", "Personal mineral water"]
  },
  {
    id: "tadoba",
    name: "Tadoba Safari & Lake Hike",
    zone: "mp",
    zoneLabel: "Madhya Pradesh",
    difficulty: "Easy",
    duration: "3 Days / 2 Nights",
    elevation: "1,200 ft",
    groupSize: "8-10",
    price: "₹11,499",
    description: "Explore the ancient tiger territory of Tadoba Andhari Tiger Reserve with open-gypsy safaris and lake walks.",
    longDescription: "Tadoba Andhari is Maharashtra's oldest and largest national park, famously called 'The Land of Tigers'. This expedition combines thrilling open 4x4 Gypsy wildlife safaris with quiet, guided peripheral nature walks along the scenic Tadoba lake. Explore high bamboo thickets, dry deciduous forests, and ancient stone ruins while listening to alert calls of deer and langurs. The deep forest is home to Bengal tigers, leopards, sloth bears, and mugger crocodiles.",
    tags: ["Jungle", "Wildlife", "Lake Ride"],
    bestSeason: "October to June (Dry summer months offer peak predator sightings around waterholes)",
    meetingPoint: "Chandrapur Railway Station (10:00 AM)",
    mapCoords: { x: 235, y: 375 },
    gallery: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      "https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1", title: "Check-in & Evening Safari", desc: "Arrive at Chandrapur, transfer to forest lodge near Moharli Gate. Go on your first evening gypsy safari." },
      { day: "Day 2 - 05:30 AM", title: "Core Zone Chase", desc: "Embark on an early morning deep core zone gypsy safari. Keep your eyes peeled for tiger cubs and wild dogs." },
      { day: "Day 2 - 04:30 PM", title: "Tadoba Lake Nature Hike", desc: "Hike along designated boundary trails of the park with a certified naturalist, spotting water birds and crocodiles." },
      { day: "Day 3 - 08:00 AM", title: "Breakfast & Checkout", desc: "Enjoy a rich local Vidarbha buffet breakfast, check out, and transfer back to Chandrapur station." }
    ],
    inclusions: ["Moharli Luxury Forest Lodge", "All meals (Buffet)", "2 Core Zone 4x4 Safaris", "Forest Entry Permits", "Naturalist fees"],
    exclusions: ["Camera charges (high-end lenses)", "Tips for drivers/guides", "Anything not in inclusions"]
  },
  {
    id: "doodhsagar",
    name: "Doodhsagar Waterfall Expedition",
    zone: "maharashtra",
    zoneLabel: "Maharashtra",
    difficulty: "Easy",
    duration: "1 Day / 1 Night",
    elevation: "1,000 ft",
    groupSize: "20-25",
    price: "₹2,299",
    description: "Witness the majestic 'Sea of Milk' cascade down four massive tiers under the heritage rail tracks.",
    longDescription: "Doodhsagar (Sea of Milk) is one of India's tallest waterfalls, located on the Mandovi River near the Maharashtra-Goa border. The waterfall plunges down a massive 1,017 feet from the steep cliffs of the Western Ghats, creating a misty spray that looks like white milk. The trek starts from Kulem, walking along scenic green rail tracks, crossing small iron bridges, and hiking through lush Bhagwan Mahavir wildlife sanctuary forests to reach the legendary splash pool.",
    tags: ["Waterfall", "Jungle", "Scenic"],
    bestSeason: "July to November (Peak monsoon creates a colossal roaring cascade)",
    meetingPoint: "Madgaon Junction (07:00 AM) / Belgaum (05:00 AM)",
    mapCoords: { x: 125, y: 485 },
    gallery: [
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=800",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1 - 07:30 AM", title: "Kulem Base Journey", desc: "Assemble at Kulem, breakfast and briefing. Rent lifejackets and board forest department gypsy vehicles." },
      { day: "Day 1 - 09:30 AM", title: "Sanctuary Jungle Walk", desc: "Hop off gypsy, trek 4 km through green canopy woods and muddy streams inside Bhagwan Mahavir sanctuary." },
      { day: "Day 1 - 11:30 AM", title: "Colossal Cascade Splash", desc: "Reach the foot of Doodhsagar waterfalls. Swim in the massive natural pool under strict safety lifeguards." },
      { day: "Day 1 - 02:30 PM", title: "Return & Local Lunch", desc: "Trek back to gypsy station, drive to Kulem, and enjoy a rich Goan-style hot buffet lunch." }
    ],
    inclusions: ["Forest Gypsy transfers", "Standard Lifejackets", "Morning Breakfast & Buffet Lunch", "Wildlife Entry Permissions"],
    exclusions: ["Train/bus travel up to Kulem", "Extra beverages", "Personal locker rentals"]
  },

  // ==========================================
  // --- MADHYA PRADESH ZONE (4 Treks) --------
  // ==========================================
  {
    id: "pachmarhi",
    name: "Pachmarhi Satpura Highlands",
    zone: "mp",
    zoneLabel: "Madhya Pradesh",
    difficulty: "Moderate",
    duration: "3 Days / 2 Nights",
    elevation: "4,300 ft",
    groupSize: "15-20",
    price: "₹5,499",
    description: "Explore the ancient Satpura tiger reserve highlands, red sandstone cliffs, canyons, and sacred Shiva shrines.",
    longDescription: "Pachmarhi, known as the 'Queen of Satpuras', is a beautiful hill station situated at an altitude of 3,500 ft in the Satpura range of Madhya Pradesh. The region is rich in biological diversity and red sandstone geology. This highland trek takes you past the gorgeous Chauragarh holy Peak (where 1,300 masonry steps are lined with thousands of iron Trishuls), through deep deciduous jungles, and down into lush canyons containing waterfalls like Duchess Falls and Bee Falls.",
    tags: ["Peak", "Heritage", "Jungle"],
    bestSeason: "October to April (Cool misty winters are excellent; Mahashivratri in spring is legendary)",
    meetingPoint: "Pipariya Railway Station (08:00 AM)",
    mapCoords: { x: 225, y: 320 },
    gallery: [
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800",
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1", title: "Reach Pachmarhi & Canyons", desc: "Drive from Pipariya to Pachmarhi. Trek down into the deep sandstone canyon of Bee Falls. Overnight in cozy mountain hotel." },
      { day: "Day 2 - 06:00 AM", title: "Chauragarh Holy Peak", desc: "Early climb up Chauragarh's 1,300 steps. Pay respects at the mystical Shiva temple surrounded by tridents." },
      { day: "Day 2 - 02:00 PM", title: "Pandav Caves & Sunset", desc: "Explore the ancient Buddhist/Pandav rock-cut caves, then hike up Dhoopgarh (highest peak in MP) for a grand sunset." },
      { day: "Day 3 - 08:30 AM", title: "Handi Khoh Gorge", desc: "Visit the massive 300-ft deep Handi Khoh ravine, followed by a local organic central-Indian lunch, and transfer back to Pipariya." }
    ],
    inclusions: ["Pipariya transfers in private Gypsies", "Premium Hotel stay (double sharing)", "All meals (local veg)", "Forest permits & guides"],
    exclusions: ["Personal tips", "Camera fees at Dhoopgarh", "Anything not in inclusions"]
  },
  {
    id: "melghat",
    name: "Melghat Tiger Reserve Forest Hike",
    zone: "mp",
    zoneLabel: "Madhya Pradesh",
    difficulty: "Easy",
    duration: "2 Days / 1 Night",
    elevation: "2,200 ft",
    groupSize: "10-12",
    price: "₹3,499",
    description: "Hike through high teak forests on the border of MP & Maharashtra, camping near a calm river stream.",
    longDescription: "Melghat Tiger Reserve lies on the Satpura hill range, spanning across the border of MP and Maharashtra. This forest trek is designed to let you experience the dense central-Indian jungle on foot. Accompanied by certified forest guards, you hike along historical tribal trails, learn tracking skills (spoor identification, bird calls), and camp in simple safari tents along the banks of the Sipna River. Spot wildlife like tigers, leopards, Indian gaurs, and flying squirrels.",
    tags: ["Jungle", "Wildlife", "Camping"],
    bestSeason: "November to June (Excellent wildlife sighting season; forest paths are completely accessible)",
    meetingPoint: "Chikhaldara Bus Stop (12:00 PM)",
    mapCoords: { x: 185, y: 340 },
    gallery: [
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800",
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1 - 12:30 PM", title: "Reach Safari Camp", desc: "Check in to Semadoh Forest Camp, have lunch, and brief with naturalists." },
      { day: "Day 1 - 03:00 PM", title: "Nature Trail Walk", desc: "Hike along Sipna river bed with forest guards. Learn to read animal pugmarks and watch colorful hornbills." },
      { day: "Day 1 - 08:00 PM", title: "Bonfire & Wildlife Talk", desc: "Enjoy a simple local dinner under a dark sky, listening to jungle stories and safety briefs." },
      { day: "Day 2 - 06:00 AM", title: "Sunrise Birding & Jeep Safari", desc: "Early morning hike for bird watching, followed by an exciting open-jeep wildlife safari. Check out by 1 PM." }
    ],
    inclusions: ["Semadoh jungle camp/tents", "Naturalist & forest guard fees", "All meals (local organic veg)", "1 Open Jeep Safari", "Tiger reserve entry charges"],
    exclusions: ["Camera charges at checkpost", "Travel to Chikhaldara", "Tips for drivers"]
  },
  {
    id: "pench",
    name: "Pench Jungle Expedition",
    zone: "mp",
    zoneLabel: "Madhya Pradesh",
    difficulty: "Easy",
    duration: "3 Days / 2 Nights",
    elevation: "1,300 ft",
    groupSize: "8-10",
    price: "₹8,999",
    description: "Enter the real 'Mowgli Land' that inspired The Jungle Book, enjoying deep forest safaris and river hiking.",
    longDescription: "Pench National Park, located on the southern boundary of MP, is the legendary forest that inspired Rudyard Kipling's immortal classic 'The Jungle Book'. Characterized by rolling hills of mixed deciduous teak forests and the wide Pench River, this reserve is a haven for Royal Bengal tigers, leopards, dholes (wild dogs), and massive herds of deer. Our expedition offers high-density wildlife safaris and low-impact peripheral walking trails.",
    tags: ["Jungle", "Wildlife", "River Walk"],
    bestSeason: "October to June (Pleasant weather in winter, high predator concentration in summer)",
    meetingPoint: "Nagpur Junction Railway Station / Airport (09:00 AM)",
    mapCoords: { x: 245, y: 335 },
    gallery: [
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=800",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1", title: "Nagpur to Pench Drive", desc: "Meet at Nagpur, drive 2 hours to Sillari/Mohgaon gate. Check in to premium safari resort. Briefing and night star trail walk." },
      { day: "Day 2 - 05:30 AM", title: "Core Jungle Gypsy Safari", desc: "Early morning core safari in Pench. Cross river islands and tracking calls of leopards and tigers." },
      { day: "Day 2 - 03:30 PM", title: "Pench River Bed Hike", desc: "Walk along dry sandy river banks outside core borders, studying forest tracks and footprints with naturalists." },
      { day: "Day 3 - 08:30 AM", title: "Sillari Walk & Return", desc: "Check out after breakfast, visit a local tribal handicraft center, and transfer back to Nagpur by evening." }
    ],
    inclusions: ["Nagpur transfers", "Luxury AC resort cottages", "Buffet Meals (all)", "1 Core Jeep Safari", "Naturalist & park entry permits"],
    exclusions: ["High-end camera lenses fees", "Tips to drivers", "Personal laundry"]
  },
  {
    id: "bhedaghat",
    name: "Bhedaghat Marble Rocks Gorge",
    zone: "maharashtra",
    zoneLabel: "Maharashtra",
    difficulty: "Easy",
    duration: "1 Day",
    elevation: "1,050 ft",
    groupSize: "20-25",
    price: "₹1,199",
    description: "Hike along the colossal 100 ft white marble cliffs carved by the Narmada River and see Dhuandhar falls.",
    longDescription: "Bhedaghat, located near Jabalpur, is world-famous for its spectacular white marble rocks. The mighty Narmada River squeezes through a narrow 3-km gorge carved inside towering white, black, and green marble cliffs that rise 100 feet. The trek takes you along the scenic gorge rim, descending down to the roaring Dhuandhar Falls, where the river plunges down 90 feet creating an immense cloud of water vapor (smoke cascade). Conclude with a magical moonlit boat ride.",
    tags: ["Waterfall", "Marble Gorge", "River Hike"],
    bestSeason: "September to April (Avoid mid-monsoon when river flow is dangerous and boating is closed)",
    meetingPoint: "Jabalpur Junction Railway Station (08:00 AM)",
    mapCoords: { x: 215, y: 435 },
    gallery: [
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1 - 08:00 AM", title: "Jabalpur to Bhedaghat", desc: "Board private group bus, travel 45 mins. Breakfast served upon arrival near the rocks." },
      { day: "Day 1 - 09:30 AM", title: "Dhuandhar Mist Walk", desc: "Hike down the paved rocky trails to Dhuandhar waterfall. Stand on viewing decks and feel the intense mist spray." },
      { day: "Day 1 - 12:00 PM", title: "Marble Gorge Rim Trail", desc: "Hike along the high white marble cliffs. Marvel at the unique geological formations." },
      { day: "Day 1 - 02:00 PM", title: "Traditional Thali Lunch", desc: "Relish a massive traditional Madhya Pradesh Thali lunch at a riverview farm." },
      { day: "Day 1 - 05:00 PM", title: "Marble Gorge Boating", desc: "Board local rowing boats to float between massive marble walls as the golden sunset sky reflects off white stone." }
    ],
    inclusions: ["Jabalpur transfers", "Breakfast & Traditional Lunch", "Marble Gorge Boating Tickets", "Expert Local Guide"],
    exclusions: ["Souvenirs (marble carvings)", "Camera fees", "Personal expenses"]
  },

  // ==========================================
  // --- HIMACHAL & LADAKH (11 Treks) ---------
  // ==========================================
  {
    id: "manali",
    name: "Manali Solang Alpine Trek",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Easy",
    duration: "3 Days / 2 Nights",
    elevation: "9,300 ft",
    groupSize: "15-20",
    price: "₹4,200",
    description: "Walk along the roaring Beas river, hike through deodar pine forests and camp in Solang Valley meadows.",
    longDescription: "This alpine trek is designed for beginners who want to experience the breathtaking beauty of Manali's mountains. Hike from Old Manali through ancient pine, spruce, and oak forests, passing quiet Himalayan villages like Goshal and Shanag. Cross wooden bridges over the roaring Beas river and pitch tents in Solang Valley, surrounded by towering snow peaks. Try adventure sports or rest in massive green wildflower meadows.",
    tags: ["Meadows", "Pine Forest", "Easy"],
    bestSeason: "April to November (Avoid heavy monsoon in July-August due to rockfall risks)",
    meetingPoint: "Manali Rambagh Circle (10:00 AM)",
    mapCoords: { x: 185, y: 120 },
    gallery: [
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1", title: "Old Manali to Jogini & Shanag", desc: "Trek from Old Manali, visit the holy Jogini waterfalls, and continue through pine woods to camp at Shanag village." },
      { day: "Day 2", title: "Shanag to Solang Valley Meadows", desc: "A scenic 4-hour hike along mountain orchards and local stone homes to the wide grasslands of Solang Valley (8,500 ft)." },
      { day: "Day 3", title: "Dhundi exploration & Return", desc: "Walk towards Dhundi (source of Beas), enjoy packed lunch under Shitidhar peak, and drive back to Manali by afternoon." }
    ],
    inclusions: ["Premium meadow camps (triple sharing)", "All meals (local organic veg)", "Certified Mountain Guide", "Forest Entry Permits"],
    exclusions: ["Paragliding/ATV rides in Solang", "Personal luggage offloading", "Stay in Manali before/after"]
  },
  {
    id: "chandrakhani",
    name: "Chandrakhani Pass Trek",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Moderate",
    duration: "4 Days / 3 Nights",
    elevation: "12,000 ft",
    groupSize: "12-15",
    price: "₹7,499",
    description: "Hike through ancient village territories like Malana and cross a sacred alpine pass with Pir Panjal views.",
    longDescription: "Chandrakhani Pass is a highly historic and scenic trek in the Kullu Valley. Standing at 12,000 ft, it connects the lush Kullu valley with the mysterious, isolated ancient village of Malana. The trail climbs through giant deodar, oak, and wild cherry forests into sprawling high-altitude pastures. The summit of the pass offers one of the best views of the colossal Pir Panjal range, Deo Tibba, and Parvati valley peaks.",
    tags: ["Pass Crossing", "Ancient Culture", "Peaks View"],
    bestSeason: "May to October (Meadows are lush green in summer; golden birch in autumn)",
    meetingPoint: "Naggar Bus Stand (09:00 AM)",
    mapCoords: { x: 200, y: 130 },
    gallery: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1", title: "Naggar to Rumsu Base", desc: "Arrive at Naggar, drive to Rumsu base village. Hike 3 hours up through towering oak forests to camp at Sterling Meadow." },
      { day: "Day 2", title: "Sterling to Naya Tapru", desc: "A steep 5-hour climb up the ridge through dense rhododendron woods to reach Naya Tapru camp (10,000 ft)." },
      { day: "Day 3", title: "The Pass Crossing", desc: "Climb through alpine fields to Chandrakhani Pass (12,000 ft). Soak in 360-degree snow peak views, then descend to camp at Nagruni." },
      { day: "Day 4", title: "Malana village & Naggar Return", desc: "Hike down to the mysterious village of Malana, explore ancient stone temples (from distance), and board return vehicles back to Naggar." }
    ],
    inclusions: ["Premium dome camping tents", "Mountaineering chef and fresh meals", "Wilderness First-Aid Kit", "Naggar-Rumsu and Malana-Naggar transport"],
    exclusions: ["Luggage offloading (mules)", "Stay in Naggar", "Personal trekking shoes"]
  },
  {
    id: "jogini-fall",
    name: "Jogini Waterfalls Trail",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Easy",
    duration: "1 Day",
    elevation: "6,700 ft",
    groupSize: "20-25",
    price: "₹799",
    description: "Hike from Vashisht through apple orchards to a sacred, multi-tiered cascading waterfall cliff.",
    longDescription: "Jogini Waterfall is a highly popular and scenic cascade located in the Vashisht village near Manali. The waterfall plunges down a massive 150-ft cliff in multiple tiers, crashing into a small holy pool below dedicated to the local deity Jogini Mata. The trail starts from the ancient Vashisht temple (known for hot sulfur springs), taking you through pine forests, apple orchards, and small tea stalls, making it a beautiful half-day walk.",
    tags: ["Waterfall", "Easy", "Holy Site"],
    bestSeason: "All year round (Monsoons are massive; winters offer beautiful snowy backdrops)",
    meetingPoint: "Vashisht Temple Entrance, Manali (09:00 AM)",
    mapCoords: { x: 190, y: 115 },
    gallery: [
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=800",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1 - 09:30 AM", title: "Apple Orchard Hike", desc: "Assemble at Vashisht, start walking along village stone paths and lush green apple orchards." },
      { day: "Day 1 - 11:00 AM", title: "Cascading Misty Cliff", desc: "Reach the foot of Jogini waterfall. Feel the misty spray, visit the tiny Mata shrine, and enjoy a packed snack." },
      { day: "Day 1 - 01:30 PM", title: "Hot Springs Bath & Lunch", desc: "Walk back to Vashisht temple. Take a dip in the natural hot sulfur spring pools, followed by a warm local cafe lunch." }
    ],
    inclusions: ["Certified local guide", "Packed snack box & juice", "Vashisht hot spring access guide", "First aid support"],
    exclusions: ["Personal transportation to Vashisht", "Tips to guides", "Water bottles"]
  },
  {
    id: "jana-fall",
    name: "Jana Waterfall Forest Trek",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Easy",
    duration: "1 Day",
    elevation: "6,900 ft",
    groupSize: "20-25",
    price: "₹899",
    description: "Hike through quiet Naggar pine woods to discover a hidden stone waterfall and eat traditional Himachali food.",
    longDescription: "Jana Waterfall is a gorgeous hidden gem situated in the thick forests of Naggar. The water cascade flows over massive natural stone boulders from a high rock face, creating a peaceful sound. The trail takes you through massive pine, cedar, and oak trees, offering spectacular views of snow-covered peaks. A key highlight is tasting the traditional Himachali cuisine (Makki Roti, Siddu, local pickle) at the local rustic wooden stalls near the waterfall.",
    tags: ["Waterfall", "Easy", "Local Food"],
    bestSeason: "October to June (Forest path is completely dry and safe; winter snow is amazing)",
    meetingPoint: "Naggar Castle Entrance (09:00 AM)",
    mapCoords: { x: 195, y: 125 },
    gallery: [
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800",
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1 - 09:30 AM", title: "Naggar Castle to Jana Forest", desc: "Gather at Naggar castle, board sharing gypsies to the starting point of the forest trail." },
      { day: "Day 1 - 10:30 AM", title: "Pine Forest Canopy Hike", desc: "Trek 3 km under giant deodar and pine trees, enjoying fresh mountain air and bird watching." },
      { day: "Day 1 - 12:00 PM", title: "Jana Stone Cascade", desc: "Reach the beautiful waterfall. Walk over the wooden bridge, take photos, and eat hot local Siddu with ghee at village shacks." }
    ],
    inclusions: ["Naggar local gypsy transfers", "Traditional Himachali Lunch (Siddu/Thali)", "Local guide fees", "First-aid support"],
    exclusions: ["Castle entry tickets", "Personal tips", "Energy drinks"]
  },
  {
    id: "chandratal",
    name: "Chandratal Glacial Lake Camp",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Moderate",
    duration: "2 Days / 1 Night",
    elevation: "14,100 ft",
    groupSize: "12-15",
    price: "₹3,899",
    description: "Camp in high luxury tents near the holy crescent-shaped Moon Lake and watch millions of stars.",
    longDescription: "Chandratal Lake (Moon Lake) is a holy high-altitude glacial lake situated at 14,100 ft in the Spiti region of Lahaul & Spiti. The lake is curved like a crescent moon and is surrounded by steep, bare mountains and dry alpine scree. The water of the lake continuously changes colors from turquoise to emerald to deep blue throughout the day. Spend a majestic night camping under the highest, cleanest starry skies in India.",
    tags: ["Glacier Lake", "High Altitude", "Camping"],
    bestSeason: "Mid-June to Mid-October (Kunzum Pass must be open for vehicle access)",
    meetingPoint: "Manali Bus Stand (07:00 AM)",
    mapCoords: { x: 210, y: 110 },
    gallery: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1 - 07:30 AM", title: "Drive through Atal Tunnel & Kunzum", desc: "Drive from Manali through Atal Tunnel, Chatru, and over the high Kunzum Pass (15,060 ft). Arrive at Chandratal camp by evening." },
      { day: "Day 1 - 05:00 PM", title: "Sunset at Moon Lake", desc: "Hike 2 km to the lake. Capture the sunset colors reflecting off the calm water surface. Walk back to camp." },
      { day: "Day 2 - 08:30 AM", title: "Sunrise Walk & Return", desc: "Sunrise lake walk, delicious camp breakfast, and drive back to Manali through the Chandra river valley." }
    ],
    inclusions: ["Semi-luxury tents (attached washroom)", "Dinner & Breakfast", "Manali to Chandratal SUV travel", "High altitude oxygen backup"],
    exclusions: ["Lunch on highway", "Personal medication", "Warm gloves/gears"]
  },
  {
    id: "spiti",
    name: "Spiti Valley High Jeep Safari",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Moderate",
    duration: "7 Days / 6 Nights",
    elevation: "15,000 ft",
    groupSize: "8-10",
    price: "₹14,999",
    description: "Explore ancient monasteries, the world's highest post office, and ride through dramatic barren mountain canyons.",
    longDescription: "The Spiti Valley Expedition is a high-altitude road adventure through a barren, high-mountain desert region in the Himalayas. Spiti translates to 'The Middle Land'—the border land between India and Tibet. Our journey takes you through the legendary places of Kibber, Kaza, Langza (fossil village), Hikkim (world's highest post office), Kye Monastery (perched on a rocky hill), and the crystal-clear Chandratal lake. You will stay in authentic local homestays and experience deep Buddhist culture.",
    tags: ["Road Trip", "Culture", "Monasteries"],
    bestSeason: "June to September (Clear dry roads, warm sunny days, and fully open passes)",
    meetingPoint: "Shimla Railway Station / Manali Bus Stand",
    mapCoords: { x: 215, y: 120 },
    gallery: [
      "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800",
      "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1", title: "Manali to Kaza", desc: "Drive over Rohtang Pass / Atal Tunnel and Kunzum Pass. Reach Kaza, the administrative headquarters of Spiti." },
      { day: "Day 2", title: "Key Monastery & Kibber village", desc: "Visit Kye Monastery, the biggest center of Buddhist learning in Spiti. Explore Kibber, once the highest motorable village." },
      { day: "Day 3", title: "Hikkim, Langza & Komic", desc: "Send a postcard from the World's Highest Post Office at Hikkim. See the gigantic Buddha statue looking over Langza." },
      { day: "Day 4", title: "Kaza to Tabo & Pin Valley", desc: "Explore 1000-year-old Tabo Monastery, see the national park boundaries of Pin Valley, homestay at Mudh village." },
      { day: "Day 5", title: "Pin Valley to Chandratal", desc: "Drive back over Kunzum Pass to reach the camp near Chandratal Lake. Hike to lake for a magnificent sunset." },
      { day: "Day 6", title: "Chandratal to Manali & Departure", desc: "Drive back to Manali. Relish a farewell dinner together, and catch night buses home." }
    ],
    inclusions: ["SUV transport (Innova / Tempo Traveler)", "Traditional village homestay & luxury camps", "Buffet breakfast & dinner", "Monastery permits & local guides"],
    exclusions: ["Lunch and highway snacks", "Personal shopping/porter tips", "Flight bookings to Delhi/Chandigarh"]
  },
  {
    id: "kanamo-peak",
    name: "Kanamo Peak Extreme Climb",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Challenging",
    duration: "6 Days / 5 Nights",
    elevation: "19,600 ft",
    groupSize: "8-10",
    price: "₹16,500",
    description: "Climb a colossal 19,600 ft trekking peak in Spiti without technical gear and stand high above the clouds.",
    longDescription: "Mount Kanamo (White Lady) is a massive trekking peak standing tall at an extreme altitude of 19,600 feet in the Spiti Valley near Kibber village. It is one of the few high-altitude peaks in India that does not require technical mountaineering gear like ropes and crampons. However, climbing it requires excellent physical stamina and severe acclimatization. Stand at the summit looking down at the massive peaks of Ladakh, Spiti, and Tibet.",
    tags: ["Peak", "Snow", "High Altitude"],
    bestSeason: "July to September (Peak summer is the only time the snow melts enough for hikers to climb safely)",
    meetingPoint: "Kaza Base Camp (09:00 AM)",
    mapCoords: { x: 220, y: 115 },
    gallery: [
      "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1-2", title: "Acclimatization in Kibber", desc: "Stay 2 nights in Kibber (14,200 ft). Go on slow walks to Tashigang and Key Monastery to let your lungs adjust." },
      { day: "Day 3", title: "Trek to Kanamo Base Camp", desc: "Hike 4 hours through high alpine dry valleys to reach Kanamo Base Camp (15,800 ft). Set up tents." },
      { day: "Day 4", title: "Summit Attempt", desc: "Start the summit push at 02:00 AM! Walk slowly on dry shale and snow ridges. Reach the 19,600-ft summit by sunrise! Return to base." },
      { day: "Day 5", title: "Descent to Kibber & Kaza", desc: "Pack up the camp, trek back to Kibber, board jeeps and celebrate with dinner in Kaza." }
    ],
    inclusions: ["Acclimatization lodge & alpine tents", "Mountaineering certified guide & cooks", "All meals during climb", "Oxygen cylinders and first aid", "Spiti local transport"],
    exclusions: ["Luggage offloading charge (mules)", "Stay in Kaza before/after", "Warm heavy down jackets"]
  },
  {
    id: "ladakh",
    name: "Ladakh Nomad Trail",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Challenging",
    duration: "6 Days / 5 Nights",
    elevation: "11,500 ft",
    groupSize: "10-12",
    price: "₹18,500",
    description: "Hike through ancient Hemis canyons, meet Tibetan nomads and camp along the mystical Pangong Tso.",
    longDescription: "This classic Ladakh Nomad Trail takes you through the heart of Hemis National Park, crossing old dry gorges and fast-flowing cold mountain streams. Visit ancient high-perched monasteries like Thiksey and Hemis. Meet nomadic Tibetan yak-herders on the high grazing plateaus. The expedition ends with an adventurous drive to the legendary, color-shifting Pangong Tso Lake (14,270 ft) on the Indo-China border.",
    tags: ["Ladakh Desert", "High Altitude", "Pass Crossing"],
    bestSeason: "July to September (Dry Ladakh season, passes are open, river flow is low)",
    meetingPoint: "Leh Market Main Office (10:00 AM)",
    mapCoords: { x: 190, y: 55 },
    gallery: [
      "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1-2", title: "Leh Rest & Acclimatize", desc: "Mandatory 2-day rest in Leh (11,500 ft) to adapt to thin air. Go on local sightseeing tours to Leh Palace and Shanti Stupa." },
      { day: "Day 3", title: "Zingchen to Rumbak Valley", desc: "Drive to Zingchen, hike inside Hemis park. Spot blue sheep and camp in the green valley of Rumbak." },
      { day: "Day 4", title: "Cross Stok La Pass", desc: "Climb Stok La pass (16,000 ft) for sweeping desert valley views. Descend to the oasis village of Stok." },
      { day: "Day 5", title: "Drive to Pangong Tso Lake", desc: "Board private SUV to drive over Chang La Pass (17,590 ft) to reach the giant salt lake Pangong Tso. Camp at Spangmik." }
    ],
    inclusions: ["Acclimatization Leh Hotel & Lakeside Camps", "All organic mountain meals", "Trek Permits & Wildlife Fees", "Oxygen cylinders and SUV transfers"],
    exclusions: ["Airfare to Leh airport", "Personal sleeping bags", "Tips for staff"]
  },
  {
    id: "khardungla",
    name: "Khardungla Pass High Expedition",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Moderate",
    duration: "1 Day",
    elevation: "17,580 ft",
    groupSize: "15-20",
    price: "₹2,499",
    description: "Drive over one of the world's highest motorable passes and stand atop a glacier looking at the Karakoram.",
    longDescription: "Khardung La is a legendary mountain pass located in the Ladakh range north of Leh. Standing at an extreme elevation of 17,580 feet, it is historically the gateway to the Shyok and Nubra valleys, and part of the old silk route. This high-altitude excursion takes you from Leh through sharp mountain bends, climbing directly into glaciated peaks. Stand at the freezing windy top looking at the colossal Karakoram range.",
    tags: ["High Altitude", "Glacier Pass", "Scenic Drive"],
    bestSeason: "May to October (Pass is open and free from blocking winter blizzards)",
    meetingPoint: "Leh Market Taxi Stand (08:00 AM)",
    mapCoords: { x: 185, y: 35 },
    gallery: [
      "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1 - 08:30 AM", title: "Leh Ascent Drive", desc: "Board private 4x4 vehicles, quick oxygen briefs and start climbing up the winding Leh-Manali highway." },
      { day: "Day 1 - 11:30 AM", title: "Khardungla Glacier Peak", desc: "Reach the Khardungla summit. Drink tea at the world's highest army cafe, take photos with glacier sheets." },
      { day: "Day 1 - 02:00 PM", title: "South Pullu Return", desc: "Descend to South Pullu checkpoint, enjoy warm Maggi and tea, and drive back to Leh by late afternoon." }
    ],
    inclusions: ["4x4 SUV transfers", "Khardungla permit documents", "Oxygen cylinders on board", "Expert guide support"],
    exclusions: ["Lunch at local checkpoints", "Warm gloves/caps", "Tips to drivers"]
  },
  {
    id: "nubra-valley",
    name: "Nubra Valley Camel Safari",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Easy",
    duration: "3 Days / 2 Nights",
    elevation: "10,000 ft",
    groupSize: "10-12",
    price: "₹6,499",
    description: "Ride two-humped Bactrian camels over the silver sand dunes of Hunder and explore high altitude desert valleys.",
    longDescription: "Nubra Valley, known as the 'Valley of Flowers', is a high-altitude cold desert situated north of Leh. Sandwiching the Shyok and Nubra rivers, the valley features beautiful silver sand dunes in Hunder, where rare, two-humped Bactrian camels (remnants of the old silk route caravans) roam. Trek along the valley floors, visit the colossal 108-ft Maitreya Buddha statue in Diskit Monastery, and enjoy warm hot springs in Panamik.",
    tags: ["Desert Dunes", "Camel Ride", "Monasteries"],
    bestSeason: "May to September (Warm sunny days, clear river wades, and easy pass access)",
    meetingPoint: "Leh Market Office (08:00 AM)",
    mapCoords: { x: 195, y: 25 },
    gallery: [
      "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1", title: "Leh to Hunder via Khardungla", desc: "Drive over the high Khardungla Pass, descend into the sand dunes of Hunder. Camp in deluxe Swiss tents." },
      { day: "Day 2 - 09:00 AM", title: "Bactrian Camel Safari", desc: "Ride the two-humped Bactrian camels across the silver sand dunes of Hunder, followed by traditional Ladakhi lunch." },
      { day: "Day 2 - 03:00 PM", title: "Diskit Monastery Buddha", desc: "Visit the Diskit monastery perched on a hill. Stand at the base of the massive Maitreya Buddha statue." },
      { day: "Day 3 - 08:30 AM", title: "Panamik Springs & Leh Return", desc: "Visit hot springs of Panamik, have breakfast, and drive back to Leh by late evening." }
    ],
    inclusions: ["Deluxe camp cottage with attached washroom", "Dinner, breakfast & organic lunch", "Inner Line Permits", "SUV transfers to-and-fro Leh"],
    exclusions: ["Camel safari ride ticket (₹400)", "Personal shopping", "Flight tickets"]
  },
  {
    id: "snow-treks",
    name: "Alpine Snow Passes Trek",
    zone: "himachal",
    zoneLabel: "Himachal + Ladakh",
    difficulty: "Challenging",
    duration: "4 Days / 3 Nights",
    elevation: "13,500 ft",
    groupSize: "12-15",
    price: "₹8,499",
    description: "Cross high-altitude glacial snow fields and sleep in frozen sub-zero camps beneath towering rock spires.",
    longDescription: "This alpine snow pass expedition takes you deep into the winter wonderland of the Kullu range. Trek through heavy snow fields, navigate slippery moraine ridges, and cross frozen glacier feeds to reach the rocky summit. Camp in specialized double-walled sub-zero tents pitched directly on snow under the shadow of Friendship Peak. It is a true test of physical endurance and winter survival skills under certified experts.",
    tags: ["Snow", "High Altitude", "Camping"],
    bestSeason: "December to April (Peak winter offers the thickest snow cover and majestic frozen look)",
    meetingPoint: "Manali Bus Stand (09:00 AM)",
    mapCoords: { x: 180, y: 105 },
    gallery: [
      "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800"
    ],
    timeline: [
      { day: "Day 1", title: "Drive to Dhundi & Trek to Bakarthach", desc: "Drive to Dhundi, put on your snow gaiters and climb 4 hours through frozen forests to camp at Bakarthach (10,800 ft)." },
      { day: "Day 2", title: "Bakarthach to Lady Leg Snow Camp", desc: "A steep 5-hour climb up the snow ridge to Lady Leg (12,500 ft). Pitch double-walled tents directly on hard snow beds." },
      { day: "Day 3", title: "Pass Summit & Snow Wade", desc: "Climb through steep snow slopes to the high Beas Kund Pass (13,500 ft). Wade through deep powdery snow, return to Bakarthach." },
      { day: "Day 4", title: "Return to Manali", desc: "Walk down to Dhundi village, change into dry clothes, and Gypsy back to Manali bus stand by late afternoon." }
    ],
    inclusions: ["High altitude sub-zero camping gear", "Full snow-gaiters, microspikes, and trekking poles", "Chef prepared warm high-calorie meals", "Mountaineering certified rescue guide"],
    exclusions: [" Luggage offloading (mules/porters)", "Thermal base layers", "Stay in Manali"]
  }
];

// Export for module/global compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TREKS_DATA };
}
