//=============================================================================
// ILB_TitleCommandTextAlign.js
//=============================================================================

/*:
 * @plugindesc Allows customization of the title screen command text alignment.
 * @author I_LIKE_BREAD7
 * 
 * @param Text Alignment
 * @text Text Alignment
 * @type select
 * @option Left
 * @value left
 * @option Center
 * @value center
 * @option Right
 * @value right
 * @default center
 * 
 * @help
 * This plugin lets you set the alignment of the title screen command text 
 * (e.g., "New Game", "Continue", "Options").
 */

(function() {

    const parameters = PluginManager.parameters('TitleCommandTextAlign');
    const textAlign = parameters['Text Alignment'] || 'center';

    Window_TitleCommand.prototype.itemTextAlign = function() {
        return textAlign;
    };

})();
