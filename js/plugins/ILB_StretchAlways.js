//=============================================================================
// ILB_StretchAlways.js
//=============================================================================

/*:
 * @plugindesc Makes the game canvas always stretch (or always not stretch, dpending on the parameter)
 *
 * @author I_LIKE_BREAD7
 *
 * @param Stretch mode
 * @type boolean
 * @on YES
 * @off NO
 * @desc Use this to enable or disable canvas stretching
 * OFF - false     ON - true
 * @default true
 * 
 * @help This plugin does not provide plugin commands.
 */

(function() {

    const parameters = PluginManager.parameters('ILB_StretchAlways');
    const stretchMode = JSON.parse(parameters['Stretch mode']);

    Graphics._defaultStretchMode = function() {
        return stretchMode;
    }

})();