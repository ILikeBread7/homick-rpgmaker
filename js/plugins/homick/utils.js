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

  /**
   * 
   * @param { { name: string, volume: number, pitch: number, pan: number } } se 
   * @returns 
   */
  static makeSeVariedPitch(se) {
    return {
      name: se.name,
      volume: se.volume,
      pitch: se.pitch * (0.95 + Math.random() * 0.1),
      pan: se.pan
    };
  }

}