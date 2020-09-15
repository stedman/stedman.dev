---
title: Watching Sass in Eleventy
meta:
  description: Automatically kick-off Sass builds in Eleventy watch mode with this workflow.
tags:
  - tutorial
  - 11ty
  - sass
---

I've been using [node-sass](https://github.com/sass/node-sass) in my [11ty](https://11ty.dev/) workflow for awhile now but haven't been able to get the `--watch` flag to work. So while Browsersync automatically refreshes the browser for content and template changes, I needed to manually rebuild the Sass files and refresh the browser.

Well, I finally had enough and hacked a solution that works for me. It might just work for you so I'm sharing the details here.

> UPDATE (2020-09-15): I recently came across an [Egghead tutorial on Sass compiling](https://egghead.io/lessons/11ty-add-sass-compiling-and-watch-for-changes-in-eleventy-11ty) that may have a better solution. They are using pure [Sass](https://www.npmjs.com/package/sass) instead of the `node-sass` (LibSass wrapper) package that I've been using. I will test this approach soon and post an update here.

1. Make sure `node-sass` is installed.

    ```shell
    npm install --save-dev node-sass
    ```

2. Open a new file, name it `_includes/sass-watch.js`, and drop in the following code.

    ```js
    const fs = require('fs');
    const path = require('path');
    const sass = require('node-sass');

    // Generate and save CSS.
    const generateCss = (_scssPath, _cssPath) => {
      // Encapsulate rendered css from _scssPath into renderedCss variable
      const renderedCss = sass.renderSync({ file: _scssPath });

      // Then write result css string to _cssPath file
      fs.writeFile(_cssPath, renderedCss.css.toString(), (writeErr) => {
        if (writeErr) throw writeErr;

        console.log(`CSS file saved: ${_cssPath}`);
      });
    };

    module.exports = (scssPath, cssPath) => {
      // If cssPath directory doesn't already exist, add it...
      if (!fs.existsSync(path.dirname(cssPath))) {
        console.log(`Creating new CSS directory: ${path.dirname(cssPath)}/`);

        // Create cssPath directory recursively
        fs.mkdir(path.dirname(cssPath), { recursive: true }, (mkdirErr) => {
          if (mkdirErr) throw mkdirErr;

          console.log('CSS directory created.');

          generateCss(scssPath, cssPath);
        });
      }

      // Generate CSS on startup
      generateCss(scssPath, cssPath);

      // Use Node's fs.watch to catch subsequent changes to scssPath directory
      fs.watch(path.dirname(scssPath), (evType, filename) => {
        console.log(`SCSS file changed: ${path.dirname(scssPath)}/${filename}`);

        generateCss(scssPath, cssPath);
      });
    };
    ```

3. Edit `.eleventy.js` so that it now includes the following `sass-watch` bits.

    ```js
    const sassWatch = require('./_includes/sass-watch');

    module.exports = function (eleventyConfig) {
      // Works only in watch mode.
      if (process.argv.includes('--watch')) {
         // Watch Sass directory for styling changes.
        sassWatch('./src/_sass/_main.scss', './dist/css/main.css');
        // Refresh the browser when Sass changes.
        eleventyConfig.addWatchTarget('./src/_sass/');
      }
      ..
    };
    ```

    Sharp-eyed folks will notice that `sassWatch` only runs when the `--watch` flag is present in the process arguments—that is, when we run `node eleventy --serve --watch`. This prevents sass-watch from running in production where it isn't needed and might just cause mischief.

    > UPDATE (2020-09-15): To simplify things, I stopped adding and using the `ELEVENTY_ENV` environment flag. Relying on the already present `--watch` argument removed a few extra steps.

    The config for the command line and VSCode is no different from the standard setup:

    * Command line: `package.json` start script:

        ```json
        "start": "eleventy --serve --watch"
        ```

    * VSCode: `.vscode/launch.json` script:

        ```json
        {
          "version": "0.2.0",
          "configurations": [
            {
              "type": "node",
              "request": "launch",
              "name": "Launch 11ty",
              "cwd": "${workspaceFolder}",
              "runtimeExecutable": "npm",
              "runtimeArgs": ["start"],
            }
          ]
        }
        ```

4. Start Eleventy again via command line (`npm start`) or VSCode via the Debugger, all subsequent changes to Sass files should initiate an automatic build and the browser should refresh with the changes.

## Conclusion

I sincerely hope there's a better solution for kicking-off Sass builds on file change events. If you know of a better way, please reach out on [Twitter @stedman](https://twitter.com/stedman).

Until then, I'll be happily updating Sass and watching the changes show up in my browser.
