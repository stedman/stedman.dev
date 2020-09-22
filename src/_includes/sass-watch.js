const fs = require('fs');
const path = require('path');
const sass = require('node-sass');

/**
 * Render and save the Sass to CSS.
 *
 * @param  {string}  sassPath     The Sass input path.
 * @param  {string}  cssFilePath  The CSS output file path.
 *
 */
const buildCss = (sassPath, cssFilePath) => {
  // Render CSS from Sass source path.
  const rendered = sass.renderSync({ file: sassPath });

  // Save CSS to output path.
  fs.writeFile(cssFilePath, rendered.css.toString(), (writeErr) => {
    if (writeErr) throw writeErr;

    // eslint-disable-next-line no-console
    console.log(`CSS file saved: ${cssFilePath} (in ${rendered.stats.duration}ms)`);
  });
};

/**
 * Initialize and watch Sass for changes requiring a build.
 *
 * @param  {string}  sassPath     The Sass input path.
 * @param  {string}  cssFilePath  The CSS output file path.
 */
module.exports = (sassPath, cssFilePath) => {
  // If CSS output directory doesn't already exist, make it.
  if (!fs.existsSync(path.dirname(cssFilePath))) {
    // eslint-disable-next-line no-console
    console.log(`Creating new CSS directory: ${path.dirname(cssFilePath)}/`);

    // Create output directory.
    fs.mkdir(path.dirname(cssFilePath), { recursive: true }, (mkdirErr) => {
      if (mkdirErr) throw mkdirErr;

      // eslint-disable-next-line no-console
      console.log('CSS directory created.');
    });
  }

  // Build CSS on startup.
  buildCss(sassPath, cssFilePath);

  // Watch for changes to Sass directory.
  fs.watch(path.dirname(sassPath), (evType, filename) => {
    // eslint-disable-next-line no-console
    console.log(`SCSS file changed: ${path.dirname(sassPath)}/${filename}`);

    // Rebuild the CSS.
    buildCss(sassPath, cssFilePath);
  });
};
