/*:
 * @plugindesc Adds customizable text to the title screen.
 * @author ChatGPT + I_LIKE_BREAD7 (fixes and small changes)
 *
 * @param TextContent
 * @text Text Content
 * @desc The text to display on the title screen.
 * @default Custom title screen text
 *
 * @param Position
 * @text Position
 * @type select
 * @option top
 * @option bottom
 * @desc Position of the text on the screen.
 * @default bottom
 *
 * @param Alignment
 * @text Alignment
 * @type select
 * @option left
 * @option right
 * @desc Alignment of the text.
 * @default right
 *
 * @param FontSize
 * @text Font Size
 * @type number
 * @desc Size of the text font.
 * @default 24
 * 
 * @param PaddingX
 * @text Padding left / right
 * @type number
 * @desc Size of the padding.
 * @default 0
 * 
 * @param PaddingY
 * @text Padding top / bottom
 * @type number
 * @desc Size of the padding.
 * @default 0
 *
 * @help
 * This plugin displays customizable text on the title screen.
 * You can set the text content, position (top/bottom),
 * alignment (left/right), font size and paddings via plugin parameters.
 */

(function() {
    const parameters = PluginManager.parameters('TitleScreenText');
    const textContent = String(parameters['TextContent'] || 'Custom title screen text');
    const position = String(parameters['Position'] || 'bottom').toLowerCase();
    const alignment = String(parameters['Alignment'] || 'right').toLowerCase();
    const fontSize = Number(parameters['FontSize'] || 24);
    const paddingX = Number(parameters['PaddingX'] || 0);
    const paddingY = Number(parameters['PaddingY'] || 0);

    const _Scene_Title_createForeground = Scene_Title.prototype.createForeground;
    Scene_Title.prototype.createForeground = function() {
        _Scene_Title_createForeground.call(this);
        this.drawCustomTitleText();
    };

    Scene_Title.prototype.drawCustomTitleText = function() {
        const maxWidth = Graphics.boxWidth;
        const lineHeight = fontSize + 10;
        const x = alignment === 'left' ? paddingX : -paddingX;
        const y = position === 'top' ? paddingY : Graphics.height - lineHeight - paddingY;

        const bitmap = this._gameTitleSprite.bitmap;
        bitmap.fontSize = fontSize;
        bitmap.drawText(textContent, x, y, maxWidth, lineHeight, alignment);
    };
})();
