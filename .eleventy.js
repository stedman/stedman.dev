const fs = require('fs');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const sassWatch = require('./src/_includes/sass-watch');
const filters = require('./src/_includes/filters');

/**
 * Add date properties to collections.
 *
 * @param  {object}   posts   Collection to add date properties to.
 * @return {object}           Augmented posts collection.
 */
const addFileDates = (posts) => posts.map((post) => {
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

  const mdItOptions = {
    main: {
      html: true,
      linkify: true,
      typographer: true,
    },
    anchor: {
      permalink: true,
      permalinkClass: 'anchor-link',
      permalinkSymbol: 'permalink',
      level: [2, 3, 4],
    },
  };

  // LIBRARY: markdown-it with markdown-it-anchor
  eleventyConfig.setLibrary('md', markdownIt(mdItOptions.main)
    .use(markdownItAnchor, mdItOptions.anchor));

  // PASSTHRU: Copy un-compiled files to the dist folder
  eleventyConfig.addPassthroughCopy('src/assets');
  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/CNAME');

  // COLLECTION: Create posts collection.
  eleventyConfig.addCollection('posts', async (collection) => {
    const posts = collection.getFilteredByGlob('./src/_posts/**.md');

    return addFileDates(posts);
  });

  // FILTERS
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
      'liquid',
      'njk',
      'md',
      'html',
    ],
    htmlTemplateEngine: 'liquid',
    dataTemplateEngine: 'liquid',
  };
};
