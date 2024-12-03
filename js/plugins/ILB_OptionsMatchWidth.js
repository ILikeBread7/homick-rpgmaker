//=============================================================================
// ILB_OptionsMatchWidth.js
//=============================================================================

/*:
 * @plugindesc Matches the width of the options window to the width of the screen
 * @author I_LIKE_BREAD7
 *
 * @param Padding
 * @desc Padding from the edge of the screen (on each side)
 * @default 10
 * 
 * @param Background
 * @desc The background type. 0: Normal, 1: Dim, 2: Transparent
 * @default 0
 *
 * @help This plugin does not provide plugin commands.
 */

(function() {
    const parameters = PluginManager.parameters('ILB_OptionsMatchWidth');
    const padding = Number(parameters['Padding'] || 0);
    const background = Number(parameters['Background'] || 0);

    Window_Options.prototype.windowWidth = function() {
        return Graphics.boxWidth;
    };

    var _Window_Options_updatePlacement = Window_Options.prototype.updatePlacement;
    Window_Options.prototype.updatePlacement = function() {
        _Window_Options_updatePlacement.call(this);
        this.setBackgroundType(background);
    };
})();