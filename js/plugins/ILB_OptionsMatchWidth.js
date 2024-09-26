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
 * @help This plugin does not provide plugin commands.
 */

(function() {
    const parameters = PluginManager.parameters('ILB_OptionsMatchWidth');
    const padding = Number(parameters['Padding'] || 0);
    
    Window_Options.prototype.windowWidth = function() {
        return Graphics.boxWidth - 2 * padding;
    };
})();