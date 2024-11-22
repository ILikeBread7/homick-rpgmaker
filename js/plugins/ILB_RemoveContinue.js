//=============================================================================
// ILB_OptionsMatchWidth.js
//=============================================================================

/*:
 * @plugindesc Removes the continue option from the title screen
 * @author I_LIKE_BREAD7
 *
 * @help This plugin does not provide plugin commands.
 */

(function() {

    const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _Window_TitleCommand_makeCommandList.call(this);
        this._list = this._list.filter(command => command.symbol !== 'continue');
    };
    
})();