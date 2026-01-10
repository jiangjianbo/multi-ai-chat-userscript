const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs-extra');
const path = require('path');
const handlebars = require('handlebars');

// Decode HTML entities
function decodeHtml(html) {
    const entities = {
        '&apos;': "'", '&#39;': "'", '&#x27;': "'",
        '&quot;': '"', '&#34;': '"',
        '&lt;': '<', '&#60;': '<',
        '&gt;': '>', '&#62;': '>',
        '&amp;': '&', '&#38;': '&'
    };
    return html.replace(/&[A-Za-z0-9#]+;/g, match => entities[match] || match);
}

const srcDir = 'src';
const outputDir = 'dist/jsdoc';
const templatePath = path.join(__dirname, 'jsdoc-template.hbs');

// Register simple 'eq' helper for comparison
handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

async function generateDocs() {
    try {
        const template = await fs.readFile(templatePath, 'utf8');
        await fs.ensureDir(outputDir);
        await fs.emptyDir(outputDir);

        const files = await fs.readdir(srcDir);
        const jsFiles = files.filter(file => file.endsWith('.js'));

        console.log(`Found ${jsFiles.length} JavaScript files in ${srcDir}`);

        for (const file of jsFiles) {
            const srcPath = path.join(srcDir, file);
            const outputFilename = `${path.basename(file, '.js')}.md`;
            const outputPath = path.join(outputDir, outputFilename);

            console.log(`Generating documentation for ${srcPath}...`);

            try {
                const templateData = await jsdoc2md.getTemplateData({ files: srcPath });

                if (templateData && templateData.length > 0) {
                    const mdContent = await jsdoc2md.render({ data: templateData, template: template });

                    if (mdContent.trim()) {
                        await fs.writeFile(outputPath, decodeHtml(mdContent));
                        console.log(`Successfully generated ${outputPath}`);
                    } else {
                        console.log(`No JSDoc comments found in ${srcPath}, skipping.`);
                    }
                } else {
                    console.log(`No JSDoc comments found in ${srcPath}, skipping.`);
                }
            } catch (error) {
                console.error(`Error processing ${srcPath}:`, error);
            }
        }

        console.log('Documentation generation complete.');
    } catch (error) {
        console.error('Error during documentation generation:', error);
        process.exit(1);
    }
}

generateDocs();
