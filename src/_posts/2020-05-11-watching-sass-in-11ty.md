---
title: Watching Sass in Eleventy
meta:
  description: Automatically kick-off Sass builds in Eleventy development mode with this workflow.
tags:
  - tutorial
  - 11ty
  - sass
---

I've been using [node-sass](https://github.com/sass/node-sass) in my [11ty](https://11ty.dev/) workflow for awhile now but, for whatever reason, couldn't get the `--watch` flag to work. This meant that, for any SCSS update, I'd have to toggle back to the command line and manually run `npx node-sass src/_sass/_main.scss dist/css/main.css` or an npm script shortcut for the same.

Well, I finally had enough and came up with something that works for me. It might just work for you so I'm sharing the details here.

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
      // Watch Sass directory for styling changes.
      // Works only if you set the ELEVENTY_ENV to 'dev'.
      if (process.env.ELEVENTY_ENV === 'dev') {
        sassWatch('./src/_sass/_main.scss', './dist/css/main.css');
      }
      ..
    };
    ```

    Sharp-eyed folks will notice that the script above won't run unless there's an `ELEVENTY_ENV` environment variable set. This is to prevent sass-watch from running in production where it isn't needed and might just cause mischief.

    For local development, I set the `ELEVENTY_ENV` variable to `dev` in two places but mostly rely on the VSCode debugger for daily use.

    1. Command line: `package.json` start script:

        ```json
        "start": "ELEVENTY_ENV=dev eleventy --serve --watch"
        ```

    2. VSCode: `.vscode/launch.json` script:

        ```json
        {
          "version": "0.2.0",
          "configurations": [
            {
              "type": "node",
              "request": "launch",
              "name": "Launch 11ty",
              "program": "${workspaceFolder}/node_modules/@11ty/eleventy/cmd.js",
              "args": [
                "--serve",
                "--watch"
              ],
              "env": {
                "ELEVENTY_ENV": "dev"
              }
            }
          ]
        }
        ```

4. Start Eleventy again via command line (`npm start`) or VSCode via the Debugger, all subsequent changes to Sass files should initiate an automatic build and the browser should refresh with the changes.

## Conclusion

I sincerely hope there's a better solution for kicking-off Sass builds from file changes. If you can enlighten me, please reach out on [Twitter @stedman](https://twitter.com/stedman).

Until then, I'll be happily updating Sass and watching the changes show up in my browser.
