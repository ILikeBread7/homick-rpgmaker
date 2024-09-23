class HomickUtils {

  /**
   * 
   * @param {any[]} arr 
   * @param {number} start 
   * @param {function} predicate 
   * @returns number
   */
  static findIndexStartingAt(arr, start, predicate) {
    if (start < 0) {
      return -1;
    }
    for (let i = start; i < arr.length; i++) {
      if (predicate(arr[i])) {
        return i;
      }
    }
    return -1;
  }

}