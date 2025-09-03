// pet.js (ฉบับสมบูรณ์ - อัปเดตระบบเลือก 2 สายที่ Lv. 15)

function PetSystem(state, helpers) {
    const { saveState, updateCoinDisplays, renderInventory, consumableItems } = helpers;
    let attunementInterval = null;
    let idleAnimationInterval = null;
    let currentPetEmotion = null; 

    // PET DEFINITIONS
    const petBackgroundDefinitions = {
        'default': { name: 'ห้องธรรมดา', description: 'ไม่มีโบนัสพิเศษ', image: `room.jpg` },
        'kitchen': { name: 'ห้องครัว', description: 'หิวช้าลง 10%', image: `kitchen.jpg` },
        'library': { name: 'ห้องสมุด', description: 'ได้รับ EXP เพิ่มขึ้น 10%', image: `library.jpg` },
        'beach': { name: 'ชายหาด', description: 'ใช้พลังงานน้อยลง 10%', image: `beach.jpg` },
        'bedroom': { name: 'ห้องนอน', description: 'ความสุขลดช้าลง 10%', image: `bedroom.jpg` },
        'restaurant': { name: 'ร้านอาหาร', description: 'ราคาอาหารลดลง 20%', image: `restaurant.jpg` },
        'amusement_park': { name: 'สวนสนุก', description: 'เล่นด้วยได้ความสุขเพิ่ม 20%', image: `amusement_park.jpg` },
        'vegetable_garden': { name: 'สวนผัก', description: 'ผักโตเร็วขึ้น 10%', image: `vegetable_garden.jpg` },
        'forest': { name: 'ป่า', description: 'โอกาสดรอปของเพิ่ม 5%', image: `forest.jpg` },
        'mythical_garden': { name: 'สวนเทพนิยาย', description: 'อาหารประเภทขนมปังให้ EXP +10%', image: 'mythical_garden.jpg' },
        'cake_shop': { name: 'ร้านเค้ก', description: 'อาหารประเภทเค้กให้ความสุข +15%', image: 'cake_shop.jpg' },
        'sky_palace': { name: 'วังฟ้า', description: 'อาหารประเภทไอศกรีมให้เหรียญม่อน +5%', image: 'sky_palace.jpg' },
        'magical_aquarium': { name: 'อควาเรียมเวทมนตร์', description: 'สตรอว์เบอร์รีมีโอกาสได้เมล็ดคืน', image: 'magical_aquarium.jpg' },
        'playroom': { name: 'Playroom', description: 'ได้ความสุขจากการเล่น +20%', image: 'playroom.jpg' },
        'playground': { name: 'สนามเด็กเล่น', description: 'พลังงานลดช้าลง 10%', image: 'playground.jpg' },
        'music_room': { name: 'ห้องดนตรี', description: 'EXP จากการเล่นด้วย +15%', image: 'music_room.jpg' },
        'digital_nexus': { name: 'Digital Nexus', description: 'พลังงานใช้ -30% และ EXP +15%', image: 'digital_nexus.jpg' },
        'gym_room': { name: 'ห้องกีฬา', description: 'ฟื้นฟู Stamina +20%', image: 'gym_room.jpg' },
        'cute_cafe': { name: 'คาเฟ่น่ารัก', description: 'เมื่อให้อาหารได้ความสุข +10%', image: 'cute_cafe.jpg' },
        'coffee_lounge': { name: 'Coffee Lounge', description: 'EXP +10%, ความหิวลดช้าลง 10%', image: 'coffee_lounge.jpg' },
        'secret_garden': { name: 'สวนลับ', description: 'ดรอปจากการสำรวจ +5%', image: 'secret_garden.jpg' },
        'hidden_shop': { name: 'ร้านค้าลับ', description: 'ราคาของในร้านค้าลด 10%', image: 'hidden_shop.jpg' },
        'beach_resort': { name: 'Beach Resort', description: 'Stamina ลดช้าลง 15%', image: 'beach_resort.jpg' },
        'ancient_forest': { name: 'Ancient Forest', description: 'EXP +15% จากการสำรวจ', image: 'ancient_forest.jpg' },
        'cozy_bedroom': { name: 'ห้องนอนใหม่', description: 'ฟื้นฟูพลังงานเร็วขึ้น 25%', image: 'cozy_bedroom.jpg' },
        'grand_kitchen': { name: 'ห้องครัวใหญ่', description: 'อาหารให้ความอิ่ม +25%', image: 'grand_kitchen.jpg' },
        'toy_gallery': { name: 'ห้องเก็บของเล่น', description: 'ความสุขจากการเล่น +25%', image: 'toy_gallery.jpg' },
        'sky_palace_legendary': { name: 'Sky Palace (Legendary)', description: 'โบนัสทุกอย่าง +10%', image: 'sky_palace_legendary.gif' },
    };
    
    const petEvolutions = {
        'base': { name: 'ร่างเบบี๋', title: '', name_class: 'text-white', bonus: null },
        // --- ฉายาขั้นแรก (Lv. 10) ---
        'cheerful': { name: 'ร่าเริง', title: ' (ร่าเริง)', description: 'ความสุขลดช้าลง 10%', name_class: 'text-cyan-300', bonus: { type: 'happiness_decay', value: 0.9 } },
        'strong': { name: 'แข็งแกร่ง', title: ' (แข็งแกร่ง)', description: 'ความอิ่มลดช้าลง 10%', name_class: 'text-amber-300', bonus: { type: 'hunger_decay', value: 0.9 } },
        'smart': { name: 'ฉลาด', title: ' (ฉลาด)', description: 'ได้รับ EXP เพิ่มขึ้น 5%', name_class: 'text-violet-400', bonus: { type: 'exp_boost', value: 1.05 } },
        'energetic': { name: 'กระฉับกระเฉง', title: ' (กระฉับกระเฉง)', description: 'พลังงานสูงสุด +10, ฟื้นฟูเร็วขึ้น 5%', name_class: 'text-lime-400', bonus: { type: 'stamina_boost', value: 10, regen: 1.05 } },
        'adventurer': { name: 'นักผจญภัย', title: ' (นักผจญภัย)', description: 'เพิ่มโอกาสเจอของหายาก 5%', name_class: 'text-orange-400', bonus: { type: 'rare_find', value: 1.05 } },
        'explorer': { name: 'นักสำรวจ', title: ' (นักสำรวจ)', description: 'ลดเวลาสำรวจลง 10%', name_class: 'text-teal-400', bonus: { type: 'explore_time', value: 0.9 } },
        'playful': { name: 'ขี้เล่น', title: ' (ขี้เล่น)', description: 'ได้รับความสุขจากการเล่น +20%', name_class: 'text-rose-400', bonus: { type: 'play_boost', value: 1.2 } },
        'lucky': { name: 'ดวงดี', title: ' (ดวงดี)', description: 'เพิ่มโชคในการสุ่มกาชาเล็กน้อย', name_class: 'text-yellow-300', bonus: { type: 'gacha_luck', value: 1.05 } },
        'gardener': { name: 'ชาวสวน', title: ' (ชาวสวน)', description: 'ลดเวลาเติบโตของผัก 10%', name_class: 'text-green-400', bonus: { type: 'garden_speed', value: 0.9 } },

        // --- ฉายาขั้นสูง (Lv. 15) ---
        // สาย Strong
        'guardian': { name: 'ผู้พิทักษ์', title: ' (ผู้พิทักษ์)', description: 'ความอิ่มลดช้าลง 20% และ +20 Max Hunger', name_class: 'text-yellow-400', bonus: { type: 'hunger_decay', value: 0.8, max_hunger_add: 20 } },
        'berserker': { name: 'นักรบคลั่ง', title: ' (นักรบคลั่ง)', description: 'เพิ่ม EXP/ของจากการสำรวจ +10% แต่ใช้ Stamina มากขึ้น 10%', name_class: 'text-red-500', bonus: { type: 'berserk_explorer', exp_item_boost: 1.1, stamina_cost: 1.1 } },
        // สาย Smart
        'sage': { name: 'นักปราชญ์', title: ' (นักปราชญ์)', description: 'ได้รับ EXP เพิ่มขึ้น 12%', name_class: 'text-fuchsia-400', bonus: { type: 'exp_boost', value: 1.12 } },
        'alchemist': { name: 'นักเล่นแร่แปรธาตุ', title: ' (นักเล่นแร่แปรธาตุ)', description: 'มีโอกาส 10% ที่จะไม่เสียไอเทมเมื่อใช้งาน และลดราคาสินค้า 5%', name_class: 'text-indigo-400', bonus: { type: 'item_saver', save_chance: 0.1, cost_multiplier: 0.95 } },
        // สาย Cheerful
        'idol': { name: 'ไอดอล', title: ' (ไอดอล)', description: 'ความสุขลดช้าลง 20% และ +10% ความสุขจากการเล่น', name_class: 'text-pink-400', bonus: { type: 'happiness_decay', value: 0.8, play_boost_extra: 1.1 } },
        'ambassador': { name: 'ทูตสันถวไมตรี', title: ' (ทูตสันถวไมตรี)', description: 'ลดราคาของในร้านค้าทั้งหมดลง 10%', name_class: 'text-rose-400', bonus: { type: 'shop_discount', value: 0.9 } },
        // สาย Energetic
        'dynamo': { name: 'จอมพลัง', title: ' (จอมพลัง)', description: 'Max Stamina +25 และฟื้นฟู Stamina เร็วขึ้น 15%', name_class: 'text-lime-300', bonus: { type: 'stamina_boost', value: 25, regen: 1.15 } },
        'marathoner': { name: 'นักวิ่งมาราธอน', title: ' (นักวิ่งมาราธอน)', description: 'ลดการใช้ Stamina ในการสำรวจลง 20% และ Max Stamina +10', name_class: 'text-cyan-400', bonus: { type: 'stamina_efficiency', reduction: 0.8, value: 10 } },
        // สาย Adventurer
        'treasure_hunter': { name: 'นักล่าสมบัติ', title: ' (นักล่าสมบัติ)', description: 'เพิ่มโอกาสเจอของหายาก 10% และมีโอกาสได้เหรียญเพิ่ม', name_class: 'text-orange-500', bonus: { type: 'rare_find', value: 1.1, coin_find: true } },
        'scout': { name: 'หน่วยสอดแนม', title: ' (หน่วยสอดแนม)', description: 'ลดเวลาและพลังงานที่ใช้ในการสำรวจลง 10%', name_class: 'text-emerald-400', bonus: { type: 'efficient_explorer', time_reduction: 0.9, stamina_reduction: 0.9 } },
        // สาย Explorer
        'pathfinder': { name: 'ผู้เบิกทาง', title: ' (ผู้เบิกทาง)', description: 'ลดเวลาสำรวจลง 20%', name_class: 'text-teal-300', bonus: { type: 'explore_time', value: 0.8 } },
        'pioneer': { name: 'นักบุกเบิก', title: ' (นักบุกเบิก)', description: 'ลดเวลาสำรวจลง 10% และเพิ่มโอกาสเจอไอเทมพิเศษ', name_class: 'text-sky-400', bonus: { type: 'explore_time_special', value: 0.9, special_find: true } },
        // สาย Playful
        'entertainer': { name: 'นักเอนเตอร์เทน', title: ' (นักเอนเตอร์เทน)', description: 'ได้รับความสุขจากการเล่น +35% และมีโอกาสได้รับ EXP', name_class: 'text-rose-500', bonus: { type: 'play_boost', value: 1.35, exp_chance: 0.25 } },
        'tinkerer': { name: 'นักประดิษฐ์', title: ' (นักประดิษฐ์)', description: 'มีโอกาส 15% ที่จะไม่เสียของเล่นเมื่อกดใช้งาน', name_class: 'text-slate-400', bonus: { type: 'toy_saver', save_chance: 0.15 } },
        // สาย Lucky
        'gambler': { name: 'นักเสี่ยงโชค', title: ' (นักเสี่ยงโชค)', description: 'เพิ่มโชคกาชา +10% และมีโอกาสได้รับตั๋วกาชาคืน', name_class: 'text-yellow-300', bonus: { type: 'gacha_luck', value: 1.1, ticket_rebate: 0.1 } },
        'prodigy': { name: 'อัจฉริยะ', title: ' (อัจฉริยะ)', description: 'เพิ่มอัตราการได้รับทรัพยากรทุกชนิด +3%', name_class: 'text-purple-400', bonus: { type: 'global_boost', value: 1.03 } },
        // สาย Gardener
        'harvester': { name: 'นักเก็บเกี่ยว', title: ' (นักเก็บเกี่ยว)', description: 'ลดเวลาเติบโตของผัก 20% และมีโอกาสได้ผลผลิตเพิ่ม', name_class: 'text-green-500', bonus: { type: 'garden_speed', value: 0.8, bonus_yield: 0.1 } },
        'botanist': { name: 'นักพฤกษศาสตร์', title: ' (นักพฤกษศาสตร์)', description: 'มีโอกาส 15% ที่จะได้ผักคุณภาพดี (EXP/ความอิ่ม +25%)', name_class: 'text-lime-500', bonus: { type: 'quality_vegetable', chance: 0.15, multiplier: 1.25 } }
    };

    const initialTitleChoices = [
        'cheerful', 'strong', 'smart', 'energetic', 'adventurer', 'explorer', 'playful', 'lucky', 'gardener'
    ];
    
    const evolutionPaths = {
        'cheerful': ['idol', 'ambassador'],
        'strong': ['guardian', 'berserker'],
        'smart': ['sage', 'alchemist'],
        'energetic': ['dynamo', 'marathoner'],
        'adventurer': ['treasure_hunter', 'scout'],
        'explorer': ['pathfinder', 'pioneer'],
        'playful': ['entertainer', 'tinkerer'],
        'lucky': ['gambler', 'prodigy'],
        'gardener': ['harvester', 'botanist']
    };

    const staminaItems = { 'item_m150': { stamina: 20 }, 'item_latte': { stamina: 30 }, 'item_americano': { stamina: 50 } };
    const petToys = { 
        'ของเล่นยาง': { happiness: 20, exp: 5 }, 
        'ลูกบอล': { happiness: 30, exp: 5 }, 
        'กีต้า': { happiness: 40, exp: 10 }, 
        'คอมพิวเตอร์': { happiness: 50, exp: 15 }, 
        'นินเท็นโด้': { happiness: 50, exp: 10 } 
    };
    const upgradeCosts = [100, 200, 400, 800, 1000];
    const maxUpgradeLevel = 5;
    const petFoodDefinitions = { 
        'ขนมปัง': { hunger: 15, exp: 5, cost: 10 }, 
        'เค้ก': { hunger: 30, exp: 12, cost: 25 }, 
        'ไอศกรีม': { hunger: 50, exp: 20, cost: 40 }, 
        'มะเขือเทศ': { hunger: 20, exp: 8, cost: 0 }, 
        'แครอท': { hunger: 30, exp: 10, cost: 0 }, 
        'บรอกโคลี': { hunger: 40, exp: 12, cost: 0 }, 
        'สตรอว์เบอร์รี': { hunger: 50, exp: 20, cost: 0 } 
    };
    
    const petEmotions = { 
        normal: ['idle.gif', 'idle2.gif', 'idle3.gif', 'idle4.gif'], 
        happy: 'happy.png', 
        sad: 'cry.png', 
        angry: 'angry.png',
        gastritis: 'gastritis.png',
        depression: 'depression.png',
        malnutrition: 'malnutrition.png'
    };

    const achievementDefinitions = {
        'feed_bread': { category: 'การป้อนอาหาร', name: 'นักชิมขนมปัง 🍞', icon: '🍞', tiers: [ { goal: 5, rewards: { exp: 10, play_coin: 1 } }, { goal: 10, rewards: { exp: 20, play_coin: 2 } }, { goal: 30, rewards: { exp: 40, play_coin: 3 } }, { goal: 50, rewards: { exp: 60, play_coin: 4 } }, { goal: 70, rewards: { exp: 80, play_coin: 5 } }, { goal: 100, rewards: { exp: 100, background: 'mythical_garden' } } ] },
        'feed_cake': { category: 'การป้อนอาหาร', name: 'คนรักเค้ก 🍰', icon: '🍰', tiers: [ { goal: 5, rewards: { exp: 15, play_coin: 1 } }, { goal: 10, rewards: { exp: 25, play_coin: 2 } }, { goal: 30, rewards: { exp: 50, play_coin: 3 } }, { goal: 50, rewards: { exp: 70, play_coin: 4 } }, { goal: 70, rewards: { exp: 90, play_coin: 5 } }, { goal: 100, rewards: { exp: 120, background: 'cake_shop' } } ] },
        'feed_icecream': { category: 'การป้อนอาหาร', name: 'ผู้เชี่ยวชาญไอศกรีม 🍦', icon: '🍦', tiers: [ { goal: 5, rewards: { exp: 20, play_coin: 1 } }, { goal: 10, rewards: { exp: 30, play_coin: 2 } }, { goal: 30, rewards: { exp: 60, play_coin: 3 } }, { goal: 50, rewards: { exp: 80, play_coin: 4 } }, { goal: 70, rewards: { exp: 100, play_coin: 5 } }, { goal: 100, rewards: { exp: 150, background: 'sky_palace' } } ] },
        'feed_tomato': { category: 'การป้อนอาหาร', name: 'ชาวสวนมะเขือเทศ 🍅', icon: '🍅', tiers: [ { goal: 5, rewards: { exp: 8, item: { id: 'เมล็ดมะเขือเทศ', amount: 1 } } }, { goal: 10, rewards: { exp: 16, item: { id: 'เมล็ดมะเขือเทศ', amount: 1 } } }, { goal: 30, rewards: { exp: 35, item: { id: 'เมล็ดมะเขือเทศ', amount: 2 } } }, { goal: 50, rewards: { exp: 55, item: { id: 'เมล็ดมะเขือเทศ', amount: 3 } } }, { goal: 70, rewards: { exp: 75, item: { id: 'เมล็ดมะเขือเทศ', amount: 4 } } }, { goal: 100, rewards: { exp: 100, background: 'vegetable_garden' } } ] },
        'feed_carrot': { category: 'การป้อนอาหาร', name: 'นักปลูกแครอท 🥕', icon: '🥕', tiers: [ { goal: 5, rewards: { exp: 10, item: { id: 'เมล็ดแครอท', amount: 1 } } }, { goal: 10, rewards: { exp: 20, item: { id: 'เมล็ดแครอท', amount: 1 } } }, { goal: 30, rewards: { exp: 40, item: { id: 'เมล็ดแครอท', amount: 2 } } }, { goal: 50, rewards: { exp: 60, item: { id: 'เมล็ดแครอท', amount: 3 } } }, { goal: 70, rewards: { exp: 80, item: { id: 'เมล็ดแครอท', amount: 4 } } }, { goal: 100, rewards: { exp: 110, background: 'forest' } } ] },
        'feed_broccoli': { category: 'การป้อนอาหาร', name: 'แฟนพันธุ์แท้บรอกโคลี 🥦', icon: '🥦', tiers: [ { goal: 5, rewards: { exp: 12, item: { id: 'เมล็ดบรอกโคลี', amount: 1 } } }, { goal: 10, rewards: { exp: 24, item: { id: 'เมล็ดบรอกโคลี', amount: 1 } } }, { goal: 30, rewards: { exp: 48, item: { id: 'เมล็ดบรอกโคลี', amount: 2 } } }, { goal: 50, rewards: { exp: 70, item: { id: 'เมล็ดบรอกโคลี', amount: 3 } } }, { goal: 70, rewards: { exp: 90, item: { id: 'เมล็ดบรอกโคลี', amount: 4 } } }, { goal: 100, rewards: { exp: 120, background: 'library' } } ] },
        'feed_strawberry': { category: 'การป้อนอาหาร', name: 'เจ้าแห่งสตรอว์เบอร์รี 🍓', icon: '🍓', tiers: [ { goal: 5, rewards: { exp: 15, item: { id: 'เมล็ดสตรอว์เบอร์รี', amount: 1 } } }, { goal: 10, rewards: { exp: 30, item: { id: 'เมล็ดสตรอว์เบอร์รี', amount: 1 } } }, { goal: 30, rewards: { exp: 60, item: { id: 'เมล็ดสตรอว์เบอร์รี', amount: 2 } } }, { goal: 50, rewards: { exp: 80, item: { id: 'เมล็ดสตรอว์เบอร์รี', amount: 3 } } }, { goal: 70, rewards: { exp: 100, item: { id: 'เมล็ดสตรอว์เบอร์รี', amount: 4 } } }, { goal: 100, rewards: { exp: 150, background: 'magical_aquarium' } } ] },
        'play_rubber_toy': { category: 'ของเล่น', name: 'นักเล่นของเล่นยาง', icon: '🧸', tiers: [ { goal: 5, rewards: { exp: 10 } }, { goal: 15, rewards: { play_coin: 2 } }, { goal: 30, rewards: { exp: 30 } }, { goal: 50, rewards: { exp: 50, item: { id: 'ของเล่นยาง', amount: 1 } } }, { goal: 100, rewards: { background: 'playroom' } } ] },
        'play_ball': { category: 'ของเล่น', name: 'นักเล่นบอล', icon: '⚽', tiers: [ { goal: 5, rewards: { exp: 10 } }, { goal: 15, rewards: { play_coin: 2 } }, { goal: 30, rewards: { exp: 30 } }, { goal: 50, rewards: { exp: 50 } }, { goal: 100, rewards: { background: 'playground' } } ] },
        'play_guitar': { category: 'ของเล่น', name: 'นักกีต้าร์', icon: '🎸', tiers: [ { goal: 5, rewards: { exp: 15 } }, { goal: 15, rewards: { play_coin: 3 } }, { goal: 30, rewards: { exp: 40 } }, { goal: 50, rewards: { exp: 60 } }, { goal: 100, rewards: { background: 'music_room' } } ] },
        'play_computer': { category: 'ของเล่น', name: 'เซียนคอมพิวเตอร์', icon: '💻', tiers: [ { goal: 5, rewards: { exp: 20 } }, { goal: 15, rewards: { play_coin: 3 } }, { goal: 30, rewards: { exp: 50 } }, { goal: 50, rewards: { exp: 70 } }, { goal: 100, rewards: { background: 'digital_nexus' } } ] },
        'use_m150': { category: 'ไอเทมเพิ่มพลัง', name: 'ผู้ใช้ M150', icon: '⚡', tiers: [ { goal: 5, rewards: { exp: 10 } }, { goal: 15, rewards: { play_coin: 2 } }, { goal: 30, rewards: { exp: 40 } }, { goal: 50, rewards: { background: 'gym_room' } } ] },
        'use_latte': { category: 'ไอเทมเพิ่มพลัง', name: 'คอกาแฟลาเต้', icon: '☕', tiers: [ { goal: 5, rewards: { exp: 10 } }, { goal: 15, rewards: { play_coin: 2 } }, { goal: 30, rewards: { exp: 40 } }, { goal: 50, rewards: { background: 'cute_cafe' } } ] },
        'use_americano': { category: 'ไอเทมเพิ่มพลัง', name: 'สายดาร์กอเมริกาโน่', icon: '☕', tiers: [ { goal: 5, rewards: { exp: 15 } }, { goal: 15, rewards: { play_coin: 3 } }, { goal: 30, rewards: { exp: 50 } }, { goal: 50, rewards: { background: 'coffee_lounge' } } ] },
        'explore_garden': { category: 'การสำรวจ', name: 'นักสำรวจสวนหลังบ้าน', icon: '🧭', tiers: [ { goal: 3, rewards: { exp: 10 } }, { goal: 10, rewards: { play_coin: 2 } }, { goal: 30, rewards: { exp: 40 } }, { goal: 50, rewards: { background: 'secret_garden' } } ] },
        'explore_market': { category: 'การสำรวจ', name: 'นักช้อปตลาดนัด', icon: '🧭', tiers: [ { goal: 3, rewards: { exp: 12 } }, { goal: 10, rewards: { play_coin: 3 } }, { goal: 30, rewards: { exp: 45 } }, { goal: 50, rewards: { background: 'hidden_shop' } } ] },
        'explore_beach': { category: 'การสำรวจ', name: 'นักเที่ยวทะเล', icon: '🧭', tiers: [ { goal: 3, rewards: { exp: 15 } }, { goal: 10, rewards: { play_coin: 3 } }, { goal: 30, rewards: { exp: 60 } }, { goal: 50, rewards: { background: 'beach_resort' } } ] },
        'explore_forest': { category: 'การสำรวจ', name: 'นักผจญภัยในป่า', icon: '🧭', tiers: [ { goal: 3, rewards: { exp: 20 } }, { goal: 10, rewards: { play_coin: 4 } }, { goal: 30, rewards: { exp: 70 } }, { goal: 50, rewards: { background: 'ancient_forest' } } ] },
        'upgrade_bed': { category: 'การอัปเกรดบ้าน', name: 'นักตกแต่งเตียง', icon: '🏠', tiers: [ { goal: 1, rewards: { exp: 20 } }, { goal: 2, rewards: { play_coin: 5 } }, { goal: 3, rewards: { play_coin: 5 } }, { goal: 4, rewards: { exp: 50 } }, { goal: 5, rewards: { background: 'cozy_bedroom' } } ] },
        'upgrade_bowl': { category: 'การอัปเกรดบ้าน', name: 'นักออกแบบชามอาหาร', icon: '🏠', tiers: [ { goal: 1, rewards: { exp: 20 } }, { goal: 2, rewards: { play_coin: 5 } }, { goal: 3, rewards: { play_coin: 5 } }, { goal: 4, rewards: { exp: 50 } }, { goal: 5, rewards: { background: 'grand_kitchen' } } ] },
        'upgrade_toy_shelf': { category: 'การอัปเกรดบ้าน', name: 'นักสะสมของเล่น', icon: '🧸', tiers: [ { goal: 1, rewards: { exp: 20 } }, { goal: 2, rewards: { play_coin: 5 } }, { goal: 3, rewards: { play_coin: 5 } }, { goal: 4, rewards: { exp: 50 } }, { goal: 5, rewards: { background: 'toy_gallery' } } ] },
        'upgrade_all_max': { category: 'การอัปเกรดบ้าน', name: 'เจ้าแห่งการแต่งบ้าน', icon: '👑', isSpecial: true, tiers: [ { goal: 1, rewards: { background: 'sky_palace_legendary' } } ] }
    };

    // DOM Elements
    const floatingPetContainer = document.getElementById('floating-pet-container');
    const floatingPetImage = document.getElementById('floating-pet-image');
    const petSpeechBubble = document.getElementById('pet-speech-bubble');
    const petStatsModal = document.getElementById('pet-stats-modal');
    const closePetStatsModalBtn = document.getElementById('close-pet-stats-modal-btn');
    const petDisplayArea = document.getElementById('pet-display-area');
    const petNameEl = document.getElementById('pet-name');
    const petLevelEl = document.getElementById('pet-level');
    const petModalImageEl = document.getElementById('pet-modal-image');
    const petExpText = document.getElementById('pet-exp-text');
    const petExpBar = document.getElementById('pet-exp-bar');
    const petHungerText = document.getElementById('pet-hunger-text');
    const petHungerBar = document.getElementById('pet-hunger-bar');
    const petHappinessText = document.getElementById('pet-happiness-text');
    const petHappinessBar = document.getElementById('pet-happiness-bar');
    const petStaminaText = document.getElementById('pet-stamina-text');
    const petStaminaBar = document.getElementById('pet-stamina-bar');
    const feedPetBtn = document.getElementById('feed-pet-btn');
    const playWithPetBtn = document.getElementById('play-with-pet-btn');
    const curePetBtn = document.getElementById('cure-pet-btn');
    const petActionButtons = document.getElementById('pet-action-buttons');
    const petExplorationStatusInModal = document.getElementById('pet-exploration-status-in-modal');
    const petExplorationLocationInModal = document.getElementById('pet-exploration-location-in-modal');
    const petExplorationTimerInModal = document.getElementById('pet-exploration-timer-in-modal');
    const changeBgBtn = document.getElementById('change-bg-btn');
    const backgroundModal = document.getElementById('background-modal');
    const closeBackgroundModalBtn = document.getElementById('close-background-modal-btn');
    const petBackgroundList = document.getElementById('pet-background-list');
    const petBackgroundBuffDisplay = document.getElementById('pet-background-buff-display');
    const petAttunementStatusDisplay = document.getElementById('pet-attunement-status-display');
    const backgroundConfirmModal = document.getElementById('background-confirm-modal');
    const backgroundConfirmImage = document.getElementById('background-confirm-image');
    const backgroundConfirmName = document.getElementById('background-confirm-name');
    const backgroundConfirmDesc = document.getElementById('background-confirm-desc');
    const confirmBackgroundChangeBtn = document.getElementById('confirm-background-change-btn');
    const cancelBackgroundChangeBtn = document.getElementById('cancel-background-change-btn');
    const upgradePetBtn = document.getElementById('upgrade-pet-btn');
    const upgradeModal = document.getElementById('upgrade-modal');
    const closeUpgradeModalBtn = document.getElementById('close-upgrade-modal-btn');
    const upgradeList = document.getElementById('upgrade-list');
    const useItemBtn = document.getElementById('use-item-btn');
    const useItemModal = document.getElementById('use-item-modal');
    const closeUseItemModalBtn = document.getElementById('close-use-item-modal-btn');
    const itemUseList = document.getElementById('item-use-list');
    const hatchModal = document.getElementById('hatch-modal');
    const eggStage = document.getElementById('egg-stage');
    const nameStage = document.getElementById('name-stage');
    const eggImage = document.getElementById('egg-image');
    const eggTapsText = document.getElementById('egg-taps');
    const petNameInput = document.getElementById('pet-name-input');
    const confirmNameBtn = document.getElementById('confirm-name-btn');
    const feedModal = document.getElementById('feed-modal');
    const foodList = document.getElementById('food-list');
    const closeFeedModalBtn = document.getElementById('close-feed-modal-btn');
    const playModal = document.getElementById('play-modal');
    const playOptionsList = document.getElementById('play-options-list');
    const closePlayModalBtn = document.getElementById('close-play-modal-btn');
    const achievementsBtn = document.getElementById('achievements-btn');
    const achievementNotification = document.getElementById('achievement-notification');
    const achievementsModal = document.getElementById('achievements-modal');
    const achievementsContent = document.getElementById('achievements-content');
    const closeAchievementsModalBtn = document.getElementById('close-achievements-modal-btn');
    const titleSelectionModal = document.getElementById('title-selection-modal');
    const titleOptionsList = document.getElementById('title-options-list');
    let eggTaps = 0;
    const TAPS_TO_HATCH = 20;

    function getActiveBuffs() {
        if (!state.pet || !state.pet.exists) return {};

        const buffs = {
            hunger_decay: 1.0,
            happiness_decay: 1.0,
            stamina_regen: 1.0,
            exp_boost: 1.0,
            play_happiness_boost: 1.0,
            food_cost_multiplier: 1.0,
            food_hunger_boost: 1.0,
            max_stamina_add: 0,
            max_hunger_add: 0,
            stamina_cost_multiplier: 1.0,
            item_save_chance: 0,
            toy_save_chance: 0,
            global_boost: 1.0,
            // Exploration specific
            explore_exp_item_boost: 1.0,
            explore_time_multiplier: 1.0,
            explore_rare_find_boost: 1.0,
        };

        const pet = state.pet;
        const evoInfo = petEvolutions[pet.evolution_form || 'base'];
        const activeBg = pet.activeBackground;

        // --- 1. Title Buffs ---
        if (evoInfo && evoInfo.bonus) {
            const bonus = evoInfo.bonus;
            switch (bonus.type) {
                case 'hunger_decay':
                    buffs.hunger_decay *= bonus.value;
                    if(bonus.max_hunger_add) buffs.max_hunger_add += bonus.max_hunger_add;
                    break;
                case 'happiness_decay':
                    buffs.happiness_decay *= bonus.value;
                    if(bonus.play_boost_extra) buffs.play_happiness_boost *= bonus.play_boost_extra;
                    break;
                case 'exp_boost': buffs.exp_boost *= bonus.value; break;
                case 'stamina_boost':
                    buffs.max_stamina_add += bonus.value;
                    buffs.stamina_regen *= bonus.regen;
                    break;
                case 'stamina_efficiency':
                    buffs.stamina_cost_multiplier *= bonus.reduction;
                    buffs.max_stamina_add += bonus.value;
                    break;
                case 'play_boost':
                     buffs.play_happiness_boost *= bonus.value;
                    // Note: exp_chance for Entertainer is handled separately in handlePlayAction
                    break;
                case 'item_saver':
                    buffs.item_save_chance = Math.max(buffs.item_save_chance, bonus.save_chance);
                    buffs.food_cost_multiplier *= bonus.cost_multiplier;
                    break;
                case 'toy_saver': buffs.toy_save_chance = Math.max(buffs.toy_save_chance, bonus.save_chance); break;
                case 'shop_discount': buffs.food_cost_multiplier *= bonus.value; break;
                case 'global_boost': buffs.global_boost *= bonus.value; break;
                // Exploration bonuses are grouped but can be used by other systems too
                case 'explore_time': buffs.explore_time_multiplier *= bonus.value; break;
                case 'rare_find': buffs.explore_rare_find_boost *= bonus.value; break;
                case 'berserk_explorer':
                    buffs.explore_exp_item_boost *= bonus.exp_item_boost;
                    buffs.stamina_cost_multiplier *= bonus.stamina_cost;
                    break;
                case 'efficient_explorer':
                    buffs.explore_time_multiplier *= bonus.time_reduction;
                    buffs.stamina_cost_multiplier *= bonus.stamina_reduction;
                    break;
            }
        }
        
        // Apply Prodigy's global boost to core stats
        if(buffs.global_boost > 1.0){
             buffs.exp_boost *= buffs.global_boost;
             // Can be applied to coin gains etc. elsewhere
        }


        // --- 2. Background Buffs ---
        if (activeBg === 'kitchen') buffs.hunger_decay *= 0.9;
        if (activeBg === 'library') buffs.exp_boost *= 1.1;
        if (activeBg === 'bedroom') buffs.happiness_decay *= 0.9;
        if (activeBg === 'restaurant') buffs.food_cost_multiplier *= 0.8;
        if (activeBg === 'amusement_park' || activeBg === 'playroom') buffs.play_happiness_boost *= 1.2;
        if (activeBg === 'gym_room') buffs.stamina_regen *= 1.2;
        if (activeBg === 'hidden_shop') buffs.food_cost_multiplier *= 0.9;
        if (activeBg === 'grand_kitchen') buffs.food_hunger_boost *= 1.25;
        if (activeBg === 'toy_gallery') buffs.play_happiness_boost *= 1.25;
        if (activeBg === 'beach' || activeBg === 'playground') buffs.stamina_cost_multiplier *= 0.9;
        if (activeBg === 'beach_resort') buffs.stamina_cost_multiplier *= 0.85;
        if (activeBg === 'ancient_forest') buffs.explore_exp_item_boost *= 1.15;
        
        if (activeBg === 'coffee_lounge') {
            buffs.exp_boost *= 1.1;
            buffs.hunger_decay *= 0.9;
        }
        if (activeBg === 'digital_nexus') {
            buffs.exp_boost *= 1.15;
            buffs.stamina_cost_multiplier *= 0.7;
        }

        if (activeBg === 'sky_palace_legendary') {
            buffs.hunger_decay *= 0.9;
            buffs.happiness_decay *= 0.9;
            buffs.stamina_regen *= 1.1;
            buffs.exp_boost *= 1.1;
            buffs.play_happiness_boost *= 1.1;
            buffs.food_cost_multiplier *= 0.9;
            buffs.stamina_cost_multiplier *= 0.9;
        }
        
        return buffs;
    }

    function checkAndApplySickness() {
        if (!state.pet || !state.pet.exists || state.pet.sickness) return;
        let newSickness = null;
        if (state.pet.hunger <= 0 && state.pet.happiness <= 0) {
            newSickness = 'malnutrition';
        } else if (state.pet.hunger <= 0) {
            newSickness = 'gastritis';
        } else if (state.pet.happiness <= 0) {
            newSickness = 'depression';
        }
        if (newSickness) {
            state.pet.sickness = newSickness;
        }
    }

    function formatCountdown(ms) {
        if (ms < 0) ms = 0;
        let s = Math.floor(ms / 1000);
        let m = Math.floor(s / 60);
        let h = Math.floor(m / 60);
        s %= 60; m %= 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function updatePetStatusOverTime() {
        if (!state.pet.exists) return;
        const now = Date.now();
        const elapsedMinutes = Math.floor((now - state.pet.lastStatusUpdate) / (1000 * 60));

        if (elapsedMinutes > 0) {
            const buffs = getActiveBuffs();
            const hungerLoss = Math.floor(elapsedMinutes / 7.5 * buffs.hunger_decay);
            const happinessLoss = Math.floor(elapsedMinutes / 10 * buffs.happiness_decay);
            const bedLevel = state.pet.upgradeLevels.bed;
            let finalRegenInterval = Math.max(1, 10 - (bedLevel * 0.5));
            if(state.pet.activeBackground === 'cozy_bedroom') finalRegenInterval *= 0.75;
            const staminaGain = Math.floor((elapsedMinutes / finalRegenInterval) * buffs.stamina_regen);
            state.pet.hunger = Math.max(0, state.pet.hunger - hungerLoss);
            state.pet.happiness = Math.max(0, state.pet.happiness - happinessLoss);
            if (!state.pet.exploration || state.pet.exploration.endTime < now) {
                const buffsForMax = getActiveBuffs();
                const levelBonus = (state.pet.level - 1) * 2;
                let maxStamina = 100 + levelBonus + buffsForMax.max_stamina_add;
                state.pet.stamina = Math.min(maxStamina, state.pet.stamina + staminaGain);
            }
            state.pet.lastStatusUpdate = now;
            checkAndApplySickness();
            saveState();
        }
    }

    function updatePetEmotion() {
        checkAndApplySickness(); 
		if (!state.pet.exists) return;
        let newEmotion = 'normal';
        let isBubbleVisible = false;
        let bubbleText = '';
        if (state.pet.sickness) {
            newEmotion = state.pet.sickness;
            isBubbleVisible = true;
            if(state.pet.sickness === 'malnutrition') bubbleText = 'ไม่มีแรงแล้ว... เป็นความผิดของเราเอง';
            else if(state.pet.sickness === 'gastritis') bubbleText = 'ปวดท้องจัง...';
            else if(state.pet.sickness === 'depression') bubbleText = 'ไม่อยากทำอะไรเลย...';
        } else if ((state.pet.hunger > 0 && state.pet.hunger <= 50) || (state.pet.happiness > 0 && state.pet.happiness <= 50)) {
            isBubbleVisible = true;
            if (state.pet.hunger <= state.pet.happiness) {
                newEmotion = 'sad'; bubbleText = 'หิวแน้ววว';
            } else {
                newEmotion = 'angry'; bubbleText = 'ไม่คิดถึงกันหรอ';
            }
        }

        if (newEmotion !== currentPetEmotion) {
            currentPetEmotion = newEmotion;
            if (idleAnimationInterval) {
                clearInterval(idleAnimationInterval);
                idleAnimationInterval = null;
            }
            petSpeechBubble.textContent = bubbleText;
            petSpeechBubble.classList.toggle('hidden', !isBubbleVisible);
            const emotionsForCurrentForm = petEmotions;
            if (currentPetEmotion === 'normal') {
                const setRandomIdle = () => {
                    const idleAnimations = emotionsForCurrentForm.normal;
                    if (!idleAnimations || idleAnimations.length === 0) return;
                    const randomIndex = Math.floor(Math.random() * idleAnimations.length);
                    const imageUrl = idleAnimations[randomIndex];
                    if (!floatingPetImage.src.endsWith(imageUrl)) {
                        floatingPetImage.src = imageUrl;
                        petModalImageEl.src = imageUrl;
                    }
                };
                setRandomIdle();
                idleAnimationInterval = setInterval(setRandomIdle, Math.random() * 5000 + 5000);
            } else {
                const imageUrl = emotionsForCurrentForm[newEmotion];
                if (imageUrl && !floatingPetImage.src.endsWith(imageUrl)) {
                    floatingPetImage.src = imageUrl;
                    petModalImageEl.src = imageUrl;
                }
            }
        }
    }
    
    function renderFloatingPet() {
        if (!state.pet.exists) {
            floatingPetContainer.classList.add('hidden');
            return;
        }
        floatingPetContainer.classList.remove('hidden');
        updatePetEmotion();
    }

    function renderPetStats() {
        if (!petNameEl) { return; }
		if (!state.pet.exists) return;
        
        const buffs = getActiveBuffs();
        const pet = state.pet;
        const currentEvoForm = pet.evolution_form || 'base';
        const evoInfo = petEvolutions[currentEvoForm];
        const maxExp = pet.level * 100;
        const levelBonus = (pet.level - 1) * 2;
        const bowlLevel = pet.upgradeLevels.bowl;
        const maxHunger = 100 + levelBonus + (bowlLevel >= 2 ? 5 : 0) + buffs.max_hunger_add;
        const bedLevel = pet.upgradeLevels.bed;
        const maxHappiness = 100 + levelBonus + (bedLevel >= 2 ? 5 : 0);
        let maxStamina = 100 + levelBonus + buffs.max_stamina_add;

        petNameEl.textContent = pet.name + evoInfo.title;
        petNameEl.className = 'text-xl font-bold';
        petNameEl.classList.add(evoInfo.name_class);
        petNameEl.style.textShadow = '1px 1px 4px rgba(0,0,0,0.7)';
        
        petLevelEl.textContent = `Lv. ${pet.level}`;
        const level = pet.level;
        const levelEl = petLevelEl;
        levelEl.classList.remove('bg-gray-400', 'text-white', 'bg-green-500', 'bg-sky-500', 'bg-indigo-500', 'bg-fuchsia-500', 'bg-amber-400', 'text-gray-800');
        if (level < 5) levelEl.classList.add('bg-gray-400', 'text-white');
        else if (level < 10) levelEl.classList.add('bg-green-500', 'text-white');
        else if (level < 15) levelEl.classList.add('bg-sky-500', 'text-white');
        else if (level < 20) levelEl.classList.add('bg-indigo-500', 'text-white');
        else if (level < 25) levelEl.classList.add('bg-fuchsia-500', 'text-white');
        else levelEl.classList.add('bg-amber-400', 'text-gray-800');

        petExpText.textContent = `${pet.exp} / ${maxExp}`;
        petExpBar.style.width = `${(pet.exp / maxExp) * 100}%`;
        petHungerText.textContent = `${pet.hunger} / ${maxHunger}`;
        petHungerBar.style.width = `${(pet.hunger / maxHunger) * 100}%`;
        petHappinessText.textContent = `${pet.happiness} / ${maxHappiness}`;
        petHappinessBar.style.width = `${(pet.happiness / maxHappiness) * 100}%`;
        petStaminaText.textContent = `${pet.stamina} / ${maxStamina}`;
        petStaminaBar.style.width = `${(pet.stamina / maxStamina) * 100}%`;
        
        const activeBgId = state.pet.activeBackground;
        const bgInfo = petBackgroundDefinitions[activeBgId];
        if (bgInfo && bgInfo.description !== 'ไม่มีโบนัสพิเศษ') {
            petDisplayArea.style.backgroundImage = `url('${bgInfo.image}')`;
            petBackgroundBuffDisplay.textContent = `โบนัส: ${bgInfo.description}`;
            petBackgroundBuffDisplay.classList.remove('hidden');
        } else {
            petDisplayArea.style.backgroundImage = `url('${petBackgroundDefinitions.default.image}')`;
            petBackgroundBuffDisplay.classList.add('hidden');
        }
        if (state.pet.exploration) {
            petExplorationStatusInModal.classList.remove('hidden');
            petExplorationLocationInModal.textContent = helpers.explorationLocations[state.pet.exploration.locationId].name;
        } else {
            petExplorationStatusInModal.classList.add('hidden');
        }
        if (pet.sickness) {
            feedPetBtn.classList.add('hidden');
            playWithPetBtn.classList.add('hidden');
            curePetBtn.classList.remove('hidden');
        } else {
            feedPetBtn.classList.remove('hidden');
            playWithPetBtn.classList.remove('hidden');
            curePetBtn.classList.add('hidden');
        }
        updatePetEmotion();
        updateAchievementNotification();
    }
    
    function isLevel10Title(formId) {
        return initialTitleChoices.includes(formId);
    }

    function checkAndTriggerEvolution() {
        const pet = state.pet;
        if (pet.level >= 10 && pet.evolution_form === 'base') {
            showTitleSelectionModal(10);
        } 
        else if (pet.level >= 15 && isLevel10Title(pet.evolution_form) && !pet.hasEvolvedTier2) {
            showTitleSelectionModal(15);
        }
    }

    function showTitleSelectionModal(level) {
        const currentForm = state.pet.evolution_form;
        const choices = (level === 10) 
            ? initialTitleChoices 
            : evolutionPaths[currentForm] || [];

        if (!choices || choices.length === 0) return;

        titleOptionsList.innerHTML = '';
        choices.forEach(choiceId => {
            const evoInfo = petEvolutions[choiceId];
            const button = document.createElement('button');
            button.className = 'btn-base w-full text-left p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200 hover:border-pink-400 transition-all';
            button.innerHTML = `
                <div class="font-bold text-lg text-pink-500">${evoInfo.title.trim()}</div>
                <div class="text-sm text-gray-500">${evoInfo.description}</div>
            `;
            button.onclick = () => {
                const confirmationMessage = `คุณแน่ใจหรือไม่ว่าจะเลือกฉายา "${evoInfo.title.trim()}"?\n\n(ไม่สามารถเปลี่ยนแปลงได้ในภายหลัง)`;
                if (confirm(confirmationMessage)) {
                    state.pet.evolution_form = choiceId;

                    if (level === 15) {
                        state.pet.hasEvolvedTier2 = true;
                    }

                    titleSelectionModal.classList.remove('visible');
                    alert(`ยินดีด้วย! ${state.pet.name} ได้รับฉายาใหม่คือ "${evoInfo.title.trim()}"!`);
                    renderPetStats();
                    saveState();
                }
            };
            titleOptionsList.appendChild(button);
        });
        titleSelectionModal.classList.add('visible');
    }
    
    function addPetExp(amount) {
        const pet = state.pet;
        const buffs = getActiveBuffs();
        let finalAmount = Math.round(amount * buffs.exp_boost);
        
        let maxExp = pet.level * 100;
        pet.exp += finalAmount;
        while (pet.exp >= maxExp) {
            pet.level++;
            pet.exp -= maxExp;
            maxExp = pet.level * 100; 
            alert(`ยินดีด้วย! ${pet.name} เลเวลอัปเป็น Lv. ${pet.level} แล้ว!`);
            checkAndTriggerEvolution();
        }
        saveState();
        renderPetStats();
    }

    function handleEggTap() {
        eggTaps++;
        eggTapsText.textContent = eggTaps;
        eggImage.classList.add('shaking');
        setTimeout(() => eggImage.classList.remove('shaking'), 200);
        if (eggTaps >= TAPS_TO_HATCH) {
            eggStage.classList.add('hidden');
            nameStage.classList.remove('hidden');
        }
    }

    function confirmPetName() {
        const name = petNameInput.value.trim();
        if (name) {
            state.pet = {
                exists: true, name: name, level: 1, exp: 0, hunger: 50, happiness: 60, stamina: 100,
                sickness: null,
                evolution_form: 'base',
                hasEvolvedTier2: false, // Flag for Tier 2 evolution
                exploration: null, lastPattedDate: null, lastStatusUpdate: Date.now(),
                ownedBackgrounds: ['default'], activeBackground: 'default', attunement: null,
                upgradeLevels: { bed: 0, bowl: 0, toy_shelf: 0 }
            };
            saveState();
            hatchModal.classList.remove('visible');
            renderFloatingPet();
        } else {
            alert('กรุณาตั้งชื่อให้น้องม่อนด้วยนะ!');
        }
    }

    function showFeedModal() {
        foodList.innerHTML = '';
        const buffs = getActiveBuffs();
        let costMultiplier = buffs.food_cost_multiplier;
        if (state.pet.upgradeLevels.bowl >= 4) costMultiplier *= 0.95;

        for (const foodName in petFoodDefinitions) {
            const food = petFoodDefinitions[foodName];
            const hasItem = (state.inventory[foodName] || 0) > 0;
            const bowlLevel = state.pet.upgradeLevels.bowl;
            const hungerBonusFromBowl = 1 + (bowlLevel > 0 ? ((bowlLevel - 1) * 0.05) : 0) + (bowlLevel >= 2 ? 0.05 : 0);
            let finalHungerGain = Math.round(food.hunger * hungerBonusFromBowl * buffs.food_hunger_boost);

            const foodEl = document.createElement('button');
            foodEl.className = 'btn-base w-full flex justify-between items-center p-3 bg-rose-50 rounded-lg border-l-4 border-rose-200';
            
            const feedAction = () => {
                let happinessGain = 0;
                if (state.pet.activeBackground === 'cute_cafe') happinessGain += 10;
                if (state.pet.activeBackground === 'cake_shop' && foodName === 'เค้ก') happinessGain += 15;
                if(happinessGain > 0) changeHappiness(happinessGain);

                changeHunger(finalHungerGain);
                
                let expGain = food.exp;
                if (state.pet.activeBackground === 'mythical_garden' && foodName === 'ขนมปัง') {
                    expGain = Math.round(expGain * 1.1);
                }
                addPetExp(expGain);
                
                const achievementKeyMap = { 'ขนมปัง': 'feed_bread', 'เค้ก': 'feed_cake', 'ไอศกรีม': 'feed_icecream', 'มะเขือเทศ': 'feed_tomato', 'แครอท': 'feed_carrot', 'บรอกโคลี': 'feed_broccoli', 'สตรอว์เบอร์รี': 'feed_strawberry' };
                if (achievementKeyMap[foodName]) trackAchievement(achievementKeyMap[foodName]);
                
                floatingPetImage.src = petEmotions.happy;
                petModalImageEl.src = petEmotions.happy;
                setTimeout(updatePetEmotion, 2000);
                feedModal.classList.remove('visible');
                alert(`คุณป้อน ${foodName} ให้ ${state.pet.name}!`);
                saveState();
                renderInventory();
                renderPetStats();
            };
            
            if (hasItem) {
                foodEl.innerHTML = `<span>ใช้ ${foodName} (+${finalHungerGain} ❤️)</span><span class="font-bold text-gray-600">มี ${state.inventory[foodName]} ชิ้น</span>`;
                foodEl.onclick = () => { 
                    const buffs = getActiveBuffs(); // Re-check buffs at time of use
                    if (buffs.item_save_chance > 0 && Math.random() < buffs.item_save_chance) {
                         alert('โชคดี! ไม่เสียอาหารชิ้นนี้');
                    } else {
                        state.inventory[foodName]--;
                    }
                    feedAction(); 
                };
            } else if (food.cost > 0) {
                const finalCost = Math.round(food.cost * costMultiplier);
                foodEl.innerHTML = `<span>ซื้อ ${foodName} (+${finalHungerGain} ❤️)</span><span class="font-bold text-amber-600">${finalCost} เหรียญ</span>`;
                foodEl.onclick = () => {
                    if (state.monCoins >= finalCost) { state.monCoins -= finalCost; updateCoinDisplays(); feedAction(); } 
                    else { alert('เหรียญม่อนไม่พอจ้า!'); }
                };
            } else { continue; }
            foodList.appendChild(foodEl);
        }
        feedModal.classList.add('visible');
    }

    function showPlayModal() {
        playOptionsList.innerHTML = '';
        const today = new Date().toDateString();
        const canPat = state.pet.lastPattedDate !== today;
        const patEl = document.createElement('button');
        patEl.className = `btn-base w-full flex justify-between items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200 ${!canPat ? 'opacity-50 cursor-not-allowed' : ''}`;
        patEl.innerHTML = `<span>ลูบหัว (+30 😊)</span><span class="font-bold text-blue-600">ฟรี (วันละครั้ง)</span>`;
        if (canPat) { patEl.onclick = () => handlePlayAction('pat'); } 
        else { patEl.disabled = true; }
        playOptionsList.appendChild(patEl);
        for (const toyName in petToys) {
            if (state.inventory[toyName] > 0) {
                const toy = petToys[toyName];
                let happinessGain = toy.happiness;
                const toyShelfLevel = state.pet.upgradeLevels.toy_shelf;
                if (toyShelfLevel >= 2) happinessGain = Math.round(happinessGain * 1.05);
                const buffs = getActiveBuffs();
                const finalHappinessGain = Math.round(happinessGain * buffs.play_happiness_boost);
                const toyEl = document.createElement('button');
                toyEl.className = 'btn-base w-full flex justify-between items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200';
                toyEl.innerHTML = `<span>ใช้ ${toyName} (+${finalHappinessGain} 😊)</span><span class="font-bold text-gray-600">มี ${state.inventory[toyName]} ชิ้น</span>`;
                toyEl.onclick = () => handlePlayAction(toyName, finalHappinessGain);
                playOptionsList.appendChild(toyEl);
            }
        }
        playModal.classList.add('visible');
    }

    function handlePlayAction(action, happinessGain) {
        const buffs = getActiveBuffs();
        let expGain = 0, playCoinGain = 0;

        if (action === 'pat') {
            if (state.pet.lastPattedDate !== new Date().toDateString()) {
                state.pet.lastPattedDate = new Date().toDateString();
                happinessGain = 30;
                expGain = 10;
                playCoinGain = 1 + Math.floor(state.pet.level / 5);
                alert(`คุณลูบหัว ${state.pet.name} อย่างเอ็นดู!\nได้รับ ${playCoinGain} เหรียญเล่นม่อน และ ${expGain} EXP!`);
            } else { return; }
        } else if (petToys[action] && state.inventory[action] > 0) {
            if (buffs.toy_save_chance > 0 && Math.random() < buffs.toy_save_chance) {
                alert('โชคดี! ไม่เสียของเล่นชิ้นนี้');
            } else {
                state.inventory[action]--;
            }
            expGain = petToys[action].exp;
            // Entertainer EXP Chance
            const evoInfo = petEvolutions[state.pet.evolution_form || 'base'];
            if(evoInfo.bonus && evoInfo.bonus.type === 'play_boost' && evoInfo.bonus.exp_chance && Math.random() < evoInfo.bonus.exp_chance){
                expGain += 5; // Bonus EXP
                alert('ดูเหมือนน้องจะสนุกเป็นพิเศษ! ได้รับ EXP เพิ่ม!');
            }
            alert(`คุณใช้ ${action} เล่นกับ ${state.pet.name}!`);
            const achievementKeyMap = { 'ของเล่นยาง': 'play_rubber_toy', 'ลูกบอล': 'play_ball', 'กีต้า': 'play_guitar', 'คอมพิวเตอร์': 'play_computer' };
            if (achievementKeyMap[action]) trackAchievement(achievementKeyMap[action]);
        } else { return; }
        
        changeHappiness(happinessGain || 0);
        if (state.pet.upgradeLevels.bed >= 4) expGain += 5;
        if (state.pet.activeBackground === 'music_room') expGain = Math.round(expGain * 1.15);
        if (expGain > 0) addPetExp(expGain);
        if (playCoinGain > 0) {
            state.playCoins += Math.round(playCoinGain * buffs.global_boost); // Prodigy buff
        }
        
        floatingPetImage.classList.add('pet-happy-animation');
        floatingPetImage.addEventListener('animationend', () => floatingPetImage.classList.remove('pet-happy-animation'), { once: true });
        saveState();
        renderPetStats();
        renderInventory();
        updateCoinDisplays();
        playModal.classList.remove('visible');
    }

    // ... The rest of the functions from showUseItemModal() to the end remain the same as the previously provided full code ...
    // ... Copy from the previous "full code" answer from here down ...

    function showUseItemModal() {
        itemUseList.innerHTML = '';
        let hasItem = false;
        // Stamina Items
        for (const itemId in staminaItems) {
            if (state.inventory[itemId] > 0) {
                hasItem = true;
                const itemEffect = staminaItems[itemId];
                const itemDetails = consumableItems[itemId];
                const itemEl = document.createElement('button');
                itemEl.className = 'btn-base w-full flex justify-between items-center p-3 bg-teal-50 rounded-lg border-l-4 border-teal-200';
                itemEl.innerHTML = `<span>ใช้ ${itemDetails.name} (+${itemEffect.stamina} ⚡️)</span><span class="font-bold text-gray-600">มี ${state.inventory[itemId]} ชิ้น</span>`;
                itemEl.onclick = () => {
                    const buffs = getActiveBuffs();
                    const levelBonus = (state.pet.level - 1) * 2;
                    let maxStamina = 100 + levelBonus + buffs.max_stamina_add;
                    if (state.pet.stamina >= maxStamina) { alert('พลังงานเต็มแล้วจ้า!'); return; }
                    
                    if (buffs.item_save_chance > 0 && Math.random() < buffs.item_save_chance) {
                        alert('โชคดี! ไม่เสียไอเทมชิ้นนี้');
                    } else {
                        state.inventory[itemId]--;
                    }

                    changeStamina(itemEffect.stamina);
                    const achievementKeyMap = { 'item_m150': 'use_m150', 'item_latte': 'use_latte', 'item_americano': 'use_americano' };
                    if (achievementKeyMap[itemId]) trackAchievement(achievementKeyMap[itemId]);
                    useItemModal.classList.remove('visible');
                    alert(`คุณใช้ ${itemDetails.name} ฟื้นฟูพลังงาน!`);
                    renderInventory();
                };
                itemUseList.appendChild(itemEl);
            }
        }
        if (!hasItem) itemUseList.innerHTML = `<p class="text-gray-500">ไม่มีไอเทมใช้งาน</p>`;
        useItemModal.classList.add('visible');
    }
    
    function renderUpgradesUI() {
        upgradeList.innerHTML = '';
        const upgrades = [
            { id: 'bed', name: 'เตียงนอน', icon: '🛏️', descriptions: ['+20 EXP', 'ความสุขสูงสุด +5', 'ความสุขลดช้าลง 5%', '+5 EXP ทุกครั้งที่เล่นด้วย', 'ปลดล็อก "ห้องนอนใหม่"'] },
            { id: 'bowl', name: 'ชามข้าว', icon: '🍚', descriptions: ['+20 EXP', 'อิ่มสูงสุด +5', 'ความหิวลดช้าลง 5%', 'ราคาอาหารลด 5%', 'ปลดล็อก "ห้องครัวใหญ่"'] },
            { id: 'toy_shelf', name: 'ชั้นของเล่น', icon: '🧸', descriptions: ['+20 EXP', 'ความสุขจากของเล่น +5%', 'โอกาสดรอปของจากการเล่น +3%', 'คูลดาวน์เล่นด้วยสั้นลง', 'ปลดล็อก "ห้องเก็บของเล่น"'] }
        ];
        upgrades.forEach(upgrade => {
            const currentLevel = state.pet.upgradeLevels[upgrade.id];
            const isMaxLevel = currentLevel >= maxUpgradeLevel;
            const effectText = currentLevel > 0 ? upgrade.descriptions[currentLevel - 1] : 'ยังไม่มีโบนัส';
            const nextEffectText = isMaxLevel ? 'สูงสุดแล้ว' : `Lv.${currentLevel + 1}: ${upgrade.descriptions[currentLevel]}`;
            const cost = isMaxLevel ? -1 : upgradeCosts[currentLevel];
            const canAfford = state.monCoins >= cost;
            const el = document.createElement('div');
            el.className = 'bg-gray-100 p-3 rounded-lg';
            el.innerHTML = `<div class="flex justify-between items-center"><div><h4 class="font-bold text-lg text-gray-800 flex items-center">${upgrade.icon} ${upgrade.name} (Lv. ${currentLevel})</h4><p class="text-sm font-semibold text-green-600">โบนัสปัจจุบัน: ${effectText}</p></div><button data-id="${upgrade.id}" class="upgrade-btn btn-base text-white font-bold py-2 px-4 rounded-lg border-b-4 ${isMaxLevel || !canAfford ? 'bg-gray-400 border-gray-500 cursor-not-allowed' : 'bg-green-500 border-green-700'}">${isMaxLevel ? 'MAX' : `${cost} $`}</button></div><div class="text-center text-xs text-gray-500 mt-2 bg-white p-1 rounded">ผลเลเวลถัดไป: ${nextEffectText}</div>`;
            upgradeList.appendChild(el);
        });
        document.querySelectorAll('.upgrade-btn').forEach(btn => btn.addEventListener('click', handleUpgrade));
    }

    function handleUpgrade(event) {
        const upgradeId = event.target.dataset.id;
        const currentLevel = state.pet.upgradeLevels[upgradeId];
        if (currentLevel >= maxUpgradeLevel) return;
        const cost = upgradeCosts[currentLevel];
        if (state.monCoins >= cost) {
            state.monCoins -= cost;
            state.pet.upgradeLevels[upgradeId]++;
            trackAchievement(`upgrade_${upgradeId}`, state.pet.upgradeLevels[upgradeId]);
            if (state.pet.upgradeLevels.bed === 5 && state.pet.upgradeLevels.bowl === 5 && state.pet.upgradeLevels.toy_shelf === 5) {
                trackAchievement('upgrade_all_max');
            }
            saveState();
            updateCoinDisplays();
            renderUpgradesUI();
            alert('อัปเกรดสำเร็จ!');
        } else {
            alert('เหรียญม่อนไม่พอจ้า!');
        }
    }

    function renderPetBackgroundsUI() {
        petBackgroundList.innerHTML = '';
        const isAttuning = !!state.pet.attunement;
        state.pet.ownedBackgrounds.forEach(bgId => {
            const bgInfo = petBackgroundDefinitions[bgId];
            if (!bgInfo) return;
            const bgEl = document.createElement('div');
            bgEl.dataset.bgId = bgId;
            const isActive = state.pet.activeBackground === bgId;
            const isBeingAttuned = isAttuning && state.pet.attunement.bgId === bgId;
            let borderClass = 'border-transparent';
            if (isActive) borderClass = 'border-pink-500 scale-105 shadow-lg';
            if (isBeingAttuned) borderClass = 'border-yellow-500 scale-105 shadow-lg';
            const disabledClass = (isAttuning && !isBeingAttuned) ? 'opacity-50 cursor-not-allowed' : '';
            bgEl.className = `relative rounded-md p-1 border-2 transition-all ${borderClass} ${disabledClass}`;
            bgEl.innerHTML = `<div class="h-16 bg-cover bg-center rounded" style="background-image: url('${bgInfo.image}')"></div><p class="text-xs font-semibold mt-1 text-center text-gray-700">${bgInfo.name}</p><div class="attunement-timer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md ${isBeingAttuned ? '' : 'hidden'}"></div>`;
            bgEl.title = bgInfo.description;
            if (!isAttuning) {
                bgEl.classList.add('cursor-pointer');
                bgEl.onclick = () => { if (!isActive) showBackgroundConfirmationModal(bgId); };
            }
            petBackgroundList.appendChild(bgEl);
        });
    }

    function showBackgroundConfirmationModal(bgId) {
        const bgInfo = petBackgroundDefinitions[bgId];
        if (!bgInfo) return;
        backgroundConfirmImage.src = bgInfo.image;
        backgroundConfirmName.textContent = bgInfo.name;
        backgroundConfirmDesc.textContent = `โบนัส: ${bgInfo.description}`;
        const oldBtn = document.getElementById('confirm-background-change-btn');
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        newBtn.onclick = () => startAttunement(bgId);
        backgroundModal.classList.remove('visible');
        backgroundConfirmModal.classList.add('visible');
    }

    function startAttunement(bgId) {
        if (state.pet.attunement || state.pet.activeBackground === bgId) { alert('ไม่สามารถเปลี่ยนได้ในขณะนี้'); return; }
        state.pet.attunement = { bgId: bgId, endTime: Date.now() + 15 * 60 * 1000 };
        saveState();
        backgroundConfirmModal.classList.remove('visible');
        alert(`เริ่มการปรับตัวเข้ากับ "${petBackgroundDefinitions[bgId].name}"!\nบัฟจะทำงานในอีก 15 นาที`);
        updateAttunementStatus();
    }

    function updateAttunementStatus() {
        if (attunementInterval) clearInterval(attunementInterval);
        const attunement = state.pet.attunement;
        if (!attunement) { petAttunementStatusDisplay.classList.add('hidden'); return; }
        const update = () => {
            const now = Date.now();
            const remaining = attunement.endTime - now;
            if (remaining <= 0) {
                const completedBgId = state.pet.attunement.bgId;
                const bgName = petBackgroundDefinitions[completedBgId]?.name || 'พื้นหลังใหม่';
                state.pet.activeBackground = completedBgId;
                state.pet.attunement = null;
                clearInterval(attunementInterval);
                attunementInterval = null;
                saveState();
                alert(`ปรับตัวเข้ากับ "${bgName}" สำเร็จ! บัฟทำงานแล้ว`);
                petAttunementStatusDisplay.classList.add('hidden');
                renderPetStats();
                if (backgroundModal.classList.contains('visible')) renderPetBackgroundsUI();
            } else {
                const countdownText = formatCountdown(remaining);
                const bgName = petBackgroundDefinitions[state.pet.attunement.bgId]?.name;
                const statusText = `กำลังปรับตัว: ${bgName} (${countdownText})`;
                petAttunementStatusDisplay.innerHTML = statusText;
                petAttunementStatusDisplay.classList.remove('hidden');
                const bgItemInList = petBackgroundList.querySelector(`[data-bg-id="${state.pet.attunement.bgId}"] .attunement-timer`);
                if (bgItemInList) { bgItemInList.textContent = countdownText; bgItemInList.classList.remove('hidden'); }
            }
        };
        attunementInterval = setInterval(update, 1000);
        update();
    }
    
    function trackAchievement(key, value = 1) {
        const isLevelBased = key.startsWith('upgrade_');
        if (isLevelBased) {
            state.achievementProgress[key] = value;
        } else {
            state.achievementProgress[key] = (state.achievementProgress[key] || 0) + value;
        }
        updateAchievementNotification();
        saveState();
    }

    function updateAchievementNotification() {
        let hasUnclaimed = false;
        for (const id in achievementDefinitions) {
            const achievement = achievementDefinitions[id];
            const progress = state.achievementProgress[id] || 0;
            for (let i = 0; i < achievement.tiers.length; i++) {
                if (progress >= achievement.tiers[i].goal && !state.achievementStatus[`${id}_${i}`]) {
                    hasUnclaimed = true; break;
                }
            }
            if (hasUnclaimed) break;
        }
        achievementNotification.classList.toggle('hidden', !hasUnclaimed);
    }
    
    function renderAchievements() {
        achievementsContent.innerHTML = '';
        const achievementsByCategory = {};
        for (const id in achievementDefinitions) {
            const achievement = achievementDefinitions[id];
            if (!achievementsByCategory[achievement.category]) achievementsByCategory[achievement.category] = [];
            achievementsByCategory[achievement.category].push({ id, ...achievement });
        }
        for (const category in achievementsByCategory) {
            const categoryEl = document.createElement('div');
            categoryEl.innerHTML = `<h3 class="text-lg font-bold text-pink-600 mb-2">${category}</h3>`;
            achievementsByCategory[category].forEach(ach => {
                const progress = state.achievementProgress[ach.id] || 0;
                let nextTier = null, nextTierIndex = -1;
                for(let i = 0; i < ach.tiers.length; i++) {
                    if (!state.achievementStatus[`${ach.id}_${i}`]) {
                        nextTier = ach.tiers[i]; nextTierIndex = i; break;
                    }
                }
                const achEl = document.createElement('div');
                achEl.className = 'bg-white p-3 rounded-lg mb-2 border';
                const progressText = nextTier ? `${progress} / ${nextTier.goal}` : 'สำเร็จทั้งหมด!';
                const progressPercent = nextTier ? (progress / nextTier.goal) * 100 : 100;
                achEl.innerHTML = `<div class="flex justify-between items-start"><div><h4 class="font-semibold text-gray-800">${ach.icon} ${ach.name}</h4><p class="text-xs text-gray-500">${progressText}</p></div></div><div class="progress-bar-bg mt-1"><div class="progress-bar bg-gradient-to-r from-amber-300 to-yellow-400" style="width: ${progressPercent}%;"></div></div><div class="mt-2 space-y-1">${ach.tiers.map((tier, i) => { const statusKey = `${ach.id}_${i}`; const isClaimed = state.achievementStatus[statusKey]; const canClaim = progress >= tier.goal && !isClaimed; let rewardText = Object.entries(tier.rewards).map(([key, value]) => { if (key === 'exp') return `+${value} EXP`; if (key === 'play_coin') return `+${value} เหรียญเล่นม่อน`; if (key === 'background') return `ปลดล็อก "${petBackgroundDefinitions[value]?.name || value}"`; if (key === 'item') return `+${value.amount} ${consumableItems[value.id]?.name || value.id}`; return ''; }).join(', '); let buttonHtml; if (isClaimed) { buttonHtml = `<button disabled class="text-xs px-2 py-1 rounded bg-gray-300 text-gray-500">รับแล้ว</button>`; } else if (canClaim) { buttonHtml = `<button data-id="${ach.id}" data-tier="${i}" class="claim-achievement-btn btn-base text-xs px-2 py-1 rounded bg-green-500 text-white font-semibold">รับ</button>`; } else { buttonHtml = `<button disabled class="text-xs px-2 py-1 rounded bg-gray-200 text-gray-400">ยังไม่ถึง</button>`; } return `<div class="flex justify-between items-center text-sm p-1 rounded ${isClaimed ? 'bg-green-50 text-gray-400 line-through' : 'bg-gray-100'}"><span>เป้าหมาย ${tier.goal}: ${rewardText}</span>${buttonHtml}</div>`; }).join('')}</div>`;
                categoryEl.appendChild(achEl);
            });
            achievementsContent.appendChild(categoryEl);
        }
        document.querySelectorAll('.claim-achievement-btn').forEach(btn => {
            btn.addEventListener('click', (e) => claimAchievementReward(e.target.dataset.id, parseInt(e.target.dataset.tier)));
        });
    }

    function claimAchievementReward(id, tierIndex) {
        const achievement = achievementDefinitions[id];
        if (!achievement) return;
        const tier = achievement.tiers[tierIndex];
        const progress = state.achievementProgress[id] || 0;
        const statusKey = `${id}_${tierIndex}`;
        if (progress >= tier.goal && !state.achievementStatus[statusKey]) {
            state.achievementStatus[statusKey] = true;
            if (tier.rewards.exp) addPetExp(tier.rewards.exp);
            if (tier.rewards.play_coin) state.playCoins += tier.rewards.play_coin;
            if (tier.rewards.item) state.inventory[tier.rewards.item.id] = (state.inventory[tier.rewards.item.id] || 0) + tier.rewards.item.amount;
            if (tier.rewards.background && !state.pet.ownedBackgrounds.includes(tier.rewards.background)) {
                state.pet.ownedBackgrounds.push(tier.rewards.background);
            }
            saveState();
            updateCoinDisplays();
            renderInventory();
            renderAchievements();
            updateAchievementNotification();
            alert('รับรางวัลสำเร็จ!');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    }

    // Drag and Drop for Floating Pet
    let isDragging = false, dragStartX, dragStartY, lastTranslateX = 0, lastTranslateY = 0;
    function dragStart(e) {
        isDragging = false;
        dragStartX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        dragStartY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        floatingPetContainer.style.transform = `translate(${lastTranslateX}px, ${lastTranslateY}px) scale(1.1)`;
        floatingPetContainer.style.transition = 'none';
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }
    function dragMove(e) {
        isDragging = true; e.preventDefault();
        let currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        let currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const dx = currentX - dragStartX;
        const dy = currentY - dragStartY;
        floatingPetContainer.style.transform = `translate(${lastTranslateX + dx}px, ${lastTranslateY + dy}px) scale(1.1)`;
    }
    function dragEnd(e) {
        if (isDragging) {
            let finalX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
            let finalY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;
            lastTranslateX += finalX - dragStartX;
            lastTranslateY += finalY - dragStartY;
        }
        floatingPetContainer.style.transform = `translate(${lastTranslateX}px, ${lastTranslateY}px) scale(1)`;
        floatingPetContainer.style.transition = 'transform 0.2s ease-out';
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchend', dragEnd);
    }
    
    function setupEventListeners() {
        floatingPetContainer.addEventListener('mousedown', dragStart);
        floatingPetContainer.addEventListener('touchstart', dragStart);
        floatingPetContainer.addEventListener('click', () => {
            if (!isDragging) { renderPetStats(); petStatsModal.classList.add('visible'); }
        });
        closePetStatsModalBtn.addEventListener('click', () => petStatsModal.classList.remove('visible'));
        eggImage.addEventListener('click', handleEggTap);
        confirmNameBtn.addEventListener('click', confirmPetName);
        feedPetBtn.addEventListener('click', showFeedModal);
        closeFeedModalBtn.addEventListener('click', () => feedModal.classList.remove('visible'));
        playWithPetBtn.addEventListener('click', showPlayModal);
        closePlayModalBtn.addEventListener('click', () => playModal.classList.remove('visible'));
        changeBgBtn.addEventListener('click', () => { renderPetBackgroundsUI(); backgroundModal.classList.add('visible'); });
        closeBackgroundModalBtn.addEventListener('click', () => backgroundModal.classList.remove('visible'));
        cancelBackgroundChangeBtn.addEventListener('click', () => {
            backgroundConfirmModal.classList.remove('visible');
            backgroundModal.classList.add('visible');
        });
        upgradePetBtn.addEventListener('click', () => { renderUpgradesUI(); upgradeModal.classList.add('visible'); });
        closeUpgradeModalBtn.addEventListener('click', () => upgradeModal.classList.remove('visible'));
        useItemBtn.addEventListener('click', showUseItemModal);
        closeUseItemModalBtn.addEventListener('click', () => useItemModal.classList.remove('visible'));
        achievementsBtn.addEventListener('click', () => { renderAchievements(); achievementsModal.classList.add('visible'); });
        closeAchievementsModalBtn.addEventListener('click', () => achievementsModal.classList.remove('visible'));

        curePetBtn.addEventListener('click', () => {
            const medicineId = 'ยาแก้ป่วย';
            if (state.inventory[medicineId] && state.inventory[medicineId] > 0) {
                state.inventory[medicineId]--;
                cureSickness();
                renderInventory();
            } else {
                alert('ไม่มียาแก้ป่วย! กรุณาไปซื้อที่ร้านค้า');
            }
        });
    }

    function cureSickness() {
        if (state.pet.sickness) {
            state.pet.sickness = null;
            const maxHunger = 100 + ((state.pet.level - 1) * 2);
            const maxHappiness = 100 + ((state.pet.level - 1) * 2);
            state.pet.hunger = Math.min(maxHunger, state.pet.hunger + 10);
            state.pet.happiness = Math.min(maxHappiness, state.pet.happiness + 10);
            updatePetEmotion();
            renderPetStats();
            saveState();
            alert('น้องรู้สึกดีขึ้นแล้ว!');
        }
    }

    function changeHunger(amount) {
        if (!state.pet || !state.pet.exists) return;
        const buffs = getActiveBuffs();
        const levelBonus = (state.pet.level - 1) * 2;
        const bowlLevel = state.pet.upgradeLevels.bowl;
        const maxHunger = 100 + levelBonus + (bowlLevel >= 2 ? 5 : 0) + buffs.max_hunger_add;
        state.pet.hunger = Math.min(maxHunger, Math.max(0, state.pet.hunger + amount));
        renderPetStats();
        saveState();
    }

    function changeHappiness(amount) {
        if (!state.pet || !state.pet.exists) return;
        const levelBonus = (state.pet.level - 1) * 2;
        const bedLevel = state.pet.upgradeLevels.bed;
        const maxHappiness = 100 + levelBonus + (bedLevel >= 2 ? 5 : 0);
        state.pet.happiness = Math.min(maxHappiness, Math.max(0, state.pet.happiness + amount));
        renderPetStats();
        saveState();
    }

    function changeStamina(amount) {
        if (!state.pet || !state.pet.exists) return;
        const buffs = getActiveBuffs();
        const levelBonus = (state.pet.level - 1) * 2;
        let maxStamina = 100 + levelBonus + buffs.max_stamina_add;
        state.pet.stamina = Math.min(maxStamina, Math.max(0, state.pet.stamina + amount));
        renderPetStats();
        saveState();
    }


    // --- Public API ---
    return {
        init: function() {
            if (!state.pet.exists) {
                hatchModal.classList.add('visible');
            } else {
                if (!state.pet.hasOwnProperty('evolution_form')) state.pet.evolution_form = 'base';
                if (!state.pet.hasOwnProperty('sickness')) state.pet.sickness = null;
                if (!state.pet.hasOwnProperty('hasEvolvedTier2')) state.pet.hasEvolvedTier2 = false;
                updatePetStatusOverTime();
                renderFloatingPet();
                updateAttunementStatus();
                renderPetStats();
            }
            updateAchievementNotification();
            setupEventListeners();
        },
        addPetExp,
        trackAchievement,
        getBackgroundInfo: (bgId) => petBackgroundDefinitions[bgId],
        getEvoInfo: () => petEvolutions[state.pet.evolution_form || 'base'],
        getActiveBuffs: () => getActiveBuffs(),
        changeHunger,
        changeHappiness,
        changeStamina,
        cureSickness
    };
}