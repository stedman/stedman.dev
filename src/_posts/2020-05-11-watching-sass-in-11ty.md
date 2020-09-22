---
title: Watching Sass in Eleventy
meta:
  description: Automatically kick-off Sass builds in Eleventy watch mode with this workflow.
tags:
  - tutorial
  - 11ty
  - sass
---

I've been using [node-sass](https://github.com/sass/node-sass) in my [11ty](https://11ty.dev/) workflow for awhile now but haven't been able to get the `--watch` flag to work to my satisfaction. For instance, while Browsersync automatically refreshes the browser for content and template changes, it didn't rebuild my Sass files and then refresh the browser.

Well, I finally had enough of the manual labor and found [a Mathieu Huot solution](https://dev.to/mathieuhuot/processing-sass-with-11ty-5a09) that sorta worked for me. I made a few tweaks that I hope he doesn't mind:

* I don't have a lot of Sass files to process and my render times were in the 125ms range. So I chose the simplicity of a synchronous process instead of a promise-based one. Bonus: I get to skip a dependency (`fs-extra`).
* Rather than introduce an environment variable (e.g., `dev`) to toggle the start of this script (and prevent it running it in production), I look for the `--watch` process argument. It's present when Eleventy is fired up in dev mode: `node eleventy --serve --watch`.

> UPDATE (2020-09-15): I recently came across an [Egghead tutorial on Sass compiling](https://egghead.io/lessons/11ty-add-sass-compiling-and-watch-for-changes-in-eleventy-11ty) that may work better for you.

## Let's go

1. Make sure `node-sass` is installed.

    ```shell
    npm install --save-dev node-sass
    ```

2. Open a new file, name it `_includes/sass-watch.js`, and drop in the following code.

    ```js
    const fs = require('fs');
    const path = require('path');
    const sass = require('node-sass');

    /**
     * Render and save the Sass to CSS.
     * @param  {string}  sassPath     The Sass input path.
     * @param  {string}  cssFilePath  The CSS output file path.
     */
    const buildCss = (sassPath, cssFilePath) => {
      // Render CSS from Sass source path.
      const rendered = sass.renderSync({ file: sassPath });
      // Save CSS to output path.
      fs.writeFile(cssFilePath, rendered.css.toString(), (writeErr) => {
        if (writeErr) throw writeErr;
        console.log(`CSS file saved: ${cssFilePath} (in ${rendered.stats.duration}ms)`);
      });
    };

    /**
     * Initialize and watch Sass for changes requiring a build.
     * @param  {string}  sassPath     The Sass input path.
     * @param  {string}  cssFilePath  The CSS output file path.
     */
    module.exports = (sassPath, cssFilePath) => {
      // If CSS output directory doesn't already exist, make it.
      if (!fs.existsSync(path.dirname(cssFilePath))) {
        console.log(`Creating new CSS directory: ${path.dirname(cssFilePath)}/`);
        // Create output directory.
        fs.mkdir(path.dirname(cssFilePath), { recursive: true }, (mkdirErr) => {
          if (mkdirErr) throw mkdirErr;
          console.log('CSS directory created.');
        });
      }
      // Build CSS on startup.
      buildCss(sassPath, cssFilePath);
      // Watch for changes to Sass directory.
      fs.watch(path.dirname(sassPath), (evType, filename) => {
        console.log(`SCSS file changed: ${path.dirname(sassPath)}/${filename}`);
        // Rebuild the CSS.
        buildCss(sassPath, cssFilePath);
      });
    };
    ```

3. Edit `.eleventy.js` so that it now includes the following `sass-watch` bits.

    ```js
    const sassWatch = require('./_includes/sass-watch');

    module.exports = function (eleventyConfig) {
      // Run only when 11ty is in watch mode.
      if (process.argv.includes('--watch')) {
         // Watch Sass directory for updates.
        sassWatch('./src/_sass/_main.scss', './dist/css/main.css');
        // Refresh the browser when there are updates in the Sass directory.
        eleventyConfig.addWatchTarget('./src/_sass/');
      }
      ..
    };
    ```

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
