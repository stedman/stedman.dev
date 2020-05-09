module.exports = {
  /**
   * Formate date to MMMM D, YYYY
   *
   * @param  {object}   dateToFilter  Date object
   *
   * @return {string}   Formatted date string.
   */
  fullDate: (dateToFilter) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const newDate = new Date(dateToFilter);

    return `${monthNames[newDate.getMonth()]} ${newDate.getDate()}, ${newDate.getFullYear()}`;
  },

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
