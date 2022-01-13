class Utils {

  /**
   * 
   * @param {any[]} arr 
   * @param {number} start 
   * @param {function} predicate 
   * @returns number
   */
  static findIndexStartingAt(arr, start, predicate) {
    for (let i = start; i < arr.length; i++) {
      if (predicate(arr[i])) {
        return i;
      }
    }
    return -1;
  }

}