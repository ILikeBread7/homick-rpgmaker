//=============================================================================
// ILB_SelectableTextAlign.js
//=============================================================================

/*:
 * @plugindesc Allows customization of the text alignment for the choice window.
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
 * @default left
 * 
 * @help
 * This plugin customizes the alignment of text for choices in the "Show Choices" event command, the title screen etc.
 */

(function() {

    const parameters = PluginManager.parameters('ILB_SelectableTextAlign');
    const textAlign = parameters['Text Alignment'] || 'left';

    Window_ChoiceList.prototype.itemRectForText = function(index) {
        const rect = this.itemRect(index);
        rect.x += this.textPadding();
        rect.width -= this.textPadding() * 2;

        const text = Window_Base.prototype.convertEscapeCharacters(this.commandName(index));
        if (textAlign === 'center') {
            rect.x += (rect.width - this.textWidth(text)) / 2;
        } else if (textAlign === 'right') {
            rect.x += rect.width - this.textWidth(text);
        }

        return rect;
    };

})();
