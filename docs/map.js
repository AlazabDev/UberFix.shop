// دالة تهيئة الخريطة الرئيسية
function initializeMap() {
    // مركز الخريطة الأولي (القاهرة)
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 30.0444, lng: 31.2357 },
        mapTypeId: 'roadmap',
        styles: [
            // الأنماط تبقى كما هي...
        ]
    });

const branches = [
    {
        "id": "Az-Branch-0001",
        "branch": "Adly Mansour Metro Station",
        "address": "Adly Mansour Central Station, 10th Park inside Metro Station",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/cCoGeE3rBNz1in5k6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0002",
        "branch": "Agora Mall",
        "address": "Agora Mall - Ground Floor - Fifth Settlement",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/tDFSwg3iHs7r7Cie7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4284756,
        "longitude": 30.0084868
    },
    {
        "id": "Az-Branch-0003",
        "branch": "Ain Shams Law",
        "address": "Ain Shams University - Faculty of Law",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/AV7oNVy3zv1ELvBz8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2864456,
        "longitude": 30.0772428
    },
    {
        "id": "Az-Branch-0004",
        "branch": "Ain Shams University",
        "address": "Ain Shams University -Faculty Of Commerce",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/LGGAzW8ZAf7pYVz49",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2873348,
        "longitude": 30.0746829
    },
    {
        "id": "Az-Branch-0005",
        "branch": "Ain Shams University 3",
        "address": "Ain Shams University - Faculty of Arts",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/ubdBiMwJz1ofBZKc9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.287256,
        "longitude": 30.0767007
    },
    {
        "id": "Az-Branch-0006",
        "branch": "AirPort T1",
        "address": "Old Airport T1",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/q3bVw53xkvkSTyVY6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0007",
        "branch": "AirPort T2",
        "address": "New Airport Terminal 2",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/acYTr6K66V12g5gV7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0008",
        "branch": "AirPort T2-G",
        "address": "Airport T2 in front of the Multi Garage",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/2yj2q8Lvr3SYtuPr7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0009",
        "branch": "AirPort T3-F",
        "address": "New Airport 3 - corridor F",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/dwB7C6nbsmmdHup27",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0010",
        "branch": "AirPort T3-G",
        "address": "New Airport 3 - corridor G",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/LNAnfYghUxvz4DKa7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0011",
        "branch": "Al Far Market",
        "address": "South 90th Street, Fifth Settlement, in front of Concord Plaza Mall.",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/hBdajgjKRiKwizs68",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4430295,
        "longitude": 30.0122123
    },
    {
        "id": "Az-Branch-0012",
        "branch": "Al Husseini to go",
        "address": "Al-Husseiny Mall, Al-Tagamoa, next to the first Nakheel Compound, New Cairo, Cairo Governorate",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/QgtpeeRQtzSKS2tBA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4226647,
        "longitude": 30.0549189
    },
    {
        "id": "Az-Branch-0013",
        "branch": "Al Qasr Al Ainy",
        "address": "93 Kasr El Aini Street, Shop No. 13/9, next to Rosa El Youssef",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/QX7FJT9c3cxH7xTp6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2351475,
        "longitude": 30.0386053
    },
    {
        "id": "Az-Branch-0014",
        "branch": "Al Rehab - Eastern Market",
        "address": "Food Court",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/9NsrymCfMnZCbqPG8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0015",
        "branch": "Al-Ahly Club Al-Jazira",
        "address": "Al-Tetch Stadium in front of the halls gate",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/ahi3wAVxyLpubKaJA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2236173,
        "longitude": 30.0450029
    },
    {
        "id": "Az-Branch-0016",
        "branch": "Al-Manara 1",
        "address": "International Conference Center El-Moshir Tantawy Axis -next to Hall 1",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/XzdhdTJMkSDMxhAQ9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3737777,
        "longitude": 30.0214702
    },
    {
        "id": "Az-Branch-0017",
        "branch": "Al-Manara 2",
        "address": "International Conference Center El-Moshir Tantawy Axis -next to Hall 4",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/XzdhdTJMkSDMxhAQ9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3737777,
        "longitude": 30.0214702
    },
    {
        "id": "Az-Branch-0018",
        "branch": "Almaza Avenue branch",
        "address": "Almaza Avenue New Mall next to Misr Aviation Hospital - Heliopolis",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/xvBehnUFj96AgD8H6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3438507,
        "longitude": 30.112315
    },
    {
        "id": "Az-Branch-0019",
        "branch": "Arabella",
        "address": "Arabella New Mall, Third Settlement, Next to Ezz El Din Pharmacy, New Cairo",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/hzDm6h8BC2dC4UHS8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3181252,
        "longitude": 30.1253988
    },
    {
        "id": "Az-Branch-0020",
        "branch": "Avenue Mall -Al Rehab",
        "address": "Avenue Mall, next to the Civil Registry, second floor, New Cairo, Rehab, Cairo",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/E5hpiSJcoJ41C9Yr9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.5091062,
        "longitude": 30.0585518
    },
    {
        "id": "Az-Branch-0021",
        "branch": "Bavaria Town El-Maadi",
        "address": "12 Bavaria Town beside EG-Bank infront of El Baron",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/f1bTqVRgSAeGRNc98",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0022",
        "branch": "Cairo Festival City 1",
        "address": "Ring Road with the ninety Street In front of the fountain , next to the Police Academy",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/gMdKQZVhuY1tGbqb6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.1970426,
        "longitude": 30.0911375
    },
    {
        "id": "Az-Branch-0023",
        "branch": "Carrefour - Al Rehab",
        "address": "Avenue Mall - Group 130 Al Rehab 2, Al Rehab City",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/YgT9F7Kymfu4hfDP9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.5091062,
        "longitude": 30.0585518
    },
    {
        "id": "Az-Branch-0024",
        "branch": "Carrefour - Al Zaytoun",
        "address": "El-Aziz Bellah, El-Zaytoun Sharkeya, Zaytoun",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/g4cbyDvgDC7GZoZv7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3120176,
        "longitude": 30.1016852
    },
    {
        "id": "Az-Branch-0025",
        "branch": "Carrefour - Mirage Mall",
        "address": "Carrefour Market - Mirage Mall -The 1st Settlement",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/c3VxYAYnWKCENm9h7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.455272,
        "longitude": 30.0797679
    },
    {
        "id": "Az-Branch-0026",
        "branch": "Carrefour - Mivida",
        "address": "90th Street . Mivida Compound-5th Settlement",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/wqik8ufv9WKBNHW1A",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4430295,
        "longitude": 30.0122123
    },
    {
        "id": "Az-Branch-0027",
        "branch": "Carrefour - Saraya Mall",
        "address": "Extension of Wali Al Aahd St , Hadaeq Al Qubbah",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/kMsrucabsiAM358w7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2829051,
        "longitude": 30.0860406
    },
    {
        "id": "Az-Branch-0028",
        "branch": "Carrefour Golf Salah Salem",
        "address": "Salah Salem Road beside Air Force House , Nasr City -Cairo",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/tEqrwqnYuwrQCM5J7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3217036,
        "longitude": 30.0826897
    },
    {
        "id": "Az-Branch-0029",
        "branch": "Carrefour- City Center Almaza",
        "address": "Suez Road, Sheraton Al Matar, Nasr City.",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/w1ZJy375FvhWq5xH9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4069558,
        "longitude": 30.0813982
    },
    {
        "id": "Az-Branch-0030",
        "branch": "Carrefour-Al Hamad Mall",
        "address": "79 Axis, First New Cairo",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/h4PbnaCPcYB3CrP27",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4272709,
        "longitude": 30.0040701
    },
    {
        "id": "Az-Branch-0031",
        "branch": "Carrefour-Helwan",
        "address": "Mostafa Fahmy Street, Helwan, Cairo.",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/dVhXCUZZfWGza32T9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.332609,
        "longitude": 29.8507406
    },
    {
        "id": "Az-Branch-0032",
        "branch": "Carrefour-Mega Mall",
        "address": "Carrefour Mega Mall - 5th Settlement - New Cairo.",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/Pyu7w1onEUXwidoz5",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4284756,
        "longitude": 30.0084868
    },
    {
        "id": "Az-Branch-0033",
        "branch": "Carrefour-New Maadi",
        "address": "Carrefour New Maadi.",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/pn5MGmXFKGCN6LPb7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2569138,
        "longitude": 29.9601561
    },
    {
        "id": "Az-Branch-0034",
        "branch": "Carrefour-Tiba Mall",
        "address": "4 Anwar Mufti.st, - Al Nasser Street - Nasr City",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/MFcKoio1uPU662iX6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3655989,
        "longitude": 30.051085
    },
    {
        "id": "Az-Branch-0035",
        "branch": "Carrefour-Tora Al Asmnt",
        "address": "55 Corniche El Nil, Tora Al Asmnt, Maadi",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/M8gRuY2H26spMKZX7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2358387,
        "longitude": 29.9721971
    },
    {
        "id": "Az-Branch-0036",
        "branch": "CFC 2",
        "address": "Ring Road with the ninety Street next to Carrefour , next to the Police Academy",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/ea2n2gkGVzUvfgUZ8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.1970426,
        "longitude": 30.0911375
    },
    {
        "id": "Az-Branch-0037",
        "branch": "ChillOut AlRehab",
        "address": "Chillout Gas station - Al Rehab - New Cairo.",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/RWfKL1BueiUhKYEg7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4399347,
        "longitude": 30.0523625
    },
    {
        "id": "Az-Branch-0038",
        "branch": "ChillOut AlShouyfat",
        "address": "The entrance to AlShouyfat - the first entrance to the Compound Golf Katameya - Gas station Chillout.",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/upnXQ4b6jMZZ2RcX6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0039",
        "branch": "City Center Almaza",
        "address": "Almaza Airport, Sheraton ,Airport, Cairo",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/xzShV5NhMo6VGCfd7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3637684,
        "longitude": 30.0902034
    },
    {
        "id": "Az-Branch-0040",
        "branch": "City Center Maadi 2",
        "address": "Ring Road - Eastern Basateen - Al Basateen - Cairo",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/UhuQfiBRGZyJdbRa9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2672487,
        "longitude": 29.9908998
    },
    {
        "id": "Az-Branch-0041",
        "branch": "City Stars 1",
        "address": "Omar Ibn El Khattab St ,City Stars Mall , 1st Floor , Nasr City",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/g1iT1qSxeRaWcif26",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3473235,
        "longitude": 30.0734298
    },
    {
        "id": "Az-Branch-0042",
        "branch": "City Stars 3",
        "address": "Omar Ibn El Khattab St ,City Stars Mall , 4th Floor , Nasr City",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/g1iT1qSxeRaWcif26",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3473235,
        "longitude": 30.0734298
    },
    {
        "id": "Az-Branch-0043",
        "branch": "Civilization Museum",
        "address": "Civilization Museum - Al Fustat",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/Kh6HwDatBpo4xtTa9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2482393,
        "longitude": 30.0085929
    },
    {
        "id": "Az-Branch-0044",
        "branch": "College of Education",
        "address": "Faculty of Education, in front of ChillOut Roxy gas station inside the college",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/jeu5QFPEp1jUtSRF6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0045",
        "branch": "Concord Plaza",
        "address": "Ninety Street, Fifth Settlement, Concord Plaza Mall",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/DZ5c5rx7bzUtnkDJ9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4839369,
        "longitude": 30.0250478
    },
    {
        "id": "Az-Branch-0046",
        "branch": "District 5 Mall",
        "address": "District 5 Mall-Ain El Soukhna Road-Industrial Area",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/RAsQs8hgjBAGEewk8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4524509,
        "longitude": 29.9548669
    },
    {
        "id": "Az-Branch-0047",
        "branch": "Down Town Mall",
        "address": "Ninety Street, Fifth Settlement",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/ZtVDDa38EhpdKSn68",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4430295,
        "longitude": 30.0122123
    },
    {
        "id": "Az-Branch-0048",
        "branch": "East Hub Madinaty",
        "address": "East Hub Mall Madinaty front of Craft Zone",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/LmRxShwCr9NDhxUv9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.6701903,
        "longitude": 30.0733606
    },
    {
        "id": "Az-Branch-0049",
        "branch": "Egypt Station 1",
        "address": "Egypt Station , Ramsis Square, Al Fagalah, Al Azbakeya, Cairo Governorate",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/xCpugxzkiTpMLg189",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2474809,
        "longitude": 30.0624241
    },
    {
        "id": "Az-Branch-0050",
        "branch": "Egypt Station 2",
        "address": "Misr Station, Ramses Square, Faggala, Azbakeya, Cairo Governorate, in front of the station",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/xCpugxzkiTpMLg189",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.24657,
        "longitude": 30.0623791
    },
    {
        "id": "Az-Branch-0051",
        "branch": "El Korba",
        "address": "18 Nazih Khalifa Street, El Korba, Heliopolis, in front of Al-Thawra Hospital , Next to CIB Bank",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/v9PCxE8ibNvozbct7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3264289,
        "longitude": 30.0912698
    },
    {
        "id": "Az-Branch-0052",
        "branch": "El Maadi",
        "address": "62 Street 9 next to the Maadi Sknat station",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/NpH1VCqTiSXcEAwA6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2544636,
        "longitude": 29.9658773
    },
    {
        "id": "Az-Branch-0053",
        "branch": "El Manial",
        "address": "81 Main Manial Street.",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/yhqCevNgGcXrNjQJ7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2252229,
        "longitude": 30.0187845
    },
    {
        "id": "Az-Branch-0054",
        "branch": "Fathalla Market-Al Rehab",
        "address": "Sadat Axis , Beginning of New Cairo , Cairo Governorate",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/LZhZve8kxJrkaJHc7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4692235,
        "longitude": 30.0534103
    },
    {
        "id": "Az-Branch-0055",
        "branch": "Fresh Food Market-Point 90",
        "address": "In front of American University Gate 5 - Point 90 Mall",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/7w54UNjQNtxoVqAL8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0056",
        "branch": "Gateway Mall - Al Rehab",
        "address": "Gateway Mall, next to Alfa Market, Gate 13, Al Rehab",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/M2Skfw4pNEAqtD9G8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4796217,
        "longitude": 30.0641894
    },
    {
        "id": "Az-Branch-0057",
        "branch": "G",
        "address": "Chillout ElChouyfat Gas Station, next to Triumph Hotel Fifth Settlement , New Cairo",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/r6HM1SAJ2zmK56Ho7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4284756,
        "longitude": 30.0084868
    },
    {
        "id": "Az-Branch-0058",
        "branch": "Girls College",
        "address": "Girls College- Merghany - inside the college",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/oJc4GeXNtvpCGhuRA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.333331,
        "longitude": 30.0852514
    },
    {
        "id": "Az-Branch-0059",
        "branch": "Global Medical City",
        "address": "Al Manteqah al Sadesah, Nasr City, Cairo",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/C4ewx5x9xt84e68B8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3558103,
        "longitude": 30.0647818
    },
    {
        "id": "Az-Branch-0060",
        "branch": "Go Bus",
        "address": "Sixth district, Next to Zanusi Company Nasr City, Cairo",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/xATXybKmy4P9xy58A",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.38149,
        "longitude": 30.0205814
    },
    {
        "id": "Az-Branch-0061",
        "branch": "Hadayek Al Kobba",
        "address": "156 Egypt and Sudan Street, next to Al-Youm Fish Restaurant",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/c8J8HnhMnahZZ6wE8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.1937874,
        "longitude": 30.044242
    },
    {
        "id": "Az-Branch-0062",
        "branch": "Heliopolis star",
        "address": "Heliopolis Star",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/qfcBCgXbxRdEoeSYA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0063",
        "branch": "Helwan",
        "address": "40 Ragheb Street, intersection of Mohamed Sayed Ahmed Street, in front of KFC and Jad Restaurant",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/iBv2jCzVxnwu9tgT7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0064",
        "branch": "Helwan University",
        "address": "Helwan University - next to the commercial center - and runway 4",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/BCQWNDqhB2KFAR1D8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3153857,
        "longitude": 29.8669319
    },
    {
        "id": "Az-Branch-0065",
        "branch": "Lake House",
        "address": "Lake House, 90th Street, next to Doucid Hotel, inside Lake House Club",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/aCDviJhqmrHgzXqj7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4536429,
        "longitude": 30.0244686
    },
    {
        "id": "Az-Branch-0066",
        "branch": "Lake View",
        "address": "Ninety Street, behind the Air Force Hospital, Fifth Settlement",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/TjutLCT46KNRJBsW6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4430295,
        "longitude": 30.0122123
    },
    {
        "id": "Az-Branch-0067",
        "branch": "lulu Heliopolis",
        "address": "Lulu District Mall - Wadi Degla after National Gas Station",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/GeCYYoKvbGXBM4sE7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4029959,
        "longitude": 30.0513412
    },
    {
        "id": "Az-Branch-0068",
        "branch": "Lulu Market-New Cairo",
        "address": "First Settlement, Lulu Market Mall, next to the Police Academy, first floor",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/3hyfFLWgvHtgtBWF9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0069",
        "branch": "Maadi 50",
        "address": "50th Street Zahraa Al Maadi, next to KFC and QNB Bank",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/hfmjGV8SZVM2jED56",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3037388,
        "longitude": 29.9619427
    },
    {
        "id": "Az-Branch-0070",
        "branch": "Maadi Laselki St.",
        "address": "Street 216, Ezbet Fahmy, From Laselki St.",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/KQ9P67kNMutU4UEc8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2795046,
        "longitude": 29.9704816
    },
    {
        "id": "Az-Branch-0071",
        "branch": "Madinaty",
        "address": "Madinaty Road in front of Carrefour",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/37Trn15YFRUAPmbL8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.6232599,
        "longitude": 30.0939533
    },
    {
        "id": "Az-Branch-0072",
        "branch": "Madinaty Food Hall",
        "address": "Open Air Mall Building F",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/Pm5vHeCrZzbdhYqNA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.6265251,
        "longitude": 30.1086266
    },
    {
        "id": "Az-Branch-0073",
        "branch": "Madinaty-Craft Zone",
        "address": "Madinaty ,Craft Zone , New Cairo",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/U9wUDiDNgE9tmY1J9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.6745522,
        "longitude": 30.0728961
    },
    {
        "id": "Az-Branch-0074",
        "branch": "Makram Ebeid",
        "address": "90 Makram Ebeid Street, Nasr City, next to Cafe Beanos",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/eDkUf1DMsP2pevNm6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3443287,
        "longitude": 30.0656806
    },
    {
        "id": "Az-Branch-0075",
        "branch": "Merghany branch",
        "address": "105 El-Sayed El-Marghani Street, Heliopolis, next to tortina For Sweets",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/DBJRkhjaqMo7LzAd7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3349789,
        "longitude": 30.087283
    },
    {
        "id": "Az-Branch-0076",
        "branch": "Metro Ahly Club",
        "address": "17 El Ahram St., In front of Normandy Cinema , El Korba",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/PfzRCZBsfqWScjW87",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.293882,
        "longitude": 30.0124784
    },
    {
        "id": "Az-Branch-0077",
        "branch": "Metro Genena Mall",
        "address": "6 El-Batrawy St",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/ngYEA4fk8mYRYz1X7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3308338,
        "longitude": 30.061516
    },
    {
        "id": "Az-Branch-0078",
        "branch": "Metro Heliopolis",
        "address": "18 Al Khalifa Al Ma'mun, Manshiet al-Bakri",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/ZwDZ33Zw1CN4V7p96",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.0054491,
        "longitude": 31.2583338
    },
    {
        "id": "Az-Branch-0079",
        "branch": "Metro Market - El Korba",
        "address": "17 El Ahram St., In front of Normandy Cinema , El Korba",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/Q7vhuuwMsdtVpo889",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.293882,
        "longitude": 30.0124784
    },
    {
        "id": "Az-Branch-0080",
        "branch": "Metro Market - Roxi",
        "address": "Booth18 Al Khalifa Al Ma'mun, Manshiet al-Bakri",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/dNCbvm9bXqNdUqEN9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2568878,
        "longitude": 30.0164728
    },
    {
        "id": "Az-Branch-0081",
        "branch": "Metro Market-Al Ahly Club",
        "address": "84 Hassan Ma'moon, Al Manteqah as Sadesah, Ahly Club St, Nasr City",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/ibr5k1hsfwyyZXbq5",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3558022,
        "longitude": 30.0706402
    },
    {
        "id": "Az-Branch-0082",
        "branch": "Metro Market-Al Mokattam",
        "address": "16, 9 Street El Nafoura Sq. Mokattam, Cairo In Front Of National Bank Of Egypt",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/yDxBR4RZXMhLJw8X8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2845269,
        "longitude": 30.0143296
    },
    {
        "id": "Az-Branch-0083",
        "branch": "Metro Market-Al Rehab",
        "address": "Ground Floor, Rehab Mall, Talaat Mostafa Street.",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/7unXh2dT6mU8M31Q9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4875239,
        "longitude": 30.0593393
    },
    {
        "id": "Az-Branch-0084",
        "branch": "Metro Market-Maadi",
        "address": "53 Masr - Helwan Agriculture Road, Maadi.",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/S5GeHJFNGnqJkhw69",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2503285,
        "longitude": 29.961073
    },
    {
        "id": "Az-Branch-0085",
        "branch": "Metro Market-Panorama Mall",
        "address": "Inside Panorama El Shorouk Mall, El Shorouk City, New Cairo",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/1E5CmFJsmkEng2QX8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.6135435,
        "longitude": 30.1365326
    },
    {
        "id": "Az-Branch-0086",
        "branch": "Mivida",
        "address": "The Fifth Settlement, after the American University, the club inside the Mivida Compound",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/W5wAKE9HK9nkw5fY6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4284756,
        "longitude": 30.0084868
    },
    {
        "id": "Az-Branch-0087",
        "branch": "Mokattam",
        "address": "23 , 9 Street , Mokattam.",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/etMZwjQigyL2rXTW9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2544067,
        "longitude": 29.965869
    },
    {
        "id": "Az-Branch-0088",
        "branch": "Morshedy Degla View",
        "address": "Middle plateau,Salah El Din St. Gate (B31), in front of Carrefour and Adidas store",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/mYUn1PgKxC12mZjXA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3324326,
        "longitude": 30.0930789
    },
    {
        "id": "Az-Branch-0089",
        "branch": "Morshedy One Kattameya",
        "address": "One Kattameya - Al Morshedy Complex - Mohamed Zaki Square - Building 214",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/akdvbWgJtGTUUg7S8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4095335,
        "longitude": 29.978617
    },
    {
        "id": "Az-Branch-0090",
        "branch": "Mostafa El Nahas",
        "address": "16 Mostafa El Nahhas, 6th District, Nasr City, next to Primus Pizza",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/aqhY9D6EQBktMzM67",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3308287,
        "longitude": 30.0647747
    },
    {
        "id": "Az-Branch-0091",
        "branch": "Negmet Heliopolis - Shiraton",
        "address": "Market Jamal Salama next to Nuzha Traffic Department - Sheraton",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/sKcGtVEQjMbaUdHP8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3814285,
        "longitude": 30.0983838
    },
    {
        "id": "Az-Branch-0092",
        "branch": "Negmet Heliopolis-Gamee Square",
        "address": "5 Al Ramla street, El-Bostan, Heliopolis, Cairo Governorate",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/RPTeZwdiEZ9x8q1B8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3288922,
        "longitude": 30.0955757
    },
    {
        "id": "Az-Branch-0093",
        "branch": "Open Air 2 - Madinty",
        "address": "Open Air Mall - next to Asfour Crystal Shop",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/EsHa2vU3j3VQdHPH7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.6265251,
        "longitude": 30.1086266
    },
    {
        "id": "Az-Branch-0094",
        "branch": "Open Air 3 - Madinty",
        "address": "Open Air Mall -Kids Area-Polt C",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/hgwPzLJ9DWqhdsPp9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0095",
        "branch": "Oscar Grand Stores - Heliopolis",
        "address": "105 Omar Ibn El-Khattab, Almazah, Heliopolis",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/4KKGJUEM8DrTzxRH9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3457243,
        "longitude": 30.0872056
    },
    {
        "id": "Az-Branch-0096",
        "branch": "Oscar Grand Stores - Maadi",
        "address": "Main Zahraa Street in Zahraa Al Maadi, Rihana Plaza Tower , near to Vodafone",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/yYnzajoRb87Z9GFKA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3057941,
        "longitude": 29.9617319
    },
    {
        "id": "Az-Branch-0097",
        "branch": "Oscar Grand Stores-Tagamoa",
        "address": "Plot 425, 90th Street. Sector 3, 5th Compound, New cairo.",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/WGGrVAAs7xQn2VzMA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4430198,
        "longitude": 30.0122171
    },
    {
        "id": "Az-Branch-0098",
        "branch": "Panda ElMaadi",
        "address": "7A Nile Corniche, Dallah Tower, Maadi District, Cairo",
        "branch_type": "Booth",
        "link": "https://maps.google.com/maps?q=29.961395631.2472813&z=17&hl=en",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2471993,
        "longitude": 29.9619698
    },
    {
        "id": "Az-Branch-0099",
        "branch": "Panda Market",
        "address": "7 El-Nasr Rd, 6th District, Nasr City",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/BRFsEG73CparcMdGA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3426152,
        "longitude": 30.0689257
    },
    {
        "id": "Az-Branch-0100",
        "branch": "Pearl Mall",
        "address": "Pearl Mall, 90th Street intersection on the main axis",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/WeWSBfsk8K3n1qxa6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4430295,
        "longitude": 30.0122123
    },
    {
        "id": "Az-Branch-0101",
        "branch": "Petrojet",
        "address": "Petrojet branch inside the company. Working hours are from Sunday to Thursday from 8 am to 3 pm",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/RNM7WKXUCoMwfNEa7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0102",
        "branch": "Petrojet Booth",
        "address": "Petrojet Company, 90th Street, next to Downtown Mall",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/DEcvdLuLSUQzod6x9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0103",
        "branch": "Qasr El-Nil",
        "address": "56 Qasr El Nil in front of Wafa Bank & Alex Bank",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/VwrGXTnJqUWqeNpE7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2325889,
        "longitude": 30.0432583
    },
    {
        "id": "Az-Branch-0104",
        "branch": "Residence Hotel",
        "address": "Residence Hotel - First Settlement-Inside the Hotel",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/c6NshQgjNERzeHsk7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0105",
        "branch": "Royal House Al Shorouk",
        "address": "El Sadat Rd, El Shorouk, beside Terrace Mall",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/LSKuW4Tvc53u3C8p8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.6269635,
        "longitude": 30.1509886
    },
    {
        "id": "Az-Branch-0106",
        "branch": "Royal House Market-Merryland",
        "address": "6 Roxy St, in front of Merryland Park behind Othman Ahmed Othman Buildings",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/uC2VYyj3SZkE62Su9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0107",
        "branch": "Seoudi Market-City Stars",
        "address": "Omar Ibn El Khattab St ,City Stars Mall , Nasr City",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/sui4wWBJmfvKeo12A",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3473235,
        "longitude": 30.0734298
    },
    {
        "id": "Az-Branch-0108",
        "branch": "Seoudi Market-Water Way",
        "address": "22 A, The Waterway Compound, New cairo, Inside W Mall, Ground Floor.",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/PBMyhgdMvvtP4qYL7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4771017,
        "longitude": 30.041309
    },
    {
        "id": "Az-Branch-0109",
        "branch": "Sheraton Heliopolis",
        "address": "24 Sayed Zakaria Street Sheraton , In front of cilantro",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/mCY8bCvs4TwJCvVv8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3771676,
        "longitude": 30.098542
    },
    {
        "id": "Az-Branch-0110",
        "branch": "Sherif St.",
        "address": "13 Sherif Street, Downtown, next to the Ministry of Endowments",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/c4VM3P1fJi3FgYu27",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0111",
        "branch": "Shorouk Sky Plaza",
        "address": "El Shorouk City, Gate 1, Cairo Ismailia Road",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/JEVCiy2TCjcXVQKg7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.627228,
        "longitude": 30.1861714
    },
    {
        "id": "Az-Branch-0112",
        "branch": "Shoubra",
        "address": "70th Shoubra Street , Between Massara & Rood El Farag.",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/LJ8N6abPWV491AQ99",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0113",
        "branch": "Shoubra 2",
        "address": "41 A Shubra Street",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/9Had4yBkSaHBG9BD8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2451556,
        "longitude": 30.0660601
    },
    {
        "id": "Az-Branch-0114",
        "branch": "Sixty Walk Mall",
        "address": "Administrative Capital, Government District, next to the Ministry of Finance, Sixty Mall",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/apP5cMxSoHVr6bAo7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.7320231,
        "longitude": 30.0185865
    },
    {
        "id": "Az-Branch-0115",
        "branch": "South Gate New cairo",
        "address": "90th Street, South Gate Mall, next to Banque Misr, the front side parallel to Concord Plaza Mall",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/fEpFjhn1sr9hrEg27",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0116",
        "branch": "Spinneys Al-Shorouk",
        "address": "City Plaza Mall - Al-Shuhada Road - next to the British University and Al-Shorouk Academy - Al-Shorouk",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/VkVNNBsXX8HqpUBp6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.6066106,
        "longitude": 30.1143316
    },
    {
        "id": "Az-Branch-0117",
        "branch": "Spinneys Maxim Mall",
        "address": "North 90th Street,Inside Spinneys Maxim Mall,Fifth Settlement",
        "branch_type": "Booth",
        "link": "https://maps.app.goo.gl/BUTj1tZqDmwayizEA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.496699,
        "longitude": 30.0295773
    },
    {
        "id": "Az-Branch-0118",
        "branch": "Spinneys-Arena Mall",
        "address": "Banks Center , 90th Street , First New Cairo.",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/wp2YqwJcDG2ev9H47",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4216236,
        "longitude": 30.0182829
    },
    {
        "id": "Az-Branch-0119",
        "branch": "Spinneys-Maadi",
        "address": "Street 250, Maadi at Sarayat Al Gharbeyah, opposite to Maadi Grand Mall.",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/zzJK2bNZR2SFVS8A7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2701317,
        "longitude": 29.9656959
    },
    {
        "id": "Az-Branch-0120",
        "branch": "Spinneys-Pearl Des Rois",
        "address": "End of AUC St, beside Banque Misr, 3rd Settlement",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/PfknvHxXunu6vrrY8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0121",
        "branch": "Spinneys-Zahraa Al-Maadi",
        "address": "Hub, 50 Mall Zahraa Al Maadi, Cairo",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/LhAUQZqTZqSa2dpQA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3144469,
        "longitude": 29.9691862
    },
    {
        "id": "Az-Branch-0122",
        "branch": "The Park Mall",
        "address": "Park Mall ,5th Settlement, in front of Lulu Hypermarket beside Porto Cairo Hotel near to American Uni.",
        "branch_type": "Booth",
        "link": "https://goo.gl/maps/zjRa5qDosrUr8KJf8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4284756,
        "longitude": 30.0084868
    },
    {
        "id": "Az-Branch-0123",
        "branch": "Tseppas - Genena Mall",
        "address": "9 El Batrawy Street, Genena Mall, Nasr City",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/CnRxwhD31VjUz6wBA",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3321901,
        "longitude": 30.060953
    },
    {
        "id": "Az-Branch-0124",
        "branch": "Tseppas Heliopolis",
        "address": "45 Abu Bakr Al-Siddiq St., Intersection of Haroun St., Court Square, Heliopolis, Cairo, in front of Al-Nasr Schools.",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/HEctf2R2vbdi7UVp8",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.3326398,
        "longitude": 30.1021743
    },
    {
        "id": "Az-Branch-0125",
        "branch": "Up Town-Moktam",
        "address": "The new plaza in front of Celestia Gardens",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/r3KheWF8sx4ARhCe6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    },
    {
        "id": "Az-Branch-0126",
        "branch": "Wadi Degla - Settlement",
        "address": "Nakheel Compound - First Settlement - Wadi Degla Club - Tennis Area",
        "branch_type": "Branch",
        "link": "https://www.abuauf.com/en/branches",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4226647,
        "longitude": 30.0549189
    },
    {
        "id": "Az-Branch-0127",
        "branch": "Wadi Degla Maadi",
        "address": "The 4th part Zahraa Maadi beside the Kuwaiti mosque inside the club Gate 4",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/osbhsb4jPVThDyZR7",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2589346,
        "longitude": 29.9595144
    },
    {
        "id": "Az-Branch-0128",
        "branch": "Watania-Al Rehab",
        "address": "In front of Gate 1 Al-Rehab - Cairo Tahrir Axis",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/sA5ikk1JVTHkai2b9",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.4994979,
        "longitude": 30.0545161
    },
    {
        "id": "Az-Branch-0129",
        "branch": "Watanya El-Maadi",
        "address": "SaKr Kuraish Road, in front of Banque Misr, From Al-Nasr Street, next to American Aid and McDonald's",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/XfSSSiQYn3UjNxXL6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.0152768,
        "longitude": 29.9736306
    },
    {
        "id": "Az-Branch-0130",
        "branch": "Zamalek Brazil",
        "address": "5 Brazil Street, Zamalek, in front of Orange",
        "branch_type": "Branch",
        "link": "https://goo.gl/maps/dztma2e4jg4zdWby5",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 31.2226419,
        "longitude": 30.0607482
    },
    {
        "id": "Az-Branch-0131",
        "branch": "Zamalek Taha Husein",
        "address": "2 Taha Hussein, in front of Al Yamamah Center, next to the National Bank of Kuwait. Shop More at Physical Stores Online Stores",
        "branch_type": "Branch",
        "link": "https://maps.app.goo.gl/Ux8HGCLXh9oNTFrr6",
        "icon": "https://al-azab.co/img/beachpin.png",
        "latitude": 30.802498,
        "longitude": 26.820553
    }
];

let map;
let markers = [];
let infoWindow;

function initMap() {
    // مركز الخريطة الأولي (القاهرة)
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 30.0444, lng: 31.2357 },
        mapTypeId: 'roadmap',
        styles: [
            {
                "featureType": "administrative",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#444444"}]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [{"color": "#f2f2f2"}]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [{"saturation": -100}, {"lightness": 45}]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [{"visibility": "simplified"}]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [{"visibility": "off"}]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [{"color": "#3498db"}, {"visibility": "on"}]
            }
        ]
    });

    // إنشاء العلامات وعرض القائمة
    setMarkers(map);
    displayBranchesList();
    setupEventListeners();
}

function setMarkers(map) {
    const bounds = new google.maps.LatLngBounds();
    
    branches.forEach(branch => {
        // تخطي الفروع ذات الإحداثيات غير الصحيحة
        if (branch.latitude === 30.802498 && branch.longitude === 26.820553) {
            return;
        }

        const marker = new google.maps.Marker({
            position: { lat: branch.latitude, lng: branch.longitude },
            map: map,
            title: branch.branch,
            icon: {
                url: branch.branch_type === 'Branch' 
                    ? 'https://al-azab.co/img/beachpin.png'
                    : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="12" fill="#e67e22" stroke="white" stroke-width="2"/>
                            <circle cx="16" cy="16" r="6" fill="white"/>
                        </svg>
                    `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
            }
        });

        marker.addListener('click', () => {
            showBranchInfo(branch);
        });

        markers.push(marker);
        bounds.extend(marker.getPosition());
    });

    // ضبط عرض الخريطة ليشمل جميع العلامات
    if (markers.length > 0) {
        map.fitBounds(bounds);
    }
}

function displayBranchesList(filteredBranches = branches) {
    const branchesList = document.getElementById('branchesList');
    branchesList.innerHTML = '';

    filteredBranches.forEach(branch => {
        const branchItem = document.createElement('div');
        branchItem.className = 'branch-item';
        branchItem.innerHTML = `
            <div class="branch-name">${branch.branch}</div>
            <div class="branch-address">${branch.address}</div>
            <span class="branch-type ${branch.branch_type}">${branch.branch_type === 'Branch' ? 'فرع رئيسي' : 'كشك'}</span>
        `;

        branchItem.addEventListener('click', () => {
            // إزالة النشاط من جميع العناصر
            document.querySelectorAll('.branch-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // إضافة النشاط للعنصر المحدد
            branchItem.classList.add('active');
            
            // إظهار معلومات الفرع
            showBranchInfo(branch);
            
            // التمرير إلى العلامة على الخريطة
            const marker = markers.find(m => 
                m.getPosition().lat() === branch.latitude && 
                m.getPosition().lng() === branch.longitude
            );
            if (marker) {
                map.panTo(marker.getPosition());
                map.setZoom(15);
            }
        });

        branchesList.appendChild(branchItem);
    });
}

function showBranchInfo(branch) {
    const branchInfo = document.getElementById('branchInfo');
    const branchInfoContent = document.getElementById('branchInfoContent');
    
    branchInfoContent.innerHTML = `
        <h3>${branch.branch}</h3>
        <p><strong>العنوان:</strong> ${branch.address}</p>
        <p><strong>نوع الفرع:</strong> ${branch.branch_type === 'Branch' ? 'فرع رئيسي' : 'كشك'}</p>
        <p><strong>رقم المعرف:</strong> ${branch.id}</p>
        <a href="${branch.link}" target="_blank" style="background: #27ae60;">عرض على الخريطة</a>
    `;
    
    branchInfo.style.display = 'block';
}

function closeBranchInfo() {
    document.getElementById('branchInfo').style.display = 'none';
}

function setupEventListeners() {
    // البحث
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', filterBranches);

    // التصفية حسب النوع
    const typeFilter = document.getElementById('typeFilter');
    typeFilter.addEventListener('change', filterBranches);
}

function filterBranches() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;

    const filteredBranches = branches.filter(branch => {
        const matchesSearch = branch.branch.toLowerCase().includes(searchTerm) || 
                             branch.address.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === 'all' || branch.branch_type === typeFilter;
        
        return matchesSearch && matchesType;
    });

    displayBranchesList(filteredBranches);
    
    // تحديث العلامات على الخريطة
    updateMapMarkers(filteredBranches);
}

function updateMapMarkers(filteredBranches) {
    // إخفاء جميع العلامات
    markers.forEach(marker => marker.setMap(null));
    
    // إظهار العلامات المرشحة فقط
    markers.forEach(marker => {
        const branch = branches.find(b => 
            b.latitude === marker.getPosition().lat() && 
            b.longitude === marker.getPosition().lng()
        );
        
        if (branch && filteredBranches.includes(branch)) {
            marker.setMap(map);
        }
    });
}

// جعل الدوال متاحة عالمياً
window.initMap = initMap;
window.closeBranchInfo = closeBranchInfo;
