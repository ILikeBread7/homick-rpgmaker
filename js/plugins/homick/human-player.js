class HumanPlayer {

  /**
   * 
   * @param {number} [playerIndex = 1] 
   */
  constructor(playerIndex = 1) {
    this._playerIndex = playerIndex;
    this._keyCode = `player${playerIndex}`;
  }

  jump() {
    return Input.isPressed(this._keyCode) ||
      (this._playerIndex === 1 && Input.isPressed('ok'));
  }

  get isHuman() {
    return true;
  }

}