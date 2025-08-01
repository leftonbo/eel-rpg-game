#!/usr/bin/env node

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import * as ts from 'typescript';

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
 * TypeScript ASTを使用してボスデータを抽出する関数
 * より安全で確実な解析が可能
 */
function extractBossDataFromAST(code: string, filename: string): BossOverview | null {
  try {
    const sourceFile = ts.createSourceFile(
      filename,
      code,
      ts.ScriptTarget.Latest,
      true
    );

    let bossDataObject: ts.ObjectLiteralExpression | null = null;

    // export const xxxData: BossData = { ... } を探す
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isVariableStatement(node) && 
          node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
        
        const declaration = node.declarationList.declarations[0];
        if (declaration?.name && ts.isIdentifier(declaration.name)) {
          const name = declaration.name.text;
          if (name.endsWith('Data') && declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
            bossDataObject = declaration.initializer;
          }
        }
      }
    });

    if (!bossDataObject) {
      console.warn(`No boss data object found in ${filename}`);
      return null;
    }

    // オブジェクトのプロパティを解析
    const bossData: Partial<BossOverview> = {};
    
    bossDataObject.properties.forEach(property => {
      if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
        const propertyName = property.name.text;
        const initializer = property.initializer;

        switch (propertyName) {
          case 'id':
            if (ts.isStringLiteral(initializer)) {
              bossData.id = initializer.text;
            }
            break;
          case 'displayName':
            if (ts.isStringLiteral(initializer)) {
              bossData.displayName = initializer.text;
            }
            break;
          case 'maxHp':
            if (ts.isNumericLiteral(initializer)) {
              const value = parseInt(initializer.text, 10);
              if (!isNaN(value)) bossData.maxHp = value;
            }
            break;
          case 'attackPower':
            if (ts.isNumericLiteral(initializer)) {
              const value = parseInt(initializer.text, 10);
              if (!isNaN(value)) bossData.attackPower = value;
            }
            break;
          case 'explorerLevelRequired':
            if (ts.isNumericLiteral(initializer)) {
              const value = parseInt(initializer.text, 10);
              if (!isNaN(value)) bossData.explorerLevelRequired = value;
            }
            break;
          case 'questNote':
            if (ts.isStringLiteral(initializer)) {
              bossData.questNote = initializer.text;
            }
            break;
          case 'victoryTrophy':
            if (ts.isObjectLiteralExpression(initializer)) {
              const trophy = extractTrophyFromObject(initializer);
              if (trophy) bossData.victoryTrophy = trophy;
            }
            break;
          case 'defeatTrophy':
            if (ts.isObjectLiteralExpression(initializer)) {
              const trophy = extractTrophyFromObject(initializer);
              if (trophy) bossData.defeatTrophy = trophy;
            }
            break;
        }
      }
    });

    // 必須プロパティの確認
    if (!bossData.id || !bossData.displayName || !bossData.maxHp || !bossData.attackPower) {
      console.warn(`Missing required properties in ${filename}`);
      return null;
    }

    return {
      id: bossData.id,
      displayName: bossData.displayName,
      explorerLevelRequired: bossData.explorerLevelRequired || 0,
      maxHp: bossData.maxHp,
      attackPower: bossData.attackPower,
      questNote: bossData.questNote,
      victoryTrophy: bossData.victoryTrophy,
      defeatTrophy: bossData.defeatTrophy,
    };

  } catch (error) {
    console.warn(`Error parsing ${filename} with AST:`, error);
    return null;
  }
}

/**
 * トロフィーオブジェクトからname/descriptionを抽出する補助関数
 */
function extractTrophyFromObject(obj: ts.ObjectLiteralExpression): { name: string; description: string } | null {
  let name: string | undefined;
  let description: string | undefined;

  obj.properties.forEach(property => {
    if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
      const propertyName = property.name.text;
      const initializer = property.initializer;

      if (propertyName === 'name' && ts.isStringLiteral(initializer)) {
        name = initializer.text;
      } else if (propertyName === 'description' && ts.isStringLiteral(initializer)) {
        description = initializer.text;
      }
    }
  });

  return (name && description) ? { name, description } : null;
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
      
      const bossData = extractBossDataFromAST(code, file);
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