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
};
