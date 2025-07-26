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
        // Create an include function that reads partial files
        const includeFunction = (partialPath) => {
            const fullPath = path.resolve(templatesDir, 'partials', `${partialPath}.ejs`);
            if (fs.existsSync(fullPath)) {
                return fs.readFileSync(fullPath, 'utf8');
            }
            console.warn(`Partial not found: ${fullPath}`);
            return `<!-- Partial not found: ${partialPath} -->`;
        };

        // Read the main template
        const mainTemplate = fs.readFileSync(path.resolve(templatesDir, 'index.ejs'), 'utf8');
        
        // Render the template with includes
        const rendered = ejs.render(mainTemplate, {
            htmlWebpackPlugin: {
                options: {
                    title: 'ElnalFTB - Turn-based RPG'
                }
            },
            include: includeFunction
        });

        // Write the output
        fs.writeFileSync(outputFile, rendered);
        console.log('Templates built successfully!');
        
    } catch (error) {
        console.error('Error building templates:', error);
        process.exit(1);
    }
}

buildTemplate();