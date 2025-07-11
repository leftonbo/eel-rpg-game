import { StatusEffectManager, StatusEffectType } from '../systems/StatusEffect';

export interface PlayerItem {
    name: string;
    count: number;
    description: string;
    use: (player: Player) => boolean;
}

export class Player {
    public name: string = 'エルナル';
    public maxHp: number = 100;
    public hp: number = 100;
    public baseAttackPower: number = 5;
    public statusEffects: StatusEffectManager = new StatusEffectManager();
    public items: Map<string, PlayerItem> = new Map();
    public isDefending: boolean = false;
    public struggleAttempts: number = 0; // For restrain escape probability
    
    constructor() {
        this.initializeItems();
    }
    
    private initializeItems(): void {
        // Healing Potion
        this.items.set('heal-potion', {
            name: '回復薬',
            count: 9,
            description: 'HPを50%回復し、状態異常を解除する',
            use: (_player: Player) => {
                if (this.items.get('heal-potion')!.count <= 0) return false;
                
                // Heal 50% of max HP
                const healAmount = Math.floor(this.maxHp * 0.5);
                this.heal(healAmount);
                
                // Remove all negative status effects except knocked out, restrained, and eaten
                const effectsToRemove = [
                    StatusEffectType.Fire,
                    StatusEffectType.Charm,
                    StatusEffectType.Slow,
                    StatusEffectType.Poison
                ];
                
                effectsToRemove.forEach(effect => {
                    this.statusEffects.removeEffect(effect);
                });
                
                this.items.get('heal-potion')!.count--;
                return true;
            }
        });
        
        // Adrenaline Shot
        this.items.set('adrenaline', {
            name: 'アドレナリン注射',
            count: 3,
            description: '次のターンまで無敵になる',
            use: (_player: Player) => {
                if (this.items.get('adrenaline')!.count <= 0) return false;
                
                this.statusEffects.addEffect(StatusEffectType.Invincible);
                this.items.get('adrenaline')!.count--;
                return true;
            }
        });
    }
    
    getAttackPower(): number {
        const modifier = this.statusEffects.getAttackModifier();
        return Math.floor(this.baseAttackPower * modifier);
    }
    
    takeDamage(amount: number): number {
        if (amount <= 0) return 0;
        
        const modifier = this.statusEffects.getDamageModifier();
        const actualDamage = Math.floor(amount * modifier);
        
        this.hp = Math.max(0, this.hp - actualDamage);
        
        // If HP reaches 0, apply knocked out status
        if (this.hp === 0 && !this.statusEffects.hasEffect(StatusEffectType.KnockedOut)) {
            this.statusEffects.addEffect(StatusEffectType.KnockedOut);
        }
        
        return actualDamage;
    }
    
    heal(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        
        // If healed from 0, remove knocked out status
        if (oldHp === 0 && this.hp > 0) {
            this.statusEffects.removeEffect(StatusEffectType.KnockedOut);
        }
        
        return this.hp - oldHp;
    }
    
    defend(): void {
        this.isDefending = true;
        this.statusEffects.addEffect(StatusEffectType.Defending);
    }
    
    useItem(itemName: string): boolean {
        const item = this.items.get(itemName);
        if (!item || item.count <= 0) return false;
        
        return item.use(this);
    }
    
    attemptStruggle(): boolean {
        if (!this.statusEffects.isRestrained() && !this.statusEffects.isEaten()) {
            return false;
        }
        
        this.struggleAttempts++;
        
        // Base success rate starts at 30% and increases by 20% each attempt
        let baseSuccessRate = 0.3 + (this.struggleAttempts - 1) * 0.2;
        baseSuccessRate = Math.min(baseSuccessRate, 0.9); // Cap at 90%
        
        // Apply charm modifier
        const modifier = this.statusEffects.getStruggleModifier();
        const finalSuccessRate = baseSuccessRate * modifier;
        
        const success = Math.random() < finalSuccessRate;
        
        if (success) {
            // Reset struggle attempts
            this.struggleAttempts = 0;
            
            // Remove restrained or eaten status
            this.statusEffects.removeEffect(StatusEffectType.Restrained);
            this.statusEffects.removeEffect(StatusEffectType.Eaten);
            
            return true;
        }
        
        return false;
    }
    
    stayStill(): void {
        // Staying still provides a small amount of healing
        const healAmount = Math.floor(this.maxHp * 0.05); // 5% of max HP
        this.heal(healAmount);
    }
    
    loseMaxHp(amount: number): void {
        this.maxHp = Math.max(0, this.maxHp - amount);
        
        // If current HP exceeds new max HP, reduce it
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }
    
    recoverFromKnockOut(): string[] {
        const messages: string[] = [];
        
        if (this.statusEffects.hasEffect(StatusEffectType.KnockedOut)) {
            // Check if knock out duration is over
            const knockOutEffect = this.statusEffects.getEffect(StatusEffectType.KnockedOut);
            if (knockOutEffect && knockOutEffect.duration <= 0) {
                this.statusEffects.removeEffect(StatusEffectType.KnockedOut);
                
                // Recover 50% HP
                const healAmount = Math.floor(this.maxHp * 0.5);
                this.heal(healAmount);
                
                messages.push('エルナルが意識を取り戻した！');
                messages.push(`HPが${healAmount}回復した！`);
            }
        }
        
        return messages;
    }
    
    canAct(): boolean {
        return this.statusEffects.canAct();
    }
    
    isRestrained(): boolean {
        return this.statusEffects.isRestrained();
    }
    
    isEaten(): boolean {
        return this.statusEffects.isEaten();
    }
    
    isKnockedOut(): boolean {
        return this.statusEffects.isKnockedOut();
    }
    
    isDead(): boolean {
        return this.maxHp <= 0;
    }
    
    startTurn(): string[] {
        // Reset defending status
        this.isDefending = false;
        
        // Apply status effects and get messages
        const effectMessages = this.statusEffects.applyEffects(this);
        
        // Check for knock out recovery and get messages
        const recoveryMessages = this.recoverFromKnockOut();
        
        return [...effectMessages, ...recoveryMessages];
    }
    
    endTurn(): string[] {
        // Decrease status effect durations and get messages
        return this.statusEffects.decreaseDurations(this);
    }
    
    getHpPercentage(): number {
        return this.maxHp > 0 ? (this.hp / this.maxHp) * 100 : 0;
    }
    
    getItemCount(itemName: string): number {
        const item = this.items.get(itemName);
        return item ? item.count : 0;
    }
    
    getStatusEffectsList(): string[] {
        return this.statusEffects.getAllEffects().map(effect => effect.name);
    }
}