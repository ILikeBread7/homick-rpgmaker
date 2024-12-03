/*:
 * @plugindesc Makes all choice windows use the full width of the screen.
 * 
 * @help This plugin does not provide plugin commands.
 */

(function() {

    var _Window_ChoiceList_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
    Window_ChoiceList.prototype.updatePlacement = function() {
        _Window_ChoiceList_updatePlacement.call(this);
        this.width = Graphics.boxWidth; // Ensure full width
        this.x = 0; // Align to the left edge of the screen
    };

})();
