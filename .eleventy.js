const fs = require('fs');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const filters = require('./src/_includes/filters');

/**
 * Add date properties to collections.
 *
 * @param  {object}   posts   Collection to add date properties to.
 * @return {object}           Augmented posts collection.
 */
const addData = (posts) => posts.map((post) => {
  const stat = fs.statSync(post.inputPath) || {};

  post.dateCreated = stat.birthtime;
  post.dateModified = stat.mtime;

  return post;
});

module.exports = function (eleventyConfig) {
  // PLUGIN: PrismJS
  eleventyConfig.addPlugin(syntaxHighlight);

  const options = {
    mdit: {
      html: true,
      linkify: true,
      typographer: true,
    },
    mdita: {
      permalink: true,
      permalinkClass: 'anchor-link',
      permalinkSymbol: '<i class="is-sr-only">permalink</i><svg viewBox="0 0 512 512"><path d="M459.7 233.4L369 324c-49.8 50-131 50-181 0-7.8-8-14-16.8-19.3-26l42-42c2-2 4.5-3.2 7-4.5 2.8 10 8 19.3 15.7 27 25 25 65.5 25 90.5 0l90.4-90.4c25-24.8 25-65.4 0-90.4s-65.6-25-90.5 0l-32.3 32.2c-26-10-54.3-13-81.7-9l68.6-68.4c50-50 131-50 181 0s50 131 0 181zM220.3 382.2L188 414.4c-24.8 25-65.4 25-90.4 0s-25-65.6 0-90.5l90.5-90.6c25-25 65.7-25 90.6 0 7.8 7.8 13 17.2 15.8 27 2.4-1.3 4.8-2.4 6.8-4.4l42-42c-5.3-9.2-11.5-18-19.3-26-50-50-131.2-50-181 0l-90.6 90.6c-50 50-50 131 0 181s131 50 181 0l68.6-68.5c-27.4 4-55.6 1.3-81.7-8.8z"/></svg>',
      level: [2, 3, 4],
    },
  };

  // LIBRARY: markdown-it with markdown-it-anchor
  eleventyConfig.setLibrary('md', markdownIt(options.mdit)
    .use(markdownItAnchor, options.mdita));

  // PASSTHRU: Copy un-compiled files to the dist folder
  eleventyConfig.addPassthroughCopy('src/assets');
  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/CNAME');

  // COLLECTION: Create posts collection.
  eleventyConfig.addCollection('posts', async (collection) => {
    const posts = collection.getFilteredByGlob('./src/_posts/**.md');

    return addData(posts);
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
