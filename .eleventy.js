const fs = require('fs');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const sassWatch = require('./lib/sass-watch');
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
  // Watch Sass directory for styling changes.
  // Works only in dev mode. Though it throws and error and then continues on.
  if (process.env.ELEVENTY_ENV === 'dev') {
    sassWatch('./src/_sass/_main.scss', './dist/assets/css/main.css');
  }

  // PLUGIN: PrismJS
  eleventyConfig.addPlugin(syntaxHighlight);
  // PLUGIN: RSS feed
  eleventyConfig.addPlugin(pluginRss);

  const options = {
    mdit: {
      html: true,
      linkify: true,
      typographer: true,
    },
    mdita: {
      permalink: true,
      permalinkClass: 'anchor-link',
      permalinkSymbol: 'permalink',
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
  eleventyConfig.addFilter('regexReplace', filters.regexReplace);

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
