import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.resolve(__dirname, '../src/templates');
const outputFile = path.resolve(__dirname, '../src/index.html');

async function buildTemplate() {
    try {
        // Render the template with EJS renderFile function for proper include support
        const rendered = await ejs.renderFile(path.resolve(templatesDir, 'index.ejs'), {
            htmlWebpackPlugin: {
                options: {
                    title: 'ElnalFTB - Turn-based RPG'
                }
            }
        }, {
            views: [
                path.resolve(templatesDir, 'partials'),
                path.resolve(templatesDir, 'components')
            ],
            encoding: 'utf8'
        });

        // Add header comment to indicate this is an auto-generated file
        const headerComment = `<!-- 
  このファイルは自動生成されます
  元ファイル: src/templates/index.ejs
  生成スクリプト: scripts/build-templates.js
  手動編集しないでください
-->
`;
        
        // Write the output with UTF-8 encoding
        fs.writeFileSync(outputFile, headerComment + rendered, 'utf8');
        console.log('Templates built successfully!');
        
    } catch (error) {
        console.error('Error building templates:', error);
        process.exit(1);
    }
}

buildTemplate();