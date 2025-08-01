#!/usr/bin/env node

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface BossOverview {
  id: string;
  displayName: string;
  explorerLevelRequired: number;
  maxHp: number;
  attackPower: number;
  questNote?: string;
  victoryTrophy?: { name: string; description: string };
  defeatTrophy?: { name: string; description: string };
}

/**
 * TypeScriptファイルからボスデータを抽出する関数
 * 正規表現を使用してコードを解析し、必要な値を抽出
 */
function extractBossDataFromCode(code: string, filename: string): BossOverview | null {
  try {
    // ボスデータオブジェクト（export const xxxData = { ... }）を探す
    const bossDataMatch = code.match(/export\s+const\s+\w+Data:\s*BossData\s*=\s*{([^}]+(?:{[^}]*}[^}]*)*[^}]*)}/s);
    if (!bossDataMatch) {
      console.warn(`No boss data object found in ${filename}`);
      return null;
    }
    
    const bossDataContent = bossDataMatch[1];
    
    // displayName を抽出
    const displayNameMatch = bossDataContent.match(/displayName:\s*['"`]([^'"`]+)['"`]/);
    if (!displayNameMatch) return null;
    
    // id を抽出
    const idMatch = bossDataContent.match(/id:\s*['"`]([^'"`]+)['"`]/);
    if (!idMatch) return null;
    
    // maxHp を抽出
    const maxHpMatch = bossDataContent.match(/maxHp:\s*(\d+)/);
    if (!maxHpMatch) return null;
    
    // attackPower を抽出
    const attackPowerMatch = bossDataContent.match(/attackPower:\s*(\d+)/);
    if (!attackPowerMatch) return null;
    
    // explorerLevelRequired を抽出（オプション、デフォルト1）
    const explorerLevelMatch = bossDataContent.match(/explorerLevelRequired:\s*(\d+)/);
    const explorerLevelRequired = explorerLevelMatch ? parseInt(explorerLevelMatch[1]) : 1;
    
    // questNote を抽出（オプション）- 複数行対応
    const questNoteMatch = bossDataContent.match(/questNote:\s*['"`]([^'"`]*(?:\\.[^'"`]*)*)['"`]/s);
    const questNote = questNoteMatch ? questNoteMatch[1] : undefined;
    
    // victoryTrophy を抽出（オプション）
    let victoryTrophy: { name: string; description: string } | undefined;
    const victoryTrophyMatch = bossDataContent.match(/victoryTrophy:\s*{\s*name:\s*['"`]([^'"`]+)['"`][^}]*description:\s*['"`]([^'"`]+)['"`][^}]*}/s);
    if (victoryTrophyMatch) {
      victoryTrophy = {
        name: victoryTrophyMatch[1],
        description: victoryTrophyMatch[2]
      };
    }
    
    // defeatTrophy を抽出（オプション）
    let defeatTrophy: { name: string; description: string } | undefined;
    const defeatTrophyMatch = bossDataContent.match(/defeatTrophy:\s*{\s*name:\s*['"`]([^'"`]+)['"`][^}]*description:\s*['"`]([^'"`]+)['"`][^}]*}/s);
    if (defeatTrophyMatch) {
      defeatTrophy = {
        name: defeatTrophyMatch[1],
        description: defeatTrophyMatch[2]
      };
    }
    
    return {
      id: idMatch[1],
      displayName: displayNameMatch[1],
      explorerLevelRequired,
      maxHp: parseInt(maxHpMatch[1]),
      attackPower: parseInt(attackPowerMatch[1]),
      questNote,
      victoryTrophy,
      defeatTrophy
    };
    
  } catch (error) {
    console.warn(`Error parsing ${filename}:`, error);
    return null;
  }
}

async function getAllBossData(): Promise<BossOverview[]> {
  const bossesDir = join(process.cwd(), 'src', 'game', 'data', 'bosses');
  const files = await readdir(bossesDir);
  const bossFiles = files.filter(file => file.endsWith('.ts'));
  
  const bosses: BossOverview[] = [];
  
  for (const file of bossFiles) {
    try {
      const filePath = join(bossesDir, file);
      const code = await readFile(filePath, 'utf-8');
      
      const bossData = extractBossDataFromCode(code, file);
      if (bossData) {
        bosses.push(bossData);
      }
    } catch (error) {
      console.warn(`Warning: Failed to load boss data from ${file}:`, error);
    }
  }
  
  return bosses.sort((a, b) => a.explorerLevelRequired - b.explorerLevelRequired);
}

function displayBossTable(bosses: BossOverview[], options: { detailed?: boolean; json?: boolean } = {}) {
  if (options.json) {
    console.log(JSON.stringify(bosses, null, 2));
    return;
  }
  
  console.log('\n🎮 Boss Overview - Eel RPG Game');
  console.log('═'.repeat(80));
  
  if (options.detailed) {
    bosses.forEach((boss, index) => {
      console.log(`\n${index + 1}. ${boss.displayName} (${boss.id})`);
      console.log(`   解禁レベル: ${boss.explorerLevelRequired}`);
      console.log(`   HP: ${boss.maxHp} | 攻撃力: ${boss.attackPower}`);
      if (boss.questNote) {
        console.log(`   クエスト: ${boss.questNote.substring(0, 100)}${boss.questNote.length > 100 ? '...' : ''}`);
      }
      if (boss.victoryTrophy) {
        console.log(`   勝利記念品: ${boss.victoryTrophy.name}`);
      }
      if (boss.defeatTrophy) {
        console.log(`   敗北記念品: ${boss.defeatTrophy.name}`);
      }
    });
  } else {
    // Simple table display
    console.log('\n| 解禁Lv | ボス名                    | HP  | 攻撃力 | ID                |');
    console.log('|--------|---------------------------|-----|--------|--------------------|');
    
    bosses.forEach(boss => {
      const level = boss.explorerLevelRequired.toString().padStart(6);
      const name = boss.displayName.padEnd(25);
      const hp = boss.maxHp.toString().padStart(3);
      const attack = boss.attackPower.toString().padStart(6);
      const id = boss.id.padEnd(18);
      
      console.log(`| ${level} | ${name} | ${hp} | ${attack} | ${id} |`);
    });
  }
  
  console.log('\n📊 統計情報:');
  console.log(`   総ボス数: ${bosses.length}`);
  console.log(`   HP範囲: ${Math.min(...bosses.map(b => b.maxHp))} - ${Math.max(...bosses.map(b => b.maxHp))}`);
  console.log(`   攻撃力範囲: ${Math.min(...bosses.map(b => b.attackPower))} - ${Math.max(...bosses.map(b => b.attackPower))}`);
  console.log(`   解禁レベル範囲: ${Math.min(...bosses.map(b => b.explorerLevelRequired))} - ${Math.max(...bosses.map(b => b.explorerLevelRequired))}`);
  
  // Level distribution
  const levelDistribution = bosses.reduce((acc, boss) => {
    acc[boss.explorerLevelRequired] = (acc[boss.explorerLevelRequired] || 0) + 1;
    return acc;
  }, {} as { [level: number]: number });
  
  console.log('\n📈 レベル別分布:');
  Object.entries(levelDistribution)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([level, count]) => {
      console.log(`   レベル ${level}: ${count}体`);
    });
  
  console.log('');
}

async function main() {
  const args = process.argv.slice(2);
  const options = {
    detailed: args.includes('--detailed') || args.includes('-d'),
    json: args.includes('--json') || args.includes('-j'),
  };
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run boss-overview [options]

Options:
  --detailed, -d    Show detailed information for each boss
  --json, -j        Output data in JSON format
  --help, -h        Show this help message

Examples:
  npm run boss-overview           # Show basic table
  npm run boss-overview --detailed  # Show detailed information
  npm run boss-overview --json    # Output JSON data
`);
    return;
  }
  
  try {
    const bosses = await getAllBossData();
    displayBossTable(bosses, options);
  } catch (error) {
    console.error('Error loading boss data:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);