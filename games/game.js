// --- Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiContainer = document.getElementById('uiContainer');
const damageNumbersContainer = document.getElementById('damageNumbersContainer');
const healthBar = document.getElementById('healthBar');
const healthText = document.getElementById('healthText');
const xpBar = document.getElementById('xpBar');
const levelText = document.getElementById('level');
const timerText = document.getElementById('timer');
const mainMenuScreen = document.getElementById('mainMenuScreen');
const guideScreen = document.getElementById('guideScreen');
const settingsScreen = document.getElementById('settingsScreen');
const pauseScreen = document.getElementById('pauseScreen');
const startScreen = document.getElementById('startScreen');
const levelUpScreen = document.getElementById('levelUpScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const chestScreen = document.getElementById('chestScreen');
const chestTitle = document.getElementById('chestTitle');
const chestAnimationContainer = document.getElementById('chestAnimationContainer');
const chestUpgradeCount = document.getElementById('chestUpgradeCount');
const chestRewardsContainer = document.getElementById('chestRewardsContainer');
const chestContinueButton = document.getElementById('chestContinueButton');
const menuStartButton = document.getElementById('menuStartButton');
const menuGuideButton = document.getElementById('menuGuideButton');
const menuSettingsButton = document.getElementById('menuSettingsButton');
const guideBackButton = document.getElementById('guideBackButton');
const settingsBackButton = document.getElementById('settingsBackButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const pauseGuideButton = document.getElementById('pauseGuideButton');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const pauseWeaponIconsContainer = document.getElementById('pauseWeaponIcons');
const pausePassiveIconsContainer = document.getElementById('pausePassiveIcons');
const coinsEarnedText = document.getElementById('coinsEarned');
const controlDragBtn = document.getElementById('controlDrag');
const controlJoystickBtn = document.getElementById('controlJoystick');
const lowModeToggleBtn = document.getElementById('lowModeToggle');
const joystickContainer = document.getElementById('joystick-container');
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');

// Guide UI
const evoGuideContainer = document.getElementById('evoGuideContainer');
const weaponGuideContainer = document.getElementById('weaponGuideContainer');
const passiveGuideContainer = document.getElementById('passiveGuideContainer');
const guideTabEvo = document.getElementById('guideTabEvo');
const guideTabWeapons = document.getElementById('guideTabWeapons');
const guideTabPassives = document.getElementById('guideTabPassives');


let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let gameState = 'menu';
let gameTime = 0;
let enemiesKilledCount = 0;
let animationFrameId;
let selectedCharacterId = null;
let nextBossTime = 300; // 5 minutes
const RENDER_SCALE = 0.75; // Zoom out factor
let guideReturnState = 'menu';
let isBonusGame = false;
let controlMode = 'drag'; // 'drag' or 'joystick'
let lowMode = false;
let pendingLevelUps = 0;

// --- Player ---
const player = {
    x: canvasWidth / 2, y: canvasHeight / 2, radius: 15 * RENDER_SCALE,
    color: '#FFFFFF', hp: 100, maxHp: 100, xp: 0, level: 1,
    xpToNextLevel: 10, lastHitTime: 0, isInvincible: false, revives: 0,
    passives: [],
    stats: {
        speed: 3 * RENDER_SCALE,
        damageModifier: 1.0,
        cooldownModifier: 1.0,
        projectileSpeedModifier: 1.0,
        damageReduction: 0,
        pickupRadius: 100 * RENDER_SCALE,
        xpGainModifier: 1.0,
        revives: 0
    }
};

// --- Master Lists ---
const WEAPONS_MASTER_LIST = {
    laser: { name: "ปืนเลเซอร์", icon: "☄️", type: 'laser_beam', damage: 15, count: 1, range: 200 * RENDER_SCALE, duration: 150, cooldown: 2500, lastAttackTime: 0, projectiles: [], maxLevel: 5, description: "ยิงเลเซอร์ใส่ศัตรูที่ใกล้ที่สุด" },
    lightning: { name: "พลังสายฟ้า", icon: "⚡️", type: 'orbital', damage: 12, count: 1, speed: 0.035, range: 80 * RENDER_SCALE, angle: 0, projectiles: [], maxLevel: 5, description: "สร้างลูกบอลไฟฟ้าโคจรรอบตัว", size: 10 * RENDER_SCALE },
    axe: { name: "ขวาน", icon: "🪓", type: 'arc', damage: 25, count: 1, speed: 7 * RENDER_SCALE, range: 1.0, cooldown: 2000, lastAttackTime: 0, projectiles: [], maxLevel: 5, description: "ขว้างขวานเป็นแนวโค้งขึ้นไป", size: 15 * RENDER_SCALE },
    garlic: { name: "ออร่ากระเทียม", icon: "🧄", type: 'aura', damage: 3, count: 1, range: 100 * RENDER_SCALE, cooldown: 500, lastAttackTime: 0, lastHit: new Map(), projectiles: [], maxLevel: 5, description: "สร้างออร่าทำความเสียหายรอบตัว" },
    missile: { name: "กระสุนเวทนำวิถี", icon: "✨", type: 'homing', damage: 20, count: 1, speed: 6 * RENDER_SCALE, cooldown: 1800, lastAttackTime: 0, projectiles: [], maxLevel: 5, pierce: 1, description: "ยิงกระสุนเวทติดตามศัตรู" },
    sword: { name: "ดาบบินได้", icon: "⚔️", type: 'sword_orbital', damage: 18, count: 1, range: 90 * RENDER_SCALE, speed: 0.04, angle: 0, cooldown: 10000, lastAttackTime: 0, projectiles: [], homingProjectiles: [], pierce: 1, maxLevel: 5, description: "ดาบโคจรรอบตัวและพุ่งโจมตี", size: 15 * RENDER_SCALE },
    santa_water: { name: "น้ำมนต์", icon: "💧", type: 'area_denial', damage: 5, count: 1, duration: 4000, cooldown: 2200, lastAttackTime: 0, projectiles: [], maxLevel: 5, radius: 50 * RENDER_SCALE, description: "สร้างพื้นที่ศักดิ์สิทธิ์ทำความเสียหาย" },
    pentagram: { name: "ดาวห้าแฉก", icon: "✡️", type: 'screen_clear', damage: 9999, cooldown: 60000, lastAttackTime: 0, projectiles: [], maxLevel: 5, chance: 0.3, description: "มีโอกาสลบศัตรูทั้งหมดบนหน้าจอ" },
    gun_one: { name: "Eight The Sparrow", icon: "🔵", type: 'directional', damage: 10, cooldown: 500, lastAttackTime: 0, speed: 10 * RENDER_SCALE, projectiles: [], maxLevel: 5, direction: 'horizontal', description: "ยิงกระสุนแนวนอน (ซ้าย-ขวา)", size: 7 * RENDER_SCALE },
    gun_two: { name: "Phiera Der Tuphello", icon: "🟣", type: 'directional', damage: 10, cooldown: 500, lastAttackTime: 0, speed: 10 * RENDER_SCALE, projectiles: [], maxLevel: 5, direction: 'vertical', description: "ยิงกระสุนแนวตั้ง (บน-ล่าง)", size: 7 * RENDER_SCALE },
    laurel: { name: "ช่อมะกอก", icon: "🌿", type: 'defensive_shield', cooldown: 5000, charges: 1, active: false, maxLevel: 5, description: "ป้องกันการโจมตีได้เป็นครั้งคราว" },
    clock_lancet: { name: "มีดสั้นแห่งเวลา", icon: "❄️", type: 'freeze_beam', damage: 0, cooldown: 6000, lastAttackTime: 0, duration: 1000, projectiles: [], maxLevel: 5, count: 1, width: 4 * RENDER_SCALE, description: "ยิงลำแสงแช่แข็งศัตรูชั่วขณะ" }
};
const PASSIVES_MASTER_LIST = {
    spinach: { name: "ผักโขม", icon: "🥬", description: "เพิ่มพลังโจมตีทั้งหมด", maxLevel: 5, apply: (p, level) => { p.stats.damageModifier = 1 + (0.1 * level); } },
    armor: { name: "เกราะ", icon: "🛡️", description: "ลดความเสียหายที่ได้รับ", maxLevel: 5, apply: (p, level) => { p.stats.damageReduction = 1 - Math.pow(0.95, level); } },
    wings: { name: "ปีก", icon: "🕊️", description: "เพิ่มความเร็วในการเคลื่อนที่", maxLevel: 5, apply: (p, level) => { p.stats.speed = (3 * RENDER_SCALE) * (1 + (0.1 * level)); } },
    tome: { name: "ตำรา", icon: "📖", description: "ลดคูลดาวน์ของอาวุธทั้งหมด", maxLevel: 5, apply: (p, level) => { p.stats.cooldownModifier = 1 - (0.08 * level); } },
    candelabrador: { name: "เชิงเทียน", icon: "🕯️", description: "เพิ่มความเร็วของโปรเจคไทล์", maxLevel: 5, apply: (p, level) => { p.stats.projectileSpeedModifier = 1 + (0.1 * level); } },
    magnet: { name: "แม่เหล็ก", icon: "🧲", description: "เพิ่มระยะการดูดไอเทมและ EXP", maxLevel: 5, apply: (p, level) => { p.stats.pickupRadius = (100 * RENDER_SCALE) * (1 + 0.25 * level); } },
    crown: { name: "มงกุฎ", icon: "👑", description: "เพิ่ม EXP ที่ได้รับ", maxLevel: 5, apply: (p, level) => { p.stats.xpGainModifier = 1 + (0.1 * level); } },
    tiragisu: { name: "ทีรามิสุ", icon: "🍰", description: "ให้การฟื้นคืนชีพเมื่อตาย", maxLevel: 2, apply: (p, level) => { p.stats.revives = level; } }
};
const EVOLUTIONS = {
    supercharge_beam: { name: "ลำแสงซูเปอร์ชาร์จ", icon: "💥", baseWeaponId: 'laser', passiveId: 'spinach', evolvedWeapon: { name: "ลำแสงซูเปอร์ชาร์จ", type: 'evo_rotating_lasers', damage: 40, count: 8, range: 2000, duration: 2000, cooldown: 5000, lastAttackTime: 0, attackStartTime: null, projectiles: [], lastHit: new Map(), isEvolved: true } },
    thunder_loop: { name: "วงแหวนอัสนี", icon: "🌀", baseWeaponId: 'lightning', passiveId: 'wings', evolvedWeapon: { name: "วงแหวนอัสนี", type: 'evo_orbital_ring', damage: 25, range: 180 * RENDER_SCALE, cooldown: 250, lastAttackTime: 0, lastHit: new Map(), projectiles: [], isEvolved: true } },
    death_spiral: { name: "เกลียวมรณะ", icon: "💀", baseWeaponId: 'axe', passiveId: 'candelabrador', evolvedWeapon: { name: "เกลียวมรณะ", type: 'evo_spiral', damage: 60, count: 8, speed: 6 * RENDER_SCALE, cooldown: 2500, lastAttackTime: 0, projectiles: [], isEvolved: true, size: 36 * RENDER_SCALE } },
    soul_eater: { name: "เครื่องดูดวิญญาณ", icon: "👻", baseWeaponId: 'garlic', passiveId: 'armor', evolvedWeapon: { name: "เครื่องดูดวิญญาณ", type: 'aura', damage: 15, range: 150 * RENDER_SCALE, cooldown: 300, lastAttackTime: 0, lastHit: new Map(), projectiles: [], isEvolved: true, lifestealOnKillChance: 0.25 } },
    thousand_edge: { name: "พันศาสตรา", icon: "🗡️", baseWeaponId: 'missile', passiveId: 'tome', evolvedWeapon: { name: "พันศาสตรา", type: 'homing', damage: 50, count: 5, speed: 8 * RENDER_SCALE, cooldown: 5000, lastAttackTime: 0, projectiles: [], isEvolved: true, pierce: 10 } },
    demonic_orbit: { name: "วงโคจรดาบปีศาจ", icon: "🔥", baseWeaponId: 'sword', passiveId: 'magnet', evolvedWeapon: { name: "วงโคจรดาบปีศาจ", type: 'orbital', damage: 50, count: 10, speed: 0.05, range: 120 * RENDER_SCALE, angle: 0, projectiles: [], isEvolved: true, size: 25 * RENDER_SCALE } },
    la_borra: { name: "La Borra", icon: "💦", baseWeaponId: 'santa_water', passiveId: 'magnet', evolvedWeapon: { name: "La Borra", type: 'evo_growing_pools', damage: 10, count: 3, duration: 6000, cooldown: 1500, lastAttackTime: 0, projectiles: [], isEvolved: true } },
    gorgeous_moon: { name: "Gorgeous Moon", icon: "🌕", baseWeaponId: 'pentagram', passiveId: 'crown', evolvedWeapon: { name: "Gorgeous Moon", type: 'evo_xp_clear', damage: 9999, cooldown: 45000, lastAttackTime: 0, projectiles: [], isEvolved: true } },
    phieraggi: { name: "Phieraggi", icon: "💫", baseWeaponId: ['gun_one', 'gun_two'], passiveId: 'tiragisu', evolvedWeapon: { name: "Phieraggi", type: 'evo_rotating_beams', damage: 30, cooldown: 50, lastAttackTime: 0, projectiles: [], isEvolved: true, angle: 0, size: 12 * RENDER_SCALE } },
    infinite_corridor: { name: "Infinite Corridor", icon: "⏳", baseWeaponId: 'clock_lancet', passiveId: 'tome', evolvedWeapon: { name: "Infinite Corridor", type: 'freeze_beam', damage: 0, cooldown: 5000, lastAttackTime: 0, duration: 2500, projectiles: [], isEvolved: true, count: 12, width: 10 * RENDER_SCALE } },
    crimson_shroud: { name: "Crimson Shroud", icon: "❤️‍🩹", baseWeaponId: 'laurel', passiveId: 'armor', evolvedWeapon: { name: "Crimson Shroud", type: 'evo_damage_cap', isEvolved: true, damageCap: 10, retaliateDamage: 10, charges: 1, active: false, cooldown: 5000 } }
};

let weapons = [];
let difficultyManager = {};

// --- Characters ---
const CHARACTERS = [
    { id: 'mage', name: 'นักเวทย์', description: 'เริ่มต้นด้วยพลังสายฟ้า', color: '#63b3ed', startingWeaponId: 'lightning' },
    { id: 'robot', name: 'หุ่นยนต์', description: 'เริ่มต้นด้วยปืนเลเซอร์', color: '#9e9e9e', startingWeaponId: 'laser' },
    { id: 'barbarian', name: 'คนเถื่อน', description: 'เริ่มต้นด้วยขวาน', color: '#f6ad55', startingWeaponId: 'axe' }
];

let enemies = [];
let xpGems = [];
let pickups = [];
let monsterProjectiles = [];
const keys = {};

// --- Control State ---
let isPointerDown = false;
let pointerPos = { x: 0, y: 0 };
let joystick = {
    active: false,
    potential: false,
    touchId: null,
    baseX: 0,
    baseY: 0,
    stickX: 0,
    stickY: 0,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
};

// --- UI Functions ---
function updateInventoryUI() {
    pauseWeaponIconsContainer.innerHTML = '';
    pausePassiveIconsContainer.innerHTML = '';
    weapons.forEach(w => {
        let master;
        if (w.isEvolved) {
            for (const key in EVOLUTIONS) {
                if (EVOLUTIONS[key].evolvedWeapon.name === w.name) {
                    master = EVOLUTIONS[key];
                    break;
                }
            }
        } else {
            master = WEAPONS_MASTER_LIST[w.id];
        }
        
        if (master) {
            const iconEl = document.createElement('div');
            iconEl.className = 'inventory-icon rounded-md';
            iconEl.innerHTML = `${master.icon}<div class="level-badge">${w.isEvolved ? 'MAX' : w.level}</div>`;
            pauseWeaponIconsContainer.appendChild(iconEl);
        }
    });
    player.passives.forEach(p => {
        const master = PASSIVES_MASTER_LIST[p.id];
        const iconEl = document.createElement('div');
        iconEl.className = 'inventory-icon rounded-md';
        iconEl.innerHTML = `${master.icon}<div class="level-badge">${p.level}</div>`;
        pausePassiveIconsContainer.appendChild(iconEl);
    });
}

// --- Guide System ---
function populateEvoGuide() {
    evoGuideContainer.innerHTML = '';
    for (const key in EVOLUTIONS) {
        const evo = EVOLUTIONS[key];
        const passive = PASSIVES_MASTER_LIST[evo.passiveId];
        const item = document.createElement('div');
        item.className = 'evo-guide-item';
        
        let weaponIconsHTML = '';
        if (Array.isArray(evo.baseWeaponId)) {
            evo.baseWeaponId.forEach(id => {
                const weapon = WEAPONS_MASTER_LIST[id];
                weaponIconsHTML += `<div class="inventory-icon rounded-md">${weapon.icon}</div>`;
            });
        } else {
            const weapon = WEAPONS_MASTER_LIST[evo.baseWeaponId];
            weaponIconsHTML = `<div class="inventory-icon rounded-md">${weapon.icon}</div>`;
        }

        item.innerHTML = `
            <div class="flex gap-1">${weaponIconsHTML}</div>
            <span>+</span>
            <div class="inventory-icon rounded-md">${passive.icon}</div>
            <span>=</span>
            <div class="inventory-icon rounded-md bg-green-700 border-green-400">${evo.icon}</div>
        `;
        evoGuideContainer.appendChild(item);
    }
}

function createGuideItemCard(master) {
    const item = document.createElement('div');
    item.className = 'guide-item-card';
    item.innerHTML = `
        <div class="inventory-icon rounded-md text-2xl">${master.icon}</div>
        <div class="flex-grow">
            <h4 class="font-bold text-lg text-yellow-200">${master.name}</h4>
            <p class="text-gray-300 text-sm">${master.description}</p>
        </div>
    `;
    return item;
}

function populateWeaponGuide() {
    weaponGuideContainer.innerHTML = '';
    for (const key in WEAPONS_MASTER_LIST) {
        weaponGuideContainer.appendChild(createGuideItemCard(WEAPONS_MASTER_LIST[key]));
    }
}

function populatePassiveGuide() {
    passiveGuideContainer.innerHTML = '';
    for (const key in PASSIVES_MASTER_LIST) {
        passiveGuideContainer.appendChild(createGuideItemCard(PASSIVES_MASTER_LIST[key]));
    }
}


// --- Character Selection ---
function populateCharacterSelection() {
    const container = document.getElementById('characterSelection');
    container.innerHTML = '';
    CHARACTERS.forEach(char => {
        const card = document.createElement('div');
        card.className = 'card bg-gray-800 border-4 border-gray-600 p-4 rounded-lg text-center';
        card.dataset.charId = char.id;
        card.innerHTML = `<div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 sm:mb-4" style="background-color: ${char.color};"></div><h3 class="text-xl sm:text-2xl font-bold text-yellow-300 mb-2">${char.name}</h3><p class="text-gray-300 text-sm">${char.description}</p>`;
        card.addEventListener('click', () => { selectedCharacterId = char.id; document.querySelectorAll('#characterSelection .card').forEach(c => c.classList.remove('selected')); card.classList.add('selected'); startButton.disabled = false; });
        container.appendChild(card);
    });
}

// --- Upgrade System ---
function getWeaponUpgradeDescription(weapon) {
    const nextLevel = weapon.level + 1;
    switch (weapon.id) {
         case 'laser':
            if (nextLevel === 2 || nextLevel === 4) return `เพิ่มจำนวนลำแสงเป็น ${weapon.count + 1} ลำ`;
            return `เพิ่มพลังโจมตีและเพิ่มระยะ`;
        case 'lightning':
            if (nextLevel === 2 || nextLevel === 4 || nextLevel === 5) return `เพิ่มจำนวนเป็น ${weapon.count + 1} ลูก`;
            return `เพิ่มพลังโจมตีและขยายขอบเขต`;
        case 'axe':
            if (nextLevel === 2 || nextLevel === 4 || nextLevel === 5) return `เพิ่มขวานเป็น ${weapon.count + 1} ชิ้น`;
            return `เพิ่มพลังโจมตีและขนาด`;
        case 'garlic':
            return `เพิ่มพลังโจมตีและขยายขอบเขต`;
        case 'missile':
             if (nextLevel === 2 || nextLevel === 4 || nextLevel === 5) return `เพิ่มจำนวนกระสุนเป็น ${weapon.count + 1} ลูก`;
             return `เพิ่มพลังโจมตีและการเจาะทะลุ`;
        case 'sword':
             if (nextLevel === 2 || nextLevel === 4 || nextLevel === 5) return `เพิ่มดาบเป็น ${weapon.count + 1} เล่ม`;
             return `เพิ่มพลังโจมตีและขนาด`;
        case 'santa_water':
            return 'เพิ่มจำนวนพื้นที่และลดคูลดาวน์';
        case 'pentagram':
            return 'เพิ่มโอกาสแสดงผลและลดคูลดาวน์';
        case 'gun_one':
        case 'gun_two':
            return 'เพิ่มพลังโจมตี, ขนาด และความเร็วโจมตี';
        case 'laurel':
            return 'เพิ่มจำนวนครั้งที่ป้องกันและลดคูลดาวน์';
        case 'clock_lancet':
            return 'เพิ่มจำนวนลำแสงและลดคูลดาวน์';
        default: return `เพิ่มประสิทธิภาพของอาวุธ`;
    }
}

function upgradeWeapon(weapon) {
    weapon.level++;
    const level = weapon.level;
    switch (weapon.id) {
        case 'laser':
            weapon.damage += 5;
            weapon.range += ( (canvasWidth / 2) - (200 * RENDER_SCALE) ) / 4;
            if (level === 2 || level === 4) weapon.count++;
            weapon.cooldown *= 0.92;
            break;
        case 'lightning': 
            weapon.damage += 2; 
            weapon.range += 10 * RENDER_SCALE; // Increase range/size
            if (level === 2) weapon.count = 2;
            if (level === 3) { weapon.speed += 0.005; }
            if (level === 4) weapon.count = 3;
            if (level === 5) { weapon.count = 4; weapon.speed += 0.005; }
            break;
        case 'axe':
            weapon.damage += 8;
            weapon.size = (weapon.size || 15 * RENDER_SCALE) * 1.15;
            if (level === 2 || level === 4 || level === 5) weapon.count++;
            weapon.cooldown *= 0.95;
            break;
        case 'garlic':
            weapon.damage += 1;
            weapon.range += 12 * RENDER_SCALE;
            weapon.cooldown *= 0.95;
            break;
        case 'missile':
            weapon.damage += 5;
            if (level === 2) { weapon.count = 2; weapon.pierce = 1; }
            if (level === 3) { weapon.pierce = 2; }
            if (level === 4) { weapon.count = 3; weapon.pierce = 3; }
            if (level === 5) { weapon.count = 4; weapon.pierce = 5; }
            break;
        case 'sword':
            weapon.damage += 5;
            weapon.size = (weapon.size || 15 * RENDER_SCALE) * 1.15;
            if (level === 2 || level === 4 || level === 5) weapon.count++;
            break;
        case 'santa_water':
            weapon.count++;
            weapon.radius *= 1.15;
            weapon.cooldown *= 0.9;
            break;
        case 'pentagram':
            weapon.chance += 0.15;
            weapon.cooldown *= 0.9;
            break;
        case 'gun_one':
        case 'gun_two':
            weapon.damage += 2;
            weapon.cooldown *= 0.9; // Faster firing
            weapon.size = (weapon.size || 7 * RENDER_SCALE) * 1.1; // Bigger bullets
            break;
        case 'laurel':
            if (level === 3 || level === 5) weapon.charges++;
            weapon.cooldown *= 0.9;
            break;
        case 'clock_lancet':
            if (level === 3 || level === 5) weapon.count++;
            weapon.cooldown *= 0.9;
            weapon.width += 2 * RENDER_SCALE;
            break;
    }
}

function getUpgradeOptions() {
    const upgrades = [];
    const evolutionCandidates = [];

    for (const evoKey in EVOLUTIONS) {
        const evo = EVOLUTIONS[evoKey];
        let canEvolve = false;
        
        if (Array.isArray(evo.baseWeaponId)) { // Handle multi-weapon evolutions (e.g., guns)
            const hasAllWeapons = evo.baseWeaponId.every(id => 
                weapons.find(w => w.id === id && w.level === WEAPONS_MASTER_LIST[id].maxLevel)
            );
            const hasPassive = player.passives.find(p => p.id === evo.passiveId && p.level === PASSIVES_MASTER_LIST[p.id].maxLevel);
            if (hasAllWeapons && hasPassive) {
                canEvolve = true;
            }
        } else { // Handle single weapon evolutions
            const weapon = weapons.find(w => w.id === evo.baseWeaponId && w.level === WEAPONS_MASTER_LIST[w.id].maxLevel);
            const passive = player.passives.find(p => p.id === evo.passiveId && p.level === PASSIVES_MASTER_LIST[p.id].maxLevel);
            if (weapon && passive) {
                canEvolve = true;
            }
        }

        if (canEvolve) {
            evolutionCandidates.push({
                id: `evolve_${evoKey}`, isEvolution: true, icon: evo.icon, name: `วิวัฒนาการ: ${evo.name}`,
                description: `เปลี่ยนอาวุธเป็นขั้นสุดยอด`,
                apply: () => {
                    const baseIds = Array.isArray(evo.baseWeaponId) ? evo.baseWeaponId : [evo.baseWeaponId];
                    // Remove all base weapons
                    weapons = weapons.filter(w => !baseIds.includes(w.id));
                    
                    // Add the new evolved weapon
                    const evolved = JSON.parse(JSON.stringify(evo.evolvedWeapon));
                    evolved.id = evoKey;
                    evolved.level = 'MAX';
                    if (evolved.type === 'aura' || evolved.type === 'evo_orbital_ring') { evolved.lastHit = new Map(); }
                    weapons.push(evolved);
                }
            });
        }
    }
    
    if (evolutionCandidates.length > 0) {
        return [evolutionCandidates[0]];
    }

    // Add upgrades for existing weapons
    weapons.forEach((w) => {
        const master = WEAPONS_MASTER_LIST[w.id];
        if (master && w.level < master.maxLevel && !w.isEvolved) {
            upgrades.push({ id: `upgrade_${w.id}`, icon: master.icon, name: `อัปเกรด ${master.name} (Lv. ${w.level + 1})`, description: getWeaponUpgradeDescription(w), apply: () => upgradeWeapon(w) });
        }
    });

    // Add upgrades for existing passives
    player.passives.forEach((p) => {
        const master = PASSIVES_MASTER_LIST[p.id];
        if (master && p.level < master.maxLevel) {
            upgrades.push({ id: `upgrade_${p.id}`, icon: master.icon, name: `อัปเกรด ${master.name} (Lv. ${p.level + 1})`, description: master.description, apply: () => { p.level++; master.apply(player, p.level); } });
        }
    });
    
    const takenBaseWeaponIds = new Set();
    weapons.forEach(w => {
        if (w.isEvolved) {
            for (const key in EVOLUTIONS) {
                if (EVOLUTIONS[key].evolvedWeapon.name === w.name) {
                     const baseIds = Array.isArray(EVOLUTIONS[key].baseWeaponId) ? EVOLUTIONS[key].baseWeaponId : [EVOLUTIONS[key].baseWeaponId];
                     baseIds.forEach(id => takenBaseWeaponIds.add(id));
                }
            }
        } else {
            takenBaseWeaponIds.add(w.id);
        }
    });


    // Add new weapons if slots are available
    if (weapons.length < 6) {
        const availableNewWeapons = Object.keys(WEAPONS_MASTER_LIST).filter(id => !takenBaseWeaponIds.has(id));
        availableNewWeapons.forEach(newId => {
            const master = WEAPONS_MASTER_LIST[newId];
            upgrades.push({ id: `new_${newId}`, icon: master.icon, name: `รับอาวุธ: ${master.name}`, description: 'เพิ่มอาวุธใหม่', apply: () => { const inst = JSON.parse(JSON.stringify(WEAPONS_MASTER_LIST[newId])); inst.id = newId; inst.level = 1; if(inst.type==='aura' || inst.type === 'sword_orbital') inst.lastHit=new Map(); weapons.push(inst); } });
        });
    }

    // Add new passives if slots are available
    if (player.passives.length < 6) {
         const currentPassiveIds = player.passives.map(p => p.id);
         const availableNewPassives = Object.keys(PASSIVES_MASTER_LIST).filter(id => !currentPassiveIds.includes(id));
         availableNewPassives.forEach(newId => {
             const master = PASSIVES_MASTER_LIST[newId];
             upgrades.push({ id: `new_${newId}`, icon: master.icon, name: `รับไอเทม: ${master.name}`, description: master.description, apply: () => { player.passives.push({id: newId, level: 1}); master.apply(player, 1); } });
         });
    }
    
    // Remove duplicates by ID, shuffle, and take the first 3 or 4
    const uniqueUpgrades = [...new Map(upgrades.map(item => [item.id, item])).values()];
    
    for (let i = uniqueUpgrades.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniqueUpgrades[i], uniqueUpgrades[j]] = [uniqueUpgrades[j], uniqueUpgrades[i]];
    }

    return uniqueUpgrades.slice(0, 4);
}


function displayUpgradeOptions(options) {
    const container = document.getElementById('upgradeOptions');
    container.innerHTML = '';
    if (options.length === 0) {
        options = [{ id: 'heal_small', icon: '❤️', name: 'พักหายใจ', description: 'ฟื้นฟู HP 20 หน่วย', apply: () => { player.hp = Math.min(player.maxHp, player.hp + 20); } }];
    }
    options.forEach(upgrade => {
        const card = document.createElement('div');
        const evolutionClass = upgrade.isEvolution ? 'evolution-card' : '';
        const cardClasses = `card bg-gray-800 border-2 border-yellow-400 p-4 sm:p-6 rounded-lg text-center flex flex-col items-center ${evolutionClass}`;
        card.className = cardClasses;
        card.innerHTML = `
            <div class="text-4xl sm:text-5xl mb-2 sm:mb-4">${upgrade.icon}</div>
            <h3 class="text-lg sm:text-xl font-bold text-yellow-300 mb-2">${upgrade.name}</h3>
            <p class="text-gray-300 text-xs sm:text-sm">${upgrade.description}</p>
        `;
        card.onclick = () => selectUpgrade(upgrade);
        container.appendChild(card);
    });
}

function selectUpgrade(upgrade) {
    upgrade.apply();
    pendingLevelUps--;

    if (pendingLevelUps > 0) {
        showNextLevelUpOptions();
    } else {
        levelUpScreen.classList.add('hidden');
        levelUpScreen.classList.remove('flex');
        gameState = 'playing';
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function showNextLevelUpOptions() {
    const options = getUpgradeOptions();
    displayUpgradeOptions(options);
    levelUpScreen.classList.remove('hidden');
    levelUpScreen.classList.add('flex');
}

function checkLevelUp() {
    if (gameState === 'levelUp') return; // Don't check for more levels while one is already processing UI

    let leveledUpThisFrame = false;
    while (player.xp >= player.xpToNextLevel) {
        leveledUpThisFrame = true;
        pendingLevelUps++;
        player.level++;
        player.xp -= player.xpToNextLevel;
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.2 + 20);
        player.maxHp += 5;
        player.hp = Math.min(player.maxHp, player.hp + 5);
    }

    if (leveledUpThisFrame) {
        gameState = 'levelUp';
        cancelAnimationFrame(animationFrameId);
        showNextLevelUpOptions();
    }
}
    
// --- Event Listeners and Controls ---
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

function handleControlStart(e) {
    if (gameState !== 'playing') return;
    
    // Add listeners immediately
    if (e.touches) {
        window.addEventListener('touchmove', handleControlMove, { passive: false });
        window.addEventListener('touchend', handleControlEnd, { passive: false });
        window.addEventListener('touchcancel', handleControlEnd, { passive: false });
    } else {
        window.addEventListener('mousemove', handleControlMove);
        window.addEventListener('mouseup', handleControlEnd);
        window.addEventListener('mouseleave', handleControlEnd);
    }

    const touch = e.touches ? e.touches[0] : null;

    if (controlMode === 'joystick' && touch) {
        // We only start a "potential" joystick. It becomes active only on move.
        if (!joystick.active && !joystick.potential) {
            e.preventDefault();
            joystick.potential = true;
            joystick.touchId = touch.identifier;
            joystick.startX = touch.clientX;
            joystick.startY = touch.clientY;
        }
    } else if (controlMode === 'drag') {
        isPointerDown = true;
        const pos = touch || e;
        pointerPos.x = pos.clientX;
        pointerPos.y = pos.clientY;
    }
}

function handleControlMove(e) {
    if (gameState !== 'playing') return;

    if (controlMode === 'joystick') {
        const touch = e.touches ? Array.from(e.touches).find(t => t.identifier === joystick.touchId) : null;
        if (!touch) return; // This move event is not for our joystick touch
        e.preventDefault();

        // Activate joystick if it was only potential
        if (joystick.potential) {
            const dx = touch.clientX - joystick.startX;
            const dy = touch.clientY - joystick.startY;
            if (Math.hypot(dx, dy) > 10) { // Activation threshold
                joystick.potential = false;
                joystick.active = true;
                joystick.baseX = joystick.startX;
                joystick.baseY = joystick.startY;

                joystickBase.style.left = `${joystick.baseX - 75}px`;
                joystickBase.style.top = `${joystick.baseY - 75}px`;
                joystickContainer.classList.remove('hidden');
                joystickBase.classList.remove('hidden');
            }
        }
        
        if (joystick.active) {
            joystick.stickX = touch.clientX;
            joystick.stickY = touch.clientY;
            
            let dx = joystick.stickX - joystick.baseX;
            let dy = joystick.stickY - joystick.baseY;
            const dist = Math.hypot(dx, dy);
            const maxDist = 60;
            
            if (dist > maxDist) {
                dx = (dx / dist) * maxDist;
                dy = (dy / dist) * maxDist;
            }
            
            joystickKnob.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
            joystick.dx = dx / maxDist;
            joystick.dy = dy / maxDist;
        }
    } else if (controlMode === 'drag' && isPointerDown) {
        const pos = e.touches ? e.touches[0] : e;
        if (pos) {
            pointerPos.x = pos.clientX;
            pointerPos.y = pos.clientY;
        }
    }
}


function handleControlEnd(e) {
    // This allows the control to end even if the game state changed (e.g. level up)
    let touchEnded = false;

    if (e.changedTouches) { // Touch event
        // Check if the ended touch was the one used for the joystick
        if (controlMode === 'joystick' && Array.from(e.changedTouches).some(t => t.identifier === joystick.touchId)) {
            touchEnded = true;
        }
        // For drag mode, any touch ending stops the drag
        else if (controlMode === 'drag') {
            touchEnded = true;
        }
    } else { // Mouse event
        touchEnded = true;
    }

    if (touchEnded) {
        // Reset Joystick state if it was active
        if (controlMode === 'joystick' && (joystick.active || joystick.potential)) {
            joystick.active = false;
            joystick.potential = false;
            joystick.dx = 0;
            joystick.dy = 0;
            joystick.touchId = null;
            joystickKnob.style.transform = `translate3d(0px, 0px, 0)`;
            joystickBase.classList.add('hidden');
        }

        // Reset Drag state if it was active
        if (controlMode === 'drag') {
            isPointerDown = false;
        }

        // Always remove listeners to prevent them from stacking up
        window.removeEventListener('touchmove', handleControlMove);
        window.removeEventListener('touchend', handleControlEnd);
        window.removeEventListener('touchcancel', handleControlEnd);
        window.removeEventListener('mousemove', handleControlMove);
        window.removeEventListener('mouseup', handleControlEnd);
        window.removeEventListener('mouseleave', handleControlEnd);
    }
}

// --- Game Logic ---
function updatePlayer() {
    let dx = 0, dy = 0;
    
    // Keyboard controls always active
    if (keys['KeyW'] || keys['ArrowUp']) dy = -1;
    if (keys['KeyS'] || keys['ArrowDown']) dy = 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx = -1;
    if (keys['KeyD'] || keys['ArrowRight']) dx = 1;
    
    // Touch controls based on mode
    if (controlMode === 'drag' && isPointerDown) {
        dx = pointerPos.x - player.x;
        dy = pointerPos.y - player.y;
    } else if (controlMode === 'joystick' && joystick.active) {
        dx = joystick.dx;
        dy = joystick.dy;
    }

    const dist = Math.hypot(dx, dy);
    if (dist > 1) { 
        dx /= dist; 
        dy /= dist; 
    }

    if (dx !== 0 || dy !== 0) { 
        player.x += dx * player.stats.speed; 
        player.y += dy * player.stats.speed; 
    }
    
    player.x = Math.max(player.radius, Math.min(window.innerWidth - player.radius, player.x)); 
    player.y = Math.max(player.radius, Math.min(window.innerHeight - player.radius, player.y));
    if (player.isInvincible && Date.now() - player.lastHitTime > 1000) player.isInvincible = false;
}

function getEnemyColor(timeMinutes) {
    const hue = 0; // Red
    const saturation = Math.min(100, 70 + timeMinutes * 5);
    const lightness = Math.max(30, 50 - timeMinutes * 3);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getXPGemColor(value) {
    if (value >= 500) return '#FFFFFF'; // White/Gold for legendary
    if (value >= 100) return '#ec4899'; // Pink 500 for epic
    if (value >= 50) return '#f97316'; // Orange 500 for rare
    if (value >= 20) return '#a21caf'; // Fuchsia 700
    if (value >= 10) return '#facc15'; // Yellow 400
    if (value >= 5) return '#4ade80'; // Green 400
    return '#60a5fa'; // Blue 400
}

function spawnWatcher() {
    const side = Math.floor(Math.random() * 4); let x, y;
    if (side === 0) { x = Math.random() * canvas.width; y = -20; } else if (side === 1) { x = canvas.width + 20; y = Math.random() * canvas.height; } else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 20; } else { x = -20; y = Math.random() * canvas.height; }
    const hp = 10 * difficultyManager.enemyHpMultiplier;
    const speed = 1.0 * difficultyManager.enemySpeedMultiplier * RENDER_SCALE;
    enemies.push({ id: `r-${Date.now()}`, type: 'watcher', x, y, radius: 15 * RENDER_SCALE, hp: hp, maxHp: hp, speed: speed, color: '#805ad5', xpValue: 5 + Math.floor(gameTime / 60), cooldown: 3000, lastAttackTime: Date.now() + Math.random() * 1000 });
}

function spawnEnemy() {
    const side = Math.floor(Math.random() * 4); let x, y;
    if (side === 0) { x = Math.random() * canvas.width; y = -20; } else if (side === 1) { x = canvas.width + 20; y = Math.random() * canvas.height; } else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 20; } else { x = -20; y = Math.random() * canvas.height; }
    
    if (gameTime > 480 && Math.random() < 0.15) { // After 8 mins, 15% chance for slime
        const hp = 50 * difficultyManager.enemyHpMultiplier;
        const speed = 0.8 * difficultyManager.enemySpeedMultiplier * RENDER_SCALE;
        enemies.push({ id: `t-${Date.now()}`, type: 'tank', x, y, radius: 22 * RENDER_SCALE, hp: hp, maxHp: hp, speed: speed, color: '#48bb78', xpValue: 10 + Math.floor(gameTime / 60) });
        return;
    }
    
    const type = Math.random() > 0.8 ? 'ghost' : 'normal';
    const hp = (type==='ghost'? 8 : 12) * difficultyManager.enemyHpMultiplier;
    const speed = (type==='ghost'? 2 : 1.2) * difficultyManager.enemySpeedMultiplier * RENDER_SCALE;
    const xpValue = (type === 'ghost' ? 3 : 1) + Math.floor(gameTime / 60);
    const color = type === 'ghost' ? '#e2e8f0' : getEnemyColor(gameTime/60);
    enemies.push({ id: `e-${Date.now()}-${Math.random()}`, type: type, x, y, radius: (type==='ghost'?12:15) * RENDER_SCALE, hp: hp, maxHp: hp, speed: speed, color: color, xpValue: xpValue });
}

function spawnHealthEnemy() {
    const side = Math.floor(Math.random() * 4); let x, y;
    if (side === 0) { x = Math.random() * canvas.width; y = -30; } else if (side === 1) { x = canvas.width + 30; y = Math.random() * canvas.height; } else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 30; } else { x = -30; y = Math.random() * canvas.height; }
    const hp = 25 * difficultyManager.enemyHpMultiplier;
    const speed = 1.5 * difficultyManager.enemySpeedMultiplier * RENDER_SCALE;
    enemies.push({ id: `h-${Date.now()}`, type: 'health', x, y, radius: 18 * RENDER_SCALE, hp: hp, maxHp: hp, speed: speed, color: '#2dd4bf', xpValue: 5, isHealthDropper: true });
}

function spawnBoss() {
    const side = Math.floor(Math.random() * 4); let x, y;
    if (side === 0) { x = Math.random() * canvas.width; y = -50; } else if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; } else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; } else { x = -50; y = Math.random() * canvas.height; }
    const bossLevel = Math.floor(gameTime / 300) + 1;
    const hp = 500 * bossLevel * difficultyManager.enemyHpMultiplier;
    enemies.push({ id: `b-${Date.now()}`, type: 'boss', x, y, radius: 40 * RENDER_SCALE, hp: hp, maxHp: hp, speed: 1.5 * difficultyManager.enemySpeedMultiplier * RENDER_SCALE, color: '#44337a', xpValue: 100, isBoss: true });
}

function updateEnemies() {
    enemies.forEach(enemy => {
        if (enemy.frozenUntil && Date.now() < enemy.frozenUntil) {
            return; // Skip movement if frozen
        }

        const dx = player.x - enemy.x; const dy = player.y - enemy.y; const dist = Math.hypot(dx, dy);
        
        // Watcher enemy behavior
        if (enemy.type === 'watcher' && dist < 400 * RENDER_SCALE) {
             if (Date.now() - enemy.lastAttackTime > enemy.cooldown) {
                enemy.lastAttackTime = Date.now();
                monsterProjectiles.push({ x: enemy.x, y: enemy.y, vx: (dx / dist) * 4 * RENDER_SCALE, vy: (dy / dist) * 4 * RENDER_SCALE, radius: 5 * RENDER_SCALE, spawnTime: Date.now() });
            }
        } else {
             if (dist > 0) { enemy.x += (dx / dist) * enemy.speed; enemy.y += (dy / dist) * enemy.speed; }
        }

        // --- Refactored Collision and Damage Logic ---
        if (dist < player.radius + enemy.radius) { // A collision is detected
            if (player.isInvincible) {
                // If player is already invincible from a previous hit in the same frame or a recent one, do nothing.
                return; // Skips to the next enemy in the forEach loop.
            }

            // If not invincible, a "hit event" occurs. Let's process it.
            const shield = weapons.find(w => w.id === 'laurel' || w.id === 'crimson_shroud');
            let damageWasBlocked = false;

            // Step 1: Check if the shield can block the hit.
            if (shield && !shield.active && shield.charges > 0) {
                damageWasBlocked = true;
                shield.charges--;
                shield.active = true; // Put shield on cooldown
                setTimeout(() => { shield.active = false; }, shield.cooldown * player.stats.cooldownModifier);

                if (shield.id === 'crimson_shroud') {
                    // Retaliate with damage
                    enemies.forEach(e => {
                        if (Math.hypot(player.x - e.x, player.y - e.y) < 200 * RENDER_SCALE) {
                            e.hp -= shield.retaliateDamage;
                            createDamageNumber(e.x, e.y, shield.retaliateDamage);
                        }
                    });
                }
            }

            // Step 2: If the shield did not block, apply damage.
            if (!damageWasBlocked) {
                let damageTaken = (enemy.isBoss ? 25 : (enemy.isHealthDropper ? 15 : (enemy.type === 'tank' ? 20 : 10)));
                
                // Apply Crimson Shroud's damage cap if it exists (even when on cooldown)
                if (shield && shield.id === 'crimson_shroud') {
                    damageTaken = Math.min(damageTaken, shield.damageCap);
                }
                
                player.hp -= damageTaken * (1 - player.stats.damageReduction);
                uiContainer.classList.add('screen-shake');
                setTimeout(() => uiContainer.classList.remove('screen-shake'), 300);
            }
            
            // Step 3: ANY hit, whether blocked or not, grants invincibility frames.
            // This is the key to preventing multi-hits in the same frame.
            player.isInvincible = true;
            player.lastHitTime = Date.now();

            // Step 4: Check for game over only after all calculations for this hit are done.
            if (player.hp <= 0) {
                gameOver();
            }
        }
    });
}

function updateWeapons() {
    weapons.forEach(w => {
        const cooldown = w.cooldown * player.stats.cooldownModifier;
        const speed = (w.speed || 0) * player.stats.projectileSpeedModifier;

        // --- PROJECTILE CREATION & ORBITING LOGIC ---
        if (w.type === 'orbital') {
            w.angle = (w.angle + w.speed) % (Math.PI * 2);
            w.projectiles = [];
            const angleInc = (2 * Math.PI) / w.count;
            for (let i = 0; i < w.count; i++) {
                const angle = w.angle + i * angleInc;
                w.projectiles.push({ x: player.x + Math.cos(angle) * w.range, y: player.y + Math.sin(angle) * w.range, radius: w.size || 10 * RENDER_SCALE, lastHit: new Map() });
            }
        } else if (w.type === 'laser_beam' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now(); w.projectiles = [];
            let targets = [...enemies].sort((a,b) => Math.hypot(player.x-a.x, player.y-a.y) - Math.hypot(player.x-b.x, player.y-b.y));
            for (let i = 0; i < w.count && i < targets.length; i++) {
                const target = targets[i];
                if (target) {
                    const dx = target.x - player.x; const dy = target.y - player.y; const angle = Math.atan2(dy, dx);
                    const endX = player.x + Math.cos(angle) * w.range; const endY = player.y + Math.sin(angle) * w.range;
                    w.projectiles.push({ startX: player.x, startY: player.y, endX: endX, endY: endY, angle: angle, width: (w.isEvolved ? 12 : 8) * RENDER_SCALE, spawnTime: Date.now(), lastHit: new Map() });
                }
            }
        } else if (w.type === 'sword_orbital') {
            w.angle = (w.angle + w.speed) % (Math.PI * 2);
            // Ensure projectile array has the correct number of swords
            while (w.projectiles.length < w.count) { w.projectiles.push({ angle: 0, lastHit: new Map() }); }
            while (w.projectiles.length > w.count) { w.projectiles.pop(); }
            // Update positions of orbiting swords
            const angleInc = (2 * Math.PI) / w.count;
            w.projectiles.forEach((p, i) => {
                p.angle = w.angle + i * angleInc;
                p.x = player.x + Math.cos(p.angle) * w.range;
                p.y = player.y + Math.sin(p.angle) * w.range;
            });

            if (Date.now() - w.lastAttackTime > cooldown) {
                w.lastAttackTime = Date.now();
                let targets = [...enemies].sort((a, b) => Math.hypot(player.x - a.x, player.y - a.y) - Math.hypot(player.x - b.x, player.y - b.y));
                for (let i = 0; i < w.count && i < targets.length; i++) {
                    const orbitingSword = w.projectiles[i % w.projectiles.length];
                    if (orbitingSword) {
                         w.homingProjectiles.push({ x: orbitingSword.x, y: orbitingSword.y, speed: 7 * RENDER_SCALE, target: targets[i], lastHit: new Map(), pierceLeft: w.pierce, spawnTime: Date.now() });
                    }
                }
            }
        } else if (w.type === 'arc' && Date.now() - w.lastAttackTime > cooldown) {
             w.lastAttackTime = Date.now();
             for (let i = 0; i < w.count; i++) w.projectiles.push({ x: player.x, y: player.y, vy: -speed, vx: (i * 2 + (Math.random()-0.5)) * (Math.random() > 0.5 ? 1 : -1) * 2 * RENDER_SCALE, gravity: 0.15 * RENDER_SCALE, angle: 0, rotationSpeed: 0.2 * (Math.random() > 0.5 ? 1 : -1), lastHit: new Map() });
        } else if (w.type === 'homing' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now();
            let targets = [...enemies].sort((a,b) => Math.hypot(player.x-a.x, player.y-a.y) - Math.hypot(player.x-b.x, player.y-b.y));
            for(let i=0; i < w.count && i < targets.length; i++){ w.projectiles.push({x:player.x, y:player.y, speed: speed, target: targets[i], lastHit: new Map(), pierceLeft: w.pierce || 1 }); }
        } else if (w.type === 'evo_spiral' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now();
            for (let i = 0; i < w.count; i++) {
                const angle = (i / w.count) * Math.PI * 2;
                w.projectiles.push({ x: player.x, y: player.y, vy: Math.sin(angle) * speed, vx: Math.cos(angle) * speed, gravity: 0, angle: 0, rotationSpeed: 0.3, lastHit: new Map(), spawnTime: Date.now() });
            }
        } else if (w.type === 'evo_stream' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now();
            let target = enemies.sort((a,b) => Math.hypot(player.x-a.x, player.y-a.y) - Math.hypot(player.x-b.x, player.y-b.y))[0];
            if(target) w.projectiles.push({x:player.x, y:player.y, speed: speed, target: target, lastHit: new Map(), pierceLeft: w.pierce || 5 });
        } else if (w.type === 'evo_sword_orbit' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now();
            let targets = [...enemies].sort((a,b) => Math.hypot(player.x-a.x, player.y-a.y) - Math.hypot(player.x-b.x, player.y-b.y));
            if (targets.length > 0) {
                for(let i = 0; i < w.count; i++) {
                    w.projectiles.push({x: player.x, y: player.y, speed: w.speed, target: targets[i % targets.length], lastHit: new Map(), pierceLeft: w.pierce});
                }
            }
        } else if (w.type === 'area_denial' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now();
            let eligibleEnemies = enemies.filter(e => Math.hypot(player.x - e.x, player.y - e.y) < canvasWidth); // Target enemies on screen
            let targets = eligibleEnemies.sort((a,b) => Math.hypot(player.x-a.x, player.y-a.y) - Math.hypot(player.x-b.x, player.y-b.y)).slice(0, w.count);
            if (targets.length < w.count) {
                 for(let i = targets.length; i < w.count; i++) {
                     targets.push({ x: player.x + (Math.random() - 0.5) * canvasWidth, y: player.y + (Math.random() - 0.5) * canvasHeight });
                 }
            }
            targets.forEach(target => {
                if(target) {
                    w.projectiles.push({x: target.x, y: target.y, radius: w.radius, spawnTime: Date.now(), lastHit: new Map()});
                }
            });
        } else if (w.type === 'screen_clear' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now();
            if (Math.random() < w.chance) {
                enemies = [];
                // Pentagram now only destroys monster projectiles, not gems
                monsterProjectiles = [];
                w.projectiles.push({type: 'flash', spawnTime: Date.now()});
            }
        } else if (w.type === 'directional') {
            if(Date.now() - w.lastAttackTime > cooldown) {
                w.lastAttackTime = Date.now();
                if(w.direction === 'horizontal') {
                    w.projectiles.push({x: player.x, y: player.y, vx: w.speed, vy: 0, spawnTime: Date.now()});
                    w.projectiles.push({x: player.x, y: player.y, vx: -w.speed, vy: 0, spawnTime: Date.now()});
                } else { // vertical
                    w.projectiles.push({x: player.x, y: player.y, vx: 0, vy: w.speed, spawnTime: Date.now()});
                    w.projectiles.push({x: player.x, y: player.y, vx: 0, vy: -w.speed, spawnTime: Date.now()});
                }
            }
        } else if (w.type === 'freeze_beam' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now();
             if (w.isEvolved && w.id === 'infinite_corridor') { 
                for(let i = 0; i < w.count; i++) {
                    const angle = (i / w.count) * 2 * Math.PI;
                    w.projectiles.push({angle: angle, spawnTime: Date.now()});
                }
            } else { 
                for(let i = 0; i < w.count; i++) {
                    const angle = (Math.random() * 2 * Math.PI);
                    w.projectiles.push({angle: angle, spawnTime: Date.now()});
                }
            }
        } else if (w.type === 'evo_xp_clear' && Date.now() - w.lastAttackTime > cooldown) {
             w.lastAttackTime = Date.now();
             xpGems.forEach(gem => {
                 player.xp += gem.value;
                 checkLevelUp();
             });
             xpGems = [];
             enemies = [];
             monsterProjectiles = [];
             w.projectiles.push({type: 'flash', spawnTime: Date.now()});
        } else if (w.type === 'evo_health_half' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now();
            enemies.forEach(e => {
                const damage = e.hp / 2;
                e.hp -= damage;
                createDamageNumber(e.x, e.y, damage);
            });
            w.projectiles.push({type: 'flash', spawnTime: Date.now(), color: 'rgba(255, 100, 100, 0.5)'});
        } else if (w.type === 'evo_rotating_beams' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now();
            w.angle = (w.angle || 0) + 0.2;
            const speed = 8 * RENDER_SCALE;
            w.projectiles.push({x: player.x, y: player.y, vx: Math.cos(w.angle) * speed, vy: Math.sin(w.angle) * speed, spawnTime: Date.now(), lastHit: new Map() });
            w.projectiles.push({x: player.x, y: player.y, vx: Math.cos(w.angle + Math.PI) * speed, vy: Math.sin(w.angle + Math.PI) * speed, spawnTime: Date.now(), lastHit: new Map() });
        } else if (w.type === 'evo_growing_pools' && Date.now() - w.lastAttackTime > cooldown) {
            w.lastAttackTime = Date.now();
            for (let i = 0; i < w.count; i++) {
                const randomDist = Math.random() * 200 * RENDER_SCALE;
                const randomAngle = Math.random() * 2 * Math.PI;
                const x = player.x + Math.cos(randomAngle) * randomDist;
                const y = player.y + Math.sin(randomAngle) * randomDist;
                w.projectiles.push({x: x, y: y, radius: 80 * RENDER_SCALE, spawnTime: Date.now(), lastHit: new Map()});
            }
        }

        // --- SPECIAL UPDATE LOGIC for channeled/active weapons ---
        if (w.type === 'evo_rotating_lasers') {
            if (!w.attackStartTime && Date.now() - w.lastAttackTime > w.cooldown) {
                w.attackStartTime = Date.now();
            }
            if (w.attackStartTime) {
                const age = Date.now() - w.attackStartTime;
                if (age > w.duration) {
                    w.attackStartTime = null;
                    w.lastAttackTime = Date.now();
                    w.projectiles = [];
                } else {
                    const rotationProgress = age / w.duration;
                    const currentRotation = Math.PI * 2 * rotationProgress;
                    const angleInc = (Math.PI * 2) / w.count;
                    w.projectiles = [];
                    for (let i = 0; i < w.count; i++) {
                        const angle = (i * angleInc) + currentRotation;
                        w.projectiles.push({
                            startX: player.x,
                            startY: player.y,
                            endX: player.x + Math.cos(angle) * w.range,
                            endY: player.y + Math.sin(angle) * w.range,
                            width: 12 * RENDER_SCALE,
                            lastHit: w.lastHit
                        });
                    }
                }
            }
        }


        // --- PROJECTILE MOVEMENT & DELETION ---
        (w.projectiles || []).forEach((p, index) => {
            if (w.type === 'laser_beam' && Date.now() - p.spawnTime > w.duration) { w.projectiles.splice(index, 1); return; }
            if (w.type === 'arc') { p.vy += p.gravity; p.y += p.vy; p.x += p.vx; p.angle += p.rotationSpeed; if (p.y > canvas.height + 50) { w.projectiles.splice(index, 1); return; } }
            if (w.type === 'homing' || w.type === 'evo_stream' || w.type === 'evo_sword_orbit') {
                if (p.target && p.target.hp > 0) {
                    const dx = p.target.x - p.x; const dy = p.target.y - p.y; const dist = Math.hypot(dx,dy);
                    if(dist > 0) {p.x += (dx/dist)*p.speed; p.y += (dy/dist)*p.speed;}
                } else {
                    const newTarget = enemies
                        .filter(e => e.hp > 0)
                        .sort((a, b) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(p.x - b.x, p.y - b.y))[0];
                    if (newTarget) {
                        p.target = newTarget;
                    } else {
                        p.y -= p.speed;
                    }
                }
                if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) { w.projectiles.splice(index, 1); return; }
            }
            if (w.type === 'evo_spiral') { p.y += p.vy; p.x += p.vx; p.angle += p.rotationSpeed; if (Date.now() - p.spawnTime > 3000) { w.projectiles.splice(index, 1); return; } }
            if (w.type === 'directional' || w.type === 'evo_rotating_beams') {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -20 || p.x > canvas.width + 20 || p.y < -20 || p.y > canvas.height + 20) {
                    w.projectiles.splice(index, 1); return;
                }
            }
             if (w.type === 'screen_clear' || w.type === 'evo_xp_clear' || w.type === 'evo_health_half') { // Visual effect
                if (Date.now() - p.spawnTime > 500) w.projectiles.splice(index, 1);
            }
            if (w.type === 'freeze_beam') {
                if (Date.now() - p.spawnTime > 500) w.projectiles.splice(index, 1);
            }
        });

        (w.homingProjectiles || []).forEach((p, index) => {
            if (Date.now() - p.spawnTime > 4000) { w.homingProjectiles.splice(index, 1); return; }
            if (p.target && p.target.hp > 0) {
                const dx = p.target.x - p.x; const dy = p.target.y - p.y; const dist = Math.hypot(dx,dy);
                if(dist > 0) {p.x += (dx/dist)*p.speed; p.y += (dy/dist)*p.speed;}
            } else {
                const newTarget = enemies
                    .filter(e => e.hp > 0)
                    .sort((a, b) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(p.x - b.x, p.y - b.y))[0];
                if (newTarget) {
                    p.target = newTarget;
                } else {
                    p.y -= p.speed;
                }
            }
            if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) { w.homingProjectiles.splice(index, 1); return; }
        });
    });
}
    
    function updateMonsterProjectiles() {
        for (let i = monsterProjectiles.length - 1; i >= 0; i--) {
            const p = monsterProjectiles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (!player.isInvincible && Math.hypot(p.x - player.x, p.y - player.y) < player.radius + p.radius) {
                player.hp -= 12 * (1 - player.stats.damageReduction);
                player.isInvincible = true;
                player.lastHitTime = Date.now();
                uiContainer.classList.add('screen-shake');
                setTimeout(() => uiContainer.classList.remove('screen-shake'), 300);
                if (player.hp <= 0) gameOver();
                monsterProjectiles.splice(i, 1);
                continue;
            }
            if (Date.now() - p.spawnTime > 5000 || p.x < 0 || p.x > canvasWidth || p.y < 0 || p.y > canvasHeight) {
                monsterProjectiles.splice(i, 1);
            }
        }
    }

    function updatePickups() {
        let magnetCollected = false;
        for (let index = pickups.length - 1; index >= 0; index--) {
            const pickup = pickups[index];
            const dx = player.x - pickup.x;
            const dy = player.y - pickup.y;
            const dist = Math.hypot(dx, dy);

            if (dist < player.radius + pickup.radius) {
                if (pickup.type === 'health') {
                    player.hp = Math.min(player.maxHp, player.hp + 20);
                } else if (pickup.type === 'magnet') {
                    magnetCollected = true;
                } else if (pickup.type === 'chest') {
                    openTreasureChest();
                    pickups.splice(index, 1);
                    return; // Crucial: Stop processing other pickups this frame
                }
                pickups.splice(index, 1); // Remove collected item
            }
        }

        if (magnetCollected) {
            // Apply magnet effect after the loop to avoid mutation issues
            xpGems.forEach(gem => {
                player.xp += (gem.value * player.stats.xpGainModifier);
                checkLevelUp();
            });
            xpGems.length = 0; // Clear array

            // Collect remaining health pickups
            for (let i = pickups.length - 1; i >= 0; i--) {
                const pickup = pickups[i];
                 if (pickup.type === 'health') {
                    player.hp = Math.min(player.maxHp, player.hp + 20);
                }
                pickups.splice(i, 1);
            }
        }
    }

    function updateXPGems() {
        for (let index = xpGems.length - 1; index >= 0; index--) {
            const gem = xpGems[index];
            const dx = player.x - gem.x; const dy = player.y - gem.y; const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < player.radius + gem.radius) { player.xp += (gem.value * player.stats.xpGainModifier); checkLevelUp(); xpGems.splice(index, 1); } 
            else if (dist < player.stats.pickupRadius) { gem.x += (dx / dist) * 5 * RENDER_SCALE; gem.y += (dy / dist) * 5 * RENDER_SCALE; }
        }
    }
    
    function checkCollisions() {
        weapons.forEach(w => {
            const damage = w.damage * player.stats.damageModifier;

            if((w.type === 'aura' || w.type === 'evo_orbital_ring' || w.type === 'area_denial' || w.type === 'evo_growing_pools')) {
                const cooldown = (w.type === 'aura' || w.type === 'evo_orbital_ring') ? w.cooldown : 250; // Faster hit rate for floor items
                
                const targetProjectiles = (w.type === 'aura' || w.type === 'evo_orbital_ring') ? [{radius: w.range, x: player.x, y: player.y, lastHit: w.lastHit}] : w.projectiles;

                targetProjectiles.forEach(puddle => {
                    enemies.forEach(enemy => {
                         const dist = Math.hypot(puddle.x - enemy.x, puddle.y - enemy.y);
                         if (dist < puddle.radius + enemy.radius && (!puddle.lastHit.has(enemy.id) || Date.now() - puddle.lastHit.get(enemy.id) > cooldown)) {
                            puddle.lastHit.set(enemy.id, Date.now()); enemy.hp -= damage; createDamageNumber(enemy.x, enemy.y, damage);
                        }
                    });
                     if (w.duration && Date.now() - puddle.spawnTime > w.duration) {
                        const index = w.projectiles.indexOf(puddle);
                        if (index > -1) w.projectiles.splice(index, 1);
                    }
                });
            } else if (w.type === 'freeze_beam') {
                 w.projectiles.forEach(beam => {
                    enemies.forEach(enemy => {
                         // Simplified beam collision
                        if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < 500 * RENDER_SCALE) { // check in a large radius
                             const enemyAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
                             if(Math.abs(enemyAngle - beam.angle) < 0.2 || Math.abs(enemyAngle - beam.angle - 2 * Math.PI) < 0.2 || Math.abs(enemyAngle - beam.angle + 2 * Math.PI) < 0.2) {
                                enemy.frozenUntil = Date.now() + w.duration;
                             }
                        }
                    });
                 });
            }
            
            (w.projectiles || []).forEach((p, pIndex) => {
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const enemy = enemies[i];
                    if (!enemy) continue;
                    let hit = false;
                    if (w.type === 'orbital' || w.type === 'sword_orbital') {
                         if (Math.hypot(p.x - enemy.x, p.y - enemy.y) < (w.type === 'sword_orbital' ? (w.size || 15 * RENDER_SCALE) : (w.id === 'demonic_orbit' ? (w.size || 20 * RENDER_SCALE) : (w.size || 12 * RENDER_SCALE))) + enemy.radius) hit = true;
                    } else if (w.type === 'laser_beam' || w.type === 'evo_rotating_lasers') {
                        const dx = p.endX - p.startX; const dy = p.endY - p.startY; const len = Math.hypot(dx, dy);
                        if (len > 0) {
                            const dot = (((enemy.x - p.startX) * dx) + ((enemy.y - p.startY) * dy)) / (len * len);
                            const closestX = p.startX + dot * dx; const closestY = p.startY + dot * dy;
                            if (dot >= 0 && dot <= 1) {
                                if (Math.hypot(enemy.x - closestX, enemy.y - closestY) < enemy.radius + p.width / 2) hit = true;
                            }
                        }
                    } else if (w.type === 'directional' || w.type === 'homing' || w.type === 'arc' || w.type === 'evo_spiral' || w.type === 'evo_stream' || w.type === 'evo_sword_orbit' || w.type === 'evo_rotating_beams') {
                         if (Math.hypot(p.x - enemy.x, p.y - enemy.y) < (w.size || 15 * RENDER_SCALE) + enemy.radius) hit = true;
                    }

                    if (hit && (!p.lastHit || !p.lastHit.has(enemy.id) || Date.now() - p.lastHit.get(enemy.id) > 500)) {
                        if(!p.lastHit) p.lastHit = new Map();
                        p.lastHit.set(enemy.id, Date.now());
                        enemy.hp -= damage;
                        createDamageNumber(enemy.x, enemy.y, damage);
                        if (w.lifestealChance && Math.random() < w.lifestealChance) { player.hp = Math.min(player.maxHp, player.hp + 1); }
                        
                        if (p.pierceLeft !== undefined) {
                            if (p.pierceLeft > 1) {
                                p.pierceLeft--;
                                const newTarget = enemies
                                    .filter(e => e.id !== enemy.id && e.hp > 0)
                                    .sort((a, b) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(p.x - b.x, p.y - b.y))[0];
                                p.target = newTarget;
                            } else {
                                w.projectiles.splice(pIndex, 1);
                                break;
                            }
                        }
                    }
                }
            });

            (w.homingProjectiles || []).forEach((p, pIndex) => {
                 for (let i = enemies.length - 1; i >= 0; i--) {
                    const enemy = enemies[i];
                    if (!enemy) continue;
                    let hit = false;
                     if (Math.hypot(p.x - enemy.x, p.y - enemy.y) < (w.size || 15 * RENDER_SCALE) + enemy.radius) hit = true;

                    if (hit && (!p.lastHit.has(enemy.id) || Date.now() - p.lastHit.get(enemy.id) > 500)) {
                        p.lastHit.set(enemy.id, Date.now());
                        enemy.hp -= damage;
                        createDamageNumber(enemy.x, enemy.y, damage);
                        
                        if (p.pierceLeft > 1) {
                            p.pierceLeft--;
                            const newTarget = enemies
                                .filter(e => e.id !== enemy.id && e.hp > 0)
                                .sort((a, b) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(p.x - b.x, p.y - b.y))[0];
                            p.target = newTarget;
                        } else {
                            w.homingProjectiles.splice(pIndex, 1);
                            break;
                        }
                    }
                 }
            });
        });

        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.hp <= 0) {
                // Handle guaranteed drops first
                if (enemy.isHealthDropper) {
                    pickups.push({type: 'health', x: enemy.x, y: enemy.y, radius: 10 * RENDER_SCALE});
                }
                if (enemy.isBoss) {
                    pickups.push({type: 'chest', x: enemy.x, y: enemy.y, radius: 20 * RENDER_SCALE});
                    for(let j = 0; j < 20; j++) { const angle = (j / 20) * Math.PI * 2; xpGems.push({x: enemy.x + Math.cos(angle)*30*RENDER_SCALE, y: enemy.y + Math.sin(angle)*30*RENDER_SCALE, value: 50}); }
                }

                // Handle random/default drops for non-special enemies
                if (!enemy.isHealthDropper && !enemy.isBoss) {
                    const soulEater = weapons.find(w => w.id === 'soul_eater');
                    if(soulEater && Math.hypot(player.x - enemy.x, player.y - enemy.y) < soulEater.range && soulEater.lifestealOnKillChance && Math.random() < soulEater.lifestealOnKillChance) {
                        player.hp = Math.min(player.maxHp, player.hp + 1);
                    }
                    
                    if (Math.random() < 0.005) { // 0.5% chance for magnet
                         pickups.push({type: 'magnet', x: enemy.x, y: enemy.y, radius: 12 * RENDER_SCALE});
                    } else { // 99.5% chance for XP gem
                        if (lowMode) {
                            const MERGE_RADIUS = 70 * RENDER_SCALE;
                            let merged = false;
                            for (const gem of xpGems) {
                                if (Math.hypot(gem.x - enemy.x, gem.y - enemy.y) < MERGE_RADIUS) {
                                    gem.value += enemy.xpValue;
                                    merged = true;
                                    break;
                                }
                            }
                            if (!merged) {
                                xpGems.push({x: enemy.x, y: enemy.y, radius: 5 * RENDER_SCALE, value: enemy.xpValue});
                            }
                        } else {
                             xpGems.push({x: enemy.x, y: enemy.y, radius: 5 * RENDER_SCALE, value: enemy.xpValue});
                        }
                    }
                }

                enemies.splice(i, 1);
                enemiesKilledCount++;
            }
        }
    }
    
    function createDamageNumber(x, y, amount) { 
        if (lowMode) return;
        const el = document.createElement('div'); 
        el.className = 'damage-number'; 
        el.textContent = Math.round(amount); 
        el.style.left = `${x}px`; 
        el.style.top = `${y}px`; 
        damageNumbersContainer.appendChild(el); 
        setTimeout(() => el.remove(), 700); 
    }
    
    // --- Drawing Helpers ---
    function drawCustomSword(ctx, size) {
        ctx.fillStyle = '#6D4C41'; // Hilt
        ctx.fillRect(-size * 0.1, size * 0.7, size * 0.2, size * 0.3); // grip
        ctx.fillRect(-size * 0.25, size * 0.6, size * 0.5, size * 0.1); // guard

        ctx.fillStyle = '#E0E0E0'; // Blade
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(-size * 0.2, -size * 0.2, -size * 0.1, size * 0.6);
        ctx.quadraticCurveTo(0, size * 0.5, size * 0.1, size * 0.6);
        ctx.quadraticCurveTo(size * 0.2, -size * 0.2, 0, -size);
        ctx.fill();

        ctx.strokeStyle = '#BDBDBD';
        ctx.lineWidth = size * 0.05;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.8);
        ctx.lineTo(0, size * 0.5);
        ctx.stroke();
    }

    function drawCustomAxe(ctx, size) {
        ctx.fillStyle = '#A1887F'; // Handle
        ctx.fillRect(-size * 0.1, -size * 0.5, size * 0.2, size * 1.5);

        ctx.fillStyle = '#B0BEC5'; // Blade
        ctx.beginPath();
        ctx.moveTo(size * 0.1, -size * 0.6);
        ctx.quadraticCurveTo(size * 0.8, -size * 0.8, size, 0);
        ctx.quadraticCurveTo(size * 0.8, size * 0.8, size * 0.1, size * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#90A4AE';
        ctx.lineWidth = size * 0.1;
        ctx.stroke();
    }

    function drawCustomScythe(ctx, size) {
        ctx.strokeStyle = '#424242'; // Dark handle
        ctx.lineWidth = size * 0.15;
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.quadraticCurveTo(-size * 0.1, 0, 0, -size);
        ctx.stroke();

        ctx.fillStyle = '#E0E0E0'; // Blade
        ctx.strokeStyle = '#BDBDBD';
        ctx.lineWidth = size * 0.1;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(size * 0.8, -size * 0.9, size * 1.2, 0);
        ctx.quadraticCurveTo(size * 0.5, -size * 0.4, 0, -size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // --- Main Drawing Function ---
    function drawPlayer(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        // Shadow
        if (!lowMode) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(0, p.radius, p.radius, p.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Body
        ctx.fillStyle = p.isInvincible ? 'rgba(255, 255, 255, 0.5)' : p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, Math.PI, 0);
        ctx.rect(-p.radius, 0, p.radius * 2, p.radius * 0.8);
        ctx.fill();
        ctx.beginPath();
        const feetWidth = p.radius * 0.4;
        ctx.rect(-p.radius * 0.8, p.radius * 0.8, feetWidth, p.radius * 0.4);
        ctx.rect(p.radius * 0.4, p.radius * 0.8, feetWidth, p.radius * 0.4);
        ctx.fill();
        // Face
        ctx.fillStyle = '#ADD8E6';
        ctx.beginPath();
        ctx.ellipse(0, -p.radius * 0.1, p.radius * 0.7, p.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(-p.radius * 0.1, -p.radius * 0.2, p.radius * 0.2, p.radius * 0.1, 0, 0, Math.PI*2);
        ctx.fill();
        
        // Shield Visual
        const shield = weapons.find(w => w.id === 'laurel' || w.id === 'crimson_shroud');
        if (shield && !lowMode) {
            const largeRadius = p.radius + 20 * RENDER_SCALE; // Larger radius
            const smallerRadius = p.radius + 18 * RENDER_SCALE; // Slightly smaller for pulsing
            if (shield.active) { // When it just blocked a hit
                ctx.save();
                ctx.globalAlpha = 0.8 + Math.sin(Date.now() / 80) * 0.2; // Brighter, faster pulse
                ctx.strokeStyle = shield.id === 'crimson_shroud' ? '#ff4d4d' : '#86efac';
                ctx.lineWidth = 10 * RENDER_SCALE; // Thicker line
                ctx.shadowColor = 'white';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(0, 0, largeRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            } else if (shield.charges > 0) { // When it's ready
                ctx.save();
                ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 300) * 0.1; // Fainter, slower pulse
                ctx.strokeStyle = shield.id === 'crimson_shroud' ? '#b91c1c' : '#166534';
                ctx.lineWidth = 7 * RENDER_SCALE; // Thicker line
                ctx.shadowColor = 'white';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(0, 0, smallerRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }
        ctx.restore();
    }

    function drawEnemy(e) {
        ctx.save();
        ctx.translate(e.x, e.y);
        if (!lowMode) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(0, e.radius, e.radius * 0.9, e.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (e.frozenUntil && Date.now() < e.frozenUntil) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#00BFFF';
            ctx.fillRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
        }

        if (e.type === 'tank') {
            const bodyWobble = Math.sin(Date.now() / 200) * (e.radius * 0.05);
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, e.radius + bodyWobble, e.radius - bodyWobble, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.ellipse(-e.radius * 0.3, -e.radius * 0.3, e.radius * 0.3, e.radius * 0.2, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (e.type === 'ghost') {
            const bob = Math.sin(Date.now() / 150) * (e.radius * 0.1);
            ctx.fillStyle = e.color;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.arc(0, bob, e.radius, Math.PI, 0);
            ctx.rect(-e.radius, bob, e.radius * 2, e.radius);
            const waveCount = 4;
            for (let i = 0; i < waveCount; i++) {
                const startX = -e.radius + (e.radius * 2 * i / waveCount);
                const endX = -e.radius + (e.radius * 2 * (i + 1) / waveCount);
                const controlX = (startX + endX) / 2;
                const controlY = e.radius + bob + (i % 2 === 0 ? e.radius * 0.3 : -e.radius * 0.3);
                if (i === 0) { ctx.lineTo(startX, e.radius + bob); }
                ctx.quadraticCurveTo(controlX, controlY, endX, e.radius + bob);
            }
            ctx.lineTo(e.radius, bob);
            ctx.fill();
            ctx.globalAlpha = 1;
        } else { // Bat / Watcher
            const wingFlap = Math.sin(Date.now() / 100) * (e.radius * 0.3);
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, e.radius * 0.7, e.radius, 0, 0, Math.PI * 2); // Body
            ctx.fill();
            if (e.type !== 'watcher' && !lowMode) { // Wings for bats
                ctx.beginPath();
                ctx.moveTo(0, -e.radius * 0.5);
                ctx.quadraticCurveTo(-e.radius * 1.5, -e.radius * 0.5 + wingFlap, -e.radius * 0.8, e.radius * 0.5);
                ctx.quadraticCurveTo(-e.radius * 0.5, e.radius * 0.2, 0, -e.radius * 0.5);
                ctx.moveTo(0, -e.radius * 0.5);
                ctx.quadraticCurveTo(e.radius * 1.5, -e.radius * 0.5 + wingFlap, e.radius * 0.8, e.radius * 0.5);
                ctx.quadraticCurveTo(e.radius * 0.5, e.radius * 0.2, 0, -e.radius * 0.5);
                ctx.fill();
            }
        }
        
        ctx.globalAlpha = 1;
        let eyeColor = e.isHealthDropper ? '#ef4444' : 'white';
        if (e.type === 'watcher') eyeColor = '#ECC94B';
        if (e.type === 'tank') eyeColor = 'black';
        if (e.type !== 'ghost') {
            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            const eyeRadius = e.type === 'watcher' ? e.radius * 0.4 : 2 * RENDER_SCALE;
            const eyeY = e.type === 'watcher' ? 0 : -e.radius * 0.1;
            const eyeXOffset = e.type === 'watcher' ? 0 : e.radius * 0.2;
            ctx.arc(-eyeXOffset, eyeY, eyeRadius, 0, Math.PI * 2);
            if (e.type !== 'watcher') {
                ctx.arc(eyeXOffset, eyeY, eyeRadius, 0, Math.PI * 2);
            }
            ctx.fill();
            if (e.type === 'watcher') {
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(0, 0, eyeRadius * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
       
        if (e.isBoss) { ctx.fillStyle = 'yellow'; ctx.font = `${20 * RENDER_SCALE}px Kanit`; ctx.textAlign = 'center'; ctx.fillText('👑', 0, -e.radius - 10); }
        if (e.isHealthDropper) { ctx.fillStyle = 'white'; ctx.font = `bold ${14 * RENDER_SCALE}px Kanit`; ctx.textAlign = 'center'; ctx.fillText('❤️', 0, e.radius * 0.4); }
        if (e.hp < e.maxHp) {
            ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-e.radius, -e.radius - (8 * RENDER_SCALE), e.radius * 2, 4 * RENDER_SCALE);
            ctx.fillStyle = '#16a34a'; ctx.fillRect(-e.radius, -e.radius - (8 * RENDER_SCALE), (e.radius * 2) * (e.hp / e.maxHp), 4 * RENDER_SCALE);
        }
        ctx.restore();
    }
    
    function drawMonsterProjectiles() {
        monsterProjectiles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.fillStyle = '#f56565';
            if (!lowMode) {
                ctx.shadowColor = '#c53030';
                ctx.shadowBlur = 8 * RENDER_SCALE;
            }
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw things on the "floor" first
        weapons.forEach(w => {
            if (w.type === 'area_denial' || w.type === 'evo_growing_pools') {
                 (w.projectiles || []).forEach(puddle => {
                     ctx.save();
                     ctx.translate(puddle.x, puddle.y);
                     const life = (Date.now() - puddle.spawnTime) / w.duration;
                     const currentRadius = w.id === 'la_borra' ? puddle.radius * Math.sin(life * Math.PI) : puddle.radius; // Growing/shrinking for evo
                     if (currentRadius > 0) {
                         if (lowMode) {
                            ctx.fillStyle = 'rgba(135, 206, 250, 0.4)';
                         } else {
                            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
                            gradient.addColorStop(0, 'rgba(135, 206, 250, 0.6)');
                            gradient.addColorStop(1, 'rgba(135, 206, 250, 0)');
                            ctx.fillStyle = gradient;
                         }
                         ctx.beginPath();
                         ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
                         ctx.fill();
                     }
                     ctx.restore();
                 });
            }
        });

        drawPlayer(player);

        // Draw auras (under projectiles but over player)
        weapons.forEach(w => {
            if (w.type === 'aura' || w.type === 'evo_orbital_ring') {
                ctx.save();
                ctx.translate(player.x, player.y);
                if (w.id === 'thunder_loop') {
                    ctx.strokeStyle = `rgba(251, 211, 141, ${0.7 + Math.sin(Date.now() / 150) * 0.3})`;
                    ctx.lineWidth = 5 * RENDER_SCALE;
                    if (!lowMode) {
                        ctx.shadowColor = 'white';
                        ctx.shadowBlur = 15 * RENDER_SCALE;
                    }
                    ctx.beginPath();
                    ctx.arc(0, 0, w.range, 0, Math.PI * 2);
                    ctx.stroke();
                     if (Math.random() > 0.5 && !lowMode) { // To make it flicker
                        ctx.save();
                        ctx.lineWidth = 2 * RENDER_SCALE;
                        ctx.shadowColor = 'white';
                        ctx.shadowBlur = 10 * RENDER_SCALE;
                        const zapCount = 5;
                        for (let i = 0; i < zapCount; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            const startX = Math.cos(angle) * w.range;
                            const startY = Math.sin(angle) * w.range;
                            const endX = startX + (Math.random() - 0.5) * 30 * RENDER_SCALE;
                            const endY = startY + (Math.random() - 0.5) * 30 * RENDER_SCALE;
                            
                            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(startX + (Math.random() - 0.5) * 15, startY + (Math.random() - 0.5) * 15);
                            ctx.lineTo(endX, endY);
                            ctx.stroke();
                        }
                        ctx.restore();
                    }
                } else {
                    if (lowMode) {
                        ctx.fillStyle = w.id === 'soul_eater' ? 'rgba(147, 51, 234, 0.4)' : 'rgba(253, 224, 71, 0.3)';
                    } else {
                        const gradient = ctx.createRadialGradient(0, 0, Math.max(0, w.range * 0.7), 0, 0, Math.max(1, w.range));
                        if (w.id === 'soul_eater') { 
                            gradient.addColorStop(0, 'rgba(147, 51, 234, 0.05)');
                            gradient.addColorStop(0.8, 'rgba(147, 51, 234, 0.4)');
                            gradient.addColorStop(1, 'rgba(167, 139, 250, 0.6)');
                        } else { // Garlic
                            gradient.addColorStop(0, 'rgba(254, 249, 195, 0.05)');
                            gradient.addColorStop(0.8, 'rgba(254, 249, 195, 0.3)');
                            gradient.addColorStop(1, 'rgba(253, 224, 71, 0.5)');
                        }
                        ctx.fillStyle = gradient;
                    }
                    ctx.beginPath();
                    ctx.arc(0, 0, w.range, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        });

        xpGems.forEach(g => { 
            ctx.save(); 
            ctx.translate(g.x, g.y); 
            const color = getXPGemColor(g.value);
            ctx.fillStyle = color;
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1 * RENDER_SCALE;

            if (!lowMode && g.value >= 50) {
                ctx.shadowColor = color;
                ctx.shadowBlur = g.value >= 500 ? 20 : (g.value >= 100 ? 15 : 8);
            }

            // Draw crystal shape
            ctx.beginPath();
            ctx.moveTo(0, -g.radius * 1.5);
            ctx.lineTo(g.radius, 0);
            ctx.lineTo(0, g.radius * 1.5);
            ctx.lineTo(-g.radius, 0);
            ctx.closePath();
            ctx.fill();
            if (!lowMode && g.value >= 20) {
                ctx.stroke();
            }
            ctx.restore(); 
        });
        pickups.forEach(p => { 
            if (p.type === 'health') { 
                ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(p.x, p.y - 3*RENDER_SCALE); ctx.bezierCurveTo(p.x, p.y - 7*RENDER_SCALE, p.x - 6*RENDER_SCALE, p.y - 7*RENDER_SCALE, p.x - 6*RENDER_SCALE, p.y); ctx.bezierCurveTo(p.x - 6*RENDER_SCALE, p.y + 5*RENDER_SCALE, p.x, p.y + 9*RENDER_SCALE, p.x, p.y + 12*RENDER_SCALE); ctx.bezierCurveTo(p.x, p.y + 9*RENDER_SCALE, p.x + 6*RENDER_SCALE, p.y + 5*RENDER_SCALE, p.x + 6*RENDER_SCALE, p.y); ctx.bezierCurveTo(p.x + 6*RENDER_SCALE, p.y - 7*RENDER_SCALE, p.x, p.y - 7*RENDER_SCALE, p.x, p.y - 3*RENDER_SCALE); ctx.fill(); 
            } else if (p.type === 'magnet') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.fillStyle = '#facc15'; // yellow-400
                ctx.beginPath();
                ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `bold ${p.radius * 1.5}px sans-serif`;
                ctx.fillText('🧲', 0, p.radius * 0.1);
                ctx.restore();
            } else if (p.type === 'chest') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.font = `bold ${p.radius * 2}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (!lowMode) {
                    ctx.shadowColor = '#f59e0b';
                    ctx.shadowBlur = 15;
                }
                ctx.fillText('🎁', 0, 0);
                ctx.restore();
            }
        });
        enemies.forEach(e => drawEnemy(e));
        drawMonsterProjectiles();

        // --- Weapon Projectile Drawing ---
        weapons.forEach(w => {
            (w.projectiles || []).forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                 if (w.type === 'orbital') {
                    if (w.id === 'lightning') {
                        ctx.save();
                        if (!lowMode) {
                            ctx.shadowColor = '#90cdf4';
                            ctx.shadowBlur = 15 * RENDER_SCALE;
                        }
                        const gradient = ctx.createRadialGradient(0, 0, p.radius * 0.2, 0, 0, p.radius);
                        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                        gradient.addColorStop(0.5, 'rgba(191, 219, 254, 1)');
                        gradient.addColorStop(1, 'rgba(96, 165, 250, 0.5)');
                        ctx.fillStyle = lowMode ? 'rgba(191, 219, 254, 1)' : gradient;
                        ctx.beginPath();
                        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    } else if (w.id === 'demonic_orbit') {
                        const angle = Math.atan2(p.y - player.y, p.x - player.x) + Math.PI / 2;
                        ctx.rotate(angle);
                        if (!lowMode) {
                            ctx.shadowColor = 'red';
                            ctx.shadowBlur = 15;
                        }
                        drawCustomSword(ctx, w.size);
                    }
                } else if (w.type === 'arc' || w.type === 'evo_spiral') {
                    ctx.rotate(p.angle);
                    if (w.id === 'death_spiral') {
                        if (!lowMode) {
                            ctx.shadowColor = 'red';
                            ctx.shadowBlur = 10;
                        }
                        drawCustomScythe(ctx, w.size);
                    } else {
                        drawCustomAxe(ctx, w.size);
                    }
                } else if (w.type === 'homing' || w.type === 'evo_stream') {
                    const angle = p.target && p.target.hp > 0 ? Math.atan2(p.target.y - p.y, p.target.x - p.x) : Math.PI * 1.5;
                    ctx.rotate(angle + Math.PI / 2);
                    ctx.fillStyle = w.id === 'thousand_edge' ? '#93c5fd' : '#FFFF00';
                    if (!lowMode) {
                        ctx.shadowColor = w.id === 'thousand_edge' ? 'white' : 'yellow';
                        ctx.shadowBlur = 10; 
                    }
                    ctx.beginPath(); ctx.moveTo(0, -10 * RENDER_SCALE); ctx.lineTo(-5 * RENDER_SCALE, 10 * RENDER_SCALE); ctx.lineTo(5 * RENDER_SCALE, 10 * RENDER_SCALE); ctx.closePath(); ctx.fill();
                } else if (w.type === 'sword_orbital') {
                    const angle = Math.atan2(p.y - player.y, p.x - player.x) + Math.PI / 2;
                    ctx.rotate(angle);
                    drawCustomSword(ctx, w.size);
                } else if (w.type === 'directional' || w.type === 'evo_rotating_beams') {
                    const color = w.id === 'phieraggi' ? `hsl(${Date.now()/10 % 360}, 100%, 70%)` : (w.id === 'gun_one' ? '#63b3ed' : '#8b5cf6');
                    ctx.fillStyle = color;
                    if (!lowMode) {
                        ctx.shadowColor = 'white'; 
                        ctx.shadowBlur = 8; 
                    }
                    ctx.beginPath(); ctx.arc(0, 0, w.size, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            });

            (w.homingProjectiles || []).forEach(p => {
                ctx.save(); ctx.translate(p.x, p.y);
                const angle = p.target && p.target.hp > 0 ? Math.atan2(p.target.y - p.y, p.target.x - p.x) : (p.lastAngle || Math.PI * 1.5);
                p.lastAngle = angle; ctx.rotate(angle + Math.PI / 2);
                drawCustomSword(ctx, w.size);
                ctx.restore();
            });

            if (w.type === 'laser_beam' || w.type === 'evo_rotating_lasers') {
                (w.projectiles || []).forEach(p => {
                    ctx.save(); ctx.beginPath(); ctx.moveTo(p.startX, p.startY); ctx.lineTo(p.endX, p.endY);
                    ctx.strokeStyle = (w.id === 'supercharge_beam' || w.id === 'laser') ? 'cyan' : '#f56565'; 
                    ctx.lineWidth = p.width;
                    if (!lowMode) {
                        ctx.shadowColor = (w.id === 'supercharge_beam' || w.id === 'laser') ? 'white' : 'orange'; 
                        ctx.shadowBlur = 15;
                    }
                     ctx.stroke(); ctx.restore();
                });
            }

            if (w.type === 'screen_clear' || w.type === 'evo_xp_clear' || w.type === 'evo_health_half') {
                (w.projectiles || []).forEach(p => {
                    const alpha = 1 - ((Date.now() - p.spawnTime) / 500);
                    ctx.fillStyle = p.color || `rgba(255, 255, 255, ${alpha * 0.8})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                });
            }
            
             if (w.type === 'freeze_beam') {
                (w.projectiles || []).forEach(p => {
                    ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(p.angle);
                    const alpha = 1 - ((Date.now() - p.spawnTime) / 500);
                    ctx.strokeStyle = `rgba(173, 216, 230, ${alpha * 0.7})`;
                    ctx.lineWidth = w.width; 
                    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(canvas.width * 2, 0); ctx.stroke(); ctx.restore();
                });
            }
        });

        healthBar.style.width = `${(player.hp/player.maxHp)*100}%`; 
        healthText.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
        xpBar.style.width = `${(player.xp/player.xpToNextLevel)*100}%`; 
        levelText.textContent = `เลเวล: ${player.level}`;
        const min = Math.floor(gameTime/60).toString().padStart(2,'0'); const sec = (gameTime%60).toString().padStart(2,'0');
        timerText.textContent = `เวลา: ${min}:${sec}`;
    }

    // --- Game Loop and State ---
    let lastTime = 0, spawnTimer = 0, gameClockTimer = 0, healthSpawnTimer = 0, watcherSpawnTimer = 0, cleanupTimer = 0;
    function gameLoop(timestamp) {
        if (gameState !== 'playing') return;
        const deltaTime = (timestamp - lastTime) / 1000; lastTime = timestamp;
        spawnTimer += deltaTime; gameClockTimer += deltaTime; healthSpawnTimer += deltaTime; watcherSpawnTimer += deltaTime; cleanupTimer += deltaTime;

        if (gameClockTimer >= 1) { gameTime++; gameClockTimer = 0; }
        
        // --- LAG FIX: Cleanup lastHit maps periodically ---
        if (cleanupTimer > 2) { // Run every 2 seconds
            const now = Date.now();
            const maxAge = 3000; // Remove entries older than 3 seconds
            weapons.forEach(w => {
                if (w.lastHit instanceof Map) {
                    for (const [key, value] of w.lastHit.entries()) {
                        if (now - value > maxAge) {
                            w.lastHit.delete(key);
                        }
                    }
                }
            });
            cleanupTimer = 0;
        }

        const RAMP_UP_DURATION = 360; // 6 minutes
        const progress = Math.min(1.0, gameTime / RAMP_UP_DURATION);
        const easedProgress = progress * progress; // Quadratic easing (slow start)

        const INITIAL_SPAWN_MULT = 4.0; const RAMP_END_SPAWN_MULT = 1.0;
        const INITIAL_HP_MULT = 0.4; const RAMP_END_HP_MULT = 1.0;
        const INITIAL_SPEED_MULT = 0.8; const RAMP_END_SPEED_MULT = 1.0;
        
        difficultyManager.enemyHpMultiplier = INITIAL_HP_MULT * (1 - easedProgress) + RAMP_END_HP_MULT * easedProgress;
        difficultyManager.enemySpeedMultiplier = INITIAL_SPEED_MULT * (1 - easedProgress) + RAMP_END_SPEED_MULT * easedProgress;
        const currentSpawnRateMultiplier = INITIAL_SPAWN_MULT * (1 - easedProgress) + RAMP_END_SPAWN_MULT * easedProgress;
        
        // After ramp-up, continue scaling difficulty
        if (gameTime > RAMP_UP_DURATION) {
            const postRampMinutes = (gameTime - RAMP_UP_DURATION) / 60;
            difficultyManager.enemyHpMultiplier += postRampMinutes * 0.5;
            difficultyManager.enemySpeedMultiplier += postRampMinutes * 0.08;
        }

        if (healthSpawnTimer > 30) { spawnHealthEnemy(); healthSpawnTimer = 0; }
        if (gameTime >= nextBossTime) { spawnBoss(); nextBossTime += 300; }
        if (gameTime > 600 && watcherSpawnTimer > 20) { // Changed from 360 to 600
             for(let i=0; i<3; i++) spawnWatcher();
             watcherSpawnTimer = 0;
        }
        
        const spawnRate = Math.max(0.08, 0.5 * currentSpawnRateMultiplier);
        if (spawnTimer > spawnRate) { 
            const waveSize = 1 + Math.floor(easedProgress * 4 + (gameTime / 60)); 
            for(let i=0; i<waveSize; i++) spawnEnemy(); 
            spawnTimer = 0; 
        }
        updatePlayer(); updateEnemies(); updateMonsterProjectiles(); updateWeapons(); updateXPGems(); updatePickups(); checkCollisions(); draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    function resetGame() {
        player.hp = 100; player.maxHp = 100; player.xp = 0; player.level = 1;
        player.xpToNextLevel = 10;
        player.x = canvas.width / 2; player.y = canvas.height / 2;
        player.passives = [];
        player.stats = { speed: 3 * RENDER_SCALE, damageModifier: 1.0, cooldownModifier: 1.0, projectileSpeedModifier: 1.0, damageReduction: 0, pickupRadius: 100 * RENDER_SCALE, xpGainModifier: 1.0, revives: 0 };
        weapons = []; enemies = []; xpGems = []; pickups = []; monsterProjectiles = [];
        gameTime = 0; enemiesKilledCount = 0; spawnTimer = 0; gameClockTimer = 0; healthSpawnTimer = 0; watcherSpawnTimer = 0; nextBossTime = 300;
        difficultyManager = { enemyHpMultiplier: 1.0, enemySpeedMultiplier: 1.0 };
        pendingLevelUps = 0;
    }
    
    function startGame() {
        if (!selectedCharacterId) return;

        // Load state from localStorage to check for coins
        const savedData = localStorage.getItem('monGameDataV17');
        if (!savedData) {
            alert('เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้เล่น!');
            window.location.href = './index.html'; // Go back if no data
            return;
        }
        let state = JSON.parse(savedData);

        const gameCost = 1;
        if (state.playCoins >= gameCost) {
            // Deduct coin and save
            state.playCoins -= gameCost;
            localStorage.setItem('monGameDataV17', JSON.stringify(state));
            
            if (controlMode === 'joystick') {
                joystickContainer.classList.remove('hidden');
                joystickBase.classList.add('hidden'); // Initially hide the base until touched
            } else {
                joystickContainer.classList.add('hidden');
            }

            // Proceed with starting the game
            resetGame();
            const character = CHARACTERS.find(c => c.id === selectedCharacterId);
            player.color = character.color;
            const weaponId = character.startingWeaponId;
            const weaponInstance = JSON.parse(JSON.stringify(WEAPONS_MASTER_LIST[weaponId]));
            weaponInstance.id = weaponId; weaponInstance.level = 1; weapons.push(weaponInstance);
            startScreen.classList.add('hidden');
            gameOverScreen.classList.add('hidden');
            gameOverScreen.classList.remove('flex');
            gameState = 'playing'; lastTime = performance.now(); gameLoop(lastTime);
        } else {
            alert('เหรียญเล่นม่อนไม่พอจ้า! กลับไปทำภารกิจก่อนนะ');
            window.location.href = './index.html'; // Go back to main menu
        }
    }

    function gameOver() {
        if(player.stats.revives > 0) {
            player.stats.revives--;
            player.hp = player.maxHp * 0.5; // Revive with 50% health
            player.isInvincible = true;
            player.lastHitTime = Date.now() + 2000; // 3 seconds total
            
            const tiragisu = player.passives.find(p => p.id === 'tiragisu');
            if(tiragisu) {
                tiragisu.level--;
                if (tiragisu.level <= 0) {
                    player.passives = player.passives.filter(p => p.id !== 'tiragisu');
                }
            }
            updateInventoryUI();
            return;
        }
        
        gameState = 'gameOver'; 
        cancelAnimationFrame(animationFrameId);

        // --- Coin Reward Logic ---
        const savedData = localStorage.getItem('monGameDataV17');
        if(savedData) {
            let state = JSON.parse(savedData);
            // Reward calculation: 1 coin per 150 enemies + 1 coin per minute survived
            let coinsWon = Math.floor(enemiesKilledCount / 150) + Math.floor(gameTime / 60);
            
            // Double rewards if it's the bonus game
            if (isBonusGame) {
                coinsWon *= 2;
            }

            state.monCoins += coinsWon;
            localStorage.setItem('monGameDataV17', JSON.stringify(state));
            coinsEarnedText.textContent = coinsWon;
        }


        const min = Math.floor(gameTime/60).toString().padStart(2,'0'); const sec = (gameTime%60).toString().padStart(2,'0');
        document.getElementById('survivalTime').textContent = `${min}:${sec}`;
        document.getElementById('enemiesKilled').textContent = enemiesKilledCount;
        gameOverScreen.classList.remove('hidden');
        gameOverScreen.classList.add('flex');
    }

    // --- Settings Logic ---
    function applySettings() {
        const checkmarkSVG = `<span class="checkmark-icon">✓ </span>`;
        
        // Control Mode
        localStorage.setItem('survivorGameControlMode', controlMode);
        controlDragBtn.classList.toggle('selected', controlMode === 'drag');
        controlJoystickBtn.classList.toggle('selected', controlMode === 'joystick');
        
        controlDragBtn.innerHTML = 'ระบบลากเดิน';
        controlJoystickBtn.innerHTML = 'จอยสติ๊ก';

        if (controlMode === 'drag') {
            controlDragBtn.innerHTML = checkmarkSVG + controlDragBtn.innerHTML;
        } else {
            controlJoystickBtn.innerHTML = checkmarkSVG + controlJoystickBtn.innerHTML;
        }

        // Low Mode
        localStorage.setItem('survivorGameLowMode', lowMode);
        lowModeToggleBtn.classList.toggle('selected', lowMode);
        
        if(lowMode) {
             lowModeToggleBtn.innerHTML = checkmarkSVG + 'โหมดประสิทธิภาพ: เปิด';
        } else {
             lowModeToggleBtn.innerHTML = `โหมดประสิทธิภาพ: ปิด`;
        }
    }

    function openTreasureChest() {
        gameState = 'chestOpening';
        cancelAnimationFrame(animationFrameId);

        // Reset UI
        chestAnimationContainer.classList.remove('hidden');
        chestRewardsContainer.classList.add('hidden');
        chestRewardsContainer.innerHTML = '';
        chestContinueButton.classList.add('hidden');
        chestUpgradeCount.textContent = '?';
        chestTitle.textContent = 'หีบสมบัติ!';

        chestScreen.classList.remove('hidden');
        
        const upgradeCount = Math.floor(Math.random() * 5) + 1;
        
        // Animate the number roll
        let currentDisplay = 0;
        const rollInterval = setInterval(() => {
            currentDisplay = Math.floor(Math.random() * 9) + 1;
            chestUpgradeCount.textContent = currentDisplay;
        }, 80);

        setTimeout(() => {
            clearInterval(rollInterval);
            chestUpgradeCount.textContent = upgradeCount;
            chestAnimationContainer.classList.add('hidden');
            chestRewardsContainer.classList.remove('hidden');
            applyChestUpgrades(upgradeCount);
        }, 2000); // Roll for 2 seconds
    }

    function applyChestUpgrades(count) {
        let possibleUpgrades = [];

        // 1. Check for evolutions first
        for (const evoKey in EVOLUTIONS) {
            const evo = EVOLUTIONS[evoKey];
            let canEvolve = false;
            if (Array.isArray(evo.baseWeaponId)) {
                const hasAllWeapons = evo.baseWeaponId.every(id => 
                    weapons.find(w => w.id === id && w.level === WEAPONS_MASTER_LIST[id].maxLevel)
                );
                const hasPassive = player.passives.find(p => p.id === evo.passiveId && p.level === PASSIVES_MASTER_LIST[p.id].maxLevel);
                if (hasAllWeapons && hasPassive) canEvolve = true;
            } else {
                const weapon = weapons.find(w => w.id === evo.baseWeaponId && w.level === WEAPONS_MASTER_LIST[w.id].maxLevel);
                const passive = player.passives.find(p => p.id === evo.passiveId && p.level === PASSIVES_MASTER_LIST[p.id].maxLevel);
                if (weapon && passive) canEvolve = true;
            }

            if (canEvolve) {
                 possibleUpgrades.push({
                    id: `evolve_${evoKey}`, 
                    icon: evo.icon, 
                    name: `วิวัฒนาการ: ${evo.name}`,
                    isEvolution: true,
                    apply: () => {
                        const baseIds = Array.isArray(evo.baseWeaponId) ? evo.baseWeaponId : [evo.baseWeaponId];
                        weapons = weapons.filter(w => !baseIds.includes(w.id));
                        const evolved = JSON.parse(JSON.stringify(evo.evolvedWeapon));
                        evolved.id = evoKey;
                        evolved.level = 'MAX';
                        if (evolved.type === 'aura' || evolved.type === 'evo_orbital_ring') { evolved.lastHit = new Map(); }
                        weapons.push(evolved);
                    }
                });
            }
        }
        
        // 2. Add normal weapon upgrades
        weapons.forEach((w) => {
            const master = WEAPONS_MASTER_LIST[w.id];
            if (master && w.level < master.maxLevel && !w.isEvolved) {
                possibleUpgrades.push({ id: `upgrade_${w.id}`, icon: master.icon, name: `อัปเกรด ${master.name}`, apply: () => upgradeWeapon(w) });
            }
        });

        // 3. Add passive upgrades
        player.passives.forEach((p) => {
            const master = PASSIVES_MASTER_LIST[p.id];
            if (master && p.level < master.maxLevel) {
                possibleUpgrades.push({ id: `upgrade_${p.id}`, icon: master.icon, name: `อัปเกรด ${master.name}`, apply: () => { p.level++; master.apply(player, p.level); } });
            }
        });
        
        if (possibleUpgrades.length === 0) {
             chestRewardsContainer.innerHTML = `<p class="text-xl text-gray-400">ไม่มีไอเทมอัปเกรดได้แล้ว!</p>`;
             chestContinueButton.classList.remove('hidden');
             return;
        }

        // Shuffle and pick upgrades
        for (let i = possibleUpgrades.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [possibleUpgrades[i], possibleUpgrades[j]] = [possibleUpgrades[j], possibleUpgrades[i]];
        }

        const upgradesToApply = possibleUpgrades.slice(0, count);

        chestTitle.textContent = 'ได้รับไอเทม!';
        upgradesToApply.forEach((upgrade, index) => {
            upgrade.apply();
            
            const rewardEl = document.createElement('div');
            rewardEl.className = 'chest-reward-item';
            rewardEl.style.animationDelay = `${index * 0.2}s`;
            rewardEl.innerHTML = `
                <div class="inventory-icon rounded-md text-3xl ${upgrade.isEvolution ? 'bg-green-700 border-green-400' : ''}">${upgrade.icon}</div>
                <span class="text-xl text-white font-semibold">${upgrade.name}</span>
            `;
            chestRewardsContainer.appendChild(rewardEl);
        });
        
        chestContinueButton.classList.remove('hidden');
    }


    // --- Initializer ---
    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        isBonusGame = urlParams.get('bonus') === 'true';

        // Load saved settings
        controlMode = localStorage.getItem('survivorGameControlMode') || 'drag';
        lowMode = localStorage.getItem('survivorGameLowMode') === 'true';
        applySettings();


        // --- Centralized Event Listeners ---
        canvas.addEventListener('mousedown', handleControlStart);
        canvas.addEventListener('touchstart', handleControlStart, { passive: false });


        // Event Listeners for UI
        menuStartButton.addEventListener('click', () => {
            mainMenuScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
            startScreen.classList.add('flex');
            
            const savedData = localStorage.getItem('monGameDataV17');
            if (savedData) {
                let state = JSON.parse(savedData);
                startButton.textContent = `เริ่มเกม (มี ${state.playCoins} | ใช้ 1)`;
            } else {
                startButton.textContent = 'เริ่มเกม (ใช้ 1 เหรียญ)';
            }
        });

        menuGuideButton.addEventListener('click', () => {
            guideReturnState = 'menu';
            mainMenuScreen.classList.add('hidden');
            guideScreen.classList.remove('hidden');
            guideScreen.classList.add('flex');
            populateEvoGuide();
            populateWeaponGuide();
            populatePassiveGuide();
        });

        menuSettingsButton.addEventListener('click', () => {
            mainMenuScreen.classList.add('hidden');
            settingsScreen.classList.remove('hidden');
            settingsScreen.classList.add('flex');
        });

        settingsBackButton.addEventListener('click', () => {
             settingsScreen.classList.add('hidden');
             settingsScreen.classList.remove('flex');
             mainMenuScreen.classList.remove('hidden');
        });

        controlDragBtn.addEventListener('click', () => {
            controlMode = 'drag';
            applySettings();
        });
        controlJoystickBtn.addEventListener('click', () => {
            controlMode = 'joystick';
            applySettings();
        });
        lowModeToggleBtn.addEventListener('click', () => {
            lowMode = !lowMode;
            applySettings();
        });

        pauseButton.addEventListener('click', () => {
            if(gameState === 'playing') {
                gameState = 'paused';
                cancelAnimationFrame(animationFrameId);
                updateInventoryUI(); // Update inventory when pausing
                pauseScreen.classList.remove('hidden');
                pauseScreen.classList.add('flex');
            }
        });

        resumeButton.addEventListener('click', () => {
            pauseScreen.classList.add('hidden');
            pauseScreen.classList.remove('flex');
            gameState = 'playing';
            lastTime = performance.now();
            gameLoop(lastTime);
        });
        
        pauseGuideButton.addEventListener('click', () => {
            guideReturnState = 'pause';
            pauseScreen.classList.add('hidden');
            pauseScreen.classList.remove('flex');
            guideScreen.classList.remove('hidden');
            guideScreen.classList.add('flex');
            populateEvoGuide();
            populateWeaponGuide();
            populatePassiveGuide();
        });

        guideBackButton.addEventListener('click', () => {
            guideScreen.classList.add('hidden');
            guideScreen.classList.remove('flex');
            if (guideReturnState === 'pause') {
                pauseScreen.classList.remove('hidden');
                pauseScreen.classList.add('flex');
            } else {
                mainMenuScreen.classList.remove('hidden');
            }
        });
        
        chestContinueButton.addEventListener('click', () => {
            chestScreen.classList.add('hidden');
            gameState = 'playing';
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        });

        // Guide Tab Logic
        function switchGuideTab(activeTab) {
            document.querySelectorAll('.guide-tab').forEach(tab => tab.classList.remove('active-tab'));
            document.querySelectorAll('.guide-content').forEach(content => content.classList.add('hidden'));
            
            if (activeTab === 'evo') {
                guideTabEvo.classList.add('active-tab');
                evoGuideContainer.classList.remove('hidden');
            } else if (activeTab === 'weapons') {
                guideTabWeapons.classList.add('active-tab');
                weaponGuideContainer.classList.remove('hidden');
            } else {
                guideTabPassives.classList.add('active-tab');
                passiveGuideContainer.classList.remove('hidden');
            }
        }
        guideTabEvo.addEventListener('click', () => switchGuideTab('evo'));
        guideTabWeapons.addEventListener('click', () => switchGuideTab('weapons'));
        guideTabPassives.addEventListener('click', () => switchGuideTab('passives'));

        startButton.addEventListener('click', startGame);
        
        populateCharacterSelection();
    }

    // Start the whole process
    init();

