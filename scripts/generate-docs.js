const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs-extra');
const path = require('path');
const handlebars = require('handlebars');
const dmd = require('dmd');

const srcDir = 'src';
const outputDir = 'dist/jsdoc';
const templatePath = path.join(__dirname, 'jsdoc-template.hbs');
const helperPath = path.join(__dirname, 'jsdoc-helpers.js');

// Register custom json helper (if still needed for debugging)
handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
});

// Register dmd's helpers
for (const helperName in dmd.helpers) {
    handlebars.registerHelper(helperName, dmd.helpers[helperName]);
}

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
          const mdContent = await jsdoc2md.render({ data: templateData, template: template, helper: helperPath });

          if (mdContent.trim()) {
            await fs.writeFile(outputPath, mdContent);
            console.log(`Successfully generated ${outputPath}`);
          } else {
            console.log(`No JSDoc comments or relevant definitions found in ${srcPath} after processing, skipping.`);
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