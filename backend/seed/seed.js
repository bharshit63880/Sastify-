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

const PRODUCTS_PER_CATEGORY = 10;
const TARGET_REVIEW_COUNT = 160;
const TARGET_BRAND_COUNT = 80;
const GENERATED_CUSTOMER_COUNT = 140;
const GENERATED_ORDER_COUNT = 240;

const segments = {
  mobile: {
    d: ["Nova", "Edge", "Prime", "Ultra", "Max", "Select"],
    c: ["Black", "Blue", "Silver", "Graphite", "Green"],
    s: ["4GB/64GB", "6GB/128GB", "8GB/128GB", "8GB/256GB"],
    p: [6999, 59999],
    ship: ["Free delivery in 2-4 days", "Open-box delivery in select cities", "Seller dispatches within 48 hours"],
    ret: "7 day replacement available",
    war: "1 year brand warranty",
    img: [
      "photo-1511707171634-5f897ff02aa9",
      "photo-1598327105666-5b89351aff97",
      "photo-1510557880182-3b7d1f64a6b3",
      "photo-1580910051074-3eb694886505",
      "photo-1605236453806-6ff36851218e",
      "photo-1512499617640-c2f999098c01",
    ],
  },
  accessory: {
    d: ["Charge", "Boost", "Dash", "Power", "Swift", "Core"],
    c: ["Black", "Blue", "White", "Graphite"],
    s: ["10000 mAh", "20000 mAh", "30000 mAh"],
    p: [799, 4999],
    ship: ["Free delivery in 2-4 days", "Seller dispatches within 48 hours", "Express delivery available in select cities"],
    ret: "7 day replacement available",
    war: "6 months to 1 year warranty",
    img: [
      "photo-1583394838336-acd977736f90",
      "photo-1583863788434-e58a36330cf0",
      "photo-1616578273573-1d1c2ef8bb3a",
      "photo-1609592806955-d8f3b9f3d363",
      "photo-1593642632823-8f785ba67e45",
      "photo-1512054502232-10a0a035d672",
    ],
  },
  audio: {
    d: ["Bass", "Wave", "Tune", "Studio", "Echo", "Pulse"],
    c: ["Black", "Blue", "Ivory", "Graphite"],
    s: ["Standard"],
    p: [999, 19999],
    ship: ["Free delivery in 2-4 days", "Premium packaging included", "Dispatches in 24-48 hours"],
    ret: "7 day replacement available",
    war: "1 year audio warranty",
    img: [
      "photo-1505740420928-5e560c06d30e",
      "photo-1546435770-a3e426bf472b",
      "photo-1484704849700-f032a568e944",
      "photo-1518444065439-e933c06ce9cd",
      "photo-1545127398-14699f92334b",
      "photo-1580894732444-8ecded7900cd",
    ],
  },
  wearable: {
    d: ["Fit", "Stride", "Orbit", "Aura", "Glide", "Move"],
    c: ["Black", "Blue", "Olive", "Rose Gold"],
    s: ["Standard"],
    p: [1499, 16999],
    ship: ["Free delivery in 2-3 days", "Dispatches in 24-48 hours", "Metro express delivery available"],
    ret: "7 day replacement available",
    war: "1 year wearable warranty",
    img: [
      "photo-1523275335684-37898b6baf30",
      "photo-1546868871-7041f2a55e12",
      "photo-1508685096489-7aacd43bd3b1",
      "photo-1516574187841-cb9cc2ca948b",
      "photo-1460353581641-37baddab0fa2",
      "photo-1575311373937-040b8e1fd5b6",
    ],
  },
  computer: {
    d: ["Air", "Book", "Note", "Flow", "Pro", "Slim"],
    c: ["Silver", "Black", "Grey", "Blue"],
    s: ["13.3 inch", "14 inch", "15.6 inch"],
    p: [799, 84999],
    ship: ["Free delivery in 2-5 days", "Dispatches in 24-48 hours", "Secure packaging included"],
    ret: "7 day replacement available",
    war: "1 year manufacturer warranty",
    img: [
      "photo-1496181133206-80ce9b88a853",
      "photo-1517336714731-489689fd1ca8",
      "photo-1496171367470-9ed9a91ea931",
      "photo-1515879218367-8466d910aaa4",
      "photo-1517430816045-df4b7de11d1d",
      "photo-1545239351-1141bd82e8a6",
    ],
  },
  fashion: {
    d: ["Classic", "Urban", "Everyday", "Premium", "Street", "Relaxed"],
    c: ["Black", "White", "Navy", "Olive", "Beige", "Blue", "Pink", "Maroon"],
    s: ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"],
    p: [399, 4999],
    ship: ["Free delivery in 2-4 days", "Easy exchange available", "Seller dispatches within 24-48 hours"],
    ret: "7 day exchange and replacement available",
    war: "No warranty applicable",
    img: [
      "photo-1521572267360-ee0c2909d518",
      "photo-1515886657613-9f3515b0c78f",
      "photo-1512436991641-6745cdb1723f",
      "photo-1483985988355-763728e1935b",
      "photo-1445205170230-053b83016050",
      "photo-1529139574466-a303027c1d8b",
      "photo-1523381210434-271e8be1f52b",
      "photo-1489987707025-afc232f7ea0f",
    ],
  },
  footwear: {
    d: ["Sprint", "Motion", "City", "Court", "Trail", "Lite"],
    c: ["Black", "White", "Blue", "Grey", "Olive"],
    s: ["6", "7", "8", "9", "10"],
    p: [699, 6999],
    ship: ["Free delivery in 2-4 days", "Easy size exchange available", "Dispatches within 24-48 hours"],
    ret: "7 day replacement available",
    war: "3 to 6 month manufacturing warranty where applicable",
    img: [
      "photo-1542291026-7eec264c27ff",
      "photo-1549298916-b41d501d3772",
      "photo-1600185365483-26d7a4cc7519",
      "photo-1608231387042-66d1773070a5",
      "photo-1460353581641-37baddab0fa2",
      "photo-1595950653106-6c9ebd614d3a",
    ],
  },
  travel: {
    d: ["Transit", "Voyage", "Cabin", "Metro", "Route", "Trail"],
    c: ["Black", "Navy", "Grey", "Olive", "Brown"],
    s: ["24 L", "30 L", "45 L", "Cabin", "Medium"],
    p: [999, 14999],
    ship: ["Free delivery in 2-5 days", "Travel-ready packaging included", "Seller dispatches within 48 hours"],
    ret: "7 day replacement available",
    war: "1 to 3 year manufacturer warranty",
    img: [
      "photo-1542296332-2e4473faf563",
      "photo-1500530855697-b586d89ba3ee",
      "photo-1488646953014-85cb44e25828",
      "photo-1527631746610-bca00a040d60",
      "photo-1500534314209-a25ddb2bd429",
      "photo-1460353581641-37baddab0fa2",
    ],
  },
  watch: {
    d: ["Neo", "Elite", "Prime", "Edge", "Classic", "City"],
    c: ["Black", "Brown", "Blue", "Silver"],
    s: ["Standard"],
    p: [1299, 15999],
    ship: ["Free delivery in 2-4 days", "Gift-ready packaging included", "Dispatches within 24-48 hours"],
    ret: "7 day replacement available",
    war: "6 months to 2 years warranty",
    img: [
      "photo-1523170335258-f5ed11844a49",
      "photo-1434056886845-dac89ffe9b56",
      "photo-1547996160-81dfa63595aa",
      "photo-1508057198894-247b23fe5ade",
      "photo-1518546305927-5a555bb7020d",
      "photo-1490367532201-b9bc1dc483f6",
    ],
  },
  kitchen: {
    d: ["Essential", "Classic", "Chef", "Smart", "Daily", "Signature"],
    c: ["Black", "Ivory", "Steel", "Sage", "Terracotta"],
    s: ["500 W", "750 W", "1000 W", "2 L", "3 L", "Set of 3", "Set of 5"],
    p: [299, 15999],
    ship: ["Free delivery in 2-5 days", "Delivered with secure packaging", "Seller dispatches within 48 hours"],
    ret: "7 day replacement available",
    war: "6 months to 2 years depending on product",
    img: [
      "photo-1517248135467-4c7edcad34c4",
      "photo-1495474472287-4d71bcdd2085",
      "photo-1482049016688-2d3e1b311543",
      "photo-1504674900247-0877df9cc836",
      "photo-1504754524776-8f4f37790ca0",
      "photo-1520607162513-77705c0f0d4a",
    ],
  },
  appliance: {
    d: ["Fresh", "Turbo", "Cool", "Power", "Eco", "Smart"],
    c: ["Silver", "White", "Black", "Graphite"],
    s: ["180 L", "230 L", "7 kg", "8 kg", "12 L"],
    p: [3999, 69999],
    ship: ["Free doorstep delivery in 3-6 days", "Installation support available in select cities", "Seller dispatches within 48 hours"],
    ret: "7 day service replacement where applicable",
    war: "1 year comprehensive warranty",
    img: [
      "photo-1586201375761-83865001e31c",
      "photo-1585515656826-18a4e83993ff",
      "photo-1520607162513-77705c0f0d4a",
      "photo-1505471768198-991d7093a7ed",
      "photo-1519710164239-da123dc03ef4",
      "photo-1523419409543-1d390d545ff3",
    ],
  },
  decor: {
    d: ["Aura", "Nest", "Calm", "Accent", "Harmony", "Glow"],
    c: ["Beige", "White", "Olive", "Gold", "Blue", "Grey"],
    s: ["Single", "Queen", "King", "Standard"],
    p: [499, 6999],
    ship: ["Free delivery in 2-5 days", "Secure packaging included", "Seller dispatches within 48 hours"],
    ret: "7 day replacement available",
    war: "No warranty applicable unless mentioned by brand",
    img: [
      "photo-1505693416388-ac5ce068fe85",
      "photo-1513694203232-719a280e022f",
      "photo-1513519245088-0e12902e5a38",
      "photo-1484101403633-562f891dc89a",
      "photo-1493666438817-866a91353ca9",
      "photo-1501045661006-fcebe0257c3f",
    ],
  },
  personalCare: {
    d: ["Glow", "Repair", "Fresh", "Hydra", "Daily", "Balance"],
    c: ["Rose", "Mint", "Amber", "Ivory"],
    s: ["50 ml", "100 ml", "200 ml", "300 ml", "Combo Pack"],
    p: [199, 2499],
    ship: ["Free delivery in 2-4 days", "Seller dispatches within 24-48 hours", "Secure hygiene packaging included"],
    ret: "7 day replacement available",
    war: "No warranty applicable",
    img: [
      "photo-1556228578-8c89e6adf883",
      "photo-1522335789203-aabd1fc54bc9",
      "photo-1625772452859-1c03d5bf1137",
      "photo-1501004318641-b39e6451bec6",
      "photo-1620916566398-39f1143ab7be",
      "photo-1580870069867-74c57ee1bb07",
    ],
  },
  fitness: {
    d: ["Active", "Core", "Recover", "Power", "Move", "Strong"],
    c: ["Black", "Blue", "Grey", "Olive"],
    s: ["Standard", "3 kg", "5 kg", "10 kg", "1 kg", "6 mm"],
    p: [499, 14999],
    ship: ["Free delivery in 2-5 days", "Seller dispatches within 48 hours", "Secure packaging included"],
    ret: "7 day replacement available",
    war: "6 months to 1 year warranty where applicable",
    img: [
      "photo-1517836357463-d25dfeac3438",
      "photo-1518611012118-696072aa579a",
      "photo-1571019613914-85f342c55f55",
      "photo-1599058917212-d750089bc07e",
      "photo-1517963879433-6ad2b056d712",
      "photo-1594737625785-a6cbdabd333c",
    ],
  },
};

const categoryRows = [
  ["Electronics", "Category", "mobile", ["mobile", "audio", "wearable", "computer", "accessory"], "Phones, audio devices, wearables, and daily personal tech.", null, false],
  ["Mobiles & Accessories", "Category", "mobile", ["mobile", "accessory"], "Smartphones, feature phones, and charging essentials.", "Electronics", false],
  ["Smartphones", "Smartphone", "mobile", ["mobile"], "5G-ready smartphones with practical daily performance.", "Mobiles & Accessories", true],
  ["Feature Phones", "Feature Phone", "mobile", ["mobile"], "Reliable keypad phones with long battery backup.", "Mobiles & Accessories", true],
  ["Power Banks", "Power Bank", "accessory", ["accessory", "mobile"], "Fast-charging power banks for work, travel, and backup charging.", "Mobiles & Accessories", true],
  ["Audio", "Category", "audio", ["audio"], "Earbuds, headphones, and speakers for calls and entertainment.", "Electronics", false],
  ["Earbuds", "Earbuds", "audio", ["audio"], "True wireless earbuds for music, calls, and workouts.", "Audio", true],
  ["Headphones", "Headphones", "audio", ["audio"], "Wireless and wired headphones for immersive everyday listening.", "Audio", true],
  ["Bluetooth Speakers", "Bluetooth Speaker", "audio", ["audio"], "Portable speakers for home, travel, and outdoor playback.", "Audio", true],
  ["Wearables", "Category", "wearable", ["wearable", "watch"], "Smart devices for fitness tracking and connected routines.", "Electronics", false],
  ["Smartwatches", "Smartwatch", "wearable", ["wearable", "watch"], "Smartwatches with calling, AMOLED displays, and health tracking.", "Wearables", true],
  ["Fitness Bands", "Fitness Band", "wearable", ["wearable"], "Lightweight fitness bands for steps, sleep, and wellness goals.", "Wearables", true],
  ["Computing", "Category", "computer", ["computer"], "Laptops and desk essentials for work, study, and setup upgrades.", "Electronics", false],
  ["Laptops", "Laptop", "computer", ["computer"], "Thin, practical laptops for work, study, and entertainment.", "Computing", true],
  ["Wireless Keyboards", "Wireless Keyboard", "computer", ["computer"], "Compact and full-size wireless keyboards for daily productivity.", "Computing", true],
  ["Wireless Mice", "Wireless Mouse", "computer", ["computer"], "Easy everyday wireless mice for work and study desks.", "Computing", true],

  ["Fashion", "Category", "fashion", ["fashion", "footwear", "travel", "watch"], "Everyday apparel, footwear, and accessories in a marketplace-style catalog.", null, false],
  ["Men's Topwear", "Category", "fashion", ["fashion"], "Casual topwear for daily styling, office casuals, and weekends.", "Fashion", false],
  ["Men T-Shirts", "Men's T-Shirt", "fashion", ["fashion"], "Printed and solid t-shirts with easy everyday fits.", "Men's Topwear", true],
  ["Men Casual Shirts", "Men's Casual Shirt", "fashion", ["fashion"], "Solid, checked, and striped casual shirts for work and outings.", "Men's Topwear", true],
  ["Men's Bottomwear", "Category", "fashion", ["fashion"], "Denim and everyday bottoms for regular wear.", "Fashion", false],
  ["Men Jeans", "Men's Jeans", "fashion", ["fashion"], "Slim, tapered, and regular jeans for daily use.", "Men's Bottomwear", true],
  ["Women's Ethnic", "Category", "fashion", ["fashion"], "Kurta-led ethnic wear with wearable colors and prints.", "Fashion", false],
  ["Women Kurtas", "Women's Kurta", "fashion", ["fashion"], "Straight and A-line kurtas for office, festive, and daily styling.", "Women's Ethnic", true],
  ["Women's Western", "Category", "fashion", ["fashion"], "Dresses, tops, and denim made for daily wear.", "Fashion", false],
  ["Women Dresses", "Women's Dress", "fashion", ["fashion"], "Fit-and-flare, midi, and casual dresses for versatile styling.", "Women's Western", true],
  ["Women Tops", "Women's Top", "fashion", ["fashion"], "Casual tops with solid shades, prints, and textured fabrics.", "Women's Western", true],
  ["Women Jeans", "Women's Jeans", "fashion", ["fashion"], "High-rise and slim-fit denim for easy everyday outfits.", "Women's Western", true],
  ["Footwear", "Category", "footwear", ["footwear", "fashion"], "Everyday shoes, sandals, and active footwear.", "Fashion", false],
  ["Sneakers", "Sneakers", "footwear", ["footwear", "fashion"], "Colorblock sneakers for casual outfits and city wear.", "Footwear", true],
  ["Running Shoes", "Running Shoes", "footwear", ["footwear"], "Lightweight running shoes for training and walking routines.", "Footwear", true],
  ["Sandals & Floaters", "Sandals", "footwear", ["footwear"], "Open footwear for comfort-led all-day use.", "Footwear", true],
  ["Accessories", "Category", "travel", ["travel", "watch", "fashion"], "Watches, bags, and luggage that complement everyday movement.", "Fashion", false],
  ["Wrist Watches", "Analog Watch", "watch", ["watch", "fashion"], "Analog-style watches for work, gifting, and daily wear.", "Accessories", true],
  ["Backpacks", "Laptop Backpack", "travel", ["travel", "fashion"], "Laptop backpacks for college, office, and short commutes.", "Accessories", true],
  ["Cabin Luggage", "Cabin Trolley", "travel", ["travel"], "Travel trolleys and carry bags for quick getaways and business trips.", "Accessories", true],

  ["Home & Kitchen", "Category", "kitchen", ["kitchen", "appliance", "decor"], "Utility products for cooking, care, appliances, and home styling.", null, false],
  ["Kitchen Appliances", "Category", "kitchen", ["kitchen", "appliance"], "Daily prep and quick-cooking appliances for Indian kitchens.", "Home & Kitchen", false],
  ["Mixer Grinders", "Mixer Grinder", "kitchen", ["kitchen", "appliance"], "Mixer grinders for chutneys, batters, dry spices, and smoothies.", "Kitchen Appliances", true],
  ["Induction Cooktops", "Induction Cooktop", "kitchen", ["kitchen", "appliance"], "Compact induction cooktops for efficient everyday cooking.", "Kitchen Appliances", true],
  ["Air Fryers", "Air Fryer", "kitchen", ["kitchen", "appliance"], "Oil-light cooking appliances for snacks, reheating, and batch meals.", "Kitchen Appliances", true],
  ["Cookware & Dining", "Category", "kitchen", ["kitchen"], "Pots, pans, pressure cookers, and everyday serving essentials.", "Home & Kitchen", false],
  ["Cookware Sets", "Cookware Set", "kitchen", ["kitchen"], "Non-stick cookware sets for regular home cooking.", "Cookware & Dining", true],
  ["Pressure Cookers", "Pressure Cooker", "kitchen", ["kitchen"], "Pressure cookers built for dependable Indian meal prep.", "Cookware & Dining", true],
  ["Bottles & Flasks", "Insulated Flask", "kitchen", ["kitchen"], "Steel bottles and flasks for office, commute, and travel.", "Cookware & Dining", true],
  ["Home Appliances", "Category", "appliance", ["appliance"], "Larger appliances for cooling, washing, and water care.", "Home & Kitchen", false],
  ["Refrigerators", "Refrigerator", "appliance", ["appliance"], "Single and double door refrigerators for modern family homes.", "Home Appliances", true],
  ["Washing Machines", "Washing Machine", "appliance", ["appliance"], "Semi and fully automatic washers for everyday family use.", "Home Appliances", true],
  ["Water Purifiers", "Water Purifier", "appliance", ["appliance"], "RO and UV water purifiers for home hydration needs.", "Home Appliances", true],
  ["Home Decor", "Category", "decor", ["decor"], "Soft furnishings and accent pieces for cleaner living spaces.", "Home & Kitchen", false],
  ["Bedsheets", "Bedsheet Set", "decor", ["decor"], "Cotton bedsheets and pillow cover sets for everyday comfort.", "Home Decor", true],
  ["Table Lamps", "Table Lamp", "decor", ["decor"], "Warm lighting for bedrooms, side tables, and study corners.", "Home Decor", true],
  ["Wall Art", "Wall Art", "decor", ["decor"], "Framed art and wall accents for easy room styling.", "Home Decor", true],

  ["Beauty & Wellness", "Category", "personalCare", ["personal-care", "fitness", "wellness"], "Skincare, haircare, and wellness essentials in a more complete catalog.", null, false],
  ["Skincare", "Category", "personalCare", ["personal-care"], "Daily cleansing, treatment, and hydration products.", "Beauty & Wellness", false],
  ["Face Wash", "Face Wash", "personalCare", ["personal-care"], "Daily face wash options for fresh, balanced routines.", "Skincare", true],
  ["Face Serums", "Face Serum", "personalCare", ["personal-care"], "Targeted serums for glow, hydration, and smoother texture.", "Skincare", true],
  ["Moisturisers", "Moisturiser", "personalCare", ["personal-care"], "Lightweight and richer moisturisers for daily hydration.", "Skincare", true],
  ["Hair Care", "Category", "personalCare", ["personal-care"], "Haircare picks for cleansing, nourishment, and repair.", "Beauty & Wellness", false],
  ["Shampoo", "Shampoo", "personalCare", ["personal-care"], "Daily and repair-focused shampoos for different hair needs.", "Hair Care", true],
  ["Hair Oil", "Hair Oil", "personalCare", ["personal-care"], "Hair oils for nourishment, scalp care, and weekly routines.", "Hair Care", true],
  ["Fitness & Nutrition", "Category", "fitness", ["fitness", "wellness"], "Home workout essentials and nutrition-driven recovery picks.", "Beauty & Wellness", false],
  ["Dumbbells", "Dumbbell Set", "fitness", ["fitness"], "Compact weights for home strength workouts and toning sessions.", "Fitness & Nutrition", true],
  ["Yoga Mats", "Yoga Mat", "fitness", ["fitness"], "Anti-slip mats for yoga, stretching, and floor workouts.", "Fitness & Nutrition", true],
  ["Whey Protein", "Whey Protein", "fitness", ["wellness", "fitness"], "Protein blends for training recovery and everyday nutrition support.", "Fitness & Nutrition", true],
];

const brandRows = [
  ["Samsung", ["mobile", "wearable", "appliance"], "Global electronics brand spanning smartphones, wearables, and appliances."],
  ["Redmi", ["mobile"], "Value-focused smartphone brand with broad market demand."],
  ["realme", ["mobile", "wearable", "audio"], "Consumer tech brand covering phones, earbuds, and wearables."],
  ["OnePlus", ["mobile", "audio", "wearable"], "Premium-leaning consumer technology brand across phones and accessories."],
  ["Motorola", ["mobile"], "Mobile brand known for balanced Android phones and reliable daily devices."],
  ["Nokia", ["mobile"], "Legacy phone brand with smartphones and dependable feature phones."],
  ["Lava", ["mobile"], "Indian mobile brand across smartphones and feature phones."],
  ["boAt", ["audio", "wearable"], "Indian lifestyle electronics brand focused on audio and smart accessories."],
  ["Noise", ["audio", "wearable"], "Wearables and audio products built for young digital-first shoppers."],
  ["JBL", ["audio"], "Audio brand known for portable speakers and headphones."],
  ["Sony", ["audio"], "Consumer electronics brand with trusted audio products."],
  ["Boult", ["audio", "wearable"], "Audio and wearable accessories built for everyday use."],
  ["HP", ["computer"], "Laptop and PC accessories brand with broad work and study appeal."],
  ["Lenovo", ["computer"], "Laptop and computing brand for office and student users."],
  ["Dell", ["computer"], "Reliable laptop and productivity device brand for mixed workloads."],
  ["Logitech", ["computer"], "Keyboard and mouse brand built for desktops, work, and hybrid setups."],
  ["Portronics", ["computer", "accessory"], "Utility accessories across charging, keyboards, and desk devices."],
  ["Roadster", ["fashion"], "Casual fashion brand with everyday fits and wearable colors."],
  ["Urbano Fashion", ["fashion"], "Men's casualwear brand with shirts, jeans, and trend-led essentials."],
  ["Highlander", ["fashion"], "Affordable fashion label with easy casual styling."],
  ["The Souled Store", ["fashion"], "Youth-led apparel brand with printed and casual everydaywear."],
  ["Levi's", ["fashion"], "Denim-focused fashion brand with broad everyday appeal."],
  ["WROGN", ["fashion"], "Modern menswear label with shirts, t-shirts, and jeans."],
  ["Libas", ["fashion"], "Women's ethnic wear brand with kurta-focused collections."],
  ["Biba", ["fashion"], "Ethnic fashion brand across kurtas and occasion-ready styling."],
  ["Tokyo Talkies", ["fashion"], "Women's westernwear brand with casual dresses and tops."],
  ["SASSAFRAS", ["fashion"], "Trend-led women's western brand for dresses and tops."],
  ["Puma", ["footwear", "fashion"], "Athleisure brand across shoes and fashion accessories."],
  ["Adidas", ["footwear", "fashion"], "Performance and casual footwear brand with strong recognition."],
  ["Campus", ["footwear"], "Footwear brand focused on value and active daily use."],
  ["Bata", ["footwear", "fashion"], "Everyday footwear brand with broad reach across India."],
  ["Fastrack", ["watch", "fashion", "wearable"], "Youth-focused brand across watches, wearables, and accessories."],
  ["Titan", ["watch", "wearable"], "Lifestyle brand with strong presence in watches and wearables."],
  ["Wildcraft", ["travel", "fashion"], "Outdoor and commute brand for bags and travel gear."],
  ["American Tourister", ["travel"], "Luggage and backpack brand for frequent travel and commute."],
  ["Safari", ["travel"], "Travel luggage and backpack brand with broad family appeal."],
  ["Skybags", ["travel", "fashion"], "Youth-focused luggage and backpacks for travel and college use."],
  ["Prestige", ["kitchen", "appliance"], "Kitchen and appliance brand widely used in Indian homes."],
  ["Butterfly", ["kitchen", "appliance"], "Kitchen utility brand for mixers, cooktops, and cookware."],
  ["Pigeon", ["kitchen", "appliance"], "Cookware and appliance label for daily home cooking."],
  ["Hawkins", ["kitchen"], "Pressure cooker and cookware brand known across Indian kitchens."],
  ["Wonderchef", ["kitchen", "appliance"], "Premium kitchen brand with cookware and countertop appliances."],
  ["Borosil", ["kitchen", "decor"], "Homeware brand covering glassware, bottles, and dining utility."],
  ["Milton", ["kitchen"], "Storage, bottle, and flask brand for home and office use."],
  ["Bajaj", ["appliance", "kitchen"], "Indian appliance brand spanning kitchens and home utility."],
  ["Havells", ["appliance", "decor"], "Appliances and home electrical brand for daily household use."],
  ["Crompton", ["appliance", "decor"], "Home electrical and appliance brand with practical utility products."],
  ["Voltas", ["appliance"], "Cooling and refrigeration brand for Indian homes."],
  ["Blue Star", ["appliance"], "Appliance brand focused on cooling and refrigeration products."],
  ["Livpure", ["appliance"], "Water purification brand for home wellness and hydration."],
  ["Bombay Dyeing", ["decor"], "Home textile brand with bedding and soft furnishing products."],
  ["Home Centre", ["decor"], "Home decor label with lighting and room accents."],
  ["Wakefit", ["decor"], "Home comfort brand with soft furnishings and sleep essentials."],
  ["Mamaearth", ["personal-care"], "Personal care brand built around daily wellness-led routines."],
  ["Minimalist", ["personal-care"], "Ingredient-focused skincare brand for treatment-led routines."],
  ["Plum", ["personal-care"], "Skincare and bodycare brand for accessible everyday self-care."],
  ["Lakme", ["personal-care"], "Beauty brand for daily makeup and skincare products."],
  ["Biotique", ["personal-care"], "Herbal skincare and haircare brand with wide household familiarity."],
  ["L'Oreal Paris", ["personal-care"], "Beauty brand across haircare and skincare essentials."],
  ["WOW Skin Science", ["personal-care", "wellness"], "Personal care and wellness brand with strong online recognition."],
  ["The Man Company", ["personal-care"], "Men's grooming and care brand for regular routines."],
  ["Boldfit", ["fitness", "wellness"], "Fitness accessory brand for home workouts and support gear."],
  ["Cosco", ["fitness"], "Fitness and sports equipment brand for home training."],
  ["Strauss", ["fitness"], "Entry-level fitness products brand for strength and mobility training."],
  ["MuscleBlaze", ["wellness", "fitness"], "Sports nutrition brand with protein and recovery-focused products."],
  ["Optimum Nutrition", ["wellness"], "Protein and sports nutrition brand for serious training support."],
];

const couponsData = [
  { code: "WELCOME10", title: "Welcome savings", description: "10% off above Rs. 2,499", discountType: "percentage", discountValue: 10, minOrderValue: 2499, maxDiscount: 1200 },
  { code: "STYLE12", title: "Fashion edit", description: "12% off on fashion orders", discountType: "percentage", discountValue: 12, minOrderValue: 1999, maxDiscount: 1800 },
  { code: "TECH1500", title: "Upgrade day", description: "Flat Rs. 1,500 off on bigger electronics carts", discountType: "fixed", discountValue: 1500, minOrderValue: 14999 },
  { code: "HOME8", title: "Home essentials", description: "8% off on home and kitchen products", discountType: "percentage", discountValue: 8, minOrderValue: 2499, maxDiscount: 1400 },
  { code: "FIT500", title: "Fitness starter", description: "Flat Rs. 500 off on fitness products", discountType: "fixed", discountValue: 500, minOrderValue: 2999 },
  { code: "BEAUTY300", title: "Beauty basket", description: "Flat Rs. 300 off on beauty orders", discountType: "fixed", discountValue: 300, minOrderValue: 1499 },
  { code: "TRAVEL10", title: "Travel ready", description: "10% off on luggage and backpacks", discountType: "percentage", discountValue: 10, minOrderValue: 3499, maxDiscount: 1600 },
  { code: "AUDIO15", title: "Audio week", description: "15% off on audio devices", discountType: "percentage", discountValue: 15, minOrderValue: 3999, maxDiscount: 2500 },
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
  { title: "Works well daily", comment: "Using it regularly and the overall experience has stayed consistent.", rating: 4 },
  { title: "Looks premium", comment: "Finish, fit, and presentation are better than expected in this price range.", rating: 5 },
  { title: "Reliable purchase", comment: "Delivered in good condition and setup was easy for everyday use.", rating: 4 },
  { title: "Good for the segment", comment: "Not perfect, but still a dependable pick in this category.", rating: 4 },
  { title: "Worth recommending", comment: "Would comfortably recommend it to family or friends.", rating: 5 },
];

const flavorNames = ["Chocolate", "Cafe Mocha", "Vanilla", "Kulfi", "Cookies and Cream"];
const collectionNames = ["Select", "Prime", "Edge", "Lite", "Max", "Neo", "Core", "Classic"];

const buildTrackingHistory = (status, createdAt) => {
  const base = new Date(createdAt);
  const at = (hours) => new Date(base.getTime() + hours * 60 * 60 * 1000);
  const timeline = [
    { status: "pending", title: "Order placed", description: "Your order was placed successfully.", timestamp: at(0) },
    { status: "confirmed", title: "Order confirmed", description: "Seller confirmed the order details.", timestamp: at(6) },
  ];

  if (["packed", "shipped", "out_for_delivery", "delivered"].includes(status)) {
    timeline.push({ status: "packed", title: "Packed", description: "Items were packed at the seller warehouse.", timestamp: at(18) });
  }

  if (["shipped", "out_for_delivery", "delivered"].includes(status)) {
    timeline.push({ status: "shipped", title: "Shipped", description: "Shipment left the warehouse and is in transit.", timestamp: at(30) });
  }

  if (["out_for_delivery", "delivered"].includes(status)) {
    timeline.push({ status: "out_for_delivery", title: "Out for delivery", description: "Shipment reached the local hub and is out for delivery.", timestamp: at(54) });
  }

  if (status === "delivered") {
    timeline.push({ status: "delivered", title: "Delivered", description: "Order delivered successfully to the customer.", timestamp: at(64) });
  }

  return timeline;
};

const baseSpecs = {
  mobile: (cfg, index) => [
    { label: "Memory", value: pick(cfg.s, index) },
    { label: "Battery", value: `${4500 + (index % 5) * 500} mAh` },
    { label: "Display", value: `${6.1 + (index % 4) * 0.2} inch` },
    { label: "Connectivity", value: "4G / 5G, Wi-Fi, Bluetooth" },
  ],
  accessory: (cfg, index) => [
    { label: "Capacity", value: pick(cfg.s, index) },
    { label: "Output", value: pick(["18W", "22.5W", "33W"], index) },
    { label: "Ports", value: pick(["USB-A + Type-C", "Dual USB-A", "USB-A + Lightning"], index) },
    { label: "Finish", value: pick(cfg.c, index) },
  ],
  audio: (cfg, index) => [
    { label: "Connectivity", value: "Bluetooth 5.3" },
    { label: "Playback", value: `${18 + (index % 5) * 6} hours` },
    { label: "Audio Profile", value: "Balanced with enhanced bass" },
    { label: "Finish", value: pick(cfg.c, index) },
  ],
  wearable: (cfg, index) => [
    { label: "Display", value: `${1.6 + (index % 4) * 0.1} inch AMOLED` },
    { label: "Battery", value: `${5 + (index % 6)} days` },
    { label: "Health Tracking", value: "Heart rate, SpO2, sleep" },
    { label: "Case", value: pick(cfg.c, index) },
  ],
  computer: (cfg, index, category) => [
    { label: "Category", value: category.name },
    { label: "Primary Spec", value: pick(cfg.s, index) },
    { label: "Connectivity", value: "Bluetooth / USB / Wi-Fi based on product" },
    { label: "Finish", value: pick(cfg.c, index) },
  ],
  fashion: (cfg, index, category) => [
    { label: "Category", value: category.name },
    { label: "Size", value: pick(cfg.s, index) },
    { label: "Color", value: pick(cfg.c, index) },
    { label: "Care", value: "Easy-care fabric and routine washing" },
  ],
  footwear: (cfg, index) => [
    { label: "Size", value: pick(cfg.s, index) },
    { label: "Sole", value: pick(["EVA", "TPR", "Rubber"], index) },
    { label: "Closure", value: pick(["Lace-Up", "Slip-On", "Hook and Loop"], index) },
    { label: "Color", value: pick(cfg.c, index) },
  ],
  travel: (cfg, index) => [
    { label: "Capacity", value: pick(cfg.s, index) },
    { label: "Material", value: pick(["Polyester", "Polycarbonate", "Nylon"], index) },
    { label: "Use Case", value: "Commute and travel" },
    { label: "Color", value: pick(cfg.c, index) },
  ],
  watch: (cfg, index) => [
    { label: "Dial", value: pick(["Analog", "Hybrid", "Minimal"], index) },
    { label: "Strap", value: pick(cfg.c, index) },
    { label: "Movement", value: "Quartz" },
    { label: "Water Resistance", value: "Basic splash resistance" },
  ],
  kitchen: (cfg, index, category) => [
    { label: "Category", value: category.name },
    { label: "Primary Spec", value: pick(cfg.s, index) },
    { label: "Material / Finish", value: pick(cfg.c, index) },
    { label: "Care", value: "Routine home use and easy maintenance" },
  ],
  appliance: (cfg, index, category) => [
    { label: "Category", value: category.name },
    { label: "Primary Spec", value: pick(cfg.s, index) },
    { label: "Finish", value: pick(cfg.c, index) },
    { label: "Installation", value: "Brand-led support where applicable" },
  ],
  decor: (cfg, index, category) => [
    { label: "Category", value: category.name },
    { label: "Size", value: pick(cfg.s, index) },
    { label: "Style", value: "Warm neutral contemporary" },
    { label: "Color", value: pick(cfg.c, index) },
  ],
  personalCare: (cfg, index) => [
    { label: "Pack Size", value: pick(cfg.s, index) },
    { label: "Usage", value: "Daily routine" },
    { label: "Suitability", value: "Suitable for regular use" },
    { label: "Variant", value: pick(cfg.d, index) },
  ],
  fitness: (cfg, index, category) => [
    { label: "Category", value: category.name },
    { label: "Primary Spec", value: pick(cfg.s, index) },
    { label: "Use Case", value: "Home workout and recovery" },
    { label: "Finish", value: pick(cfg.c, index) },
  ],
};

const getBrandsForCategory = (category, brands) => brands.filter((brand) => brand.tags.some((tag) => category.brandTags.includes(tag)));

const buildProductName = (category, brand, cfg, index) => {
  switch (category.productType) {
    case "Smartphone":
      return `${brand.name} ${pick(collectionNames, index)} 5G (${pick(cfg.s, index)})`;
    case "Feature Phone":
      return `${brand.name} Dual SIM Feature Phone ${100 + ((index * 13) % 900)}`;
    case "Power Bank":
      return `${brand.name} ${pick(cfg.s, index)} Fast Charging Power Bank`;
    case "Earbuds":
      return `${brand.name} TWS Earbuds with ${pick(["ENC", "ANC", "low-latency mode"], index)}`;
    case "Headphones":
      return `${brand.name} Wireless Over-Ear Headphones`;
    case "Bluetooth Speaker":
      return `${brand.name} Portable Bluetooth Speaker ${10 + (index % 4) * 5}W`;
    case "Smartwatch":
      return `${brand.name} AMOLED Smartwatch with BT Calling`;
    case "Fitness Band":
      return `${brand.name} Fitness Band with Heart Rate Monitor`;
    case "Laptop":
      return `${brand.name} ${pick(["Intel Core i5", "Ryzen 5", "Intel Core i3"], index)} Laptop ${pick(cfg.s, index)}`;
    case "Wireless Keyboard":
      return `${brand.name} Wireless Keyboard with ${pick(["Silent Keys", "Numeric Pad", "Compact Layout"], index)}`;
    case "Wireless Mouse":
      return `${brand.name} Wireless Optical Mouse`;
    case "Men's T-Shirt":
      return `${brand.name} Men Regular Fit ${pick(["Printed", "Solid", "Graphic"], index)} Round Neck T-Shirt`;
    case "Men's Casual Shirt":
      return `${brand.name} Men Slim Fit ${pick(["Solid", "Checked", "Striped"], index)} Casual Shirt`;
    case "Men's Jeans":
      return `${brand.name} Men ${pick(["Slim", "Tapered", "Regular"], index)} Fit Mid-Rise Jeans`;
    case "Women's Kurta":
      return `${brand.name} Women Printed Straight Kurta`;
    case "Women's Dress":
      return `${brand.name} Women Fit and Flare Dress`;
    case "Women's Top":
      return `${brand.name} Women Casual ${pick(["Puff Sleeve", "Ribbed", "Solid"], index)} Top`;
    case "Women's Jeans":
      return `${brand.name} Women High Rise ${pick(["Slim", "Straight", "Bootcut"], index)} Jeans`;
    case "Sneakers":
      return `${brand.name} ${pick(["Colorblock", "Minimal", "Court"], index)} Sneakers`;
    case "Running Shoes":
      return `${brand.name} Lightweight Running Shoes`;
    case "Sandals":
      return `${brand.name} Comfort Sandals and Floaters`;
    case "Analog Watch":
      return `${brand.name} Analog Watch for Men and Women`;
    case "Laptop Backpack":
      return `${brand.name} ${pick(cfg.s, index)} Laptop Backpack`;
    case "Cabin Trolley":
      return `${brand.name} Cabin Trolley Suitcase`;
    case "Mixer Grinder":
      return `${brand.name} ${pick(["500W", "750W", "1000W"], index)} Mixer Grinder`;
    case "Induction Cooktop":
      return `${brand.name} ${pick(["1200W", "1800W", "2000W"], index)} Induction Cooktop`;
    case "Air Fryer":
      return `${brand.name} ${pick(["3.5 L", "4.2 L", "5.5 L"], index)} Air Fryer`;
    case "Cookware Set":
      return `${brand.name} Non-Stick Cookware Set ${pick(["Set of 3", "Set of 5", "Set of 7"], index)}`;
    case "Pressure Cooker":
      return `${brand.name} ${pick(["2 L", "3 L", "5 L"], index)} Pressure Cooker`;
    case "Insulated Flask":
      return `${brand.name} Stainless Steel Insulated Flask ${pick(["750 ml", "1 L", "1.5 L"], index)}`;
    case "Refrigerator":
      return `${brand.name} ${pick(["183 L", "223 L", "253 L"], index)} Double Door Refrigerator`;
    case "Washing Machine":
      return `${brand.name} ${pick(["7 kg", "8 kg", "8.5 kg"], index)} Fully Automatic Washing Machine`;
    case "Water Purifier":
      return `${brand.name} RO + UV Water Purifier`;
    case "Bedsheet Set":
      return `${brand.name} Cotton Bedsheet Set with Pillow Covers`;
    case "Table Lamp":
      return `${brand.name} Decorative Table Lamp`;
    case "Wall Art":
      return `${brand.name} Framed Wall Art Set`;
    case "Face Wash":
      return `${brand.name} Daily Glow Face Wash ${pick(["100 ml", "150 ml", "200 ml"], index)}`;
    case "Face Serum":
      return `${brand.name} Vitamin C Face Serum ${pick(["30 ml", "50 ml"], index)}`;
    case "Moisturiser":
      return `${brand.name} Hydrating Moisturiser ${pick(["50 ml", "100 ml", "200 ml"], index)}`;
    case "Shampoo":
      return `${brand.name} Damage Repair Shampoo ${pick(["180 ml", "340 ml", "650 ml"], index)}`;
    case "Hair Oil":
      return `${brand.name} Nourishing Hair Oil ${pick(["100 ml", "200 ml", "300 ml"], index)}`;
    case "Dumbbell Set":
      return `${brand.name} Hex Dumbbell Set ${pick(["3 kg", "5 kg", "10 kg"], index)}`;
    case "Yoga Mat":
      return `${brand.name} Anti-Slip Yoga Mat ${pick(["4 mm", "6 mm", "8 mm"], index)}`;
    case "Whey Protein":
      return `${brand.name} Whey Protein ${pick(flavorNames, index)} ${pick(["1 kg", "2 kg"], index)}`;
    default:
      return `${brand.name} ${pick(cfg.d, index)} ${category.productType} ${pick(collectionNames, index)}`;
  }
};

const buildHighlights = (category, brand, cfg, index) => [
  `${brand.name} ${category.name.toLowerCase()} pick built for practical everyday use.`,
  `${pick(cfg.c, index)} finish paired with ${pick(cfg.d, index).toLowerCase()} styling and marketplace-friendly value.`,
  `${category.productType} configuration tuned for reliability, comfort, and repeat use.`,
  "Seller-ready packaging, nationwide delivery support, and easy replacement where applicable.",
];

const getProductAt = (products, index) => products[index % products.length];

const pickBrandsForSeed = (rows, categoryRowsMeta, targetCount) => {
  const requiredTags = new Set(
    categoryRowsMeta
      .filter(([, , , , , , isLeaf = true]) => isLeaf !== false)
      .flatMap(([, , , brandTags]) => brandTags)
  );

  const selected = [];
  const coveredTags = new Set();

  rows.forEach((row) => {
    const [, tags] = row;
    const addsCoverage = tags.some((tag) => requiredTags.has(tag) && !coveredTags.has(tag));

    if (!addsCoverage) {
      return;
    }

    selected.push(row);
    tags.forEach((tag) => {
      if (requiredTags.has(tag)) {
        coveredTags.add(tag);
      }
    });
  });

  rows.forEach((row) => {
    if (selected.length >= targetCount) {
      return;
    }

    if (!selected.includes(row)) {
      selected.push(row);
    }
  });

  return selected;
};

const buildProductsData = (categories, brands) => {
  const products = [];

  categories.forEach((category, categoryIndex) => {
    if (category.isLeaf === false) {
      return;
    }

    const cfg = segments[category.segment];
    const priceStep = cfg.p[1] > 20000 ? 500 : cfg.p[1] > 5000 ? 100 : 50;
    const matchingBrands = getBrandsForCategory(category, brands);
    const eligibleBrands = matchingBrands.length ? matchingBrands : brands;

    for (let i = 0; i < PRODUCTS_PER_CATEGORY; i += 1) {
      const idx = categoryIndex * PRODUCTS_PER_CATEGORY + i;
      const brand = pick(eligibleBrands, idx);
      const name = buildProductName(category, brand, cfg, idx);
      const rawPrice = cfg.p[0] + (((idx * 137) + (categoryIndex * 59)) % (cfg.p[1] - cfg.p[0] + 1));
      const price = roundTo(rawPrice, priceStep);
      const originalPrice = roundTo(price * (1.15 + (idx % 18) / 100), priceStep);
      const stock = idx % 23 === 0 ? 0 : 5 + ((idx * 11) % 75);
      const colors = [...new Set([pick(cfg.c, idx), pick(cfg.c, idx + 1), pick(cfg.c, idx + 2)])];
      const sizes = ["fashion", "footwear", "travel", "kitchen", "decor", "fitness"].includes(category.segment)
        ? [...new Set([pick(cfg.s, idx), pick(cfg.s, idx + 1)])]
        : [];
      const sourceImages = category.imageIds?.length ? category.imageIds : cfg.img;
      const images = Array.from(
        new Set([pick(sourceImages, idx), pick(sourceImages, idx + 1), pick(sourceImages, idx + 2)])
      ).map((item) => image(item));
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

      products.push({
        name,
        title: name,
        slug: slugify(`${name}-${category.name}-${100 + ((idx * 17) % 900)}`),
        shortDescription: `${category.name} from ${brand.name} built for practical everyday use and strong value.`,
        description: `${brand.name} ${category.productType.toLowerCase()} in the ${category.name.toLowerCase()} range, designed for Indian shoppers looking for practical value, reliable delivery support, and an ecommerce-style catalog experience that feels close to a real marketplace listing.`,
        highlights: buildHighlights(category, brand, cfg, idx),
        specs: baseSpecs[category.segment](cfg, idx, category),
        category: category._id,
        brand: brand._id,
        price,
        originalPrice,
        discountPercent: discount,
        discountPercentage: discount,
        stock,
        stockQuantity: stock,
        thumbnail: images[0],
        images,
        rating: 0,
        reviewCount: 0,
        featured: i < 2,
        trending: idx % 4 === 0,
        bestseller: idx % 5 === 0,
        isTrending: idx % 4 === 0,
        isBestSeller: idx % 5 === 0,
        isDealOfDay: idx % 6 === 0,
        status: "active",
        sizes,
        colors,
        shippingText: pick(cfg.ship, idx),
        sellerName: `${brand.name} Official Store`,
        returnPolicy: cfg.ret,
        warranty: cfg.war,
        seoTitle: name,
        seoDescription: `${category.productType} from ${brand.name} with live pricing and delivery support.`,
        metaKeywords: [brand.name, category.name, category.productType, "India"],
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
    users.push({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@sastify.com`,
      password: hashedPassword,
      role: "user",
      isAdmin: false,
      isVerified: true,
      phone: phone(i + 1),
    });
  }

  return users;
};

const buildAddressDocs = (users) => users.filter((user) => !user.isAdmin).map((user, index) => {
  const locality = pick(localities, index);
  return {
    user: user._id,
    fullName: user.name,
    line1: `${100 + index}, ${locality.area} Residency`,
    line2: `Near ${pick(["Metro", "Market", "Park", "Circle"], index)} Road`,
    city: locality.city,
    state: locality.state,
    postalCode: locality.postalCode,
    country: "India",
    phoneNumber: user.phone,
    addressType: index % 3 === 0 ? "office" : "home",
    type: index % 3 === 0 ? "office" : "home",
    isDefault: true,
  };
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

    const count = Math.min(1 + (productIndex % 3 === 0 ? 1 : 0), TARGET_REVIEW_COUNT - docs.length);
    let sum = 0;

    for (let reviewIndex = 0; reviewIndex < count; reviewIndex += 1) {
      const reviewer = customers[(productIndex * 7 + reviewIndex * 11) % customers.length];
      const template = pick(reviewTemplates, productIndex + reviewIndex);
      const rating = Math.max(3, Math.min(5, template.rating - ((productIndex + reviewIndex) % 7 === 0 ? 1 : 0)));

      docs.push({
        user: reviewer._id,
        product: product._id,
        title: template.title,
        comment: `${template.comment} Bought for ${pick(["home use", "daily work", "family use", "travel", "regular styling"], productIndex + reviewIndex)}.`,
        rating,
        status: "published",
      });

      sum += rating;
    }

    stats[product._id.toString()] = {
      rating: Number((sum / count).toFixed(1)),
      reviewCount: count,
    };
  });

  return { docs, stats };
};

const snapshotAddress = (address) => ({
  fullName: address.fullName,
  phoneNumber: address.phoneNumber,
  line1: address.line1,
  line2: address.line2,
  landmark: "",
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
  addressType: address.addressType,
});

const buildOrderItem = (product, quantity) => ({
  product: product._id,
  slug: product.slug,
  name: product.name,
  brand: product.brand,
  brandName: product.brandName,
  category: product.category,
  categoryName: product.categoryName,
  image: product.thumbnail,
  quantity,
  unitPrice: product.price,
  originalPrice: product.originalPrice,
  discountPercent: product.discountPercent,
  totalPrice: formatMoney(product.price * quantity),
  selectedVariant: {
    size: product.sizes?.[0] || "",
    color: product.colors?.[0] || "",
  },
});

const applyCouponToSubtotal = (subtotal, coupon) => {
  if (!coupon || subtotal < coupon.minOrderValue) {
    return 0;
  }

  if (coupon.discountType === "percentage") {
    return Math.min(coupon.maxDiscount || Infinity, formatMoney((subtotal * coupon.discountValue) / 100));
  }

  return Math.min(coupon.discountValue, subtotal);
};

async function seed() {
  await connectToDB();

  await Promise.all([
    Wishlist.deleteMany({}),
    Cart.deleteMany({}),
    Payment.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    Address.deleteMany({}),
    Coupon.deleteMany({}),
    Product.deleteMany({}),
    Brand.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({}),
  ]);

  const categories = [];
  const categoryByName = new Map();

  for (const [name, , segment, , description, parentName] of categoryRows) {
    const parentCategory = parentName ? categoryByName.get(parentName) : null;
    const slug = slugify(name);
    const created = await Category.create({
      name,
      description,
      image: segments[segment]?.img?.[0] ? image(segments[segment].img[0]) : "",
      isActive: true,
      parentId: parentCategory?._id || null,
      level: parentCategory ? Number(parentCategory.level || 0) + 1 : 0,
      path: parentCategory ? `${parentCategory.path}/${slug}` : slug,
    });

    categories.push(created);
    categoryByName.set(name, created);
  }

  const trimmedBrands = pickBrandsForSeed(brandRows, categoryRows, TARGET_BRAND_COUNT);
  const brands = await Brand.insertMany(trimmedBrands.map(([name, , description]) => ({
    name,
    description,
    isActive: true,
  })));

  const categoriesWithMeta = categoryRows.map(([name, productType, segment, brandTags, description, parentName, isLeaf = true]) => ({
    name,
    productType,
    segment,
    brandTags,
    description,
    parentName,
    isLeaf,
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
  const products = createdProducts.map((product) => ({
    ...product.toObject(),
    brandName: brandLookup[product.brand.toString()],
    categoryName: categoryLookup[product.category.toString()],
  }));

  const addresses = await Address.insertMany(buildAddressDocs(seededUsers));
  const addressByUserId = Object.fromEntries(addresses.map((address) => [address.user.toString(), address]));
  const coupons = await Coupon.insertMany(couponsData.map((coupon, index) => ({
    ...coupon,
    expiresAt: new Date(Date.now() + (45 + index * 10) * 24 * 60 * 60 * 1000),
    usageLimit: 5000,
    usageCount: 0,
    active: true,
  })));

  const { docs: reviewDocs, stats } = buildReviewDocs(products, seededUsers);
  await Review.insertMany(reviewDocs);
  await Product.bulkWrite(Object.entries(stats).map(([productId, value]) => ({
    updateOne: {
      filter: { _id: productId },
      update: { $set: { rating: value.rating, reviewCount: value.reviewCount } },
    },
  })));

  const customerUsers = seededUsers.filter((user) => !user.isAdmin);
  const orderDocs = [];
  const paymentDocs = [];
  const couponUsage = {};

  for (let index = 0; index < GENERATED_ORDER_COUNT; index += 1) {
    const customer = customerUsers[index % customerUsers.length];
    const address = addressByUserId[customer._id.toString()];
    const paymentMethod = index % 4 === 0 ? "cod" : "online";
    const orderStatus = paymentMethod === "cod"
      ? pick(["pending", "confirmed", "packed"], index)
      : pick(["confirmed", "packed", "shipped", "out_for_delivery", "delivered"], index);
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

    if (coupon) {
      couponUsage[coupon._id.toString()] = (couponUsage[coupon._id.toString()] || 0) + 1;
    }

    orderDocs.push({
      orderNumber: `ORD-${String(20260000 + suffix)}`,
      user: customer._id,
      items: selectedItems,
      pricing: {
        subtotal,
        shipping,
        tax,
        couponCode: coupon?.code || "",
        couponDiscount,
        totalSavings,
        total,
      },
      addressSnapshot: snapshotAddress(address),
      paymentMethod,
      paymentGateway: online ? "razorpay" : "",
      paymentGatewayOrderId: online ? `order_seed_${suffix}` : "",
      paymentGatewayPaymentId: online ? `pay_seed_${suffix}` : "",
      paymentStatus: online ? "paid" : "cod_pending",
      paymentVerified: online,
      transactionMeta: { source: "seed" },
      orderStatus,
      trackingHistory: buildTrackingHistory(orderStatus, createdAt),
      createdAt,
      updatedAt: new Date(createdAt.getTime() + 12 * 60 * 60 * 1000),
    });
  }

  const createdOrders = await Order.insertMany(orderDocs);
  createdOrders.forEach((order) => {
    if (order.paymentMethod === "online") {
      paymentDocs.push({
        user: order.user,
        paymentMethod: "online",
        paymentGateway: "razorpay",
        gatewayOrderId: order.paymentGatewayOrderId,
        gatewayPaymentId: order.paymentGatewayPaymentId,
        gatewaySignature: `sig_${order.orderNumber}`,
        status: "paid",
        verified: true,
        order: order._id,
        addressId: addressByUserId[order.user.toString()]._id,
        couponCode: order.pricing.couponCode || "",
        amount: order.pricing.total,
        meta: { source: "seed" },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    }
  });

  await Payment.insertMany(paymentDocs);
  await Coupon.bulkWrite(coupons.map((coupon) => ({
    updateOne: {
      filter: { _id: coupon._id },
      update: { $set: { usageCount: couponUsage[coupon._id.toString()] || 0 } },
    },
  })));

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
