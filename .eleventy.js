const fs = require('fs');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const filters = require('./src/_includes/filters');

module.exports = function (eleventyConfig) {
  // PLUGIN: PrismJS
  eleventyConfig.addPlugin(syntaxHighlight);

  // PASSTHRU: Copy un-compiled files to the dist folder
  eleventyConfig.addPassthroughCopy('src/assets');
  eleventyConfig.addPassthroughCopy('src/robots.txt');

  // COLLECTION: Create posts collection.
  eleventyConfig.addCollection('posts', async (collection) => {
    const posts = collection.getFilteredByGlob('./src/_posts/**.md');
    const statPromise = (fileUrl) => new Promise((resolve, reject) => {
      fs.stat(
        fileUrl,
        (err, stats) => {
          if (err) reject(err);

          resolve(stats.mtime);
        },
      );
    });

    // Add file lastModified property
    for (let idx = 0; idx < posts.length; idx += 1) {
      const post = posts[idx];

      // eslint-disable-next-line no-await-in-loop
      post.lastModified = await statPromise(post.inputPath);
    }

    return posts;
  });

  // FILTERS
  eleventyConfig.addFilter('fullDate', filters.fullDate);

  // TRANSFORM: Add appropriate TARGET and REL to external links.
  eleventyConfig.addTransform('external-link-rel', (content) => {
    const desired = {
      className: 'external-link',
      target: 'target="_blank"',
      rel: 'rel="nofollow noopener noreferrer"',
    };
    // Find all external links--lazily we'll assume those start with https.
    const reLinkMatch = /<a .*?href="https?:\/\/[^"]+".*?>/g;
    // Find class, target, and rel attributes.
    const reClass = /.*class="([^"]+)".*/;
    const reTarget = /.*target="([^"]+)".*/;
    const reRel = /.*rel="([^"]+)".*/;

    return content.replace(reLinkMatch, (linkMatch) => {
      const classMatch = linkMatch.match(reClass);
      let newLink = linkMatch;

      if (classMatch) {
        newLink = linkMatch.replace(classMatch[1], `${classMatch[1]} ${desired.className}`);
      } else {
        newLink = linkMatch.replace('<a ', `<a class="${desired.className}" `);
      }

      const hasTarget = reTarget.test(newLink);

      if (hasTarget && reRel.test(newLink)) {
        // If target and rel already exist, assume it was done right.
        return newLink;
      } if (hasTarget) {
        return newLink.replace('>', ` ${desired.rel}>`);
      }

      return newLink.replace('>', ` ${desired.target} ${desired.rel}>`);
    });
  });

  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: './_includes',
      layouts: './_layouts',
      data: './_data',
    },
    templateFormats: [
      'html',
      'njk',
      'md',
      'liquid',
    ],
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
  };
};
