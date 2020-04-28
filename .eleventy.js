module.exports = (eleventyConfig) => {
  // PASSTHRU: Copy the `assets` directory to the compiled site folder
  eleventyConfig.addPassthroughCopy('assets');

  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: '../_includes',
      layouts: '../_layouts',
      data: '../_data'
    },
    templateFormats: [
      'njk',
      'liquid',
      'md',
      'html',
    ],
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
  };
};
