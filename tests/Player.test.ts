import { Player } from '../src/game/entities/Player';
import { AbilityType } from '../src/game/systems/AbilitySystem';
import { StatusEffectType } from '../src/game/systems/StatusEffect';
import * as PlayerConstants from '../src/game/entities/PlayerConstants';

describe('Player', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player();
        player.lateInitialize();
    });

    describe('基本機能', () => {
        test('プレイヤーが正しく初期化される', () => {
            expect(player.name).toBe(PlayerConstants.DEFAULT_PLAYER_NAME);
            expect(player.icon).toBe(PlayerConstants.DEFAULT_PLAYER_ICON);
            expect(player.baseMaxHp).toBe(PlayerConstants.BASE_MAX_HP);
            expect(player.baseMaxMp).toBe(PlayerConstants.BASE_MAX_MP);
            expect(player.baseAttackPower).toBe(PlayerConstants.BASE_ATTACK_POWER);
        });

        test('プレイヤー情報を更新できる', () => {
            const newName = 'テストプレイヤー';
            const newIcon = '🧪';
            
            player.updatePlayerInfo(newName, newIcon);
            
            expect(player.name).toBe(newName);
            expect(player.icon).toBe(newIcon);
            expect(player.displayName).toBe(newName);
        });
    });

    describe('ステータス計算', () => {
        test('基本攻撃力が正しく計算される', () => {
            const expectedAttackPower = PlayerConstants.BASE_ATTACK_POWER;
            expect(player.getAttackPower()).toBeGreaterThanOrEqual(expectedAttackPower);
        });

        test('HPが正しく回復する', () => {
            player.hp = 50;
            const healAmount = 30;
            const actualHeal = player.heal(healAmount);
            
            expect(actualHeal).toBe(healAmount);
            expect(player.hp).toBe(80);
        });

        test('HP回復上限チェック', () => {
            player.hp = 90;
            const healAmount = 30;
            const actualHeal = player.heal(healAmount);
            
            expect(actualHeal).toBe(10); // 100 - 90 = 10
            expect(player.hp).toBe(100);
        });
    });

    describe('経験値とレベルアップ', () => {
        test('経験値を追加できる', () => {
            const result = player.addExperience(AbilityType.Combat, 100);
            
            expect(result.newLevel).toBeGreaterThanOrEqual(0);
            expect(typeof result.leveledUp).toBe('boolean');
        });

        test('戦闘経験値を追加できる', () => {
            const damage = 50;
            
            expect(() => {
                player.addCombatExperience(damage);
            }).not.toThrow();
        });
    });

    describe('装備システム', () => {
        test('装備情報を取得できる', () => {
            const equipmentInfo = player.getEquipmentInfo();
            
            expect(equipmentInfo).toHaveProperty('weapon');
            expect(equipmentInfo).toHaveProperty('armor');
        });

        test('利用可能な武器を取得できる', () => {
            const weapons = player.getAvailableWeapons();
            
            expect(Array.isArray(weapons)).toBe(true);
            expect(weapons.length).toBeGreaterThan(0);
        });

        test('利用可能な防具を取得できる', () => {
            const armors = player.getAvailableArmors();
            
            expect(Array.isArray(armors)).toBe(true);
            expect(armors.length).toBeGreaterThan(0);
        });
    });

    describe('スキルシステム', () => {
        test('アンロック済みスキルを取得できる', () => {
            const skills = player.getUnlockedSkills();
            
            expect(Array.isArray(skills)).toBe(true);
        });

        test('利用可能なスキルを取得できる', () => {
            const availableSkills = player.getAvailableSkills();
            
            expect(Array.isArray(availableSkills)).toBe(true);
        });

        test('アンロック済みパッシブスキルを取得できる', () => {
            const passiveSkills = player.getUnlockedPassiveSkills();
            
            expect(Array.isArray(passiveSkills)).toBe(true);
        });
    });

    describe('バトルアクション', () => {
        test('防御できる', () => {
            expect(player.isDefending).toBe(false);
            
            player.defend();
            
            expect(player.isDefending).toBe(true);
        });

        test('もがく行動を実行できる', () => {
            // 拘束状態を設定
            player.statusEffects.addEffect(StatusEffectType.Restrained);
            
            const result = player.attemptStruggle();
            
            expect(typeof result).toBe('boolean');
        });

        test('じっとする行動を実行できる', () => {
            const initialHp = player.hp;
            const initialMp = player.mp;
            
            player.stayStill();
            
            // HPまたはMPが回復しているはず
            expect(player.hp >= initialHp || player.mp >= initialMp).toBe(true);
        });
    });

    describe('ターン管理', () => {
        test('ターン開始処理が実行できる', () => {
            player.isDefending = true;
            
            player.startTurn();
            
            expect(player.isDefending).toBe(false);
        });

        test('ラウンド終了処理が実行できる', () => {
            const messages = player.processRoundEnd();
            
            expect(Array.isArray(messages)).toBe(true);
        });
    });

    describe('進行管理', () => {
        test('探索者レベルを取得できる', () => {
            const explorerLevel = player.getExplorerLevel();
            
            expect(typeof explorerLevel).toBe('number');
            expect(explorerLevel).toBeGreaterThanOrEqual(0);
        });

        test('アクセス可能な地形を取得できる', () => {
            const terrains = player.getAccessibleTerrains();
            
            expect(Array.isArray(terrains)).toBe(true);
            expect(terrains.length).toBeGreaterThan(0);
        });

        test('アビリティレベル情報を取得できる', () => {
            const abilityLevels = player.getAbilityLevels();
            
            expect(typeof abilityLevels).toBe('object');
            expect(Object.keys(abilityLevels).length).toBeGreaterThan(0);
        });
    });

    describe('アイテム管理', () => {
        test('アイテム数を取得できる', () => {
            const count = player.getItemCount('heal-potion');
            
            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });

    describe('状態管理', () => {
        test('敗北状態をチェックできる', () => {
            const isDefeated = player.isDefeated();
            
            expect(typeof isDefeated).toBe('boolean');
        });

        test('状態異常リストを取得できる', () => {
            const statusEffects = player.getStatusEffectsList();
            
            expect(Array.isArray(statusEffects)).toBe(true);
        });

        test('防御ダメージカット判定ができる', () => {
            const shouldCut = player.shouldCutDefendDamage();
            
            expect(typeof shouldCut).toBe('boolean');
        });
    });

    describe('バトル状態リセット', () => {
        test('バトル状態をリセットできる', () => {
            player.struggleAttempts = 5;
            player.isDefending = true;
            
            player.resetBattleState();
            
            expect(player.struggleAttempts).toBe(0);
            expect(player.isDefending).toBe(false);
        });
    });

    describe('ステータス再計算', () => {
        test('ステータスを再計算できる', () => {
            expect(() => {
                player.recalculateStats();
            }).not.toThrow();
            
            expect(player.maxHp).toBeGreaterThan(0);
        });
    });
});