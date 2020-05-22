module.exports = {
  /**
   * Allow regex in replace filter. Global flag set by default,
   *
   * @param {string}  content     Content to search/replace.
   * @param {string}  rePattern   RegExp patter to use.
   * @param {string}  replacement Replacement text.
   * @return {string}             Replaced content.
   *
   */
  regexReplace: (content, rePattern, replacement) => {
    const re = new RegExp(rePattern, 'g');

    return content.replace(re, replacement);
  },
};
