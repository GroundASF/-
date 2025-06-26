// 五行仙途卡牌对战游戏 - 简化版本

// 五行元素常量
const ELEMENTS = {
    FIRE: 'fire',
    WATER: 'water',
    WOOD: 'wood',
    METAL: 'metal',
    EARTH: 'earth'
};

// 元素中文名称和颜色
const ELEMENT_INFO = {
    [ELEMENTS.FIRE]: { name: '火', color: '#ff4757', symbol: '🔥' },
    [ELEMENTS.WATER]: { name: '水', color: '#3742fa', symbol: '💧' },
    [ELEMENTS.WOOD]: { name: '木', color: '#2ed573', symbol: '🌳' },
    [ELEMENTS.METAL]: { name: '金', color: '#ffa502', symbol: '⚔️' },
    [ELEMENTS.EARTH]: { name: '土', color: '#8b4513', symbol: '🏔️' }
};

// 修仙道体
const CULTIVATION_EFFECTS = {
    element_master: {
        name: '元素御仙',
        description: '开局选择1种属性，后续该属性成功造成伤害（未被完全防御）时，额外+1伤害'
    },
    five_element_array: {
        name: '五行阵仙',
        description: '斗法或防御时，使用2张相同属性灵牌，效果等同于「原属性+生该属性」'
    },
    blood_guide_lord: {
        name: '血引道君',
        description: '灵牌上限为7张；每个回合开始时，最多可耗3次仙元，每次耗1点，抽2张牌，（耗至1点仙元停止）'
    },
    mystic_treasury: {
        name: '玄库藏真仙',
        description: '初始灵牌2张，灵牌上限8张；初始仙元4点，仙元上限4点，可通过仙府提升；被动：每回合首次引灵时，若灵牌≤1张，则额外抽1张'
    },
    spirit_thief: {
        name: '窃灵天官',
        description: '每局拥有3个仙术点，行动前可消耗1个仙术点抽取对手1张灵牌'
    },
    mystic_wood_healer: {
        name: '玄木药师',
        description: '回元调息无需三张相同元素的牌即可达成效果；专属能力：可建造特殊建筑「青华灵泉殿」，提升仙元上限'
    },
    burning_sky_cultivator: {
        name: '焚天修士',
        description: '每局拥有三个仙术点，行动前可消耗一个仙术点将手牌中所有同属性灵牌一次性打出进行攻击，每张牌造成1点伤害。对方可以正常防御'
    },
    shield_guardian: {
        name: '罡盾卫道者',
        description: '可消耗手牌中任意两张灵牌，生成1层「罡盾」。「罡盾」可在下次受到攻击时，直接抵消1点伤害（无论是否使用克制属性防御），每层「罡盾」仅生效1次，最多可叠加3层'
    }
};

// 简化的游戏状态
let gameState = {
    currentScreen: 'start',
    player: null,
    ai: null
};

// 简化的UI控制器
class SimpleUIController {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 开始游戏按钮
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('开始游戏按钮被点击');
                this.showCultivationSelection();
            });
        }

        // 帮助按钮
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                console.log('帮助按钮被点击');
                this.showHelpModal();
            });
        }

        // 重新开始按钮
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                console.log('重新开始按钮被点击');
                this.restartGame();
            });
        }
    }

    showScreen(screenId) {
        console.log('切换到屏幕:', screenId);
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }
        gameState.currentScreen = screenId;
    }

    showCultivationSelection() {
        console.log('显示修仙道体选择');
        this.showScreen('cultivation-select-screen');
        this.renderCultivationOptions();
    }

    renderCultivationOptions() {
        const container = document.getElementById('cultivation-options');
        if (!container) return;
        
        container.innerHTML = '';

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
                console.log('选择了修仙道体:', effect.name);
                document.querySelectorAll('.cultivation-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                setTimeout(() => {
                    this.selectCultivation(type);
                }, 500);
            });

            container.appendChild(option);
        });
    }

    selectCultivation(cultivationType) {
        console.log('确认选择修仙道体:', cultivationType);
        // 这里可以添加更多逻辑
        alert('修仙道体选择成功！游戏功能正在完善中...');
    }

    showHelpModal() {
        console.log('显示帮助弹窗');
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
            </div>
            <button id="close-help" class="btn-primary">知道了</button>
        `;
        
        this.showModal(content);
        
        const closeBtn = document.getElementById('close-help');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }
    }

    showModal(content) {
        const overlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        if (overlay && modalContent) {
            modalContent.innerHTML = content;
            overlay.classList.remove('hidden');
        }
    }

    hideModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    restartGame() {
        console.log('重新开始游戏');
        gameState = {
            currentScreen: 'start',
            player: null,
            ai: null
        };
        this.showScreen('start-screen');
    }
}

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化游戏');
    const uiController = new SimpleUIController();
    console.log('游戏初始化完成');
});

console.log('JavaScript文件加载完成');
