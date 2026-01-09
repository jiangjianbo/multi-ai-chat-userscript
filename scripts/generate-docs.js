const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs-extra');
const path = require('path');

const srcDir = 'src';
const outputDir = 'dist/jsdoc';

async function generateDocs() {
  try {
    // 1. 确保输出目录存在且清空
    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);

    // 2. 获取 src 目录下的所有 .js 文件
    const files = await fs.readdir(srcDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    console.log(`Found ${jsFiles.length} JavaScript files in ${srcDir}`);

    // 3. 为每个 JS 文件生成 Markdown 文档
    for (const file of jsFiles) {
      const srcPath = path.join(srcDir, file);
      const outputFilename = `${path.basename(file, '.js')}.md`;
      const outputPath = path.join(outputDir, outputFilename);

      console.log(`Generating documentation for ${srcPath}...`);

      const mdContent = await jsdoc2md.render({ files: srcPath });

      if (mdContent) {
        await fs.writeFile(outputPath, mdContent);
        console.log(`Successfully generated ${outputPath}`);
      } else {
        console.log(`No JSDoc comments found in ${srcPath}, skipping.`);
      }
    }

    console.log('Documentation generation complete.');
  } catch (error) {
    console.error('Error during documentation generation:', error);
    process.exit(1);
  }
}

generateDocs();
