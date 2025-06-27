// 五行仙途卡牌对战游戏

// 音效系统
class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.audioContext = null;
        this.soundFrequencies = {
            cardDraw: 440,
            attack: 330,
            defend: 392,
            damage: 220,
            build: 494,
            skill: 587,
            victory: 880,
            defeat: 165
        };
    }

    ensureAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (error) {
                console.warn('音效系统初始化失败:', error);
                this.enabled = false;
            }
        }
    }

    playSound(soundName, duration = 0.2) {
        if (!this.enabled) return;
        this.ensureAudioContext();
        if (!this.audioContext) return;

        try {
            const frequency = this.soundFrequencies[soundName] || 440;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('音效播放失败:', error);
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// 全局音效管理器
const soundManager = new SoundManager();

// 五行元素常量
const ELEMENTS = {
    FIRE: 'fire',
    WATER: 'water',
    WOOD: 'wood',
    METAL: 'metal',
    EARTH: 'earth'
};

// 五行相生相克关系
const ELEMENT_RELATIONS = {
    GENERATE: {
        [ELEMENTS.WOOD]: ELEMENTS.FIRE,
        [ELEMENTS.FIRE]: ELEMENTS.EARTH,
        [ELEMENTS.EARTH]: ELEMENTS.METAL,
        [ELEMENTS.METAL]: ELEMENTS.WATER,
        [ELEMENTS.WATER]: ELEMENTS.WOOD
    },
    OVERCOME: {
        [ELEMENTS.WOOD]: ELEMENTS.EARTH,
        [ELEMENTS.EARTH]: ELEMENTS.WATER,
        [ELEMENTS.WATER]: ELEMENTS.FIRE,
        [ELEMENTS.FIRE]: ELEMENTS.METAL,
        [ELEMENTS.METAL]: ELEMENTS.WOOD
    }
};

// 元素中文名称和颜色
const ELEMENT_INFO = {
    [ELEMENTS.FIRE]: { name: '火', color: '#ff4757', symbol: '🔥' },
    [ELEMENTS.WATER]: { name: '水', color: '#3742fa', symbol: '💧' },
    [ELEMENTS.WOOD]: { name: '木', color: '#2ed573', symbol: '🌳' },
    [ELEMENTS.METAL]: { name: '金', color: '#ffa502', symbol: '⚔️' },
    [ELEMENTS.EARTH]: { name: '土', color: '#8b4513', symbol: '🏔️' }
};

// 灵根类型
const SPIRIT_ROOTS = {
    NONE: 'none',
    FIRE: 'fire',
    WATER: 'water',
    WOOD: 'wood',
    METAL: 'metal',
    EARTH: 'earth'
};

// 灵根效果
const SPIRIT_ROOT_EFFECTS = {
    [SPIRIT_ROOTS.NONE]: {
        name: '无灵根',
        description: '仙元上限 +1，建筑上限 +1',
        energyBonus: 1,
        buildingBonus: 1
    },
    [SPIRIT_ROOTS.FIRE]: {
        name: '火灵根',
        description: '火元素伤害 +1；受到水元素伤害 +1；受到火元素伤害 -1',
        damageBonus: { [ELEMENTS.FIRE]: 1 },
        damageReceived: { [ELEMENTS.WATER]: 1, [ELEMENTS.FIRE]: -1 }
    },
    [SPIRIT_ROOTS.WATER]: {
        name: '水灵根',
        description: '水元素伤害 +1；受到土元素伤害 +1；受到水元素伤害 -1',
        damageBonus: { [ELEMENTS.WATER]: 1 },
        damageReceived: { [ELEMENTS.EARTH]: 1, [ELEMENTS.WATER]: -1 }
    },
    [SPIRIT_ROOTS.WOOD]: {
        name: '木灵根',
        description: '木元素伤害 +1；受到金元素伤害 +1；受到木元素伤害 -1',
        damageBonus: { [ELEMENTS.WOOD]: 1 },
        damageReceived: { [ELEMENTS.METAL]: 1, [ELEMENTS.WOOD]: -1 }
    },
    [SPIRIT_ROOTS.METAL]: {
        name: '金灵根',
        description: '金属性伤害 +1；受到火元素伤害 +1；受到金属性伤害 -1',
        damageBonus: { [ELEMENTS.METAL]: 1 },
        damageReceived: { [ELEMENTS.FIRE]: 1, [ELEMENTS.METAL]: -1 }
    },
    [SPIRIT_ROOTS.EARTH]: {
        name: '土灵根',
        description: '土元素伤害 +1；受到木元素伤害 +1；受到土元素伤害 -1',
        damageBonus: { [ELEMENTS.EARTH]: 1 },
        damageReceived: { [ELEMENTS.WOOD]: 1, [ELEMENTS.EARTH]: -1 }
    }
};

// 修仙道体
const CULTIVATION_TYPES = {
    ELEMENT_MASTER: 'element_master',
    FIVE_ELEMENT_ARRAY: 'five_element_array',
    BLOOD_GUIDE_LORD: 'blood_guide_lord',
    MYSTIC_TREASURY: 'mystic_treasury',
    SPIRIT_THIEF: 'spirit_thief',
    MYSTIC_WOOD_HEALER: 'mystic_wood_healer',
    BURNING_SKY_CULTIVATOR: 'burning_sky_cultivator',
    SHIELD_GUARDIAN: 'shield_guardian'
};

// 修仙道体效果
const CULTIVATION_EFFECTS = {
    [CULTIVATION_TYPES.ELEMENT_MASTER]: {
        name: '元素御仙',
        description: '开局选择1种属性，后续该属性成功造成伤害（未被完全防御）时，额外+2伤害',
        needsElementChoice: true
    },
    [CULTIVATION_TYPES.FIVE_ELEMENT_ARRAY]: {
        name: '五行阵仙',
        description: '斗法或防御时，使用2张相同属性灵牌，效果等同于「原属性+生该属性」'
    },
    [CULTIVATION_TYPES.BLOOD_GUIDE_LORD]: {
        name: '血引道君',
        description: '灵牌上限为7张；每个回合开始时，最多可耗3次仙元，每次耗1点，抽2张牌',
        handLimit: 7,
        specialAbility: 'blood_draw'
    },
    [CULTIVATION_TYPES.MYSTIC_TREASURY]: {
        name: '玄库藏真仙',
        description: '初始灵牌2张，灵牌上限8张；初始仙元6点，仙元上限6点；每回合首次引灵时，若灵牌≤1张，则额外抽1张',
        initialHand: 2,
        handLimit: 8,
        initialEnergy: 6,
        energyLimit: 6,
        specialAbility: 'auto_draw'
    },
    [CULTIVATION_TYPES.SPIRIT_THIEF]: {
        name: '窃灵天官',
        description: '每4个回合自动偷窃对方一张牌',
        specialAbility: 'steal_card_passive',
        passiveCooldown: 4
    },
    [CULTIVATION_TYPES.MYSTIC_WOOD_HEALER]: {
        name: '玄木药师',
        description: '回元调息无需三张相同元素的牌即可达成效果；可建造特殊建筑「青华灵泉殿」',
        specialAbility: 'easy_recover',
        specialBuilding: 'qinghua_spring_hall'
    },
    [CULTIVATION_TYPES.BURNING_SKY_CULTIVATOR]: {
        name: '焚天修士',
        description: '每局拥有四个仙术点，行动前可消耗一个仙术点将手牌中所有同属性灵牌一次性打出进行攻击',
        skillPoints: 4,
        specialAbility: 'mass_attack'
    },
    [CULTIVATION_TYPES.SHIELD_GUARDIAN]: {
        name: '罡盾卫道者',
        description: '开局提供两层罡盾，每三个回合后增加一层罡盾，当罡盾层数到达三层时暂停增加，罡盾小于等于2时继续倒计时',
        specialAbility: 'shield_passive',
        maxShields: 3,
        initialShields: 2,
        shieldCooldown: 3
    }
};

// 建筑类型
const BUILDING_TYPES = {
    FIVE_ELEMENT_OBSERVATORY: 'five_element_observatory',
    FIRE_BURNING_PAVILION: 'fire_burning_pavilion',
    WATER_ABYSS_PALACE: 'water_abyss_palace',
    EARTH_MOUNTAIN_HALL: 'earth_mountain_hall',
    WOOD_SPIRIT_HERMITAGE: 'wood_spirit_hermitage',
    METAL_DEMON_TOWER: 'metal_demon_tower',
    HEAVENLY_MECHANISM_PALACE: 'heavenly_mechanism_palace',
    YIN_YANG_DWELLING: 'yin_yang_dwelling',
    NINE_TRANSFORMATION_PAVILION: 'nine_transformation_pavilion',
    STAR_OBSERVATORY: 'star_observatory',
    SPIRIT_ABSORPTION_ALTAR: 'spirit_absorption_altar',
    QINGHUA_SPRING_HALL: 'qinghua_spring_hall'
};

// AI性格类型
const AI_PERSONALITIES = {
    BALANCED: 'balanced',        // 平衡型（原有逻辑）
    AGGRESSIVE: 'aggressive',    // 攻击型（手牌满时必选攻击）
    ELEMENT_FOCUSED: 'element_focused', // 元素专注型（选择重复最多的元素）
    ELEMENT_DIVERSE: 'element_diverse', // 元素多样型（选择共同最少但不为零的元素）
    VENGEFUL: 'vengeful'         // 记仇型
};

// AI性格名称映射
const AI_PERSONALITY_NAMES = {
    [AI_PERSONALITIES.BALANCED]: '平衡型',
    [AI_PERSONALITIES.AGGRESSIVE]: '攻击型',
    [AI_PERSONALITIES.ELEMENT_FOCUSED]: '元素专注型',
    [AI_PERSONALITIES.ELEMENT_DIVERSE]: '元素多样型',
    [AI_PERSONALITIES.VENGEFUL]: '记仇型'
};

// 建筑效果
const BUILDING_EFFECTS = {
    [BUILDING_TYPES.FIVE_ELEMENT_OBSERVATORY]: {
        name: '五行聚灵观',
        cost: [ELEMENTS.METAL, ELEMENTS.WOOD, ELEMENTS.WATER, ELEMENTS.FIRE, ELEMENTS.EARTH],
        description: '灵牌上限+1（每个建筑独立生效）',
        effect: 'hand_limit_boost_individual',
        handLimitBonus: 1
    },
    [BUILDING_TYPES.FIRE_BURNING_PAVILION]: {
        name: '赤焰焚天阁',
        cost: [ELEMENTS.FIRE, ELEMENTS.FIRE, ELEMENTS.FIRE, ELEMENTS.FIRE],
        description: '后续火属性伤害+1',
        effect: 'fire_damage_boost',
        damageBonus: { [ELEMENTS.FIRE]: 1 }
    },
    [BUILDING_TYPES.WATER_ABYSS_PALACE]: {
        name: '碧水凝渊宫',
        cost: [ELEMENTS.WATER, ELEMENTS.WATER, ELEMENTS.WATER, ELEMENTS.WATER],
        description: '后续水属性伤害+1',
        effect: 'water_damage_boost',
        damageBonus: { [ELEMENTS.WATER]: 1 }
    },
    [BUILDING_TYPES.EARTH_MOUNTAIN_HALL]: {
        name: '厚土镇岳殿',
        cost: [ELEMENTS.EARTH, ELEMENTS.EARTH, ELEMENTS.EARTH, ELEMENTS.EARTH],
        description: '后续土属性伤害+1',
        effect: 'earth_damage_boost',
        damageBonus: { [ELEMENTS.EARTH]: 1 }
    },
    [BUILDING_TYPES.WOOD_SPIRIT_HERMITAGE]: {
        name: '青木焕灵庵',
        cost: [ELEMENTS.WOOD, ELEMENTS.WOOD, ELEMENTS.WOOD, ELEMENTS.WOOD],
        description: '后续木属性伤害+1',
        effect: 'wood_damage_boost',
        damageBonus: { [ELEMENTS.WOOD]: 1 }
    },
    [BUILDING_TYPES.METAL_DEMON_TOWER]: {
        name: '金罡破魔塔',
        cost: [ELEMENTS.METAL, ELEMENTS.METAL, ELEMENTS.METAL, ELEMENTS.METAL],
        description: '后续金属性伤害+1',
        effect: 'metal_damage_boost',
        damageBonus: { [ELEMENTS.METAL]: 1 }
    },
    [BUILDING_TYPES.HEAVENLY_MECHANISM_PALACE]: {
        name: '天机衍道宫',
        cost: [ELEMENTS.METAL, ELEMENTS.WOOD, ELEMENTS.WATER, ELEMENTS.FIRE, ELEMENTS.EARTH, 'any', 'any', 'any', 'any'],
        description: '每个回合额外获得1个仙法行动点',
        effect: 'extra_action_point',
        actionPointBonus: 1,
        requirement: 'hand_limit_9'
    },
    [BUILDING_TYPES.YIN_YANG_DWELLING]: {
        name: '阴阳盈虚庐',
        cost: 'two_pairs', // 特殊成本格式
        description: '仙元上限+2',
        effect: 'max_energy_boost',
        maxEnergyBonus: 2
    },
    [BUILDING_TYPES.NINE_TRANSFORMATION_PAVILION]: {
        name: '九转归真阁',
        cost: 'two_quads', // 特殊成本格式
        description: '仙元上限+4',
        effect: 'max_energy_boost_3',
        maxEnergyBonus: 4,
        requirement: 'hand_limit_8'
    },
    [BUILDING_TYPES.STAR_OBSERVATORY]: {
        name: '星象窥天楼',
        cost: 'three_three_two', // 特殊成本格式
        description: '每回合开始时，可从灵牌堆顶查看3张牌，选择1张加入手牌，其余2张放回牌堆底',
        effect: 'card_preview',
        requirement: 'hand_limit_8'
    },
    [BUILDING_TYPES.SPIRIT_ABSORPTION_ALTAR]: {
        name: '灵炁汲引坛',
        cost: 'four_plus_three', // 特殊成本格式
        description: '若灵牌数量≤3张，每个回合开始的时候自动抽一张牌',
        effect: 'auto_draw',
        requirement: 'hand_limit_7'
    },
    [BUILDING_TYPES.QINGHUA_SPRING_HALL]: {
        name: '青华灵泉殿',
        cost: [ELEMENTS.WOOD, ELEMENTS.WOOD, ELEMENTS.WOOD, ELEMENTS.WATER, ELEMENTS.WATER],
        description: '每三个回合恢复一滴血，如果满血则没效果（玄木药师专属，上限2个）',
        effect: 'qinghua_healing',
        healingCooldown: 3,
        exclusive: CULTIVATION_TYPES.MYSTIC_WOOD_HEALER,
        buildingLimit: 2
    }
};

// 游戏状态
class GameState {
    constructor() {
        this.currentScreen = 'start';
        this.player = null;
        this.ai = null;
        this.currentTurn = null;
        this.turnPhase = 'start';
        this.actionPoints = 1;
        this.roundNumber = 1; // 回合数（一个回合包含玩家和AI各自的轮次）
        this.gameLog = [];
        this.deck = this.createDeck();
        this.discardPile = [];
        this.inDefenseMode = false; // 防御模式标记，防止在防御选择期间结束回合
    }

    createDeck() {
        const deck = [];
        Object.values(ELEMENTS).forEach(element => {
            for (let i = 0; i < 20; i++) {
                deck.push(element);
            }
        });
        return this.shuffleDeck(deck);
    }

    shuffleDeck(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    drawCard(player = null) {
        if (this.deck.length === 0) {
            if (this.discardPile.length === 0) return null;
            this.deck = this.shuffleDeck(this.discardPile);
            this.discardPile = [];
        }

        // 如果没有指定玩家，使用原有的随机抽牌逻辑
        if (!player) {
            return this.deck.pop();
        }

        // 动态概率抽牌系统
        return this.drawCardWithDynamicProbability(player);
    }

    drawCardWithDynamicProbability(player) {
        if (this.deck.length === 0) return null;

        // 统计手牌中各元素的数量
        const handCounts = {};
        Object.values(ELEMENTS).forEach(element => {
            handCounts[element] = 0;
        });

        player.hand.forEach(card => {
            handCounts[card]++;
        });

        // 计算动态概率
        const baseProbability = 0.2; // 每个元素初始20%
        const probabilities = {};
        let totalAdjustment = 0;

        Object.values(ELEMENTS).forEach(element => {
            const count = handCounts[element];
            // 手牌中元素越多，概率越小；越少，概率越高
            let adjustment = 0;
            if (count === 0) {
                adjustment = 0.1; // 没有的元素增加10%概率
            } else if (count === 1) {
                adjustment = 0.05; // 1张的元素增加5%概率
            } else if (count >= 2) {
                adjustment = -0.05 * (count - 1); // 2张以上每张减少5%概率
            }

            probabilities[element] = Math.max(0.05, baseProbability + adjustment); // 最低5%概率
            totalAdjustment += probabilities[element];
        });

        // 归一化概率，确保总和为1
        Object.keys(probabilities).forEach(element => {
            probabilities[element] = probabilities[element] / totalAdjustment;
        });

        // 根据概率选择元素
        const random = Math.random();
        let cumulative = 0;
        let selectedElement = null;

        for (const element of Object.values(ELEMENTS)) {
            cumulative += probabilities[element];
            if (random <= cumulative) {
                selectedElement = element;
                break;
            }
        }

        // 从牌堆中找到对应元素的牌
        const availableCards = this.deck.filter(card => card === selectedElement);
        if (availableCards.length === 0) {
            // 如果没有对应元素的牌，随机抽取
            return this.deck.pop();
        }

        // 随机选择一张对应元素的牌
        const cardIndex = this.deck.findIndex(card => card === selectedElement);
        const drawnCard = this.deck.splice(cardIndex, 1)[0];

        return drawnCard;
    }

    addToLog(message) {
        this.gameLog.push(message);
        console.log(message);
    }
}

// 玩家类
class Player {
    constructor(isAI = false) {
        this.isAI = isAI;
        this.cultivation = null;
        this.spiritRoot = null;
        this.energy = 8;
        this.maxEnergy = 8;
        this.hand = [];
        this.handLimit = 6;
        this.buildings = [];
        this.buildingLimit = 5;
        this.skillPoints = 0;
        this.shields = 0;
        this.selectedElement = null;
        this.damageBonus = {};
        this.passiveCounters = {}; // 被动技能计数器
        this.aiPersonality = null; // AI性格
        this.vengefulCountdown = 0; // 记仇倒计时
        this.buildingCounters = {}; // 建筑效果计数器
        this.lastActionTime = 0; // 上次行动时间
        this.aiActionCooldown = 0; // AI行动冷却时间
    }

    initialize(cultivation, spiritRoot) {
        this.cultivation = cultivation;
        this.spiritRoot = spiritRoot;

        const cultivationEffect = CULTIVATION_EFFECTS[cultivation];
        const spiritRootEffect = SPIRIT_ROOT_EFFECTS[spiritRoot];

        if (cultivationEffect.handLimit) {
            this.handLimit = cultivationEffect.handLimit;
        }
        if (cultivationEffect.initialEnergy) {
            this.energy = cultivationEffect.initialEnergy;
        }
        if (cultivationEffect.energyLimit) {
            this.maxEnergy = cultivationEffect.energyLimit;
        }
        if (cultivationEffect.skillPoints) {
            this.skillPoints = cultivationEffect.skillPoints;
        }
        if (cultivationEffect.initialShields) {
            this.shields = cultivationEffect.initialShields;
        }

        if (spiritRootEffect.energyBonus) {
            this.maxEnergy += spiritRootEffect.energyBonus;
            this.energy = this.maxEnergy;
        }
        if (spiritRootEffect.buildingBonus) {
            this.buildingLimit += spiritRootEffect.buildingBonus;
        }
        if (spiritRootEffect.damageBonus) {
            this.damageBonus = { ...spiritRootEffect.damageBonus };
        }

        // 应用建筑效果
        this.applyBuildingEffects();
    }

    applyBuildingEffects() {
        // 重置建筑加成
        this.buildingDamageBonus = {};
        this.buildingHandLimitBonus = 0;
        this.buildingMaxEnergyBonus = 0;
        this.buildingActionPointBonus = 0;

        // 应用所有建筑效果
        this.buildings.forEach(building => {
            const effect = BUILDING_EFFECTS[building.type];
            if (effect.damageBonus) {
                Object.keys(effect.damageBonus).forEach(element => {
                    this.buildingDamageBonus[element] = (this.buildingDamageBonus[element] || 0) + effect.damageBonus[element];
                });
            }
            if (effect.handLimitBonus) {
                // 五行聚灵观每个建筑独立生效
                if (effect.effect === 'hand_limit_boost_individual') {
                    this.buildingHandLimitBonus += effect.handLimitBonus;
                    this.handLimit += effect.handLimitBonus;
                } else {
                    this.buildingHandLimitBonus += effect.handLimitBonus;
                    this.handLimit += effect.handLimitBonus;
                }
            }
            if (effect.maxEnergyBonus) {
                this.buildingMaxEnergyBonus += effect.maxEnergyBonus;
                this.maxEnergy += effect.maxEnergyBonus;
                this.energy += effect.maxEnergyBonus; // 同时增加当前仙元
            }
            if (effect.actionPointBonus) {
                this.buildingActionPointBonus += effect.actionPointBonus;
            }
        });
    }

    canBuildBuilding(buildingType) {
        const building = BUILDING_EFFECTS[buildingType];
        if (!building) return false;

        // 检查是否是专属建筑
        if (building.exclusive && this.cultivation !== building.exclusive) {
            return false;
        }

        // 检查建筑上限
        if (this.buildings.length >= this.buildingLimit) {
            return false;
        }

        // 检查特定建筑的数量限制
        if (building.buildingLimit) {
            const existingCount = this.buildings.filter(b => b.type === buildingType).length;
            if (existingCount >= building.buildingLimit) {
                return false;
            }
        }

        // 移除相同建筑限制，允许建造多个相同的建筑

        // 检查建筑要求
        if (building.requirement) {
            if (building.requirement === 'hand_limit_9' && this.handLimit < 9) {
                return false;
            }
            if (building.requirement === 'hand_limit_8' && this.handLimit < 8) {
                return false;
            }
            if (building.requirement === 'hand_limit_7' && this.handLimit < 7) {
                return false;
            }
        }

        // 检查材料是否足够
        return this.checkBuildingCost(building.cost);
    }

    checkBuildingCost(cost) {
        if (Array.isArray(cost)) {
            // 普通成本检查
            const requiredCards = [...cost];
            const availableCards = [...this.hand];

            for (let required of requiredCards) {
                if (required === 'any') {
                    if (availableCards.length === 0) return false;
                    availableCards.splice(0, 1); // 移除任意一张
                } else {
                    const index = availableCards.indexOf(required);
                    if (index === -1) return false;
                    availableCards.splice(index, 1);
                }
            }
            return true;
        } else {
            // 特殊成本检查
            return this.checkSpecialCost(cost);
        }
    }

    checkSpecialCost(costType) {
        const elementCounts = {};
        this.hand.forEach(card => {
            elementCounts[card] = (elementCounts[card] || 0) + 1;
        });

        switch (costType) {
            case 'two_pairs':
                // 需要两对相同属性的牌
                let pairs = 0;
                Object.values(elementCounts).forEach(count => {
                    pairs += Math.floor(count / 2);
                });
                return pairs >= 2;

            case 'two_quads':
                // 需要两个四张相同属性的牌
                let quads = 0;
                Object.values(elementCounts).forEach(count => {
                    quads += Math.floor(count / 4);
                });
                return quads >= 2;

            case 'three_three_two':
                // 需要3+3+2的组合
                const counts = Object.values(elementCounts).sort((a, b) => b - a);
                return counts.length >= 3 && counts[0] >= 3 && counts[1] >= 3 && counts[2] >= 2;

            case 'four_plus_three':
                // 需要4张相同+3张不同
                const maxCount = Math.max(...Object.values(elementCounts));
                if (maxCount < 4) return false;
                const remainingElements = Object.keys(elementCounts).filter(element =>
                    elementCounts[element] !== maxCount
                ).length;
                return remainingElements >= 3;

            default:
                return false;
        }
    }

    buildBuilding(buildingType, gameState) {
        if (!this.canBuildBuilding(buildingType)) return false;

        const building = BUILDING_EFFECTS[buildingType];

        // 消耗材料
        this.consumeBuildingCost(building.cost, gameState);

        // 添加建筑
        this.buildings.push({
            type: buildingType,
            name: building.name,
            effect: building.effect
        });

        // 重新应用建筑效果
        this.applyBuildingEffects();

        return true;
    }

    consumeBuildingCost(cost, gameState) {
        if (Array.isArray(cost)) {
            // 普通成本消耗
            const requiredCards = [...cost];
            for (let required of requiredCards) {
                if (required === 'any') {
                    if (this.hand.length > 0) {
                        this.discardCard(0, gameState);
                    }
                } else {
                    const index = this.hand.indexOf(required);
                    if (index !== -1) {
                        this.discardCard(index, gameState);
                    }
                }
            }
        } else {
            // 特殊成本消耗
            this.consumeSpecialCost(cost, gameState);
        }
    }

    consumeSpecialCost(costType, gameState) {
        const elementCounts = {};
        this.hand.forEach(card => {
            elementCounts[card] = (elementCounts[card] || 0) + 1;
        });

        switch (costType) {
            case 'two_pairs':
                // 消耗两对
                let pairsConsumed = 0;
                for (let element in elementCounts) {
                    while (elementCounts[element] >= 2 && pairsConsumed < 2) {
                        this.discardCard(this.hand.indexOf(element), gameState);
                        this.discardCard(this.hand.indexOf(element), gameState);
                        elementCounts[element] -= 2;
                        pairsConsumed++;
                    }
                }
                break;

            case 'two_quads':
                // 消耗两个四张
                let quadsConsumed = 0;
                for (let element in elementCounts) {
                    while (elementCounts[element] >= 4 && quadsConsumed < 2) {
                        for (let i = 0; i < 4; i++) {
                            this.discardCard(this.hand.indexOf(element), gameState);
                        }
                        elementCounts[element] -= 4;
                        quadsConsumed++;
                    }
                }
                break;

            case 'three_three_two':
                // 消耗3+3+2
                const sortedElements = Object.keys(elementCounts).sort((a, b) => elementCounts[b] - elementCounts[a]);
                // 消耗第一个元素3张
                for (let i = 0; i < 3; i++) {
                    this.discardCard(this.hand.indexOf(sortedElements[0]), gameState);
                }
                // 消耗第二个元素3张
                for (let i = 0; i < 3; i++) {
                    this.discardCard(this.hand.indexOf(sortedElements[1]), gameState);
                }
                // 消耗第三个元素2张
                for (let i = 0; i < 2; i++) {
                    this.discardCard(this.hand.indexOf(sortedElements[2]), gameState);
                }
                break;

            case 'four_plus_three':
                // 消耗4张相同+3张不同
                const maxElement = Object.keys(elementCounts).reduce((a, b) =>
                    elementCounts[a] > elementCounts[b] ? a : b
                );
                // 消耗4张相同
                for (let i = 0; i < 4; i++) {
                    this.discardCard(this.hand.indexOf(maxElement), gameState);
                }
                // 消耗3张不同
                const otherElements = Object.keys(elementCounts).filter(e => e !== maxElement);
                for (let i = 0; i < 3 && i < otherElements.length; i++) {
                    this.discardCard(this.hand.indexOf(otherElements[i]), gameState);
                }
                break;
        }
    }

    demolishBuilding(buildingIndex) {
        if (buildingIndex >= 0 && buildingIndex < this.buildings.length) {
            // 移除建筑效果
            const building = this.buildings[buildingIndex];
            const effect = BUILDING_EFFECTS[building.type];

            if (effect.handLimitBonus) {
                this.handLimit -= effect.handLimitBonus;
            }
            if (effect.maxEnergyBonus) {
                this.maxEnergy -= effect.maxEnergyBonus;
                this.energy = Math.min(this.energy, this.maxEnergy);
            }

            this.buildings.splice(buildingIndex, 1);
            this.applyBuildingEffects();
            return true;
        }
        return false;
    }

    drawCards(count, gameState, ignoreLimit = false) {
        for (let i = 0; i < count; i++) {
            if (!ignoreLimit && this.hand.length >= this.handLimit) break;
            const card = gameState.drawCard(this); // 传递玩家参数以启用动态概率
            if (card) {
                this.hand.push(card);
            }
        }
    }

    discardCard(cardIndex, gameState) {
        if (cardIndex >= 0 && cardIndex < this.hand.length) {
            const discarded = this.hand.splice(cardIndex, 1)[0];
            gameState.discardPile.push(discarded);
            return discarded;
        }
        return null;
    }

    canRecoverEnergy() {
        if (this.energy >= this.maxEnergy) return false;

        if (this.cultivation === CULTIVATION_TYPES.MYSTIC_WOOD_HEALER) {
            return this.hand.length >= 3;
        }

        const elementCounts = {};
        this.hand.forEach(card => {
            elementCounts[card] = (elementCounts[card] || 0) + 1;
        });

        return Object.values(elementCounts).some(count => count >= 3);
    }

    recoverEnergy(gameState) {
        if (!this.canRecoverEnergy()) return false;

        if (this.cultivation === CULTIVATION_TYPES.MYSTIC_WOOD_HEALER) {
            for (let i = 0; i < 3 && this.hand.length > 0; i++) {
                this.discardCard(0, gameState);
            }
        } else {
            const elementCounts = {};
            this.hand.forEach((card, index) => {
                if (!elementCounts[card]) elementCounts[card] = [];
                elementCounts[card].push(index);
            });

            for (const [element, indices] of Object.entries(elementCounts)) {
                if (indices.length >= 3) {
                    for (let i = 2; i >= 0; i--) {
                        this.discardCard(indices[i], gameState);
                    }
                    break;
                }
            }
        }

        this.energy = Math.min(this.energy + 1, this.maxEnergy);
        gameState.addToLog(`${this.isAI ? 'AI' : '玩家'} 回元调息，恢复1点仙元`);
        return true;
    }
}

// 全局游戏状态
let gameState = new GameState();

// 界面控制类
class UIController {
    constructor() {
        this.currentModal = null;
        this.selectedCards = [];
        this.processingSkill = false; // 防抖标记
        this.initializeEventListeners();
    }

    addTouchSupport() {
        // 防止移动设备上的双击缩放
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // 为所有按钮添加触摸反馈
        document.addEventListener('touchstart', function(e) {
            if (e.target.classList.contains('action-btn') ||
                e.target.classList.contains('btn-primary') ||
                e.target.classList.contains('btn-secondary') ||
                e.target.classList.contains('card')) {
                e.target.style.transform = 'scale(0.95)';
            }
        });

        document.addEventListener('touchend', function(e) {
            if (e.target.classList.contains('action-btn') ||
                e.target.classList.contains('btn-primary') ||
                e.target.classList.contains('btn-secondary') ||
                e.target.classList.contains('card')) {
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 100);
            }
        });
    }

    initializeEventListeners() {
        // 等待DOM加载完成
        document.addEventListener('DOMContentLoaded', () => {
            this.bindEventListeners();
        });

        // 如果DOM已经加载完成，直接绑定
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.bindEventListeners();
            });
        } else {
            this.bindEventListeners();
        }
    }

    bindEventListeners() {
        // 添加触摸事件支持
        this.addTouchSupport();

        // 开始游戏按钮
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.showCultivationSelection();
            });
        }

        // 帮助按钮已移除

        // 重新开始按钮
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartGame();
            });
        }

        // 行动按钮
        const drawBtn = document.getElementById('draw-card-btn');
        if (drawBtn) {
            drawBtn.addEventListener('click', () => {
                this.handleDrawCard();
            });
        }

        const attackBtn = document.getElementById('attack-btn');
        if (attackBtn) {
            attackBtn.addEventListener('click', () => {
                this.handleAttack();
            });
        }

        const buildBtn = document.getElementById('build-btn');
        if (buildBtn) {
            buildBtn.addEventListener('click', () => {
                this.handleBuild();
            });
        }

        // 结束回合按钮已移除，改为自动结束

        const demolishBtn = document.getElementById('demolish-btn');
        if (demolishBtn) {
            demolishBtn.addEventListener('click', () => {
                this.handleDemolish();
            });
        }

        const recoverBtn = document.getElementById('recover-energy-btn');
        if (recoverBtn) {
            recoverBtn.addEventListener('click', () => {
                this.handleRecoverEnergy();
            });
        }

        const skillBtn = document.getElementById('use-skill-btn');
        if (skillBtn) {
            skillBtn.addEventListener('click', () => {
                this.handleUseSkill();
            });
        }

        // 罡盾按钮
        const shieldBtn = document.getElementById('shield-btn');
        if (shieldBtn) {
            shieldBtn.addEventListener('click', () => {
                this.useShieldSkill();
            });
        }

        // 音效切换按钮
        const soundBtn = document.getElementById('sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.toggleSound();
            });
        }

        // 游戏提示按钮
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showGameInstructionsAndFix();
            });
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
        gameState.currentScreen = screenId;
    }

    showCultivationSelection() {
        this.showScreen('cultivation-select-screen');
        this.renderCultivationOptions();
    }

    renderCultivationOptions() {
        const container = document.getElementById('cultivation-options');
        container.innerHTML = '';

        // 添加网格布局样式
        container.style.display = 'grid';
        container.style.gridTemplateColumns = '1fr 1fr';
        container.style.gridTemplateRows = 'repeat(4, 1fr)';
        container.style.gap = '15px';
        container.style.maxWidth = '800px';
        container.style.margin = '0 auto';

        Object.entries(CULTIVATION_EFFECTS).forEach(([type, effect]) => {
            const option = document.createElement('div');
            option.className = 'cultivation-option';
            option.dataset.cultivation = type;

            const nameDiv = document.createElement('div');
            nameDiv.className = 'cultivation-name';
            nameDiv.textContent = effect.name;

            const descDiv = document.createElement('div');
            descDiv.className = 'cultivation-description';
            descDiv.textContent = effect.description;

            option.appendChild(nameDiv);
            option.appendChild(descDiv);

            option.addEventListener('click', () => {
                document.querySelectorAll('.cultivation-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');

                // 立即进入下一阶段，不需要延迟
                this.selectCultivation(type);
            });

            container.appendChild(option);
        });
    }

    selectCultivation(cultivationType) {
        this.initializePlayers(cultivationType);
    }

    initializePlayers(cultivationType) {
        // 初始化玩家
        gameState.player = new Player(false);
        gameState.ai = new Player(true);

        // 随机分配灵根
        const spiritRoots = Object.values(SPIRIT_ROOTS);
        const playerSpiritRoot = spiritRoots[Math.floor(Math.random() * spiritRoots.length)];
        const aiSpiritRoot = spiritRoots[Math.floor(Math.random() * spiritRoots.length)];

        gameState.player.initialize(cultivationType, playerSpiritRoot);

        // 如果玩家是元素御仙，随机分配元素
        if (cultivationType === CULTIVATION_TYPES.ELEMENT_MASTER) {
            const elements = Object.values(ELEMENTS);
            gameState.player.selectedElement = elements[Math.floor(Math.random() * elements.length)];
        }

        // AI随机选择修仙道体
        const aiCultivation = Object.keys(CULTIVATION_EFFECTS)[Math.floor(Math.random() * Object.keys(CULTIVATION_EFFECTS).length)];
        gameState.ai.initialize(aiCultivation, aiSpiritRoot);

        // 如果AI也是元素御仙，随机选择元素
        if (aiCultivation === CULTIVATION_TYPES.ELEMENT_MASTER) {
            const elements = Object.values(ELEMENTS);
            gameState.ai.selectedElement = elements[Math.floor(Math.random() * elements.length)];
        }

        // 随机分配AI性格
        const personalities = Object.values(AI_PERSONALITIES);
        gameState.ai.aiPersonality = personalities[Math.floor(Math.random() * personalities.length)];

        // 开局抽牌
        const playerInitialHand = gameState.player.cultivation === CULTIVATION_TYPES.MYSTIC_TREASURY ? 2 : 3;
        const aiInitialHand = gameState.ai.cultivation === CULTIVATION_TYPES.MYSTIC_TREASURY ? 2 : 3;

        gameState.player.drawCards(playerInitialHand, gameState);
        gameState.ai.drawCards(aiInitialHand, gameState);

        this.showSpiritRootResult();
    }

    showSpiritRootResult() {
        this.showScreen('spirit-root-screen');

        // 创建老虎机动画界面
        this.createSlotMachine();
    }

    createSlotMachine() {
        const container = document.getElementById('spirit-root-result');
        container.innerHTML = `
            <div class="slot-machine-title">灵根觉醒中...</div>
            <div class="slot-machine" id="slot-machine">
                <div class="slot-reel">
                    <div class="slot-reel-content" id="player-reel">
                        <!-- 玩家灵根选项 -->
                    </div>
                </div>
                <div class="slot-reel">
                    <div class="slot-reel-content" id="ai-reel">
                        <!-- AI灵根选项 -->
                    </div>
                </div>
            </div>
            <div class="slot-result" id="slot-result">
                <!-- 结果显示 -->
            </div>
        `;

        // 填充老虎机内容
        this.populateSlotReels();

        // 开始动画
        setTimeout(() => {
            this.startSlotAnimation();
        }, 200); // 适配2秒总时长
    }

    populateSlotReels() {
        const playerReel = document.getElementById('player-reel');
        const aiReel = document.getElementById('ai-reel');

        // 创建所有灵根选项的列表（重复多次用于动画）
        const spiritRoots = Object.keys(SPIRIT_ROOT_EFFECTS);
        const extendedRoots = [];

        // 重复灵根列表多次，确保动画效果
        for (let i = 0; i < 10; i++) {
            extendedRoots.push(...spiritRoots);
        }

        // 添加玩家的最终结果到末尾
        extendedRoots.push(gameState.player.spiritRoot);

        // 填充玩家老虎机
        extendedRoots.forEach(rootKey => {
            const root = SPIRIT_ROOT_EFFECTS[rootKey];
            const item = document.createElement('div');
            item.className = 'slot-item';
            item.innerHTML = `
                <h4>${root.name}</h4>
                <p>${root.description}</p>
            `;
            playerReel.appendChild(item);
        });

        // 为AI创建类似的列表
        const aiExtendedRoots = [];
        for (let i = 0; i < 10; i++) {
            aiExtendedRoots.push(...spiritRoots);
        }
        aiExtendedRoots.push(gameState.ai.spiritRoot);

        // 填充AI老虎机
        aiExtendedRoots.forEach(rootKey => {
            const root = SPIRIT_ROOT_EFFECTS[rootKey];
            const item = document.createElement('div');
            item.className = 'slot-item';
            item.innerHTML = `
                <h4>${root.name}</h4>
                <p>${root.description}</p>
            `;
            aiReel.appendChild(item);
        });
    }

    startSlotAnimation() {
        const slotMachine = document.getElementById('slot-machine');
        const playerReel = document.getElementById('player-reel');
        const aiReel = document.getElementById('ai-reel');

        slotMachine.classList.add('spinning');

        let playerSpeed = 10; // 加快初始速度
        let aiSpeed = 10;
        let playerPosition = 0;
        let aiPosition = 0;

        // 玩家老虎机动画
        const playerInterval = setInterval(() => {
            playerPosition += 120; // 每个项目的高度
            playerReel.style.transform = `translateY(-${playerPosition}px)`;

            // 逐渐减速
            playerSpeed += 2; // 减小加速度，更快停止

            if (playerSpeed > 50) { // 更快停止
                clearInterval(playerInterval);
                // 停在最终位置
                const finalPosition = (playerReel.children.length - 1) * 120;
                playerReel.style.transform = `translateY(-${finalPosition}px)`;
                playerReel.style.transition = 'transform 0.2s ease-out';
            }
        }, playerSpeed);

        // AI老虎机动画（稍微延迟停止）
        const aiInterval = setInterval(() => {
            aiPosition += 120;
            aiReel.style.transform = `translateY(-${aiPosition}px)`;

            aiSpeed += 2; // 减小加速度，更快停止

            if (aiSpeed > 60) { // AI稍晚停止，但也更快
                clearInterval(aiInterval);
                const finalPosition = (aiReel.children.length - 1) * 120;
                aiReel.style.transform = `translateY(-${finalPosition}px)`;
                aiReel.style.transition = 'transform 0.2s ease-out';

                // 动画结束后显示结果
                setTimeout(() => {
                    this.showSlotResults();
                }, 100); // 减少等待时间
            }
        }, aiSpeed);
    }

    showSlotResults() {
        const slotMachine = document.getElementById('slot-machine');
        const resultDiv = document.getElementById('slot-result');

        slotMachine.classList.remove('spinning');

        const playerRoot = SPIRIT_ROOT_EFFECTS[gameState.player.spiritRoot];
        const aiRoot = SPIRIT_ROOT_EFFECTS[gameState.ai.spiritRoot];

        // 创建合并的界面：左边灵根觉醒，右边先后手决定
        resultDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; gap: 40px; margin-top: 20px;">
                <!-- 左侧：灵根觉醒结果 -->
                <div style="flex: 1;">
                    <h3 style="text-align: center; margin-bottom: 20px;">灵根觉醒</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="spirit-root-card" style="font-size: 0.9em; padding: 15px;">
                            <div class="spirit-root-name">你的灵根：${playerRoot.name}</div>
                            <div class="spirit-root-effect" style="font-size: 0.8em;">${playerRoot.description}</div>
                        </div>
                        <div class="spirit-root-card" style="font-size: 0.9em; padding: 15px;">
                            <div class="spirit-root-name">对手灵根：${aiRoot.name}</div>
                            <div class="spirit-root-effect" style="font-size: 0.8em;">${aiRoot.description}</div>
                        </div>
                    </div>
                </div>

                <!-- 右侧：先后手决定 -->
                <div style="flex: 1;">
                    <h3 style="text-align: center; margin-bottom: 20px;">决定先后手</h3>
                    <div id="turn-order-section">
                        <div id="turn-order-animation" class="turn-order-display" style="margin-bottom: 20px;">
                            <div class="player-draw" style="margin-bottom: 10px;">
                                <h4>你抽到：</h4>
                                <div id="player-draw-card" class="element-card"></div>
                            </div>
                            <div class="ai-draw">
                                <h4>对手抽到：</h4>
                                <div id="ai-draw-card" class="element-card"></div>
                            </div>
                        </div>
                        <div id="turn-order-result" class="turn-result hidden">
                            <!-- 先后手结果 -->
                        </div>
                    </div>
                </div>
            </div>
            <button id="start-battle-btn" class="btn-primary hidden" style="margin-top: 30px;">开始对战</button>
        `;

        resultDiv.classList.add('show');

        // 自动开始先后手决定
        setTimeout(() => {
            this.startTurnOrderDetermination();
        }, 300); // 减少等待时间从1000ms到300ms
    }

    startTurnOrderDetermination() {
        let playerElement, aiElement;
        let attempts = 0;
        const maxAttempts = 10;

        const drawCards = () => {
            if (attempts >= maxAttempts) {
                gameState.currentTurn = Math.random() < 0.5 ? 'player' : 'ai';
                this.showCombinedTurnOrderResult();
                return;
            }

            attempts++;
            playerElement = Object.values(ELEMENTS)[Math.floor(Math.random() * 5)];
            aiElement = Object.values(ELEMENTS)[Math.floor(Math.random() * 5)];

            this.animateCardDraw(playerElement, aiElement);

            setTimeout(() => {
                const result = this.checkTurnOrder(playerElement, aiElement);
                if (result) {
                    gameState.currentTurn = result.winner;
                    gameState.turnOrderExplanation = result.explanation;
                    this.showCombinedTurnOrderResult();
                } else {
                    drawCards();
                }
            }, 200); // 减少等待时间从800ms到200ms
        };

        drawCards();
    }

    determineTurnOrder() {
        // 保留原函数以防其他地方调用，但现在直接调用新的合并版本
        this.startTurnOrderDetermination();
    }

    animateCardDraw(playerElement, aiElement) {
        const playerCard = document.getElementById('player-draw-card');
        const aiCard = document.getElementById('ai-draw-card');

        playerCard.className = 'element-card element-' + playerElement;
        playerCard.textContent = ELEMENT_INFO[playerElement].symbol + ' ' + ELEMENT_INFO[playerElement].name;

        aiCard.className = 'element-card element-' + aiElement;
        aiCard.textContent = ELEMENT_INFO[aiElement].symbol + ' ' + ELEMENT_INFO[aiElement].name;
    }

    checkTurnOrder(playerElement, aiElement) {
        const playerElementName = ELEMENT_INFO[playerElement].name;
        const aiElementName = ELEMENT_INFO[aiElement].name;

        if (ELEMENT_RELATIONS.OVERCOME[playerElement] === aiElement) {
            return {
                winner: 'player',
                explanation: `${playerElementName}克制${aiElementName}`
            };
        }
        if (ELEMENT_RELATIONS.OVERCOME[aiElement] === playerElement) {
            return {
                winner: 'ai',
                explanation: `${aiElementName}克制${playerElementName}`
            };
        }

        if (ELEMENT_RELATIONS.GENERATE[playerElement] === aiElement) {
            return {
                winner: 'player',
                explanation: `${playerElementName}生成${aiElementName}`
            };
        }
        if (ELEMENT_RELATIONS.GENERATE[aiElement] === playerElement) {
            return {
                winner: 'ai',
                explanation: `${aiElementName}生成${playerElementName}`
            };
        }

        return null;
    }

    showCombinedTurnOrderResult() {
        const resultDiv = document.getElementById('turn-order-result');
        const isPlayerFirst = gameState.currentTurn === 'player';

        const resultText = document.createElement('h4');
        resultText.textContent = isPlayerFirst ? '你先手！' : '对手先手！';
        resultText.style.textAlign = 'center';
        resultText.style.color = isPlayerFirst ? '#2ed573' : '#ff6b6b';

        const explanationText = document.createElement('p');
        explanationText.textContent = `原因：${gameState.turnOrderExplanation}`;
        explanationText.style.textAlign = 'center';
        explanationText.style.fontSize = '14px';
        explanationText.style.color = '#ccc';
        explanationText.style.marginTop = '10px';

        resultDiv.innerHTML = '';
        resultDiv.appendChild(resultText);
        resultDiv.appendChild(explanationText);
        resultDiv.classList.remove('hidden');

        document.getElementById('start-battle-btn').classList.remove('hidden');
        document.getElementById('start-battle-btn').onclick = () => {
            this.startBattle();
        };
    }

    showTurnOrderResult() {
        // 保留原函数以防其他地方调用
        this.showCombinedTurnOrderResult();
    }

    startBattle() {
        this.showScreen('game-screen');
        this.initializeGame();
        this.drawWuxingChart();
        this.updateUI();

        gameState.addToLog('游戏开始！');

        // 移除自动显示游戏提示，改为通过帮助按钮手动查看
    }

    showGameInstructions() {
        const content = `
            <h3>五行仙途卡牌对战 - 游戏说明</h3>
            <div class="help-content">
                <h4>游戏目标</h4>
                <p>通过斗法将对手的仙元降至0点获得胜利。</p>

                <h4>五行相生相克</h4>
                <p><span style="color: #2ed573;">相生（绿色实线箭头）：</span>木→火→土→金→水→木</p>
                <p><span style="color: #ff6b6b;">相克（红色虚线箭头）：</span>木克土、土克水、水克火、火克金、金克木</p>

                <h4>回合流程</h4>
                <ol>
                    <li><strong>技能阶段：</strong>如果有仙术点，可选择使用技能</li>
                    <li><strong>行动阶段：</strong>必须用完所有行动点才能结束回合</li>
                    <li><strong>可选行动：</strong>引灵（抽牌）、斗法（攻击）、筑府（建造）、回元调息</li>
                </ol>

                <h4>战斗规则</h4>
                <ul>
                    <li><strong>普通攻击：</strong>每张牌造成1点伤害</li>
                    <li><strong>五行合攻：</strong>使用相生关系的牌（如木+火）造成2点伤害</li>
                    <li><strong>伤害加成：</strong>五行合攻时，只有被生成元素的加成生效</li>
                    <li><strong>防御：</strong>使用克制对方攻击元素的牌可减少1点伤害</li>
                    <li><strong>罡盾：</strong>可直接抵消伤害，最多叠加3层</li>
                </ul>

                <h4>卡牌选择</h4>
                <p>选择卡牌时只能选择相生关系的牌进行五行合攻，或选择相同元素的牌。</p>

                <h4>修仙道体特色</h4>
                <ul>
                    <li><strong>元素御仙：</strong>专精元素额外+1伤害</li>
                    <li><strong>窃灵天官：</strong>可窃取对手手牌</li>
                    <li><strong>焚天修士：</strong>可群体攻击同属性牌</li>
                    <li><strong>罡盾卫道者：</strong>可生成护盾防御</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button id="start-battle-now" class="btn-primary">开始战斗</button>
            </div>
        `;

        this.showModal(content);

        // 使用requestAnimationFrame确保DOM更新后再绑定事件
        requestAnimationFrame(() => {
            const startBtn = document.getElementById('start-battle-now');

            if (startBtn) {
                console.log('找到开始战斗按钮，绑定事件');
                startBtn.addEventListener('click', () => {
                    console.log('开始战斗按钮被点击');
                    this.hideModal();
                    this.startTurn();
                });
            } else {
                console.error('找不到开始战斗按钮');
                // 如果找不到按钮，3秒后自动开始
                setTimeout(() => {
                    this.hideModal();
                    this.startTurn();
                }, 3000);
            }
        });
    }

    initializeGame() {
        gameState.turnPhase = 'start';
        gameState.actionPoints = 1;

        // 确保玩家和AI有初始手牌
        if (gameState.player.hand.length === 0) {
            const playerInitialHand = gameState.player.cultivation === CULTIVATION_TYPES.MYSTIC_TREASURY ? 2 : 3;
            gameState.player.drawCards(playerInitialHand, gameState);
            console.log('玩家抽取初始手牌:', playerInitialHand, '张');
        }

        if (gameState.ai.hand.length === 0) {
            const aiInitialHand = gameState.ai.cultivation === CULTIVATION_TYPES.MYSTIC_TREASURY ? 2 : 3;
            gameState.ai.drawCards(aiInitialHand, gameState);
            console.log('AI抽取初始手牌:', aiInitialHand, '张');
        }

        // 确保所有UI信息正确显示
        this.updatePlayerInfo();
        this.updateAIInfo();
        this.updateGameStatus();
        this.updateActionButtons();
    }

    drawWuxingChart() {
        const svg = document.querySelector('#wuxing-chart svg');
        if (!svg) return;

        svg.innerHTML = '';

        // 定义箭头标记
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // 相生箭头（绿色）
        const generateMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        generateMarker.setAttribute('id', 'generate-arrow');
        generateMarker.setAttribute('markerWidth', '10');
        generateMarker.setAttribute('markerHeight', '10');
        generateMarker.setAttribute('refX', '8');
        generateMarker.setAttribute('refY', '3');
        generateMarker.setAttribute('orient', 'auto');
        generateMarker.setAttribute('markerUnits', 'strokeWidth');

        const generatePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        generatePath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        generatePath.setAttribute('fill', '#2ed573');
        generateMarker.appendChild(generatePath);
        defs.appendChild(generateMarker);

        // 相克箭头（红色）
        const overcomeMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        overcomeMarker.setAttribute('id', 'overcome-arrow');
        overcomeMarker.setAttribute('markerWidth', '10');
        overcomeMarker.setAttribute('markerHeight', '10');
        overcomeMarker.setAttribute('refX', '8');
        overcomeMarker.setAttribute('refY', '3');
        overcomeMarker.setAttribute('orient', 'auto');
        overcomeMarker.setAttribute('markerUnits', 'strokeWidth');

        const overcomePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        overcomePath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        overcomePath.setAttribute('fill', '#ff6b6b');
        overcomeMarker.appendChild(overcomePath);
        defs.appendChild(overcomeMarker);

        svg.appendChild(defs);

        // 五角星的五个顶点坐标
        const centerX = 100, centerY = 100, radius = 80;
        const points = [];

        // 元素顺序：火、土、金、水、木（按五角星顺序）
        const elements = [ELEMENTS.FIRE, ELEMENTS.EARTH, ELEMENTS.METAL, ELEMENTS.WATER, ELEMENTS.WOOD];

        for (let i = 0; i < 5; i++) {
            const angle = (i * 72 - 90) * Math.PI / 180;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            points.push({ x, y, element: elements[i] });
        }

        // 绘制相生关系的箭头（五边形）
        for (let i = 0; i < 5; i++) {
            const current = points[i];
            const next = points[(i + 1) % 5];

            // 计算箭头起点和终点（避免与圆圈重叠）
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const unitX = dx / length;
            const unitY = dy / length;

            const startX = current.x + unitX * 25;
            const startY = current.y + unitY * 25;
            const endX = next.x - unitX * 25;
            const endY = next.y - unitY * 25;

            const generateLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            generateLine.setAttribute('x1', startX);
            generateLine.setAttribute('y1', startY);
            generateLine.setAttribute('x2', endX);
            generateLine.setAttribute('y2', endY);
            generateLine.setAttribute('stroke', '#2ed573');
            generateLine.setAttribute('stroke-width', '3');
            generateLine.setAttribute('marker-end', 'url(#generate-arrow)');
            svg.appendChild(generateLine);
        }

        // 绘制相克关系的箭头（五角星）
        for (let i = 0; i < 5; i++) {
            const current = points[i];
            const target = points[(i + 2) % 5]; // 跳过一个点形成五角星

            // 计算箭头起点和终点（避免与圆圈重叠）
            const dx = target.x - current.x;
            const dy = target.y - current.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const unitX = dx / length;
            const unitY = dy / length;

            const startX = current.x + unitX * 25;
            const startY = current.y + unitY * 25;
            const endX = target.x - unitX * 25;
            const endY = target.y - unitY * 25;

            const overcomeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            overcomeLine.setAttribute('x1', startX);
            overcomeLine.setAttribute('y1', startY);
            overcomeLine.setAttribute('x2', endX);
            overcomeLine.setAttribute('y2', endY);
            overcomeLine.setAttribute('stroke', '#ff6b6b');
            overcomeLine.setAttribute('stroke-width', '2');
            overcomeLine.setAttribute('stroke-dasharray', '5,5');
            overcomeLine.setAttribute('marker-end', 'url(#overcome-arrow)');
            svg.appendChild(overcomeLine);
        }

        // 添加元素圆圈和标签
        points.forEach((point, i) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', '20');
            circle.setAttribute('fill', ELEMENT_INFO[point.element].color);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '2');
            svg.appendChild(circle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', point.x);
            text.setAttribute('y', point.y + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#fff');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.textContent = ELEMENT_INFO[point.element].name;
            svg.appendChild(text);
        });
    }

    updateUI() {
        this.updatePlayerInfo();
        this.updateAIInfo();
        this.updateGameStatus();
        this.updatePassiveProgress();
        this.updateActionButtons();
    }

    updatePlayerInfo() {
        const player = gameState.player;

        if (!player) {
            console.warn('Player not initialized');
            return;
        }

        const cultivationEl = document.getElementById('player-cultivation');
        if (cultivationEl) {
            let cultivationText = CULTIVATION_EFFECTS[player.cultivation].name;
            if (player.selectedElement) {
                cultivationText += `（${ELEMENT_INFO[player.selectedElement].name}）`;
            }
            cultivationEl.textContent = cultivationText;
            console.log('Updated player cultivation:', cultivationText);
        } else {
            console.warn('player-cultivation element not found');
        }

        const spiritRootEl = document.getElementById('player-spirit-root');
        if (spiritRootEl) {
            spiritRootEl.textContent = SPIRIT_ROOT_EFFECTS[player.spiritRoot].name;

            // 设置灵根颜色
            const spiritRootColors = {
                [SPIRIT_ROOTS.NONE]: '#888',     // 灰色
                [SPIRIT_ROOTS.FIRE]: '#ff4757',  // 红色
                [SPIRIT_ROOTS.WATER]: '#3742fa', // 蓝色
                [SPIRIT_ROOTS.METAL]: '#ffd700', // 黄色
                [SPIRIT_ROOTS.WOOD]: '#2ed573',  // 绿色
                [SPIRIT_ROOTS.EARTH]: '#8b4513'  // 棕色
            };
            spiritRootEl.style.color = spiritRootColors[player.spiritRoot] || '#74b9ff';

            console.log('Updated player spirit root:', SPIRIT_ROOT_EFFECTS[player.spiritRoot].name);
        } else {
            console.warn('player-spirit-root element not found');
        }

        const energyEl = document.getElementById('player-energy');
        const maxEnergyEl = document.getElementById('player-max-energy');
        if (energyEl && maxEnergyEl) {
            // 使用爱心显示仙元
            let heartsHtml = '';
            for (let i = 0; i < player.maxEnergy; i++) {
                if (i < player.energy) {
                    heartsHtml += '<span class="heart filled">❤️</span>';
                } else {
                    heartsHtml += '<span class="heart empty">🤍</span>';
                }
            }
            energyEl.innerHTML = heartsHtml;
            maxEnergyEl.textContent = ''; // 清空最大仙元显示，因为爱心已经显示了
        }

        const handCountEl = document.getElementById('player-hand-count');
        if (handCountEl) handCountEl.textContent = `${player.hand.length}/${player.handLimit}`;

        // 更新护盾显示
        const playerShields = document.getElementById('player-shields');
        if (playerShields) {
            if (player.shields > 0) {
                playerShields.classList.remove('hidden');
                const shieldCount = playerShields.querySelector('.shield-count');
                if (shieldCount) shieldCount.textContent = player.shields;
            } else {
                playerShields.classList.add('hidden');
            }
        }

        // 更新技能点显示
        const playerSkillPoints = document.getElementById('player-skill-points');
        if (playerSkillPoints) {
            if (player.skillPoints > 0) {
                playerSkillPoints.classList.remove('hidden');
                const skillCount = playerSkillPoints.querySelector('.skill-count');
                if (skillCount) skillCount.textContent = player.skillPoints;
            } else {
                playerSkillPoints.classList.add('hidden');
            }
        }

        this.renderPlayerHand();
        this.renderPlayerBuildings();
    }

    updateAIInfo() {
        const ai = gameState.ai;

        if (!ai) {
            console.warn('AI not initialized');
            return;
        }

        const cultivationEl = document.getElementById('ai-cultivation');
        if (cultivationEl) {
            let cultivationText = CULTIVATION_EFFECTS[ai.cultivation].name;
            if (ai.selectedElement) {
                cultivationText += `（${ELEMENT_INFO[ai.selectedElement].name}）`;
            }
            cultivationEl.textContent = cultivationText;
            console.log('Updated AI cultivation:', cultivationText);
        } else {
            console.warn('ai-cultivation element not found');
        }

        const spiritRootEl = document.getElementById('ai-spirit-root');
        if (spiritRootEl) {
            spiritRootEl.textContent = SPIRIT_ROOT_EFFECTS[ai.spiritRoot].name;

            // 设置灵根颜色
            const spiritRootColors = {
                [SPIRIT_ROOTS.NONE]: '#888',     // 灰色
                [SPIRIT_ROOTS.FIRE]: '#ff4757',  // 红色
                [SPIRIT_ROOTS.WATER]: '#3742fa', // 蓝色
                [SPIRIT_ROOTS.METAL]: '#ffd700', // 黄色
                [SPIRIT_ROOTS.WOOD]: '#2ed573',  // 绿色
                [SPIRIT_ROOTS.EARTH]: '#8b4513'  // 棕色
            };
            spiritRootEl.style.color = spiritRootColors[ai.spiritRoot] || '#74b9ff';

            console.log('Updated AI spirit root:', SPIRIT_ROOT_EFFECTS[ai.spiritRoot].name);
        } else {
            console.warn('ai-spirit-root element not found');
        }

        const personalityPrefixEl = document.getElementById('ai-personality-prefix');
        if (personalityPrefixEl && ai.aiPersonality) {
            personalityPrefixEl.textContent = (AI_PERSONALITY_NAMES[ai.aiPersonality] || '未知') + '的';
            console.log('Updated AI personality:', AI_PERSONALITY_NAMES[ai.aiPersonality]);
        }

        const energyEl = document.getElementById('ai-energy');
        const maxEnergyEl = document.getElementById('ai-max-energy');
        if (energyEl && maxEnergyEl) {
            // 使用爱心显示仙元
            let heartsHtml = '';
            for (let i = 0; i < ai.maxEnergy; i++) {
                if (i < ai.energy) {
                    heartsHtml += '<span class="heart filled">❤️</span>';
                } else {
                    heartsHtml += '<span class="heart empty">🤍</span>';
                }
            }
            energyEl.innerHTML = heartsHtml;
            maxEnergyEl.textContent = ''; // 清空最大仙元显示
        }

        const handCountEl = document.getElementById('ai-hand-count');
        if (handCountEl) handCountEl.textContent = `${ai.hand.length}/${ai.handLimit}`;

        // 更新护盾显示
        const aiShields = document.getElementById('ai-shields');
        if (aiShields) {
            if (ai.shields > 0) {
                aiShields.classList.remove('hidden');
                const shieldCount = aiShields.querySelector('.shield-count');
                if (shieldCount) shieldCount.textContent = ai.shields;
            } else {
                aiShields.classList.add('hidden');
            }
        }

        // 更新技能点显示
        const aiSkillPoints = document.getElementById('ai-skill-points');
        if (aiSkillPoints) {
            if (ai.skillPoints > 0) {
                aiSkillPoints.classList.remove('hidden');
                const skillCount = aiSkillPoints.querySelector('.skill-count');
                if (skillCount) skillCount.textContent = ai.skillPoints;
            } else {
                aiSkillPoints.classList.add('hidden');
            }
        }

        this.renderAIHand();
        this.renderAIBuildings();
    }

    updateGameStatus() {
        const currentTurnEl = document.getElementById('current-turn');
        if (currentTurnEl) {
            currentTurnEl.textContent = `第${gameState.roundNumber}回合 - ${gameState.currentTurn === 'player' ? '玩家轮次' : 'AI轮次'}`;
        }

        const actionPointsEl = document.getElementById('action-points');
        if (actionPointsEl) {
            actionPointsEl.textContent = `行动点：${gameState.actionPoints}`;
        }

        this.updateGameLog();
    }

    updateGameLog() {
        const logContainer = document.getElementById('game-log');
        if (!logContainer) return;

        logContainer.innerHTML = '';

        gameState.gameLog.slice(-10).forEach(message => {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.textContent = message;
            logContainer.appendChild(entry);
        });

        logContainer.scrollTop = logContainer.scrollHeight;
    }

    clearPlayedCards() {
        const container = document.getElementById('played-cards-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    addPlayedCards(cards, playerName) {
        const container = document.getElementById('played-cards-container');
        if (!container) return;

        const playedGroup = document.createElement('div');
        playedGroup.className = 'played-card-group';

        const playerLabel = document.createElement('div');
        playerLabel.className = 'played-card-player';
        playerLabel.textContent = playerName;
        playedGroup.appendChild(playerLabel);

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'played-cards';

        // 先创建目标位置的卡牌容器
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = `played-card element-${card}`;
            cardElement.textContent = ELEMENT_INFO[card].symbol;
            cardElement.style.opacity = '0'; // 初始隐藏
            cardsContainer.appendChild(cardElement);
        });

        playedGroup.appendChild(cardsContainer);
        container.appendChild(playedGroup);

        // 执行飞行动画
        this.animateCardsFlying(cards, playerName, cardsContainer);
    }

    animateCardsFlying(cards, playerName, targetContainer) {
        // 取消飞行动画，直接显示卡牌
        cards.forEach((card, index) => {
            const targetCard = targetContainer.children[index];
            if (targetCard) {
                targetCard.style.opacity = '1';
            }
        });
    }

    renderPlayerHand() {
        const handContainer = document.getElementById('player-hand');
        if (!handContainer) return;

        handContainer.innerHTML = '';

        gameState.player.hand.forEach((element, index) => {
            const card = document.createElement('div');
            card.className = `card element-${element}`;
            card.dataset.index = index;
            card.textContent = ELEMENT_INFO[element].symbol;

            card.addEventListener('click', () => {
                // 只有在玩家回合时才能选择卡牌
                if (gameState.currentTurn === 'player') {
                    this.toggleCardSelection(card, index);
                }
            });

            handContainer.appendChild(card);
        });
    }

    renderAIHand() {
        const handContainer = document.getElementById('ai-hand');
        if (!handContainer) return;

        handContainer.innerHTML = '';

        for (let i = 0; i < gameState.ai.hand.length; i++) {
            const card = document.createElement('div');
            card.className = 'card card-back';
            card.textContent = '?';
            handContainer.appendChild(card);
        }
    }

    renderPlayerBuildings() {
        // 更新仙府数量显示
        const buildingCountEl = document.getElementById('player-building-count');
        if (buildingCountEl) {
            buildingCountEl.textContent = `(${gameState.player.buildings.length}/${gameState.player.buildingLimit})`;
        }

        // 更新玩家建筑槽位，不显示空的仙府
        for (let i = 0; i < 5; i++) {
            const slot = document.getElementById(`player-building-slot-${i}`);
            if (slot) {
                if (i < gameState.player.buildings.length) {
                    const building = gameState.player.buildings[i];
                    slot.textContent = building.name;
                    slot.className = 'building-slot occupied';
                    slot.title = BUILDING_EFFECTS[building.type].description;
                    slot.style.display = 'block';
                } else {
                    // 隐藏空的建筑槽位
                    slot.style.display = 'none';
                }
            }
        }
    }

    renderAIBuildings() {
        // 更新AI仙府数量显示
        const aiBuildingCountEl = document.getElementById('ai-building-count');
        if (aiBuildingCountEl) {
            aiBuildingCountEl.textContent = `(${gameState.ai.buildings.length}/${gameState.ai.buildingLimit})`;
        }

        // 更新AI建筑槽位，不显示空的仙府
        for (let i = 0; i < 5; i++) {
            const slot = document.getElementById(`ai-building-slot-${i}`);
            if (slot) {
                if (i < gameState.ai.buildings.length) {
                    const building = gameState.ai.buildings[i];
                    slot.textContent = building.name;
                    slot.className = 'building-slot occupied';
                    slot.title = BUILDING_EFFECTS[building.type].description;
                    slot.style.display = 'block';
                } else {
                    // 隐藏空的建筑槽位
                    slot.style.display = 'none';
                }
            }
        }
    }

    toggleCardSelection(cardElement, index) {
        const isSelected = cardElement.classList.contains('selected');

        if (isSelected) {
            cardElement.classList.remove('selected');
            this.selectedCards = this.selectedCards.filter(i => i !== index);
            this.clearCardHighlights();
        } else {
            cardElement.classList.add('selected');
            this.selectedCards.push(index);

            // 只在选择第一张牌时高亮相关牌
            if (this.selectedCards.length === 1) {
                this.highlightRelatedCards(index);
            } else {
                this.clearCardHighlights();
            }
        }

        this.updateActionButtons();
    }

    highlightRelatedCards(selectedIndex) {
        // 清除之前的高亮
        this.clearCardHighlights();

        const selectedElement = gameState.player.hand[selectedIndex];
        const handCards = document.querySelectorAll('.player-side .hand .card');
        const player = gameState.player;

        handCards.forEach((card, index) => {
            if (index === selectedIndex) return; // 跳过已选择的牌

            const cardElement = gameState.player.hand[index];

            // 检查是否有相生关系
            const hasGenerateRelation =
                ELEMENT_RELATIONS.GENERATE[selectedElement] === cardElement ||
                ELEMENT_RELATIONS.GENERATE[cardElement] === selectedElement;

            // 五行阵仙：相同元素的牌也会高亮
            const isSameElement = cardElement === selectedElement;
            const isArrayMaster = player && player.cultivation === CULTIVATION_TYPES.FIVE_ELEMENT_ARRAY;

            if (hasGenerateRelation || (isArrayMaster && isSameElement)) {
                card.classList.add('highlighted');
            }
        });
    }

    clearCardHighlights() {
        const handCards = document.querySelectorAll('.player-side .hand .card');
        handCards.forEach(card => {
            card.classList.remove('highlighted');
        });
    }

    // 移除canSelectCard方法，现在允许选择任何牌

    isValidCardSelection() {
        if (!this.selectedCards || this.selectedCards.length === 0) {
            return false;
        }

        if (this.selectedCards.length === 1) {
            return true; // 单张牌总是有效的
        }

        // 确保gameState.player存在
        if (!gameState.player || !gameState.player.hand) {
            return false;
        }

        const selectedElements = this.selectedCards.map(i => gameState.player.hand[i]);

        // 检查是否都是相同元素（只有五行阵仙可以使用相同元素的牌）
        if (selectedElements.every(element => element === selectedElements[0])) {
            // 只有五行阵仙才能使用相同元素的牌进行攻击
            if (gameState.player.cultivation === CULTIVATION_TYPES.FIVE_ELEMENT_ARRAY) {
                return true;
            } else if (selectedElements.length === 1) {
                return true; // 单张牌任何职业都可以使用
            } else {
                return false; // 其他职业不能使用多张相同元素的牌
            }
        }

        // 检查是否有相生关系（用于五行合攻）
        for (let i = 0; i < selectedElements.length; i++) {
            for (let j = i + 1; j < selectedElements.length; j++) {
                const element1 = selectedElements[i];
                const element2 = selectedElements[j];
                if (ELEMENT_RELATIONS.GENERATE[element1] === element2 ||
                    ELEMENT_RELATIONS.GENERATE[element2] === element1) {
                    return true;
                }
            }
        }

        return false; // 没有相生关系的不同元素无法进行有效攻击
    }

    canPlayerRecoverEnergy() {
        const player = gameState.player;
        if (!player || player.energy >= player.maxEnergy) return false;

        if (this.selectedCards.length !== 3) return false;

        // 玄木药师：选择任意3张牌即可
        if (player.cultivation === CULTIVATION_TYPES.MYSTIC_WOOD_HEALER) {
            return true;
        }

        // 其他道体：需要3张相同元素的牌
        const selectedElements = this.selectedCards.map(index => player.hand[index]);

        // 检查是否都是相同元素
        return selectedElements.every(element => element === selectedElements[0]);
    }

    checkPlayerActionPoints() {
        // 如果玩家没有行动点了，检查手牌上限然后自动结束回合
        // 但如果正在防御模式中，则不能结束回合
        if (gameState.currentTurn === 'player' && gameState.actionPoints <= 0 && !gameState.inDefenseMode) {
            this.checkHandLimit(() => {
                gameState.addToLog('行动点用完，自动结束回合');
                setTimeout(() => {
                    this.handleEndTurn();
                }, 1000);
            });
        }
    }

    checkHandLimit(callback) {
        const player = gameState.player;
        if (player.hand.length > player.handLimit) {
            this.showDiscardModal(callback);
        } else {
            callback();
        }
    }

    clearCardSelection() {
        document.querySelectorAll('.card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        this.clearCardHighlights();
        this.selectedCards = [];
    }

    updateActionButtons() {
        const isPlayerTurn = gameState.currentTurn === 'player';
        const hasActionPoints = gameState.actionPoints > 0;
        const hasSelectedCards = this.selectedCards && this.selectedCards.length > 0;

        // 显示/隐藏按钮
        const demolishBtn = document.getElementById('demolish-btn');
        if (demolishBtn) {
            // 只有在建造了5个仙府后才显示拆除按钮
            demolishBtn.classList.toggle('hidden',
                !isPlayerTurn || !gameState.player || gameState.player.buildings.length < 5);
        }

        // 回元调息按钮
        const recoverBtn = document.getElementById('recover-energy-btn');
        if (recoverBtn) {
            const canRecover = this.canPlayerRecoverEnergy();
            const isMysticWoodHealer = gameState.player && gameState.player.cultivation === CULTIVATION_TYPES.MYSTIC_WOOD_HEALER;
            const hasThreeCards = this.selectedCards && this.selectedCards.length === 3;
            const energyNotFull = gameState.player && gameState.player.energy < gameState.player.maxEnergy;
            const notInCooldown = !gameState.recoverEnergyCooldown;

            // 玄木药师：选择3张牌且仙元未满且不在冷却中时显示
            // 其他职业：需要满足canPlayerRecoverEnergy的条件且不在冷却中
            const shouldShow = isPlayerTurn && energyNotFull && notInCooldown &&
                ((isMysticWoodHealer && hasThreeCards) || (!isMysticWoodHealer && canRecover));

            recoverBtn.classList.toggle('hidden', !shouldShow);

            // 设置按钮状态
            if (gameState.recoverEnergyCooldown) {
                recoverBtn.disabled = true;
                recoverBtn.title = '回元调息冷却中...';
            } else {
                recoverBtn.disabled = false;
                recoverBtn.title = '';
            }
        }

        const skillBtn = document.getElementById('use-skill-btn');
        if (skillBtn) {
            const hasRegularSkill = gameState.player && gameState.player.skillPoints > 0 && !gameState.skillUsedThisTurn;
            const isBloodGuide = gameState.player && gameState.player.cultivation === CULTIVATION_TYPES.BLOOD_GUIDE_LORD;
            const isSpiritThief = gameState.player && gameState.player.cultivation === CULTIVATION_TYPES.SPIRIT_THIEF;
            const sacrificeCount = gameState.sacrificeUsedCount || 0;
            const canSacrifice = isBloodGuide && gameState.player.energy >= 2 && sacrificeCount < 3 && !gameState.sacrificeCooldown;

            // 窃灵天官不显示技能按钮（被动技能）
            skillBtn.classList.toggle('hidden',
                !isPlayerTurn || !gameState.player || isSpiritThief || (!hasRegularSkill && !canSacrifice));

            // 更新按钮文本和状态
            if (isBloodGuide && canSacrifice) {
                skillBtn.textContent = '献祭';
                skillBtn.title = `消耗1点仙元，抽取2张牌（本回合已使用${sacrificeCount}/3次）`;
                skillBtn.disabled = false;
            } else if (isBloodGuide && gameState.sacrificeCooldown) {
                skillBtn.textContent = '献祭';
                skillBtn.title = '献祭冷却中...';
                skillBtn.disabled = true;
            } else if (isBloodGuide && sacrificeCount >= 3) {
                skillBtn.textContent = '献祭';
                skillBtn.title = '本回合献祭次数已用完（3/3）';
                skillBtn.disabled = true;
            } else if (hasRegularSkill) {
                skillBtn.textContent = '使用技能';
                skillBtn.title = '';
                skillBtn.disabled = false;
            }
        }

        // 罡盾按钮（只对罡盾卫道者显示，且选择了恰好2张牌）
        const shieldBtn = document.getElementById('shield-btn');
        if (shieldBtn) {
            const isShieldGuardian = gameState.player && gameState.player.cultivation === CULTIVATION_TYPES.SHIELD_GUARDIAN;
            const hasSelectedExactlyTwoCards = this.selectedCards && this.selectedCards.length === 2;
            const canUseShield = gameState.player && gameState.player.shields < 3;

            shieldBtn.classList.toggle('hidden',
                !isPlayerTurn || !isShieldGuardian || !hasSelectedExactlyTwoCards || !canUseShield);
        }

        // 启用/禁用按钮
        const drawBtn = document.getElementById('draw-card-btn');
        if (drawBtn) {
            drawBtn.disabled = !isPlayerTurn || !hasActionPoints;
            drawBtn.title = '';
        }

        const attackBtn = document.getElementById('attack-btn');
        if (attackBtn) {
            const hasValidSelection = hasSelectedCards && this.isValidCardSelection();
            const hasTwoCards = this.selectedCards && this.selectedCards.length === 2;
            const hasMoreThanTwoCards = this.selectedCards && this.selectedCards.length > 2;

            // 检查两张牌是否有相生关系或者是五行阵仙的相同元素牌
            let hasTwoCardsWithGeneration = false;
            let hasTwoSameElementCards = false;
            if (hasTwoCards) {
                const card1 = gameState.player.hand[this.selectedCards[0]];
                const card2 = gameState.player.hand[this.selectedCards[1]];
                hasTwoCardsWithGeneration =
                    ELEMENT_RELATIONS.GENERATE[card1] === card2 ||
                    ELEMENT_RELATIONS.GENERATE[card2] === card1;
                hasTwoSameElementCards = card1 === card2 && gameState.player.cultivation === CULTIVATION_TYPES.FIVE_ELEMENT_ARRAY;
            }

            // 只有选择超过两张牌时才禁用斗法按钮
            attackBtn.disabled = !isPlayerTurn || !hasActionPoints || !hasValidSelection || hasMoreThanTwoCards;

            if (hasMoreThanTwoCards) {
                attackBtn.title = '选择了三张或以上牌时不能进行斗法';
                attackBtn.style.backgroundColor = '#666';
                attackBtn.style.color = '#999';
            } else if (hasTwoCards && !hasTwoCardsWithGeneration && !hasTwoSameElementCards) {
                attackBtn.title = '两张牌必须有相生关系才能进行斗法（五行阵仙可使用相同元素牌）';
                attackBtn.style.backgroundColor = '#666';
                attackBtn.style.color = '#999';
                attackBtn.disabled = true;
            } else if (hasSelectedCards && !hasValidSelection) {
                attackBtn.title = '选择的牌无法进行有效攻击（需要相同元素或相生关系）';
                attackBtn.style.backgroundColor = '';
                attackBtn.style.color = '';
            } else {
                attackBtn.title = '';
                attackBtn.style.backgroundColor = '';
                attackBtn.style.color = '';
            }
        }

        const buildBtn = document.getElementById('build-btn');
        if (buildBtn) {
            buildBtn.disabled = !isPlayerTurn || !hasActionPoints;
        }

        // 结束回合按钮已移除，改为自动结束
    }

    updatePassiveProgress() {
        // 更新玩家被动技能进度
        this.updatePlayerPassiveProgress(gameState.player, 'player-passive-progress');

        // 更新AI被动技能进度
        this.updatePlayerPassiveProgress(gameState.ai, 'ai-passive-progress');
    }

    updatePlayerPassiveProgress(player, elementId) {
        const progressEl = document.getElementById(elementId);
        if (!progressEl || !player) return;

        const cultivation = CULTIVATION_EFFECTS[player.cultivation];
        let progressText = '';

        // 窃灵天官被动进度
        if (cultivation.specialAbility === 'steal_card_passive') {
            const progress = player.passiveCounters.stealCard || 0;
            progressText = `窃灵进度: ${progress}/4`;
        }

        // 罡盾卫道者被动进度
        else if (cultivation.specialAbility === 'shield_passive') {
            if (player.shields <= 2) {
                const progress = player.passiveCounters.shieldGeneration || 0;
                progressText = `罡盾进度: ${progress}/3`;
            } else {
                progressText = `罡盾已满`;
            }
        }

        // 记仇AI进度
        if (player === gameState.ai && player.aiPersonality === AI_PERSONALITIES.VENGEFUL && player.vengefulCountdown > 0) {
            progressText += (progressText ? ' | ' : '') + `记仇: ${player.vengefulCountdown}回合`;
        }

        if (progressText) {
            progressEl.textContent = progressText;
            progressEl.classList.remove('hidden');
        } else {
            progressEl.classList.add('hidden');
        }
    }

    // 回合制战斗逻辑
    startTurn() {
        gameState.turnPhase = 'start';
        gameState.actionPoints = 1;
        gameState.skillUsedThisTurn = false; // 重置技能使用标记
        gameState.sacrificeCooldown = false; // 重置献祭冷却
        gameState.sacrificeUsedCount = 0; // 重置献祭使用次数
        gameState.recoverEnergyCooldown = false; // 重置回元调息冷却

        // 清空打出的牌区域
        this.clearPlayedCards();

        const currentPlayer = gameState.currentTurn === 'player' ? gameState.player : gameState.ai;

        // 应用建筑效果
        this.applyTurnStartBuildingEffects(currentPlayer);

        gameState.addToLog(`${gameState.currentTurn === 'player' ? '玩家' : 'AI'}的回合开始`);

        if (gameState.currentTurn === 'player') {
            // 检查玩家是否有技能点且本回合未使用技能
            if (gameState.player.skillPoints > 0 && !gameState.skillUsedThisTurn) {
                this.showSkillPrompt();
            } else {
                this.updateActionButtons();
            }
        } else {
            this.handleAITurn();
        }
    }

    applyTurnStartBuildingEffects(player) {
        // 应用天机衍道宫效果（额外行动点）
        if (player.buildings.some(b => b.type === BUILDING_TYPES.HEAVENLY_MECHANISM_PALACE)) {
            gameState.actionPoints += 1;
        }

        // 应用星象窥天楼效果（查看牌堆顶3张牌）
        if (player === gameState.player && player.buildings.some(b => b.type === BUILDING_TYPES.STAR_OBSERVATORY)) {
            this.handleStarObservatoryEffect();
        }

        // 应用灵炁汲引坛效果（自动抽牌）
        if (player.buildings.some(b => b.type === BUILDING_TYPES.SPIRIT_ABSORPTION_ALTAR)) {
            if (player.hand.length <= 3) {
                player.drawCards(1, gameState);
                gameState.addToLog(`${player === gameState.player ? '玩家' : 'AI'}的灵炁汲引坛效果触发，自动抽取1张牌`);
            }
        }

        // 应用被动技能效果
        this.applyPassiveSkillEffects(player);

        // 应用青华灵泉殿治疗效果
        this.applyQinghuaHealingEffect(player);
    }

    applyPassiveSkillEffects(player) {
        const cultivation = CULTIVATION_EFFECTS[player.cultivation];

        // 窃灵天官被动技能
        if (cultivation.specialAbility === 'steal_card_passive') {
            if (!player.passiveCounters.stealCard) {
                player.passiveCounters.stealCard = 0;
            }
            player.passiveCounters.stealCard++;

            if (player.passiveCounters.stealCard >= 4) {
                player.passiveCounters.stealCard = 0;
                this.executePassiveStealSkill(player);
            }
        }

        // 罡盾卫道者被动技能
        if (cultivation.specialAbility === 'shield_passive') {
            if (!player.passiveCounters.shieldGeneration) {
                player.passiveCounters.shieldGeneration = 0;
            }

            // 只有在罡盾小于等于2时才计数
            if (player.shields <= 2) {
                player.passiveCounters.shieldGeneration++;

                if (player.passiveCounters.shieldGeneration >= 3) {
                    player.passiveCounters.shieldGeneration = 0;

                    // 增加一层罡盾，但不超过3层
                    if (player.shields < 3) {
                        player.shields++;
                        const playerName = player === gameState.player ? '玩家' : 'AI';
                        gameState.addToLog(`${playerName}的罡盾被动技能触发，获得1层罡盾，当前罡盾：${player.shields}层`);
                        soundManager.playSound('skill');
                    }
                }
            }
        }
    }

    executePassiveStealSkill(player) {
        const target = player === gameState.player ? gameState.ai : gameState.player;

        if (target.hand.length === 0) return;

        // 随机窃取目标一张牌
        const stolenIndex = Math.floor(Math.random() * target.hand.length);
        const stolenCard = target.hand.splice(stolenIndex, 1)[0];

        if (player.hand.length < player.handLimit) {
            player.hand.push(stolenCard);
        } else {
            gameState.discardPile.push(stolenCard);
        }

        const playerName = player === gameState.player ? '玩家' : 'AI';
        const targetName = target === gameState.player ? '玩家' : 'AI';
        gameState.addToLog(`${playerName}的窃灵被动技能触发，获得了${targetName}的一张${ELEMENT_INFO[stolenCard].name}牌`);
        soundManager.playSound('skill');
    }

    applyQinghuaHealingEffect(player) {
        const qinghuaBuildings = player.buildings.filter(b => b.type === BUILDING_TYPES.QINGHUA_SPRING_HALL);

        qinghuaBuildings.forEach((building, index) => {
            const counterId = `qinghua_${index}`;
            if (!player.buildingCounters[counterId]) {
                player.buildingCounters[counterId] = 0;
            }

            player.buildingCounters[counterId]++;

            if (player.buildingCounters[counterId] >= 3) {
                player.buildingCounters[counterId] = 0;

                // 只有在未满血时才恢复
                if (player.energy < player.maxEnergy) {
                    player.energy = Math.min(player.maxEnergy, player.energy + 1);
                    const playerName = player === gameState.player ? '玩家' : 'AI';
                    gameState.addToLog(`${playerName}的青华灵泉殿效果触发，恢复1点仙元`);
                    soundManager.playSound('heal');
                }
            }
        });
    }

    handleStarObservatoryEffect() {
        if (gameState.deck.length < 3) return;

        const topCards = gameState.deck.slice(0, 3);

        // 显示选择界面
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <h3>星象窥天楼</h3>
            <p>选择1张牌加入手牌，其余2张放回牌堆底：</p>
            <div class="card-selection" id="star-card-selection">
                ${topCards.map((card, index) => `
                    <div class="card element-${card}" onclick="game.selectStarCard(${index})" data-index="${index}">
                        ${ELEMENT_INFO[card].symbol}
                    </div>
                `).join('')}
            </div>
        `;

        modal.classList.remove('hidden');
    }

    selectStarCard(cardIndex) {
        const topCards = gameState.deck.slice(0, 3);
        const selectedCard = topCards[cardIndex];

        // 移除选中的牌并加入手牌
        gameState.deck.splice(cardIndex, 1);
        gameState.player.hand.push(selectedCard);

        // 将剩余的牌放到牌堆底
        const remainingCards = gameState.deck.splice(0, 2);
        gameState.deck.push(...remainingCards);

        gameState.addToLog(`玩家通过星象窥天楼选择了${ELEMENT_INFO[selectedCard].name}牌`);

        this.hideModal();
        this.updateUI();
    }

    showSkillPrompt() {
        const cultivation = CULTIVATION_EFFECTS[gameState.player.cultivation];
        const content = `
            <h3>技能使用</h3>
            <p>你有 ${gameState.player.skillPoints} 个仙术点</p>
            <p>修仙道体：${cultivation.name}</p>
            <p>是否要在行动前使用技能？</p>
            <button id="use-skill-now" class="btn-primary">使用技能</button>
            <button id="skip-skill" class="action-btn">跳过</button>
        `;

        this.showModal(content);

        setTimeout(() => {
            const useSkillBtn = document.getElementById('use-skill-now');
            const skipSkillBtn = document.getElementById('skip-skill');

            if (useSkillBtn) {
                useSkillBtn.addEventListener('click', () => {
                    this.hideModal();
                    setTimeout(() => {
                        this.handleUseSkill();
                    }, 100);
                });
            }

            if (skipSkillBtn) {
                skipSkillBtn.addEventListener('click', () => {
                    this.hideModal();
                    setTimeout(() => {
                        this.updateActionButtons();
                    }, 100);
                });
            }
        }, 100);
    }

    handleDrawCard() {
        if (gameState.actionPoints <= 0) return;

        const player = gameState.player;
        const currentTime = Date.now();

        // 检查天机衍道宫的行动点使用间隔
        if (player.buildings.some(b => b.type === BUILDING_TYPES.HEAVENLY_MECHANISM_PALACE)) {
            if (currentTime - player.lastActionTime < 300) { // 0.3秒间隔
                alert('请等待0.3秒后再使用下一个行动点');
                return;
            }
        }

        player.drawCards(1, gameState, true); // 允许超过手牌上限
        gameState.actionPoints--;
        player.lastActionTime = currentTime; // 更新上次行动时间
        gameState.addToLog('玩家引灵，抽取1张牌');

        soundManager.playSound('cardDraw');
        this.updateUI();

        // 检查是否还有行动点
        this.checkPlayerActionPoints();
    }

    handleAttack() {
        if (gameState.actionPoints <= 0 || this.selectedCards.length === 0) return;

        const attackCards = this.selectedCards.map(index => gameState.player.hand[index]);
        const damageInfo = this.calculateDamage(attackCards, gameState.player);

        gameState.addToLog(`玩家发动攻击，使用${attackCards.map(c => ELEMENT_INFO[c].name).join('、')}`);

        soundManager.playSound('attack');

        // 添加到打出的牌区域
        this.addPlayedCards(attackCards, '玩家');

        // 移除使用的卡牌
        this.selectedCards.sort((a, b) => b - a).forEach(index => {
            gameState.player.discardCard(index, gameState);
        });
        this.clearCardSelection();

        // AI防御
        this.handleAIDefense(attackCards, damageInfo, gameState.player);

        gameState.actionPoints--;
        gameState.player.lastActionTime = Date.now(); // 更新上次行动时间
        this.updateUI();

        // 检查是否还有行动点
        this.checkPlayerActionPoints();
    }

    calculateDamage(cards, attacker) {
        let baseDamage = 0;
        const elementCounts = {};
        let isWuxingAttack = false;
        let effectiveElement = null;

        // 统计元素数量
        cards.forEach(card => {
            elementCounts[card] = (elementCounts[card] || 0) + 1;
        });

        // 检查五行合攻
        for (const [element, count] of Object.entries(elementCounts)) {
            if (count >= 1) {
                const generatedElement = ELEMENT_RELATIONS.GENERATE[element];
                if (generatedElement && elementCounts[generatedElement] >= 1) {
                    baseDamage += 2; // 五行合攻
                    isWuxingAttack = true;
                    // 在五行合攻中，只有被生成的元素（B）的加成有效
                    effectiveElement = generatedElement;
                    break;
                }
            }
        }

        // 五行阵仙特殊被动：2张相同属性牌等同于"原属性+生该属性"
        if (!isWuxingAttack && attacker.cultivation === CULTIVATION_TYPES.FIVE_ELEMENT_ARRAY) {
            for (const [element, count] of Object.entries(elementCounts)) {
                if (count >= 2) {
                    const generatedElement = ELEMENT_RELATIONS.GENERATE[element];
                    if (generatedElement) {
                        baseDamage += 2; // 五行阵仙特殊攻击
                        isWuxingAttack = true;
                        effectiveElement = generatedElement;
                        gameState.addToLog(`五行阵仙特殊被动触发！2张${ELEMENT_INFO[element].name}牌等同于${ELEMENT_INFO[element].name}+${ELEMENT_INFO[generatedElement].name}`);
                        break;
                    }
                }
            }
        }

        // 如果没有五行合攻，计算普通伤害
        if (baseDamage === 0) {
            baseDamage = cards.length; // 基础伤害：每张牌1点
        }

        return { baseDamage, isWuxingAttack, effectiveElement, cards };
    }

    calculateFinalDamage(damageInfo, attacker, finalBaseDamage) {
        const { baseDamage, isWuxingAttack, effectiveElement, cards } = damageInfo;

        // 如果基础伤害全部被抵挡，则不应用任何加成
        if (finalBaseDamage <= 0) {
            return 0;
        }

        // 应用灵根和建筑加成
        let totalDamage = finalBaseDamage;

        if (isWuxingAttack && effectiveElement) {
            // 五行合攻：只有被生成元素的加成有效
            if (attacker.damageBonus[effectiveElement]) {
                totalDamage += attacker.damageBonus[effectiveElement];
            }

            // 建筑加成（只对被生成的元素有效）
            if (attacker.buildingDamageBonus && attacker.buildingDamageBonus[effectiveElement]) {
                totalDamage += attacker.buildingDamageBonus[effectiveElement];
            }

            // 元素御仙加成（只对被生成的元素有效）
            if (attacker.selectedElement === effectiveElement) {
                totalDamage += 2;
            }

            gameState.addToLog(`五行合攻！只有${ELEMENT_INFO[effectiveElement].name}元素的加成生效`);
        } else {
            // 普通攻击：所有相关元素的加成都有效
            cards.forEach(card => {
                if (attacker.damageBonus[card]) {
                    totalDamage += attacker.damageBonus[card];
                }

                // 建筑加成
                if (attacker.buildingDamageBonus && attacker.buildingDamageBonus[card]) {
                    totalDamage += attacker.buildingDamageBonus[card];
                }

                // 元素御仙加成
                if (attacker.selectedElement === card) {
                    totalDamage += 2;
                }
            });
        }

        return totalDamage;
    }

    handleAIDefense(attackCards, damageInfo, attacker) {
        const ai = gameState.ai;
        let finalBaseDamage = damageInfo.baseDamage;

        // 检查是否有克制卡牌
        const attackElement = attackCards[0];

        // 找到克制攻击元素的防御元素
        let counterElement = null;
        for (const [defenseElement, targetElement] of Object.entries(ELEMENT_RELATIONS.OVERCOME)) {
            if (targetElement === attackElement) {
                counterElement = defenseElement;
                break;
            }
        }

        if (counterElement && ai.hand.includes(counterElement)) {
            const defenseIndex = ai.hand.indexOf(counterElement);
            ai.discardCard(defenseIndex, gameState);
            finalBaseDamage = Math.max(0, finalBaseDamage - 1);
            gameState.addToLog(`AI使用${ELEMENT_INFO[counterElement].name}防御，减少1点伤害`);
            soundManager.playSound('defend');
        }

        // 应用护盾
        if (ai.shields > 0) {
            const shieldBlocked = Math.min(ai.shields, finalBaseDamage);
            ai.shields -= shieldBlocked;
            finalBaseDamage -= shieldBlocked;
            gameState.addToLog(`AI的罡盾抵消${shieldBlocked}点伤害`);
        }

        // 计算最终伤害（包括加成）
        const finalDamage = this.calculateFinalDamage(damageInfo, attacker, finalBaseDamage);

        // 造成伤害
        if (finalDamage > 0) {
            ai.energy = Math.max(0, ai.energy - finalDamage);
            gameState.addToLog(`AI受到${finalDamage}点伤害，剩余仙元：${ai.energy}`);
            soundManager.playSound('damage');

            // 添加伤害动画效果
            const aiInfo = document.getElementById('ai-info');
            if (aiInfo) {
                aiInfo.classList.add('damage-flash');
                setTimeout(() => aiInfo.classList.remove('damage-flash'), 500);
            }

            // 触发记仇AI的记仇状态
            if (ai.aiPersonality === AI_PERSONALITIES.VENGEFUL) {
                ai.vengefulCountdown = 3;
                gameState.addToLog('AI进入记仇状态，接下来3回合将优先攻击！');
            }
        } else if (finalBaseDamage <= 0) {
            gameState.addToLog(`AI完全防御了攻击，伤害加成无效`);
        }

        // 检查游戏结束
        if (ai.energy <= 0) {
            this.endGame('player');
        }
    }

    handleAITurn() {
        // 进一步减少初始延迟，让AI行动更快
        setTimeout(() => {
            const ai = gameState.ai;

            // 添加安全检查，防止无限循环
            if (!gameState.aiTurnCount) gameState.aiTurnCount = 0;
            gameState.aiTurnCount++;

            if (gameState.aiTurnCount > 10) {
                console.warn('AI回合次数过多，强制结束回合');
                gameState.aiTurnCount = 0;
                gameState.inDefenseMode = false; // 清除防御模式
                this.endTurn();
                return;
            }

            // 检查是否在防御模式下卡住
            if (gameState.inDefenseMode && gameState.aiTurnCount > 3) {
                console.warn('AI在防御模式下卡住，强制清除防御模式');
                gameState.inDefenseMode = false;
                this.hideModal();
            }

            // 添加调试信息
            console.log('AI回合开始:', {
                actionPoints: gameState.actionPoints,
                aiHandCount: ai.hand.length,
                aiEnergy: ai.energy,
                aiSkillPoints: ai.skillPoints,
                turnCount: gameState.aiTurnCount
            });

            // 检查是否还有行动点
            if (gameState.actionPoints <= 0) {
                console.log('AI没有行动点，结束回合');
                setTimeout(() => this.endTurn(), 300); // 进一步减少延迟
                return;
            }

            // AI决策逻辑 - 每次只执行一个行动
            let actionExecuted = false;

            // 首先检查是否使用技能
            if (this.shouldAIUseSkill(ai)) {
                console.log('AI决定使用技能');
                this.executeAISkill(ai);
                actionExecuted = true;
            } else if (ai.canRecoverEnergy() && ai.energy < ai.maxEnergy / 2 && !gameState.recoverEnergyCooldown) {
                // 优先回元调息（不消耗行动点）
                console.log('AI决定回元调息');
                const recovered = ai.recoverEnergy(gameState);
                if (recovered) {
                    gameState.recoverEnergyCooldown = true;
                    setTimeout(() => {
                        gameState.recoverEnergyCooldown = false;
                    }, 300);
                }
                actionExecuted = true;
            } else if (gameState.actionPoints > 0) {
                console.log('AI进入攻击/抽牌决策');
                // AI决策：攻击还是抽牌
                const handRatio = ai.hand.length / ai.handLimit;
                const playerHandRatio = gameState.player.hand.length / gameState.player.handLimit;

                // 基础抽牌概率：手牌越多，抽牌概率越小，减少AI攻击欲望
                let drawProbability = Math.max(0.4, 1 - handRatio * 0.6); // 提高基础抽牌概率

                // 减少根据玩家手牌数量的攻击欲望调整
                const aggressionBonus = Math.max(0, (1 - playerHandRatio) * 0.2); // 减少攻击倾向加成
                drawProbability = Math.max(0.3, drawProbability - aggressionBonus); // 提高最低抽牌概率

                // 根据AI性格决定行为
                actionExecuted = this.executeAIPersonalityBehavior(ai, drawProbability);
            }

            this.updateUI();

            console.log('AI回合结束，执行了动作:', actionExecuted);

            // 只有在执行了行动后才检查是否继续
            if (actionExecuted) {
                // AI使用完一个行动点后增加1秒冷却
                ai.aiActionCooldown = Date.now() + 1000;

                // 检查是否还有行动点
                if (gameState.actionPoints <= 0) {
                    console.log('AI行动点用完，结束回合');
                    setTimeout(() => this.endTurn(), 300);
                } else {
                    // 如果还有行动点，等待冷却后继续AI回合
                    console.log('AI还有行动点，等待1秒冷却后继续回合');
                    setTimeout(() => this.handleAITurn(), 1000); // 1秒冷却
                }
            } else {
                // 如果没有执行任何行动，直接结束回合
                console.log('AI没有执行任何行动，结束回合');
                setTimeout(() => this.endTurn(), 300);
            }
        }, 300); // 进一步减少初始延迟
    }

    getAIBestAttackCombination(ai) {
        const hand = ai.hand;

        // 优先寻找相生组合
        for (let i = 0; i < hand.length; i++) {
            for (let j = i + 1; j < hand.length; j++) {
                const element1 = hand[i];
                const element2 = hand[j];

                // 检查相生关系
                if (ELEMENT_RELATIONS.GENERATE[element1] === element2 ||
                    ELEMENT_RELATIONS.GENERATE[element2] === element1) {
                    return [element1, element2];
                }
            }
        }

        // 寻找相同元素组合
        const elementCounts = {};
        hand.forEach(element => {
            elementCounts[element] = (elementCounts[element] || 0) + 1;
        });

        for (const [element, count] of Object.entries(elementCounts)) {
            if (count >= 2) {
                return [element, element];
            }
        }

        // 没有组合，使用单张牌
        if (hand.length > 0) {
            return [hand[0]];
        }
        // 如果没有手牌，返回空数组
        return [];
    }

    shouldAIUseSkill(ai) {
        // 检查AI是否有技能点且本回合未使用技能
        if (ai.skillPoints <= 0 || gameState.skillUsedThisTurn) {
            return false;
        }

        const cultivation = CULTIVATION_EFFECTS[ai.cultivation];

        switch (cultivation.specialAbility) {
            case 'mass_attack':
                // 焚天修士：检测同属性牌数量，3张以上时概率递增
                return this.shouldBurningSkyCultivatorUseSkill(ai);

            case 'blood_draw':
                // 血引道君：根据手牌数量和血量决定
                return this.shouldBloodGuideLordUseSkill(ai);

            default:
                return false;
        }
    }

    shouldBurningSkyCultivatorUseSkill(ai) {
        const elementCounts = {};
        ai.hand.forEach(card => {
            elementCounts[card] = (elementCounts[card] || 0) + 1;
        });

        let maxSameElement = Math.max(...Object.values(elementCounts));

        if (maxSameElement >= 3) {
            // 基础50%概率，每多一张增加10%
            const probability = 0.5 + (maxSameElement - 3) * 0.1;
            return Math.random() < Math.min(probability, 1.0);
        }

        return false;
    }

    shouldBloodGuideLordUseSkill(ai) {
        const handRatio = ai.hand.length / ai.handLimit;
        const energyRatio = ai.energy / ai.maxEnergy;

        // 手牌少时增加使用概率，血量低时减少使用概率
        let probability = 0.3; // 基础概率
        probability += (1 - handRatio) * 0.4; // 手牌越少，概率越高
        probability -= (1 - energyRatio) * 0.3; // 血量越低，概率越低

        return Math.random() < Math.max(0.1, Math.min(probability, 0.8));
    }

    executeAISkill(ai) {
        const cultivation = CULTIVATION_EFFECTS[ai.cultivation];

        switch (cultivation.specialAbility) {
            case 'mass_attack':
                this.executeAIMassAttackSkill(ai);
                break;

            case 'blood_draw':
                this.executeAIBloodDrawSkill(ai);
                break;
        }
    }

    executeAIStealSkill(ai) {
        if (gameState.player.hand.length === 0) return;

        // 随机窃取玩家一张牌
        const stolenIndex = Math.floor(Math.random() * gameState.player.hand.length);
        const stolenCard = gameState.player.hand.splice(stolenIndex, 1)[0];

        if (ai.hand.length < ai.handLimit) {
            ai.hand.push(stolenCard);
        } else {
            gameState.discardPile.push(stolenCard);
        }

        ai.skillPoints--;
        gameState.skillUsedThisTurn = true;
        gameState.addToLog(`AI使用窃灵技能，获得了玩家的一张${ELEMENT_INFO[stolenCard].name}牌`);
        soundManager.playSound('skill');
    }

    executeAIMassAttackSkill(ai) {
        const elementCounts = {};
        ai.hand.forEach(card => {
            elementCounts[card] = (elementCounts[card] || 0) + 1;
        });

        // 找到数量最多的元素
        let bestElement = null;
        let maxCount = 0;
        for (const [element, count] of Object.entries(elementCounts)) {
            if (count > maxCount) {
                maxCount = count;
                bestElement = element;
            }
        }

        if (bestElement && maxCount >= 3) {
            const attackCards = ai.hand.filter(card => card === bestElement);

            // 移除所有该元素的牌
            for (let i = ai.hand.length - 1; i >= 0; i--) {
                if (ai.hand[i] === bestElement) {
                    ai.discardCard(i, gameState);
                }
            }

            // 焚天技能特殊伤害计算：3张或以上时总伤害为1
            let damageInfo;
            if (attackCards.length >= 3) {
                damageInfo = { baseDamage: 1, isWuxingAttack: false, effectiveElement: bestElement, cards: attackCards };
                gameState.addToLog(`AI使用焚天技能，打出${attackCards.length}张${ELEMENT_INFO[bestElement].name}牌，总伤害1点`);
            } else {
                damageInfo = this.calculateDamage(attackCards, ai);
                gameState.addToLog(`AI使用焚天技能，打出${attackCards.length}张${ELEMENT_INFO[bestElement].name}牌`);
            }

            ai.skillPoints--;
            gameState.skillUsedThisTurn = true;
            soundManager.playSound('skill');

            // 添加到打出的牌区域
            this.addPlayedCards(attackCards, 'AI');

            // 玩家防御
            this.handlePlayerDefense(attackCards, damageInfo, ai);
        }
    }

    executeAIBloodDrawSkill(ai) {
        if (ai.energy < 2) return;

        // 消耗1点仙元，抽取2张牌
        ai.energy--;
        ai.drawCards(2, gameState, true);

        gameState.addToLog(`AI使用献祭技能，消耗1点仙元，抽取2张牌`);
        soundManager.playSound('skill');
    }

    executeAIPersonalityBehavior(ai, drawProbability) {
        console.log('AI性格:', ai.aiPersonality);

        // 如果AI性格为空，随机分配一个
        if (!ai.aiPersonality) {
            const personalities = Object.values(AI_PERSONALITIES);
            ai.aiPersonality = personalities[Math.floor(Math.random() * personalities.length)];
            console.log('AI性格为空，随机分配:', ai.aiPersonality);
        }

        // 添加安全检查，确保AI不会卡住
        try {
            switch (ai.aiPersonality) {
                case AI_PERSONALITIES.AGGRESSIVE:
                    return this.executeAggressiveAI(ai, drawProbability);
                case AI_PERSONALITIES.ELEMENT_FOCUSED:
                    return this.executeElementFocusedAI(ai, drawProbability);
                case AI_PERSONALITIES.ELEMENT_DIVERSE:
                    return this.executeElementDiverseAI(ai, drawProbability);
                case AI_PERSONALITIES.VENGEFUL:
                    return this.executeVengefulAI(ai, drawProbability);
                default:
                    return this.executeBalancedAI(ai, drawProbability);
            }
        } catch (error) {
            console.error('AI性格执行出错:', error);
            // 出错时使用平衡型AI作为后备
            return this.executeBalancedAI(ai, drawProbability);
        }
    }

    executeBalancedAI(ai, drawProbability) {
        // 平衡型AI逻辑，减少攻击欲望
        if (ai.hand.length >= ai.handLimit) {
            return this.executeAIAttack(ai, 'AI手牌已满，必须攻击');
        } else if (ai.hand.length === 0) {
            return this.executeAIDraw(ai, drawProbability);
        } else {
            // 提高抽牌概率，减少攻击欲望
            const balancedDrawProbability = Math.max(0.5, drawProbability * 1.2);
            if (Math.random() < balancedDrawProbability) {
                return this.executeAIDraw(ai, balancedDrawProbability);
            } else {
                return this.executeAIAttack(ai, 'AI平衡型选择攻击');
            }
        }
    }

    executeAggressiveAI(ai, drawProbability) {
        // 攻击型AI：手牌满时必选攻击，但整体攻击欲望减少
        if (ai.hand.length >= ai.handLimit) {
            return this.executeAIAttack(ai, 'AI手牌已满，攻击型性格必须攻击');
        } else if (ai.hand.length === 0) {
            return this.executeAIDraw(ai, drawProbability);
        } else {
            // 攻击型AI仍然倾向于攻击，但减少攻击欲望
            const aggressiveDrawProbability = Math.max(0.3, drawProbability * 0.7); // 提高抽牌概率
            if (Math.random() < aggressiveDrawProbability) {
                return this.executeAIDraw(ai, aggressiveDrawProbability);
            } else {
                return this.executeAIAttack(ai, 'AI攻击型性格选择攻击');
            }
        }
    }

    executeElementFocusedAI(ai, drawProbability) {
        // 元素专注型AI：选择重复最多的元素进行斗法
        if (ai.hand.length >= ai.handLimit) {
            return this.executeAIAttackWithMostFrequentElement(ai);
        } else if (ai.hand.length === 0 || Math.random() < drawProbability) {
            return this.executeAIDraw(ai, drawProbability);
        } else {
            return this.executeAIAttackWithMostFrequentElement(ai);
        }
    }

    executeElementDiverseAI(ai, drawProbability) {
        // 元素多样型AI：选择共同最少但不为零的元素进行斗法
        if (ai.hand.length >= ai.handLimit) {
            return this.executeAIAttackWithLeastFrequentElement(ai);
        } else if (ai.hand.length === 0 || Math.random() < drawProbability) {
            return this.executeAIDraw(ai, drawProbability);
        } else {
            return this.executeAIAttackWithLeastFrequentElement(ai);
        }
    }

    executeVengefulAI(ai, drawProbability) {
        // 记仇型AI：被攻击后连续3回合攻击，否则抽牌到手牌满，减少攻击欲望
        if (ai.vengefulCountdown > 0) {
            // 记仇状态，优先攻击但也有概率抽牌
            ai.vengefulCountdown--;
            if (ai.hand.length > 0) {
                // 即使在记仇状态，也有20%概率抽牌
                if (Math.random() < 0.2) {
                    return this.executeAIDraw(ai, 1.0);
                } else {
                    return this.executeAIAttack(ai, `AI记仇状态攻击（剩余${ai.vengefulCountdown}回合）`);
                }
            } else {
                return this.executeAIDraw(ai, 1.0); // 没牌就抽牌
            }
        } else {
            // 非记仇状态，抽牌直到手牌满，并尝试建造
            if (ai.hand.length < ai.handLimit) {
                return this.executeAIDraw(ai, 1.0);
            } else {
                // 手牌满了，优先抽牌而不是攻击
                const vengefulDrawProbability = 0.7; // 70%概率继续抽牌
                if (Math.random() < vengefulDrawProbability) {
                    return this.executeAIDraw(ai, 1.0);
                } else {
                    return this.executeAIAttack(ai, 'AI记仇型手牌满了，选择攻击');
                }
            }
        }
    }

    executeAIAttack(ai, logMessage) {
        console.log(logMessage);

        // 检查AI是否有手牌
        if (ai.hand.length === 0) {
            console.log('AI没有手牌，改为抽牌');
            return this.executeAIDraw(ai, 1.0);
        }

        const attackCards = this.getAIBestAttackCombination(ai);
        if (attackCards.length > 0) {
            const damageInfo = this.calculateDamage(attackCards, ai);

            // 移除使用的卡牌
            attackCards.forEach(card => {
                const index = ai.hand.indexOf(card);
                if (index !== -1) {
                    ai.discardCard(index, gameState);
                }
            });

            gameState.addToLog(`AI发动攻击，使用${attackCards.map(c => ELEMENT_INFO[c].name).join('、')}`);
            soundManager.playSound('attack');

            // 添加到打出的牌区域
            this.addPlayedCards(attackCards, 'AI');

            this.handlePlayerDefense(attackCards, damageInfo, ai);
            gameState.actionPoints--;
            return true;
        } else {
            // 没有有效攻击组合，改为抽牌
            console.log('AI没有有效攻击组合，改为抽牌');
            return this.executeAIDraw(ai, 1.0);
        }
    }

    executeAIDraw(ai, probability) {
        console.log('AI决定抽牌，概率:', probability);
        ai.drawCards(1, gameState);
        gameState.actionPoints--;
        gameState.addToLog('AI引灵，抽取1张牌');
        soundManager.playSound('cardDraw');
        return true;
    }

    executeAIAttackWithMostFrequentElement(ai) {
        // 找到手牌中最多的元素
        const elementCounts = {};
        ai.hand.forEach(card => {
            elementCounts[card] = (elementCounts[card] || 0) + 1;
        });

        let mostFrequentElement = null;
        let maxCount = 0;
        Object.entries(elementCounts).forEach(([element, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostFrequentElement = element;
            }
        });

        if (mostFrequentElement && maxCount > 0) {
            const attackCards = ai.hand.filter(card => card === mostFrequentElement);
            if (attackCards.length > 0) {
                const damageInfo = this.calculateDamage(attackCards, ai);

                // 移除使用的卡牌
                attackCards.forEach(card => {
                    const index = ai.hand.indexOf(card);
                    if (index !== -1) {
                        ai.discardCard(index, gameState);
                    }
                });

                gameState.addToLog(`AI元素专注型攻击，使用${attackCards.length}张${ELEMENT_INFO[mostFrequentElement].name}牌`);
                soundManager.playSound('attack');

                // 添加到打出的牌区域
                this.addPlayedCards(attackCards, 'AI');

                this.handlePlayerDefense(attackCards, damageInfo, ai);
                gameState.actionPoints--;
                return true;
            }
        }

        // 没有找到合适的元素，改为抽牌
        return this.executeAIDraw(ai, 1.0);
    }

    executeAIAttackWithLeastFrequentElement(ai) {
        // 找到手牌中最少但不为零的元素
        const elementCounts = {};
        ai.hand.forEach(card => {
            elementCounts[card] = (elementCounts[card] || 0) + 1;
        });

        let leastFrequentElement = null;
        let minCount = Infinity;
        Object.entries(elementCounts).forEach(([element, count]) => {
            if (count > 0 && count < minCount) {
                minCount = count;
                leastFrequentElement = element;
            }
        });

        if (leastFrequentElement && minCount > 0) {
            const attackCards = ai.hand.filter(card => card === leastFrequentElement);
            if (attackCards.length > 0) {
                const damageInfo = this.calculateDamage(attackCards, ai);

                // 移除使用的卡牌
                attackCards.forEach(card => {
                    const index = ai.hand.indexOf(card);
                    if (index !== -1) {
                        ai.discardCard(index, gameState);
                    }
                });

                gameState.addToLog(`AI元素多样型攻击，使用${attackCards.length}张${ELEMENT_INFO[leastFrequentElement].name}牌`);
                soundManager.playSound('attack');

                // 添加到打出的牌区域
                this.addPlayedCards(attackCards, 'AI');

                this.handlePlayerDefense(attackCards, damageInfo, ai);
                gameState.actionPoints--;
                return true;
            }
        }

        // 没有找到合适的元素，改为抽牌
        return this.executeAIDraw(ai, 1.0);
    }

    handlePlayerDefense(attackCards, damageInfo, attacker) {
        // 检查是否为两张牌的攻击
        if (attackCards.length === 2) {
            this.handleAdvancedDefense(attackCards, damageInfo, attacker);
        } else {
            // 单张牌攻击的原有逻辑
            this.handleSimpleDefense(attackCards, damageInfo, attacker);
        }
    }

    handleSimpleDefense(attackCards, damageInfo, attacker) {
        // 检查玩家是否可以防御
        const attackElement = attackCards[0];

        // 找到克制攻击元素的防御元素
        let counterElement = null;
        for (const [defenseElement, targetElement] of Object.entries(ELEMENT_RELATIONS.OVERCOME)) {
            if (targetElement === attackElement) {
                counterElement = defenseElement;
                break;
            }
        }

        if (counterElement && gameState.player.hand.includes(counterElement)) {
            this.showDefenseModal(attackCards, damageInfo, counterElement, attacker);
        } else {
            gameState.addToLog('你没有可以防御的卡牌');
            this.applyDamageToPlayer(damageInfo, attacker);
        }
    }

    handleAdvancedDefense(attackCards, damageInfo, attacker) {
        const elementA = attackCards[0];
        const elementB = attackCards[1];

        // 检查是否为五行合攻（B生A）
        let isWuxingAttack = false;
        let targetElement = null; // 被生成的元素（A）

        if (ELEMENT_RELATIONS.GENERATE[elementB] === elementA) {
            isWuxingAttack = true;
            targetElement = elementA;
        } else if (ELEMENT_RELATIONS.GENERATE[elementA] === elementB) {
            isWuxingAttack = true;
            targetElement = elementB;
        }

        if (!isWuxingAttack) {
            // 不是五行合攻，使用简单防御逻辑
            this.handleSimpleDefense(attackCards, damageInfo, attacker);
            return;
        }

        // 找到克制目标元素的防御元素C
        let elementC = null;
        for (const [defenseElement, targetEl] of Object.entries(ELEMENT_RELATIONS.OVERCOME)) {
            if (targetEl === targetElement) {
                elementC = defenseElement;
                break;
            }
        }

        if (!elementC) {
            // 没有克制元素，无法防御
            gameState.addToLog('你没有可以防御的卡牌');
            this.applyDamageToPlayer(damageInfo, attacker);
            return;
        }

        // 检查是否有C元素
        const hasElementC = gameState.player.hand.includes(elementC);

        if (!hasElementC) {
            // 没有C元素，自动不防御
            gameState.addToLog('你没有可以防御的卡牌');
            this.applyDamageToPlayer(damageInfo, attacker);
            return;
        }

        // 找到生成C元素的D元素
        let elementD = null;
        for (const [generateElement, targetEl] of Object.entries(ELEMENT_RELATIONS.GENERATE)) {
            if (targetEl === elementC) {
                elementD = generateElement;
                break;
            }
        }

        // 检查是否有D元素
        const hasElementD = elementD && gameState.player.hand.includes(elementD);

        // 五行阵仙特殊检查：拥有克制攻击的牌两张或以上时弹出高级防御选项
        const isArrayMaster = gameState.player.cultivation === CULTIVATION_TYPES.FIVE_ELEMENT_ARRAY;
        const counterElementCount = gameState.player.hand.filter(card => card === elementC).length;

        if (hasElementC && hasElementD) {
            // 有C和D元素，提供高级防御选项
            this.showAdvancedDefenseModal(attackCards, damageInfo, elementC, elementD, attacker, targetElement);
        } else if (hasElementC && isArrayMaster && counterElementCount >= 2) {
            // 五行阵仙拥有两张或以上克制牌，提供高级防御选项
            this.showAdvancedDefenseModal(attackCards, damageInfo, elementC, null, attacker, targetElement);
        } else if (hasElementC) {
            // 只有C元素，提供普通防御选项
            this.showDefenseModal(attackCards, damageInfo, elementC, attacker);
        } else {
            // 没有防御牌，直接受到伤害
            gameState.addToLog('你没有可以防御的卡牌');
            this.applyDamageToPlayer(damageInfo, attacker);
        }
    }

    applyDamageToPlayer(damageInfo, attacker) {
        let finalBaseDamage = damageInfo.baseDamage;

        // 应用护盾
        if (gameState.player.shields > 0) {
            const shieldBlocked = Math.min(gameState.player.shields, finalBaseDamage);
            gameState.player.shields -= shieldBlocked;
            finalBaseDamage -= shieldBlocked;
            gameState.addToLog(`你的罡盾抵消${shieldBlocked}点伤害`);
        }

        // 计算最终伤害（包括加成）
        const finalDamage = this.calculateFinalDamage(damageInfo, attacker, finalBaseDamage);

        if (finalDamage > 0) {
            gameState.player.energy = Math.max(0, gameState.player.energy - finalDamage);
            gameState.addToLog(`你受到${finalDamage}点伤害，剩余仙元：${gameState.player.energy}`);
            soundManager.playSound('damage');

            // 添加伤害动画效果
            const playerInfo = document.getElementById('player-info');
            if (playerInfo) {
                playerInfo.classList.add('damage-flash');
                setTimeout(() => playerInfo.classList.remove('damage-flash'), 500);
            }
        } else if (finalBaseDamage <= 0) {
            gameState.addToLog(`你完全防御了攻击，伤害加成无效`);
        }

        if (gameState.player.energy <= 0) {
            this.endGame('ai');
        }
    }

    applyDamageToPlayerWithDefense(damageInfo, attacker, finalBaseDamage) {
        // 应用护盾
        if (gameState.player.shields > 0) {
            const shieldBlocked = Math.min(gameState.player.shields, finalBaseDamage);
            gameState.player.shields -= shieldBlocked;
            finalBaseDamage -= shieldBlocked;
            gameState.addToLog(`你的罡盾抵消${shieldBlocked}点伤害`);
        }

        // 计算最终伤害（包括加成）
        const finalDamage = this.calculateFinalDamage(damageInfo, attacker, finalBaseDamage);

        if (finalDamage > 0) {
            gameState.player.energy = Math.max(0, gameState.player.energy - finalDamage);
            gameState.addToLog(`你受到${finalDamage}点伤害，剩余仙元：${gameState.player.energy}`);
            soundManager.playSound('damage');

            // 添加伤害动画效果
            const playerInfo = document.getElementById('player-info');
            if (playerInfo) {
                playerInfo.classList.add('damage-flash');
                setTimeout(() => playerInfo.classList.remove('damage-flash'), 500);
            }
        } else if (finalBaseDamage <= 0) {
            gameState.addToLog(`你完全防御了攻击，伤害加成无效`);
        }

        if (gameState.player.energy <= 0) {
            this.endGame('ai');
        }
    }

    handleBuild() {
        if (gameState.actionPoints <= 0) return;

        this.showBuildingModal();
        soundManager.playSound('build');
    }

    showBuildingModal() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <h3>选择建造的仙府</h3>
            <div class="building-options" id="building-options">
                <!-- 建筑选项将在这里生成 -->
            </div>
            <button id="cancel-build" class="btn-secondary">取消</button>
        `;

        this.renderBuildingOptions();
        modal.classList.remove('hidden');

        // 使用setTimeout确保DOM更新后再绑定事件
        setTimeout(() => {
            const cancelBtn = document.getElementById('cancel-build');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.hideModal();
                });
            }
        }, 100);
    }

    renderBuildingOptions() {
        const container = document.getElementById('building-options');
        if (!container) return;

        container.innerHTML = '';

        Object.keys(BUILDING_EFFECTS).forEach(buildingType => {
            const building = BUILDING_EFFECTS[buildingType];
            const canBuild = gameState.player.canBuildBuilding(buildingType);

            const option = document.createElement('div');
            option.className = `building-option ${canBuild ? '' : 'disabled'}`;

            let costText = '';
            if (Array.isArray(building.cost)) {
                costText = building.cost.map(element => {
                    if (element === 'any') return '任意';
                    return ELEMENT_INFO[element].name;
                }).join(' + ');
            } else {
                switch (building.cost) {
                    case 'two_pairs':
                        costText = '任意两张相同属性的牌×2（如火火土土）';
                        break;
                    case 'two_quads':
                        costText = '任意四张相同属性的牌×2（如水水水水木木木木）';
                        break;
                    case 'three_three_two':
                        costText = '三个相同的某属性灵牌×2 + 两个相同属性的灵牌×1（如木木木火火火水水）';
                        break;
                    case 'four_plus_three':
                        costText = '四个相同的属性灵牌 + 另外三个不同的属性灵牌（如火火火火金木水）';
                        break;
                }
            }

            option.innerHTML = `
                <h4>${building.name}</h4>
                <p><strong>建造成本：</strong>${costText}</p>
                <p><strong>效果：</strong>${building.description}</p>
                ${building.requirement ? `<p><strong>要求：</strong>${this.getRequirementText(building.requirement)}</p>` : ''}
                ${building.exclusive ? `<p><strong>专属：</strong>${CULTIVATION_EFFECTS[building.exclusive].name}</p>` : ''}
            `;

            if (canBuild) {
                option.addEventListener('click', () => {
                    this.confirmBuildBuilding(buildingType);
                });
            }

            container.appendChild(option);
        });
    }

    getRequirementText(requirement) {
        switch (requirement) {
            case 'hand_limit_9':
                return '灵牌上限≥9';
            case 'hand_limit_8':
                return '灵牌上限≥8';
            case 'hand_limit_7':
                return '灵牌上限≥7';
            default:
                return requirement;
        }
    }

    confirmBuildBuilding(buildingType) {
        const building = BUILDING_EFFECTS[buildingType];

        let costText = '';
        if (Array.isArray(building.cost)) {
            costText = building.cost.map(element => {
                if (element === 'any') return '任意';
                return ELEMENT_INFO[element].name;
            }).join(' + ');
        } else {
            switch (building.cost) {
                case 'two_pairs':
                    costText = '任意两张相同属性的牌×2';
                    break;
                case 'two_quads':
                    costText = '任意四张相同属性的牌×2';
                    break;
                case 'three_three_two':
                    costText = '三个相同属性×2 + 两个相同属性×1';
                    break;
                case 'four_plus_three':
                    costText = '四个相同属性 + 三个不同属性';
                    break;
            }
        }

        // 检查青华灵泉殿的特殊限制
        if (buildingType === BUILDING_TYPES.QINGHUA_SPRING_HALL) {
            const existingCount = gameState.player.buildings.filter(b => b.type === buildingType).length;
            if (existingCount >= 2) {
                alert('建造的太多了！青华灵泉殿最多只能建造2个。');
                return;
            }
        }

        if (confirm(`确定要建造${building.name}吗？\n成本：${costText}\n效果：${building.description}`)) {
            if (gameState.player.buildBuilding(buildingType, gameState)) {
                gameState.actionPoints--;
                gameState.addToLog(`玩家建造了${building.name}`);
                this.hideModal();
                this.updateUI();
                this.checkPlayerActionPoints();
            } else {
                alert('建造失败！请检查材料是否足够。');
            }
        }
    }

    handleEndTurn() {
        // 检查手牌上限
        if (gameState.player.hand.length > gameState.player.handLimit) {
            this.showDiscardModal();
            return;
        }

        this.endTurn();
    }

    endTurn() {
        // 重置AI回合计数器
        gameState.aiTurnCount = 0;

        if (gameState.currentTurn === 'player') {
            // 玩家回合结束前检查手牌上限
            this.checkHandLimit(() => {
                gameState.currentTurn = 'ai';
                this.clearCardSelection();
                this.startTurn();
            });
        } else {
            // AI回合结束，切换到玩家，并增加回合数
            gameState.currentTurn = 'player';
            gameState.roundNumber++; // 一个完整回合结束（玩家+AI）
            this.clearCardSelection();
            this.startTurn();
        }
    }

    handleDemolish() {
        if (gameState.player.buildings.length === 0) {
            alert('没有可拆解的仙府！');
            return;
        }

        this.showDemolishModal();
    }

    showDemolishModal() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <h3>选择要拆解的仙府</h3>
            <div class="demolish-options" id="demolish-options">
                <!-- 拆解选项将在这里生成 -->
            </div>
            <button id="cancel-demolish" class="btn-secondary">取消</button>
        `;

        this.renderDemolishOptions();
        modal.classList.remove('hidden');

        // 使用setTimeout确保DOM更新后再绑定事件
        setTimeout(() => {
            const cancelBtn = document.getElementById('cancel-demolish');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.hideModal();
                });
            }
        }, 100);
    }

    renderDemolishOptions() {
        const container = document.getElementById('demolish-options');
        if (!container) return;

        container.innerHTML = '';

        gameState.player.buildings.forEach((building, index) => {
            const buildingEffect = BUILDING_EFFECTS[building.type];

            const option = document.createElement('div');
            option.className = 'building-option';

            option.innerHTML = `
                <h4>${building.name}</h4>
                <p><strong>效果：</strong>${buildingEffect.description}</p>
                <button class="demolish-btn" onclick="game.confirmDemolishBuilding(${index})">拆解</button>
            `;

            container.appendChild(option);
        });
    }

    confirmDemolishBuilding(buildingIndex) {
        const building = gameState.player.buildings[buildingIndex];

        if (confirm(`确定要拆解${building.name}吗？\n拆解后将失去该仙府的所有效果。`)) {
            if (gameState.player.demolishBuilding(buildingIndex)) {
                gameState.addToLog(`玩家拆解了${building.name}`);
                this.hideModal();
                this.updateUI();
            } else {
                alert('拆解失败！');
            }
        }
    }

    handleRecoverEnergy() {
        const player = gameState.player;

        // 检查冷却状态
        if (gameState.recoverEnergyCooldown) {
            console.log('回元调息冷却中，忽略重复调用');
            return;
        }

        // 检查基本条件
        if (player.energy >= player.maxEnergy) {
            alert('仙元已满，无法回元调息');
            return;
        }

        // 对于非玄木药师，检查是否为相同元素
        if (player.cultivation !== CULTIVATION_TYPES.MYSTIC_WOOD_HEALER) {
            const selectedElements = this.selectedCards.map(index => player.hand[index]);
            if (!selectedElements.every(element => element === selectedElements[0])) {
                alert('需要选择3张相同元素的牌才能回元调息');
                return;
            }
        }

        // 立即设置冷却状态，防止重复触发
        gameState.recoverEnergyCooldown = true;

        // 弃置选中的牌
        if (player.cultivation === CULTIVATION_TYPES.MYSTIC_WOOD_HEALER) {
            // 玄木药师：弃置任意3张牌
            const cardsToDiscard = this.selectedCards.slice(0, 3);
            cardsToDiscard.sort((a, b) => b - a).forEach(index => {
                player.discardCard(index, gameState);
            });
        } else {
            // 其他道体：弃置3张相同元素的牌
            const selectedElements = this.selectedCards.map(index => player.hand[index]);
            const elementCounts = {};
            const elementIndices = {};

            selectedElements.forEach((element, i) => {
                if (!elementCounts[element]) {
                    elementCounts[element] = 0;
                    elementIndices[element] = [];
                }
                elementCounts[element]++;
                elementIndices[element].push(this.selectedCards[i]);
            });

            // 找到第一个有3张或以上的元素
            for (const [element, count] of Object.entries(elementCounts)) {
                if (count >= 3) {
                    const cardsToDiscard = elementIndices[element].slice(0, 3);
                    cardsToDiscard.sort((a, b) => b - a).forEach(index => {
                        player.discardCard(index, gameState);
                    });
                    break;
                }
            }
        }

        // 恢复1点仙元
        player.energy = Math.min(player.energy + 1, player.maxEnergy);
        gameState.addToLog(`玩家回元调息，恢复1点仙元`);
        soundManager.playSound('heal');

        this.clearCardSelection();
        this.updateUI();
        this.checkPlayerActionPoints();

        // 0.3秒后解除冷却
        setTimeout(() => {
            if (gameState.recoverEnergyCooldown) {
                gameState.recoverEnergyCooldown = false;
                this.updateActionButtons(); // 更新按钮状态
                console.log('回元调息冷却结束');
            }
        }, 300);
    }

    handleUseSkill() {
        // 防抖机制：如果正在处理技能，忽略重复调用
        if (this.processingSkill) {
            console.log('技能正在处理中，忽略重复调用');
            return;
        }

        this.processingSkill = true;

        const player = gameState.player;
        const cultivation = CULTIVATION_EFFECTS[player.cultivation];

        // 检查是否是血引道君的献祭技能
        if (player.cultivation === CULTIVATION_TYPES.BLOOD_GUIDE_LORD) {
            this.useBloodSacrificeSkill();
            // 0.5秒后重置处理标记
            setTimeout(() => {
                this.processingSkill = false;
            }, 500);
            return;
        }

        if (player.skillPoints <= 0) {
            alert('没有可用的仙术点');
            this.processingSkill = false;
            return;
        }

        switch (cultivation.specialAbility) {
            case 'mass_attack':
                this.showMassAttackSkill();
                break;
            case 'shield_generation':
                this.useShieldSkill();
                break;
            default:
                alert('该修仙道体没有主动技能');
                break;
        }

        // 0.5秒后重置处理标记
        setTimeout(() => {
            this.processingSkill = false;
        }, 500);
    }

    useBloodSacrificeSkill() {
        const player = gameState.player;

        // 检查冷却状态
        if (gameState.sacrificeCooldown) {
            console.log('献祭技能冷却中，忽略重复调用');
            return;
        }

        // 检查使用次数
        const sacrificeCount = gameState.sacrificeUsedCount || 0;
        if (sacrificeCount >= 3) {
            alert('本回合献祭次数已用完');
            return;
        }

        if (player.energy < 2) {
            alert('仙元不足，无法使用献祭技能');
            return;
        }

        // 立即设置冷却状态，防止重复触发
        gameState.sacrificeCooldown = true;

        // 消耗1点仙元
        player.energy--;
        gameState.sacrificeUsedCount = (gameState.sacrificeUsedCount || 0) + 1;

        // 抽取2张牌（不消耗行动点，忽略手牌上限）
        player.drawCards(2, gameState, true);

        gameState.addToLog(`玩家使用献祭技能，消耗1点仙元，抽取2张牌（${gameState.sacrificeUsedCount}/3）`);
        soundManager.playSound('skill');

        this.updateUI();
        this.updateActionButtons();

        // 0.3秒后解除冷却
        setTimeout(() => {
            if (gameState.sacrificeCooldown) {
                gameState.sacrificeCooldown = false;
                this.updateActionButtons(); // 更新按钮状态
                console.log('献祭技能冷却结束');
            }
        }, 300);
    }



    showMassAttackSkill() {
        const elementButtons = Object.values(ELEMENTS).map(element =>
            `<button class="element-btn" data-element="${element}">${ELEMENT_INFO[element].name}</button>`
        ).join('');

        const content = `
            <h3>焚天技能</h3>
            <p>选择要攻击的元素类型，将打出手牌中所有该元素的牌：</p>
            <div class="element-selection">
                ${elementButtons}
            </div>
            <button id="cancel-skill" class="action-btn">取消</button>
        `;

        this.showModal(content);

        setTimeout(() => {
            document.querySelectorAll('.element-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const element = btn.dataset.element;
                    this.hideModal();
                    this.useMassAttackSkill(element);
                });
            });

            const cancelBtn = document.getElementById('cancel-skill');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.hideModal();
                });
            }
        }, 100);
    }

    useMassAttackSkill(element) {
        const player = gameState.player;
        const attackCards = player.hand.filter(card => card === element);

        if (attackCards.length === 0) {
            alert(`手牌中没有${ELEMENT_INFO[element].name}元素的牌`);
            return;
        }

        if (player.skillPoints <= 0) {
            alert('没有可用的仙术点');
            return;
        }

        // 移除所有该元素的牌
        for (let i = player.hand.length - 1; i >= 0; i--) {
            if (player.hand[i] === element) {
                player.discardCard(i, gameState);
            }
        }

        // 焚天技能特殊伤害计算：3张或以上时总伤害为1
        let damageInfo;
        if (attackCards.length >= 3) {
            damageInfo = { baseDamage: 1, isWuxingAttack: false, effectiveElement: element, cards: attackCards };
            gameState.addToLog(`玩家使用焚天技能，打出${attackCards.length}张${ELEMENT_INFO[element].name}牌，总伤害1点`);
        } else {
            damageInfo = this.calculateDamage(attackCards, player);
            gameState.addToLog(`玩家使用焚天技能，打出${attackCards.length}张${ELEMENT_INFO[element].name}牌`);
        }

        player.skillPoints--;
        gameState.skillUsedThisTurn = true; // 标记本回合已使用技能
        soundManager.playSound('skill');

        // 添加到打出的牌区域
        this.addPlayedCards(attackCards, '玩家');

        // AI防御
        this.handleAIDefense(attackCards, damageInfo, player);

        this.updateUI();

        // 每回合只能使用一个技能，直接进入行动阶段
        this.updateActionButtons();
    }

    useShieldSkill() {
        const player = gameState.player;

        if (player.shields >= 3) {
            alert('罡盾已达到上限（3层）');
            return;
        }

        // 只消耗前两张选中的牌
        const cardsToDiscard = this.selectedCards.slice(0, 2);
        cardsToDiscard.sort((a, b) => b - a).forEach(index => {
            player.discardCard(index, gameState);
        });

        player.shields = Math.min(player.shields + 1, 3);
        gameState.skillUsedThisTurn = true; // 标记本回合已使用技能
        gameState.addToLog(`玩家生成1层罡盾，当前罡盾：${player.shields}层`);
        soundManager.playSound('skill');

        this.clearCardSelection();
        this.updateUI();

        // 每回合只能使用一个技能，直接进入行动阶段
        this.updateActionButtons();
    }



    endGame(winner) {
        gameState.addToLog(`游戏结束！${winner === 'player' ? '玩家' : 'AI'}获胜！`);

        // 播放胜利或失败音效
        if (winner === 'player') {
            soundManager.playSound('victory', 1.0);
        } else {
            soundManager.playSound('defeat', 1.0);
        }

        setTimeout(() => {
            this.showScreen('game-over-screen');
            const resultEl = document.getElementById('game-result');
            if (resultEl) {
                resultEl.textContent = winner === 'player' ? '恭喜获胜！' : '很遗憾败北！';
            }
        }, 2000);
    }

    // 弹窗相关方法
    showDiscardModal(callback = null) {
        const player = gameState.player;
        const excessCards = player.hand.length - player.handLimit;

        if (excessCards <= 0) {
            if (callback) callback();
            return;
        }

        let content = `<h3>选择弃置${excessCards}张牌</h3><div class="modal-hand">`;

        player.hand.forEach((element, index) => {
            content += `
                <div class="card element-${element}" data-index="${index}">
                    ${ELEMENT_INFO[element].symbol}
                </div>
            `;
        });

        content += `</div><p>已选择：<span id="selected-count">0</span>/${excessCards}</p><button id="confirm-discard" class="btn-primary" disabled>确认弃置</button>`;

        this.showModal(content);

        // 添加卡牌选择逻辑
        let selectedForDiscard = [];
        const selectedCountEl = document.getElementById('selected-count');
        const confirmBtn = document.getElementById('confirm-discard');

        document.querySelectorAll('.modal-hand .card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                if (selectedForDiscard.includes(index)) {
                    selectedForDiscard = selectedForDiscard.filter(i => i !== index);
                    card.classList.remove('selected');
                } else if (selectedForDiscard.length < excessCards) {
                    selectedForDiscard.push(index);
                    card.classList.add('selected');
                }

                // 更新选择计数和按钮状态
                selectedCountEl.textContent = selectedForDiscard.length;
                confirmBtn.disabled = selectedForDiscard.length !== excessCards;
            });
        });

        confirmBtn.addEventListener('click', () => {
            if (selectedForDiscard.length === excessCards) {
                selectedForDiscard.sort((a, b) => b - a).forEach(index => {
                    player.discardCard(index, gameState);
                });
                this.hideModal();
                this.updateUI();

                // 执行回调函数
                if (callback) {
                    callback();
                } else if (gameState.turnPhase === 'end') {
                    this.endTurn();
                }
            }
        });
    }

    showDefenseModal(attackCards, damageInfo, counterElement, attacker) {
        // 设置防御模式标记，防止在防御选择期间结束回合
        gameState.inDefenseMode = true;

        // 阻止页面其他点击事件
        document.body.style.pointerEvents = 'none';

        const content = `
            <h3>对手攻击</h3>
            <p>对手使用${attackCards.map(c => ELEMENT_INFO[c].name).join('、')}攻击</p>
            <p>你可以使用${ELEMENT_INFO[counterElement].name}进行防御</p>
            <button id="defend-btn" class="btn-primary">防御</button>
            <button id="no-defend-btn" class="action-btn">不防御</button>
        `;

        this.showModal(content);

        document.getElementById('defend-btn').addEventListener('click', () => {
            const defenseIndex = gameState.player.hand.indexOf(counterElement);
            gameState.player.discardCard(defenseIndex, gameState);
            let finalBaseDamage = Math.max(0, damageInfo.baseDamage - 1);
            gameState.addToLog(`你使用${ELEMENT_INFO[counterElement].name}防御，减少1点伤害`);
            soundManager.playSound('defend');
            this.applyDamageToPlayerWithDefense(damageInfo, attacker, finalBaseDamage);
            gameState.inDefenseMode = false; // 清除防御模式标记
            this.hideModal();
            this.updateUI();
        });

        document.getElementById('no-defend-btn').addEventListener('click', () => {
            this.applyDamageToPlayer(damageInfo, attacker);
            gameState.inDefenseMode = false; // 清除防御模式标记
            this.hideModal();
            this.updateUI();
        });
    }

    showAdvancedDefenseModal(attackCards, damageInfo, elementC, elementD, attacker, targetElement) {
        // 设置防御模式标记，防止在防御选择期间结束回合
        gameState.inDefenseMode = true;

        // 阻止页面其他点击事件
        document.body.style.pointerEvents = 'none';

        const content = `
            <h3>对手五行合攻</h3>
            <p>对手使用${attackCards.map(c => ELEMENT_INFO[c].name).join('、')}进行五行合攻！</p>
            <p>目标元素：${ELEMENT_INFO[targetElement].name}</p>
            <div class="defense-options">
                <div class="defense-option">
                    <h4>高级防御</h4>
                    <p>使用${ELEMENT_INFO[elementD].name} + ${ELEMENT_INFO[elementC].name}进行高级防御</p>
                    <p>效果：完全抵消攻击伤害</p>
                    <button id="advanced-defend-btn" class="btn-primary">高级防御</button>
                </div>
                <div class="defense-option">
                    <h4>普通防御</h4>
                    <p>使用${ELEMENT_INFO[elementC].name}进行普通防御</p>
                    <p>效果：减少1点伤害</p>
                    <button id="normal-defend-btn" class="btn-secondary">普通防御</button>
                </div>
                <div class="defense-option">
                    <h4>不防御</h4>
                    <p>承受全部伤害</p>
                    <button id="no-defend-btn" class="action-btn">不防御</button>
                </div>
            </div>
        `;

        this.showModal(content);

        // 高级防御
        document.getElementById('advanced-defend-btn').addEventListener('click', () => {
            const elementCIndex = gameState.player.hand.indexOf(elementC);
            const elementDIndex = gameState.player.hand.indexOf(elementD);

            gameState.player.discardCard(Math.max(elementCIndex, elementDIndex), gameState); // 先移除索引较大的
            gameState.player.discardCard(Math.min(elementCIndex, elementDIndex), gameState); // 再移除索引较小的

            gameState.addToLog(`你使用${ELEMENT_INFO[elementD].name} + ${ELEMENT_INFO[elementC].name}进行高级防御，完全抵消攻击！`);
            soundManager.playSound('defend');

            // 高级防御完全抵消伤害
            this.applyDamageToPlayerWithDefense(damageInfo, attacker, 0);
            gameState.inDefenseMode = false; // 清除防御模式标记
            this.hideModal();
            this.updateUI();
        });

        // 普通防御
        document.getElementById('normal-defend-btn').addEventListener('click', () => {
            const defenseIndex = gameState.player.hand.indexOf(elementC);
            gameState.player.discardCard(defenseIndex, gameState);
            let finalBaseDamage = Math.max(0, damageInfo.baseDamage - 1);
            gameState.addToLog(`你使用${ELEMENT_INFO[elementC].name}进行普通防御，减少1点伤害`);
            soundManager.playSound('defend');
            this.applyDamageToPlayerWithDefense(damageInfo, attacker, finalBaseDamage);
            gameState.inDefenseMode = false; // 清除防御模式标记
            this.hideModal();
            this.updateUI();
        });

        // 不防御
        document.getElementById('no-defend-btn').addEventListener('click', () => {
            this.applyDamageToPlayer(damageInfo, attacker);
            gameState.inDefenseMode = false; // 清除防御模式标记
            this.hideModal();
            this.updateUI();
        });
    }

    toggleSound() {
        const isEnabled = soundManager.toggle();
        const button = document.getElementById('sound-toggle');

        if (isEnabled) {
            button.textContent = '🔊';
            button.classList.remove('muted');
            button.title = '关闭音效';
        } else {
            button.textContent = '🔇';
            button.classList.add('muted');
            button.title = '开启音效';
        }
    }

    showHelpModal() {
        const content = `
            <h3>五行仙途卡牌对战 - 游戏说明</h3>
            <div class="help-content">
                <h4>游戏目标</h4>
                <p>通过斗法将对手的仙元降至0点获得胜利。</p>

                <h4>五行相生相克</h4>
                <p>相生：木→火→土→金→水→木</p>
                <p>相克：木克土、土克水、水克火、火克金、金克木</p>

                <h4>基本操作</h4>
                <ul>
                    <li><strong>引灵：</strong>抽取1张灵牌</li>
                    <li><strong>斗法：</strong>选择卡牌攻击对手</li>
                    <li><strong>筑府：</strong>建造仙府获得增益</li>
                    <li><strong>回元调息：</strong>弃置3张相同元素牌回复1点仙元</li>
                </ul>

                <h4>修仙道体</h4>
                <p>每种修仙道体都有独特的能力和特点，选择适合你的战斗风格。</p>
            </div>
            <button id="close-help" class="btn-primary">知道了</button>
        `;

        this.showModal(content);

        // 使用setTimeout确保DOM更新后再绑定事件
        setTimeout(() => {
            const closeBtn = document.getElementById('close-help');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideModal();
                });
            }
        }, 100);
    }

    showModal(content) {
        const overlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        if (overlay && modalContent) {
            modalContent.innerHTML = content;
            overlay.classList.remove('hidden');
            console.log('弹窗已显示');

            // 添加点击外部关闭功能（仅对非关键弹窗）
            if (!content.includes('开始战斗')) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.hideModal();
                    }
                });
            }
        } else {
            console.error('找不到弹窗元素', { overlay, modalContent });
        }
    }

    hideModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        gameState.inDefenseMode = false; // 清除防御模式标记
        document.body.style.pointerEvents = 'auto'; // 恢复页面点击事件
    }

    restartGame() {
        gameState = new GameState();
        this.selectedCards = [];
        this.showScreen('start-screen');
    }

    // 删除了所有抽牌动画相关方法
}

// 初始化UI控制器
const uiController = new UIController();

// 为了兼容内联事件处理器，创建全局game对象引用
window.game = uiController;
