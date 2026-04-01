require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { connectToDB } = require("../database/db");
const Address = require("../models/Address");
const Brand = require("../models/Brand");
const Cart = require("../models/Cart");
const Category = require("../models/Category");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");
const Wishlist = require("../models/Wishlist");
const { slugify } = require("../utils/slugify");

const PRODUCTS_PER_CATEGORY = 22;
const TARGET_CATEGORY_COUNT = 10;
const TARGET_PRODUCT_COUNT = 100;
const TARGET_REVIEW_COUNT = 15;
const TARGET_BRAND_COUNT = 18;
const GENERATED_CUSTOMER_COUNT = 140;
const GENERATED_ORDER_COUNT = 240;

const segments = {
  mobile: { d: ["Blaze", "Pulse", "Vision", "Nova", "Edge", "Zen"], c: ["Black", "Blue", "Olive", "Silver"], s: ["4GB/64GB", "6GB/128GB", "8GB/256GB"], p: [3999, 45999], ship: ["Free delivery in 2-4 days", "Open-box delivery in select cities", "Seller dispatches within 48 hours"], ret: "7 day replacement available", war: "1 year brand warranty", img: ["photo-1511707171634-5f897ff02aa9", "photo-1546054454-aa26e2b734c7", "photo-1580910051074-3eb694886505", "photo-1510557880182-3b7d1f64a6b3", "photo-1512499617640-c2f999098c01", "photo-1517336714731-489689fd1ca8", "photo-1511707171634-5f897ff02aa9", "photo-1556740749-887f6717d7e4"] },
  wearable: { d: ["Stride", "Move", "Orbit", "Aura", "Glide", "Sprint"], c: ["Black", "Olive", "Blue", "Stone"], s: ["Standard"], p: [1499, 14999], ship: ["Free delivery in 2-3 days", "Metro express delivery available", "Dispatches in 24-48 hours"], ret: "7 day replacement available", war: "1 year wearable warranty", img: ["photo-1523275335684-37898b6baf30", "photo-1546868871-7041f2a55e12", "photo-1508685096489-7aacd43bd3b1", "photo-1517841905240-472988babdf9", "photo-1516574187841-cb9cc2ca948b", "photo-1460353581641-37baddab0fa2"] },
  audio: { d: ["Bass", "Sonic", "Wave", "Studio", "Echo", "Tune"], c: ["Graphite", "Ivory", "Black", "Navy"], s: ["Standard"], p: [899, 19999], ship: ["Free delivery in 2-4 days", "Premium packaging included", "Express delivery available"], ret: "7 day replacement available", war: "1 year audio warranty", img: ["photo-1546435770-a3e426bf472b", "photo-1606220588913-b3aacb4d2f46", "photo-1505740420928-5e560c06d30e", "photo-1512446816044-4a65fdc5a6a7", "photo-1484704849700-f032a568e944", "photo-1484704849700-f032a568e944"] },
  appliance: { d: ["Smart", "Turbo", "Fresh", "Cool", "Power", "Eco"], c: ["Silver", "White", "Black", "Graphite"], s: ["Standard"], p: [2499, 68999], ship: ["Seller dispatches within 48 hours", "Installation support available in select cities", "Free doorstep delivery in 3-6 days"], ret: "7 day service replacement where applicable", war: "1 year comprehensive warranty", img: ["photo-1585515656826-18a4e83993ff", "photo-1586201375761-83865001e31c", "photo-1520607162513-77705c0f0d4a", "photo-1505471768198-991d7093a7ed", "photo-1523419409543-1d390d545ff3", "photo-1519710164239-da123dc03ef4"] },
  kitchen: { d: ["Everyday", "Classic", "Chef", "Signature", "Smart", "Essential"], c: ["Sage", "Ivory", "Terracotta", "Steel"], s: ["Standard", "Set of 3", "Set of 5", "24 Pc"], p: [299, 15999], ship: ["Delivered with secure packaging", "Free delivery in 2-5 days", "Easy doorstep delivery available"], ret: "7 day replacement available", war: "6 months to 2 years depending on product", img: ["photo-1517248135467-4c7edcad34c4", "photo-1473093295043-cdd812d0e601", "photo-1495474472287-4d71bcdd2085", "photo-1482049016688-2d3e1b311543", "photo-1504674900247-0877df9cc836", "photo-1504754524776-8f4f37790ca0"] },
  furniture: { d: ["Urban", "Comfort", "Prime", "Heritage", "Modern", "Craft"], c: ["Walnut", "Oak", "Beige", "Charcoal"], s: ["Single", "Queen", "King", "Standard"], p: [2499, 55999], ship: ["Free doorstep delivery in 4-7 days", "Installation support available in metro cities", "Large-item delivery slot shared after confirmation"], ret: "7 day replacement available", war: "1 to 3 year manufacturer warranty", img: ["photo-1505693416388-ac5ce068fe85", "photo-1493666438817-866a91353ca9", "photo-1513694203232-719a280e022f", "photo-1524758631624-e2822e304c36", "photo-1484101403633-562f891dc89a", "photo-1505691938895-1758d7feb511"] },
  office: { d: ["Work", "Ergo", "Focus", "Task", "Studio", "Flex"], c: ["Oak", "Walnut", "Black", "Stone"], s: ["Standard", "120 cm", "140 cm"], p: [1499, 34999], ship: ["Installation support available in select cities", "Free delivery in 3-6 days", "Seller dispatches within 48 hours"], ret: "7 day replacement available", war: "1 year manufacturer warranty", img: ["photo-1497366754035-f200968a6e72", "photo-1497366811353-6870744d04b2", "photo-1517502474097-f9b30659dadb", "photo-1524758631624-e2822e304c36", "photo-1496181133206-80ce9b88a853", "photo-1504384308090-c894fdcc538d"] },
  decor: { d: ["Glow", "Aura", "Calm", "Nest", "Accent", "Harmony"], c: ["Beige", "Olive", "Ivory", "Gold"], s: ["Single", "Queen", "King", "Standard"], p: [399, 12999], ship: ["Free delivery in 2-5 days", "Secure packaging included", "Seller dispatches within 48 hours"], ret: "7 day replacement available", war: "6 months to 1 year depending on product", img: ["photo-1513694203232-719a280e022f", "photo-1513519245088-0e12902e5a38", "photo-1484101403633-562f891dc89a", "photo-1505691938895-1758d7feb511", "photo-1501045661006-fcebe0257c3f", "photo-1505691938895-1758d7feb511"] },
  personalCare: { d: ["Glow", "Pure", "Daily", "Repair", "Fresh", "Balance"], c: ["Amber", "Rose", "Sand", "Ivory"], s: ["100 ml", "200 ml", "300 ml", "Combo Pack"], p: [249, 3499], ship: ["Lightweight secure packaging", "Free delivery in 2-4 days", "Seller dispatches within 24-48 hours"], ret: "7 day replacement available", war: "No warranty applicable", img: ["photo-1556228578-8c89e6adf883", "photo-1625772452859-1c03d5bf1137", "photo-1522335789203-aabd1fc54bc9", "photo-1522335789203-aabd1fc54bc9", "photo-1501004318641-b39e6451bec6", "photo-1501004318641-b39e6451bec6"] },
  fitness: { d: ["Active", "Core", "Flex", "Power", "Move", "Recover"], c: ["Black", "Olive", "Blue", "Grey"], s: ["Standard", "5 kg", "10 kg", "20 kg"], p: [399, 24999], ship: ["Free delivery in 2-5 days", "Seller dispatches within 48 hours", "Equipment delivery slot shared after packing"], ret: "7 day replacement available", war: "6 months to 1 year warranty", img: ["photo-1517836357463-d25dfeac3438", "photo-1518611012118-696072aa579a", "photo-1571019613914-85f342c55f55", "photo-1517963879433-6ad2b056d712", "photo-1517963879433-6ad2b056d712", "photo-1517836357463-d25dfeac3438"] },
  fashion: { d: ["Urban", "Classic", "Everyday", "Premium", "Street", "Comfort"], c: ["Black", "Navy", "Olive", "White", "Maroon"], s: ["S", "M", "L", "XL", "XXL"], p: [499, 8999], ship: ["Free delivery in 2-4 days", "Easy exchange available", "Seller dispatches within 24-48 hours"], ret: "7 day exchange and replacement available", war: "No warranty applicable", img: ["photo-1523381210434-271e8be1f52b", "photo-1512436991641-6745cdb1723f", "photo-1521572267360-ee0c2909d518", "photo-1489987707025-afc232f7ea0f", "photo-1445205170230-053b83016050", "photo-1529139574466-a303027c1d8b"] },
  travel: { d: ["Voyage", "Transit", "Cabin", "Metro", "Trail", "Glide"], c: ["Black", "Navy", "Olive", "Grey"], s: ["Cabin", "Medium", "Large", "30 L", "45 L"], p: [799, 14999], ship: ["Free delivery in 2-5 days", "Travel-ready packaging included", "Seller dispatches within 48 hours"], ret: "7 day replacement available", war: "1 to 3 year manufacturer warranty", img: ["photo-1500530855697-b586d89ba3ee", "photo-1488646953014-85cb44e25828", "photo-1527631746610-bca00a040d60", "photo-1499951360447-b19be8fe80f5", "photo-1500530855697-b586d89ba3ee", "photo-1527631746610-bca00a040d60"] },
  baby: { d: ["Tender", "Care", "Soft", "Safe", "Little", "Pure"], c: ["Pastel Blue", "Pastel Pink", "Ivory", "Mint"], s: ["Small", "Medium", "Large", "Combo Pack"], p: [249, 5999], ship: ["Free delivery in 2-4 days", "Secure hygiene packaging included", "Seller dispatches within 24-48 hours"], ret: "7 day replacement available", war: "No warranty applicable", img: ["photo-1515488042361-ee00e0ddd4e4", "photo-1544717305-2782549b5136", "photo-1516627145497-ae6968895b74", "photo-1487412720507-e7ab37603c6f", "photo-1516627145497-ae6968895b74", "photo-1544717305-2782549b5136"] },
  watch: { d: ["Classic", "Neo", "Edge", "Elite", "Prime", "City"], c: ["Brown", "Black", "Silver", "Blue"], s: ["Standard"], p: [1299, 17999], ship: ["Free delivery in 2-4 days", "Gift-ready packaging included", "Seller dispatches within 24-48 hours"], ret: "7 day replacement available", war: "6 months to 2 years warranty", img: ["photo-1523170335258-f5ed11844a49", "photo-1434056886845-dac89ffe9b56", "photo-1547996160-81dfa63595aa", "photo-1500530855697-b586d89ba3ee", "photo-1523275335684-37898b6baf30", "photo-1547996160-81dfa63595aa"] },
};

const categoryRows = [
  ["Smartphones", "Smartphone", "mobile", ["mobile"], "5G-ready smartphones for daily use and streaming."],
  ["Feature Phones", "Feature Phone", "mobile", ["mobile"], "Reliable keypad phones with long battery life."],
  ["Tablets", "Tablet", "mobile", ["mobile"], "Tablets for entertainment, classes, and light work."],
  ["Power Banks", "Power Bank", "mobile", ["mobile"], "Portable charging for work, travel, and backup."],
  ["Chargers & Cables", "Charger", "mobile", ["mobile"], "Fast charging accessories for phones and tablets."],
  ["Smartwatches", "Smartwatch", "wearable", ["wearable", "watch"], "Smartwatches with calling and health tracking."],
  ["Fitness Bands", "Fitness Band", "wearable", ["wearable"], "Lightweight bands for step goals and wellness."],
  ["Earbuds", "Earbuds", "audio", ["audio"], "True wireless earbuds for music and calls."],
  ["Bluetooth Speakers", "Speaker", "audio", ["audio"], "Portable speakers for home and outdoor use."],
  ["Headphones", "Headphones", "audio", ["audio"], "Over-ear and on-ear headphones for daily listening."],
  ["Soundbars", "Soundbar", "audio", ["audio"], "TV soundbars with clearer dialogue and fuller audio."],
  ["Televisions", "Television", "appliance", ["appliance"], "Smart TVs built for streaming and sports."],
  ["Refrigerators", "Refrigerator", "appliance", ["appliance"], "Single and double-door fridges for modern kitchens."],
  ["Washing Machines", "Washing Machine", "appliance", ["appliance"], "Laundry appliances for family homes."],
  ["Air Conditioners", "Air Conditioner", "appliance", ["appliance"], "Cooling solutions for Indian summers."],
  ["Air Coolers", "Air Cooler", "appliance", ["appliance"], "Room coolers for bedrooms and study spaces."],
  ["Microwave Ovens", "Microwave Oven", "appliance", ["appliance", "kitchen"], "Microwave ovens for reheating and quick meals."],
  ["Water Purifiers", "Water Purifier", "appliance", ["appliance"], "RO and UV purifiers for home drinking water."],
  ["Mixer Grinders", "Mixer Grinder", "kitchen", ["kitchen", "appliance"], "Daily kitchen prep appliances for chutneys and batters."],
  ["Induction Cooktops", "Induction Cooktop", "kitchen", ["kitchen", "appliance"], "Portable cooktops for efficient compact cooking."],
  ["Pressure Cookers", "Pressure Cooker", "kitchen", ["kitchen"], "Pressure cookers for everyday Indian meals."],
  ["Cookware Sets", "Cookware Set", "kitchen", ["kitchen"], "Pots and pans for regular home cooking."],
  ["Dinner Sets", "Dinner Set", "kitchen", ["kitchen"], "Ceramic and glass dinnerware for family dining."],
  ["Water Bottles", "Bottle", "kitchen", ["kitchen"], "Insulated bottles and drinkware for office, school, and travel."],
  ["Sofas", "Sofa", "furniture", ["furniture"], "Comfort-focused sofas for living rooms."],
  ["Coffee Tables", "Coffee Table", "furniture", ["furniture"], "Centre tables for everyday living spaces."],
  ["Study Desks", "Study Desk", "office", ["office", "furniture"], "Work and study desks for compact home setups."],
  ["Office Chairs", "Office Chair", "office", ["office", "furniture"], "Ergonomic office chairs for long work sessions."],
  ["Beds", "Bed", "furniture", ["furniture"], "Beds for modern bedrooms and guest rooms."],
  ["Mattresses", "Mattress", "furniture", ["furniture"], "Mattresses designed for support and airflow."],
  ["Wardrobes", "Wardrobe", "furniture", ["furniture"], "Spacious wardrobes with shelves and hanging storage."],
  ["Storage Cabinets", "Storage Cabinet", "furniture", ["furniture"], "Storage units for utility and bedroom organization."],
  ["Curtains", "Curtain Set", "decor", ["decor"], "Window curtains for privacy and light control."],
  ["Bedsheets", "Bedsheet Set", "decor", ["decor"], "Bedsheets and bedding sets for everyday comfort."],
  ["Home Lighting", "Light", "decor", ["decor"], "Table lamps, floor lamps, and home lighting."],
  ["Wall Decor", "Wall Decor", "decor", ["decor"], "Mirrors, framed art, and decorative accents."],
  ["Skincare", "Skincare Kit", "personalCare", ["personal-care"], "Serums, cleansers, and moisturisers for daily routines."],
  ["Hair Care", "Hair Care Kit", "personalCare", ["personal-care"], "Shampoos, oils, and masks for regular care."],
  ["Grooming Kits", "Grooming Kit", "personalCare", ["personal-care"], "Grooming kits and tools for personal upkeep."],
  ["Makeup", "Makeup Kit", "personalCare", ["personal-care", "fashion"], "Face, lip, and eye products for daily looks."],
  ["Wellness Supplements", "Supplement Pack", "fitness", ["wellness", "fitness", "personal-care"], "Supplements and nutrition support for active lifestyles."],
  ["Fitness Equipment", "Fitness Equipment", "fitness", ["fitness"], "Home workout essentials for strength and cardio."],
  ["Yoga Essentials", "Yoga Kit", "fitness", ["fitness"], "Yoga mats and accessories for mindful movement."],
  ["Men's Fashion", "Menswear", "fashion", ["fashion"], "Men's apparel for work, travel, and casual styling."],
  ["Women's Fashion", "Womenswear", "fashion", ["fashion"], "Women's apparel with versatile everyday styling."],
  ["Footwear", "Footwear", "fashion", ["fashion"], "Sneakers, sandals, and everyday footwear."],
  ["Watches", "Watch", "watch", ["watch", "fashion"], "Analog and hybrid watch styles for daily wear."],
  ["Backpacks", "Backpack", "travel", ["travel", "fashion"], "Backpacks for commute, college, work, and short trips."],
  ["Travel Luggage", "Luggage Set", "travel", ["travel"], "Cabin luggage and travel suitcases for frequent flyers."],
  ["Baby Care", "Baby Care Kit", "baby", ["baby"], "Baby essentials for feeding, hygiene, and comfort."],
];

const brandRows = [
  ["boAt", ["audio", "wearable"], "Indian lifestyle electronics brand focused on audio and wearables."],
  ["Noise", ["audio", "wearable"], "Consumer tech brand known for smartwatches and earbuds."],
  ["Fire-Boltt", ["audio", "wearable"], "Wearables and audio products built for value-focused shoppers."],
  ["Boult", ["audio", "wearable"], "Audio and wearable accessories for daily use."],
  ["Mivi", ["audio"], "Made-in-India audio brand for speakers and earbuds."],
  ["Zebronics", ["audio", "mobile", "office"], "Electronics brand covering audio, accessories, and office gear."],
  ["Portronics", ["audio", "mobile", "office"], "Utility accessories across charging, speakers, and office use."],
  ["Ambrane", ["mobile"], "Charging and mobile accessory brand known for power banks."],
  ["Lava", ["mobile"], "Indian mobile brand offering smartphones, tablets, and feature phones."],
  ["Micromax", ["mobile"], "Electronics brand with feature phones, tablets, and mobile devices."],
  ["Titan", ["wearable", "watch", "fashion"], "Indian brand with watches, wearables, and lifestyle accessories."],
  ["Fastrack", ["wearable", "watch", "fashion"], "Youth-focused brand for watches, bags, and wearables."],
  ["Bata India", ["fashion"], "Footwear and fashion essentials brand with broad reach across India."],
  ["Campus", ["fashion"], "Athleisure-focused Indian footwear brand for active wear."],
  ["Liberty", ["fashion"], "Indian footwear brand spanning casual and work styles."],
  ["Wildcraft", ["fashion", "travel"], "Outdoor and travel brand for apparel and backpacks."],
  ["Skybags", ["travel", "fashion"], "Indian luggage and backpack brand for students and travellers."],
  ["VIP", ["travel"], "Legacy Indian luggage brand with cabin and check-in travel options."],
  ["Safari", ["travel"], "Travel luggage and bags brand for family and work travel."],
  ["Prestige", ["kitchen", "appliance"], "Kitchen and appliance brand widely used in Indian homes."],
  ["Butterfly", ["kitchen", "appliance"], "Cookware and kitchen appliance brand for home cooking routines."],
  ["Pigeon", ["kitchen", "appliance"], "Utility kitchenware and home appliances for everyday cooking."],
  ["Hawkins", ["kitchen"], "Pressure cookers and cookware built for Indian kitchens."],
  ["Borosil", ["kitchen", "decor"], "Glassware, drinkware, and home utility products with durable finishes."],
  ["Milton", ["kitchen"], "Homeware brand known for bottles, flasks, and lunch solutions."],
  ["Cello", ["kitchen", "decor", "furniture"], "Home and kitchen brand spanning drinkware and storage utility."],
  ["Wonderchef", ["kitchen", "appliance"], "Premium kitchen tools and countertop appliances."],
  ["Bajaj", ["appliance", "kitchen", "personal-care"], "Indian appliance brand spanning kitchens and home climate."],
  ["Havells", ["appliance", "decor"], "Electrical and appliance brand for lighting and home utility."],
  ["Crompton", ["appliance", "decor"], "Home electrical and appliance brand for fans, lighting, and utility."],
  ["Usha", ["appliance", "decor", "furniture"], "Legacy Indian brand across appliances and home use."],
  ["Voltas", ["appliance"], "Cooling solutions brand with strong presence in Indian climate control."],
  ["Blue Star", ["appliance"], "Cooling and refrigeration brand for residential spaces."],
  ["Livpure", ["appliance"], "Water purification and home hydration solutions brand."],
  ["Godrej Interio", ["furniture", "office"], "Furniture and office interiors brand with broad home catalog."],
  ["Nilkamal", ["furniture", "office", "decor"], "Furniture and storage brand used widely across Indian homes."],
  ["Urban Ladder", ["furniture", "office", "decor"], "Modern furniture brand for bedrooms, living rooms, and study spaces."],
  ["Wakefit", ["furniture", "decor"], "Mattresses, furniture, and sleep-focused home products."],
  ["Sleepyhead", ["furniture", "decor"], "Comfort-first furniture and bedding brand for urban homes."],
  ["Durian", ["furniture", "office"], "Home and office furniture brand for work and living spaces."],
  ["Mamaearth", ["personal-care", "baby"], "Personal and baby care products built around everyday family routines."],
  ["Himalaya", ["personal-care", "baby", "wellness"], "Personal care and wellness brand familiar across India."],
  ["Biotique", ["personal-care"], "Skincare and haircare brand with herbal product lines."],
  ["Lakme", ["personal-care", "fashion"], "Beauty and makeup brand for daily and occasion looks."],
  ["Minimalist", ["personal-care"], "Ingredient-focused skincare brand for targeted routines."],
  ["Plum", ["personal-care"], "Skincare and bodycare brand with routines for daily self-care."],
  ["WOW Skin Science", ["personal-care", "wellness"], "Beauty and wellness brand across haircare and skincare."],
  ["SUGAR Cosmetics", ["personal-care", "fashion"], "Makeup-first beauty brand with wearable shades and travel kits."],
  ["Forest Essentials", ["personal-care"], "Premium beauty and wellness products rooted in Indian rituals."],
  ["Wipro", ["office", "decor", "appliance"], "Indian brand serving office utility, lighting, and electronics needs."],
  ["Syska", ["mobile", "decor"], "Charging, lighting, and electronics accessories brand."],
  ["Crossbeats", ["audio", "wearable"], "Wearables and audio solutions for young customers."],
  ["Maharaja Whiteline", ["appliance", "kitchen"], "Home and kitchen appliances brand for grinding and cooking."],
  ["Ajanta", ["decor", "watch"], "Timekeeping and home utility brand with clocks and watch products."],
  ["Lifelong", ["fitness"], "Home utility and fitness products for entry-level daily use."],
  ["Cosco", ["fitness"], "Fitness and sports equipment brand for home workouts and recreation."],
  ["HRX", ["fitness", "fashion"], "Fitness-led apparel and accessories brand."],
  ["Boldfit", ["fitness", "wellness"], "Fitness accessories, yoga gear, and wellness-oriented equipment."],
  ["Tynor", ["fitness", "wellness"], "Support and recovery products for active mobility and wellness."],
  ["Mee Mee", ["baby"], "Baby care brand covering feeding, hygiene, and infant essentials."],
  ["Mother Sparsh", ["baby", "personal-care"], "Baby and family care products for gentle daily routines."],
];

const couponsData = [
  { code: "WELCOME10", title: "Welcome savings", description: "10% off above Rs. 2,499", discountType: "percentage", discountValue: 10, minOrderValue: 2499, maxDiscount: 1200 },
  { code: "HOME1500", title: "Home upgrade offer", description: "Flat Rs. 1,500 off on bigger home orders", discountType: "fixed", discountValue: 1500, minOrderValue: 14999 },
  { code: "AUDIO15", title: "Audio week", description: "15% off on audio devices", discountType: "percentage", discountValue: 15, minOrderValue: 3999, maxDiscount: 2500 },
  { code: "FIT500", title: "Fitness starter", description: "Flat Rs. 500 off on fitness products", discountType: "fixed", discountValue: 500, minOrderValue: 2999 },
  { code: "STYLE12", title: "Fashion edit", description: "12% off on style categories", discountType: "percentage", discountValue: 12, minOrderValue: 1999, maxDiscount: 1800 },
  { code: "KITCHEN8", title: "Kitchen essentials", description: "8% off on kitchen products", discountType: "percentage", discountValue: 8, minOrderValue: 2499, maxDiscount: 1400 },
  { code: "CARE300", title: "Beauty basket", description: "Flat Rs. 300 off on self-care orders", discountType: "fixed", discountValue: 300, minOrderValue: 1499 },
  { code: "TRAVEL10", title: "Travel ready", description: "10% off on luggage and backpacks", discountType: "percentage", discountValue: 10, minOrderValue: 3499, maxDiscount: 1600 },
  { code: "BABY5", title: "Baby care boost", description: "5% off on baby care essentials", discountType: "percentage", discountValue: 5, minOrderValue: 999, maxDiscount: 500 },
  { code: "MEGADEAL", title: "Mega marketplace day", description: "Flat Rs. 2,000 off on high-value carts", discountType: "fixed", discountValue: 2000, minOrderValue: 24999 },
];

const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
const pick = (arr, index) => arr[index % arr.length];
const formatMoney = (value) => Number(value.toFixed(2));
const roundTo = (value, step) => Math.max(step, Math.round(value / step) * step);
const phone = (index) => `9${String(100000000 + index).slice(0, 9)}`;

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krish", "Ananya", "Aadhya", "Diya", "Myra", "Ira", "Riya", "Meera", "Kiara", "Saanvi", "Kavya", "Ishaan", "Kabir", "Rohan", "Yash", "Dhruv", "Aryan", "Pranav", "Aanya", "Nitya", "Avni", "Ishita", "Navya"];
const lastNames = ["Sharma", "Verma", "Patel", "Gupta", "Singh", "Nair", "Reddy", "Mehta", "Iyer", "Kapoor", "Malhotra", "Bose", "Chopra", "Joshi", "Das", "Pillai", "Kulkarni", "Chaudhary", "Jain", "Agarwal"];
const localities = [
  { city: "Bengaluru", state: "Karnataka", postalCode: "560038", area: "Indiranagar" },
  { city: "Mumbai", state: "Maharashtra", postalCode: "400053", area: "Andheri West" },
  { city: "Delhi", state: "Delhi", postalCode: "110024", area: "Lajpat Nagar" },
  { city: "Pune", state: "Maharashtra", postalCode: "411014", area: "Viman Nagar" },
  { city: "Hyderabad", state: "Telangana", postalCode: "500081", area: "Madhapur" },
  { city: "Chennai", state: "Tamil Nadu", postalCode: "600041", area: "Thiruvanmiyur" },
  { city: "Ahmedabad", state: "Gujarat", postalCode: "380015", area: "Satellite" },
  { city: "Kolkata", state: "West Bengal", postalCode: "700019", area: "Ballygunge" },
  { city: "Jaipur", state: "Rajasthan", postalCode: "302017", area: "Malviya Nagar" },
  { city: "Gurugram", state: "Haryana", postalCode: "122003", area: "Sector 54" },
];

const reviewTemplates = [
  { title: "Great value", comment: "Packaging was solid and the product feels worth the price.", rating: 5 },
  { title: "Works well daily", comment: "Using it regularly and the experience has stayed consistent so far.", rating: 4 },
  { title: "Looks premium", comment: "Finish, fit, and overall presentation are better than expected.", rating: 5 },
  { title: "Reliable purchase", comment: "Delivered in good condition and setup was easy for everyday use.", rating: 4 },
  { title: "Good for the segment", comment: "Not perfect, but a dependable pick in this price range.", rating: 4 },
  { title: "Worth recommending", comment: "I would comfortably recommend this to family or friends.", rating: 5 },
];

const buildTrackingHistory = (status, createdAt) => {
  const base = new Date(createdAt);
  const at = (hours) => new Date(base.getTime() + hours * 60 * 60 * 1000);
  const timeline = [
    { status: "pending", title: "Order placed", description: "Your order was placed successfully.", timestamp: at(0) },
    { status: "confirmed", title: "Order confirmed", description: "Seller confirmed the order details.", timestamp: at(6) },
  ];
  if (["packed", "shipped", "out_for_delivery", "delivered"].includes(status)) timeline.push({ status: "packed", title: "Packed", description: "Items were packed at the seller warehouse.", timestamp: at(18) });
  if (["shipped", "out_for_delivery", "delivered"].includes(status)) timeline.push({ status: "shipped", title: "Shipped", description: "Shipment left the warehouse and is in transit.", timestamp: at(30) });
  if (["out_for_delivery", "delivered"].includes(status)) timeline.push({ status: "out_for_delivery", title: "Out for delivery", description: "Shipment reached the local hub and is out for delivery.", timestamp: at(54) });
  if (status === "delivered") timeline.push({ status: "delivered", title: "Delivered", description: "Order delivered successfully to the customer.", timestamp: at(64) });
  return timeline;
};

const baseSpecs = {
  mobile: (cfg, index) => [{ label: "Memory", value: pick(cfg.s, index) }, { label: "Battery", value: `${4500 + (index % 5) * 500} mAh` }, { label: "Connectivity", value: "4G / 5G, Wi-Fi, Bluetooth" }, { label: "Display", value: `${6.1 + (index % 4) * 0.2} inch` }],
  wearable: (cfg, index) => [{ label: "Display", value: `${1.6 + (index % 4) * 0.1} inch AMOLED` }, { label: "Battery", value: `${5 + (index % 6)} days` }, { label: "Health Tracking", value: "Heart rate, SpO2, sleep" }, { label: "Case", value: pick(cfg.c, index) }],
  audio: (cfg, index) => [{ label: "Connectivity", value: "Bluetooth 5.3" }, { label: "Playback", value: `${18 + (index % 5) * 6} hours` }, { label: "Audio Profile", value: "Balanced with enhanced bass" }, { label: "Finish", value: pick(cfg.c, index) }],
  appliance: (cfg, index) => [{ label: "Power", value: `${800 + (index % 7) * 200} W` }, { label: "Capacity", value: `${10 + (index % 8) * 5} L` }, { label: "Installation", value: "Brand-led support where applicable" }, { label: "Finish", value: pick(cfg.c, index) }],
  kitchen: (cfg, index) => [{ label: "Material", value: "Food-grade steel / ceramic composite" }, { label: "Set Size", value: pick(cfg.s, index) }, { label: "Care", value: "Hand wash or dishwasher-safe based on product" }, { label: "Finish", value: pick(cfg.c, index) }],
  furniture: (cfg, index) => [{ label: "Primary Material", value: "Engineered wood / metal blend" }, { label: "Finish", value: pick(cfg.c, index) }, { label: "Assembly", value: "Basic assembly required" }, { label: "Size", value: pick(cfg.s, index) }],
  office: (cfg, index) => [{ label: "Primary Material", value: "Engineered wood with powder-coated frame" }, { label: "Finish", value: pick(cfg.c, index) }, { label: "Use Case", value: "Home office and study setups" }, { label: "Size", value: pick(cfg.s, index) }],
  decor: (cfg, index) => [{ label: "Style", value: "Warm neutral contemporary" }, { label: "Finish", value: pick(cfg.c, index) }, { label: "Care", value: "Low-maintenance home styling" }, { label: "Size", value: pick(cfg.s, index) }],
  personalCare: (cfg, index) => [{ label: "Pack Size", value: pick(cfg.s, index) }, { label: "Usage", value: "Daily routine" }, { label: "Suitability", value: "Suitable for regular use" }, { label: "Finish", value: pick(cfg.c, index) }],
  fitness: (cfg, index) => [{ label: "Use Case", value: "Home workout and recovery" }, { label: "Pack / Weight", value: pick(cfg.s, index) }, { label: "Durability", value: "Designed for repeated home sessions" }, { label: "Finish", value: pick(cfg.c, index) }],
  fashion: (cfg, index) => [{ label: "Size", value: pick(cfg.s, index) }, { label: "Fit", value: "Regular everyday fit" }, { label: "Color", value: pick(cfg.c, index) }, { label: "Care", value: "Easy-care fabric and routine washing" }],
  travel: (cfg, index) => [{ label: "Size", value: pick(cfg.s, index) }, { label: "Material", value: "Durable poly-fabric shell" }, { label: "Use Case", value: "Commute and travel" }, { label: "Color", value: pick(cfg.c, index) }],
  baby: (cfg, index) => [{ label: "Pack Size", value: pick(cfg.s, index) }, { label: "Usage", value: "Daily baby care routine" }, { label: "Material", value: "Gentle and family-safe formulation" }, { label: "Color", value: pick(cfg.c, index) }],
  watch: (cfg, index) => [{ label: "Dial", value: "Analog / hybrid inspired" }, { label: "Strap", value: pick(cfg.c, index) }, { label: "Movement", value: "Quartz" }, { label: "Water Resistance", value: "Basic splash resistance" }],
};

const getBrandsForCategory = (category, brands) => brands.filter((brand) => brand.tags.some((tag) => category.brandTags.includes(tag)));
const buildHighlights = (category, brand, cfg, index) => [`${pick(cfg.d, index)} design tuned for Indian households and daily use.`, `${brand.name} backed product configuration with marketplace-ready packaging.`, `${pick(cfg.c, index)} finish matched with practical everyday usability.`, `${category.productType} setup designed for value, reliability, and repeat usage.`];
const getProductAt = (products, index) => products[index % products.length];

const buildProductsData = (categories, brands) => {
  const products = [];
  categories.forEach((category, categoryIndex) => {
    if (products.length >= TARGET_PRODUCT_COUNT) {
      return;
    }

    const cfg = segments[category.segment];
    const priceStep = cfg.p[1] > 20000 ? 500 : cfg.p[1] > 5000 ? 100 : 50;
    const matchingBrands = getBrandsForCategory(category, brands);
    for (let i = 0; i < PRODUCTS_PER_CATEGORY; i += 1) {
      if (products.length >= TARGET_PRODUCT_COUNT) {
        break;
      }

      const idx = categoryIndex * PRODUCTS_PER_CATEGORY + i;
      const brand = pick(matchingBrands, idx);
      const name = `${brand.name} ${pick(cfg.d, idx)} ${category.productType} ${pick(["Neo", "Prime", "Max", "Select", "Edge", "Lite"], idx)} ${100 + ((idx * 17) % 900)}`;
      const rawPrice = cfg.p[0] + (((idx * 137) + (categoryIndex * 59)) % (cfg.p[1] - cfg.p[0] + 1));
      const price = roundTo(rawPrice, priceStep);
      const originalPrice = roundTo(price * (1.15 + (idx % 18) / 100), priceStep);
      const stock = idx % 29 === 0 ? 0 : 5 + ((idx * 11) % 75);
      const colors = [...new Set([pick(cfg.c, idx), pick(cfg.c, idx + 1), pick(cfg.c, idx + 2)])];
      const sizes = ["fashion", "travel", "kitchen", "furniture", "office"].includes(category.segment) ? [...new Set([pick(cfg.s, idx), pick(cfg.s, idx + 1)])] : cfg.s.slice(0, 1);
      const images = Array.from(
        new Set([pick(cfg.img, idx), pick(cfg.img, idx + 3), pick(cfg.img, idx + 6)])
      ).map((item) => image(item));
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      products.push({
        name, title: name, slug: slugify(name),
        shortDescription: `${pick(cfg.d, idx)} ${category.productType.toLowerCase()} built for dependable everyday use.`,
        description: `${brand.name} ${pick(cfg.d, idx)} ${category.productType.toLowerCase()} in the ${category.name.toLowerCase()} range, designed for Indian shoppers looking for practical value, reliable delivery support, and easy day-to-day usability.`,
        highlights: buildHighlights(category, brand, cfg, idx), specs: baseSpecs[category.segment](cfg, idx), category: category._id, brand: brand._id,
        price, originalPrice, discountPercent: discount, discountPercentage: discount, stock, stockQuantity: stock, thumbnail: images[0], images, rating: 0, reviewCount: 0,
        featured: i < 4, trending: idx % 4 === 0, bestseller: idx % 5 === 0, status: "active", sizes, colors, shippingText: pick(cfg.ship, idx),
        sellerName: `${brand.name} Official Store`, returnPolicy: cfg.ret, warranty: cfg.war, seoTitle: name, seoDescription: `${category.productType} from ${brand.name} with live pricing and delivery support.`, metaKeywords: [brand.name, category.name, category.productType, "India"],
      });
    }
  });
  return products;
};

const generateCustomers = async (hashedPassword) => {
  const users = [];
  for (let i = 0; i < GENERATED_CUSTOMER_COUNT; i += 1) {
    const firstName = pick(firstNames, i);
    const lastName = pick(lastNames, i * 3);
    users.push({ name: `${firstName} ${lastName}`, email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@sastify.com`, password: hashedPassword, role: "user", isAdmin: false, isVerified: true, phone: phone(i + 1) });
  }
  return users;
};

const buildAddressDocs = (users) => users.filter((user) => !user.isAdmin).map((user, index) => {
  const locality = pick(localities, index);
  return { user: user._id, fullName: user.name, line1: `${100 + index}, ${locality.area} Residency`, line2: `Near ${pick(["Metro", "Market", "Park", "Circle"], index)} Road`, city: locality.city, state: locality.state, postalCode: locality.postalCode, country: "India", phoneNumber: user.phone, addressType: index % 3 === 0 ? "office" : "home", type: index % 3 === 0 ? "office" : "home", isDefault: true };
});

const buildReviewDocs = (products, users) => {
  const docs = [];
  const stats = {};
  const customers = users.filter((user) => !user.isAdmin);
  products.forEach((product, productIndex) => {
    if (docs.length >= TARGET_REVIEW_COUNT) {
      stats[product._id.toString()] = { rating: 0, reviewCount: 0 };
      return;
    }

    const count = Math.min(1, TARGET_REVIEW_COUNT - docs.length);
    let sum = 0;
    for (let reviewIndex = 0; reviewIndex < count; reviewIndex += 1) {
      const reviewer = customers[(productIndex * 7 + reviewIndex * 11) % customers.length];
      const template = pick(reviewTemplates, productIndex + reviewIndex);
      const rating = Math.max(3, Math.min(5, template.rating - ((productIndex + reviewIndex) % 7 === 0 ? 1 : 0)));
      docs.push({ user: reviewer._id, product: product._id, title: template.title, comment: `${template.comment} Bought for ${pick(["home use", "daily work", "family use", "personal care", "travel"], productIndex + reviewIndex)}.`, rating, status: "published" });
      sum += rating;
    }
    stats[product._id.toString()] = { rating: Number((sum / count).toFixed(1)), reviewCount: count };
  });
  return { docs, stats };
};

const snapshotAddress = (address) => ({ fullName: address.fullName, phoneNumber: address.phoneNumber, line1: address.line1, line2: address.line2, landmark: "", city: address.city, state: address.state, postalCode: address.postalCode, country: address.country, addressType: address.addressType });
const buildOrderItem = (product, quantity) => ({ product: product._id, slug: product.slug, name: product.name, brand: product.brand, brandName: product.brandName, category: product.category, categoryName: product.categoryName, image: product.thumbnail, quantity, unitPrice: product.price, originalPrice: product.originalPrice, discountPercent: product.discountPercent, totalPrice: formatMoney(product.price * quantity), selectedVariant: { size: product.sizes?.[0] || "", color: product.colors?.[0] || "" } });
const applyCouponToSubtotal = (subtotal, coupon) => !coupon || subtotal < coupon.minOrderValue ? 0 : coupon.discountType === "percentage" ? Math.min(coupon.maxDiscount || Infinity, formatMoney((subtotal * coupon.discountValue) / 100)) : Math.min(coupon.discountValue, subtotal);

async function seed() {
  await connectToDB();
  await Promise.all([Wishlist.deleteMany({}), Cart.deleteMany({}), Payment.deleteMany({}), Order.deleteMany({}), Review.deleteMany({}), Address.deleteMany({}), Coupon.deleteMany({}), Product.deleteMany({}), Brand.deleteMany({}), Category.deleteMany({}), User.deleteMany({})]);

  const limitedCategoryRows = categoryRows.slice(0, TARGET_CATEGORY_COUNT);
  const categories = await Category.insertMany(
    limitedCategoryRows.map(([name, , segment, , description]) => ({
      name,
      description,
      image: segments[segment]?.img?.[0] ? image(segments[segment].img[0]) : "",
      isActive: true,
    }))
  );
  const trimmedBrands = brandRows.slice(0, TARGET_BRAND_COUNT);
  const brands = await Brand.insertMany(trimmedBrands.map(([name, , description]) => ({ name, description, isActive: true })));
  const categoriesWithMeta = limitedCategoryRows.map(([name, productType, segment, brandTags, description]) => ({
    name,
    productType,
    segment,
    brandTags,
    description,
    _id: categories.find((entry) => entry.name === name)._id,
  }));
  const brandsWithMeta = trimmedBrands.map(([name, tags, description]) => ({
    name,
    tags,
    description,
    _id: brands.find((entry) => entry.name === name)._id,
  }));

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const userPassword = await bcrypt.hash("User@1234", 10);
  const seededUsers = await User.insertMany([
    { name: "Sastify Admin", email: "admin@sastify.com", password: adminPassword, role: "admin", isAdmin: true, isVerified: true, phone: "9876543210" },
    { name: "Riya Sharma", email: "riya.sharma@sastify.com", password: userPassword, role: "user", isAdmin: false, isVerified: true, phone: "9898989898" },
    { name: "Arjun Mehta", email: "arjun.mehta@sastify.com", password: userPassword, role: "user", isAdmin: false, isVerified: true, phone: "9888777666" },
    ...(await generateCustomers(userPassword)),
  ]);

  const createdProducts = await Product.insertMany(buildProductsData(categoriesWithMeta, brandsWithMeta));
  const brandLookup = Object.fromEntries(brandsWithMeta.map((brand) => [brand._id.toString(), brand.name]));
  const categoryLookup = Object.fromEntries(categoriesWithMeta.map((category) => [category._id.toString(), category.name]));
  const products = createdProducts.map((product) => ({ ...product.toObject(), brandName: brandLookup[product.brand.toString()], categoryName: categoryLookup[product.category.toString()] }));

  const addresses = await Address.insertMany(buildAddressDocs(seededUsers));
  const addressByUserId = Object.fromEntries(addresses.map((address) => [address.user.toString(), address]));
  const coupons = await Coupon.insertMany(couponsData.map((coupon, index) => ({ ...coupon, expiresAt: new Date(Date.now() + (45 + index * 10) * 24 * 60 * 60 * 1000), usageLimit: 5000, usageCount: 0, active: true })));

  const { docs: reviewDocs, stats } = buildReviewDocs(products, seededUsers);
  await Review.insertMany(reviewDocs);
  await Product.bulkWrite(Object.entries(stats).map(([productId, value]) => ({ updateOne: { filter: { _id: productId }, update: { $set: { rating: value.rating, reviewCount: value.reviewCount } } } })));

  const customerUsers = seededUsers.filter((user) => !user.isAdmin);
  const orderDocs = [];
  const paymentDocs = [];
  const couponUsage = {};

  for (let index = 0; index < GENERATED_ORDER_COUNT; index += 1) {
    const customer = customerUsers[index % customerUsers.length];
    const address = addressByUserId[customer._id.toString()];
    const paymentMethod = index % 4 === 0 ? "cod" : "online";
    const orderStatus = paymentMethod === "cod" ? pick(["pending", "confirmed", "packed"], index) : pick(["confirmed", "packed", "shipped", "out_for_delivery", "delivered"], index);
    const itemCount = 1 + (index % 3);
    const selectedItems = [];
    for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
      const product = products[(index * 9 + itemIndex * 17) % products.length];
      selectedItems.push(buildOrderItem(product, 1 + ((index + itemIndex) % 2)));
    }
    const subtotal = formatMoney(selectedItems.reduce((sum, item) => sum + item.totalPrice, 0));
    const shipping = subtotal >= 999 ? 0 : 49;
    const tax = formatMoney(subtotal * 0.05);
    const totalSavings = formatMoney(selectedItems.reduce((sum, item) => sum + (item.originalPrice - item.unitPrice) * item.quantity, 0));
    const coupon = index % 5 === 0 ? coupons[index % coupons.length] : null;
    const couponDiscount = applyCouponToSubtotal(subtotal, coupon);
    const total = formatMoney(subtotal + shipping + tax - couponDiscount);
    const createdAt = new Date(Date.now() - ((index % 90) + 1) * 24 * 60 * 60 * 1000);
    const suffix = 1000 + index;
    const online = paymentMethod === "online";
    if (coupon) couponUsage[coupon._id.toString()] = (couponUsage[coupon._id.toString()] || 0) + 1;
    orderDocs.push({
      orderNumber: `ORD-${String(20260000 + suffix)}`, user: customer._id, items: selectedItems,
      pricing: { subtotal, shipping, tax, couponCode: coupon?.code || "", couponDiscount, totalSavings, total },
      addressSnapshot: snapshotAddress(address), paymentMethod, paymentGateway: online ? "razorpay" : "", paymentGatewayOrderId: online ? `order_seed_${suffix}` : "", paymentGatewayPaymentId: online ? `pay_seed_${suffix}` : "",
      paymentStatus: online ? "paid" : "cod_pending", paymentVerified: online, transactionMeta: { source: "seed" }, orderStatus, trackingHistory: buildTrackingHistory(orderStatus, createdAt), createdAt, updatedAt: new Date(createdAt.getTime() + 12 * 60 * 60 * 1000),
    });
  }

  const createdOrders = await Order.insertMany(orderDocs);
  createdOrders.forEach((order) => {
    if (order.paymentMethod === "online") {
      paymentDocs.push({ user: order.user, paymentMethod: "online", paymentGateway: "razorpay", gatewayOrderId: order.paymentGatewayOrderId, gatewayPaymentId: order.paymentGatewayPaymentId, gatewaySignature: `sig_${order.orderNumber}`, status: "paid", verified: true, order: order._id, addressId: addressByUserId[order.user.toString()]._id, couponCode: order.pricing.couponCode || "", amount: order.pricing.total, meta: { source: "seed" }, createdAt: order.createdAt, updatedAt: order.updatedAt });
    }
  });
  await Payment.insertMany(paymentDocs);
  await Coupon.bulkWrite(coupons.map((coupon) => ({ updateOne: { filter: { _id: coupon._id }, update: { $set: { usageCount: couponUsage[coupon._id.toString()] || 0 } } } })));

  const riyaUser = seededUsers.find((user) => user.email === "riya.sharma@sastify.com");
  const arjunUser = seededUsers.find((user) => user.email === "arjun.mehta@sastify.com");
  await Wishlist.insertMany([
    { user: riyaUser._id, product: getProductAt(products, 3)._id },
    { user: riyaUser._id, product: getProductAt(products, 11)._id },
    { user: arjunUser._id, product: getProductAt(products, 8)._id },
  ]);
  await Cart.insertMany([
    {
      user: riyaUser._id,
      product: getProductAt(products, 21)._id,
      quantity: 1,
      color: getProductAt(products, 21).colors?.[0] || "",
    },
    {
      user: riyaUser._id,
      product: getProductAt(products, 42)._id,
      quantity: 2,
      size: getProductAt(products, 42).sizes?.[0] || "",
    },
    {
      user: arjunUser._id,
      product: getProductAt(products, 65)._id,
      quantity: 1,
    },
  ]);

  console.log("Seed completed successfully.");
  console.log(`Categories seeded: ${categories.length}`);
  console.log(`Brands seeded: ${brands.length}`);
  console.log(`Products seeded: ${products.length}`);
  console.log(`Reviews seeded: ${reviewDocs.length}`);
  console.log(`Orders seeded: ${createdOrders.length}`);
  console.log(`Payments seeded: ${paymentDocs.length}`);
  console.log(`Users seeded: ${seededUsers.length}`);
  console.log("Admin login: admin@sastify.com / Admin@123");
  console.log("User login: riya.sharma@sastify.com / User@1234");
  console.log("Additional seeded customers use password: User@1234");
  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error("Seed failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
