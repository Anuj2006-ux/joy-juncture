import json

# Game data for each file
games_data = {
    "g2.html": {
        "id": "jj02",
        "title": "Mehfil – Musical Card Game",
        "oldPrice": 1038,
        "newPrice": 518,
        "image": "https://joyjuncture.com/cdn/shop/files/WhatsApp_Image_2025-11-29_at_13.51.05.jpg?v=1764407325&width=713",
        "tag": "Hot",
        "navTitle": "Mehfil",
        "pageTitle": "Joy Juncture | Mehfil"
    },
    "g3.html": {
        "id": "jj03",
        "title": "Tamasha – Bollywood Bid",
        "oldPrice": 1038,
        "newPrice": 518,
        "image": "https://joyjuncture.com/cdn/shop/files/generated_image2.png?v=1764408944&width=713",
        "tag": "New",
        "navTitle": "Tamasha",
        "pageTitle": "Joy Juncture | Tamasha"
    },
    "g4.html": {
        "id": "jj04",
        "title": "Murder Mystery Case File",
        "oldPrice": 2598,
        "newPrice": 1298,
        "image": "https://joyjuncture.com/cdn/shop/files/WhatsAppImage2025-11-26at22.26.34.jpg?v=1764311510&width=360",
        "tag": "Best Seller",
        "navTitle": "Murder Mystery",
        "pageTitle": "Joy Juncture | Murder Mystery"
    },
    "g5.html": {
        "id": "jj05",
        "title": "Buzzed – Drinking Game",
        "oldPrice": 778,
        "newPrice": 388,
        "image": "https://joyjuncture.com/cdn/shop/files/generated_image_buzz.png?v=1764409590&width=360",
        "tag": "18+",
        "navTitle": "Buzzed",
        "pageTitle": "Joy Juncture | Buzzed"
    },
    "g6.html": {
        "id": "jj06",
        "title": "Judge Me & Guess",
        "oldPrice": 1948.70,
        "newPrice": 1298.70,
        "image": "https://joyjuncture.com/cdn/shop/files/WhatsApp_Image_2025-11-29_at_14.45.13.jpg?v=1764407770&width=360",
        "tag": "Sale",
        "navTitle": "Judge Me",
        "pageTitle": "Joy Juncture | Judge Me"
    },
    "g7.html": {
        "id": "jj07",
        "title": "One More Round | Jigsaw Puzzle",
        "oldPrice": 843.70,
        "newPrice": 648.70,
        "image": "https://joyjuncture.com/cdn/shop/files/IMG_1735.jpg?v=1750756387&width=360",
        "tag": "Sale",
        "navTitle": "One More Round",
        "pageTitle": "Joy Juncture | One More Round"
    }
}

print(json.dumps(games_data, indent=2))
