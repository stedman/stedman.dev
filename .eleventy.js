const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // PASSTHRU: Copy the `assets` directory to the compiled site folder
  eleventyConfig.addPassthroughCopy('src/assets');

  // PLUGIN: PrismJS
  eleventyConfig.addPlugin(syntaxHighlight);

  // COLLECTION: Create meetup posts collection.
  // eslint-disable-next-line arrow-body-style
  eleventyConfig.addCollection('posts', (collection) => {
    // Reverse the collection (to LIFO)
    // so collections.posts[0] is always the upcoming|latest meetup.
    return collection.getFilteredByGlob('./src/posts/**.md').reverse();
  });

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
      data: './_data'
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
