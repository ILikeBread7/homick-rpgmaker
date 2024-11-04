//=============================================================================
// ILB_DefaultChoices.js
//=============================================================================

/*:
 * @plugindesc Allows you to set the default choice and remember the last chosen option
 * @author I_LIKE_BREAD7
 *
 * @param Default choice variable ID
 * @desc Variable used as the default choice value
 * @default 1
 *
 * @help This plugin allows you to set the default choice to the value of the variable passes as the parameter.
 * It also lets you save the choice chosen by the player.
 * The values start at 0, so the first option is 0, the second is 1 etc.
 * In order to use this plugin use a plugin command right before the choice you want it to apply to.
 * The commands only apply to the first choice that appears after the command is used, if you want it to apply to more choices you need to run it before every choice.
 * 
 * Plugin Command:
 *   ILB_DefaultChoices set  - sets the default choice to the variable's value
 *   ILB_DefaultChoices save - saves the selected choice to the variable
 *   ILB_DefaultChoices reset set - cancels the set plugin command
 *   ILB_DefaultChoices reset save - cancels the save plugin command
 *   ILB_DefaultChoices reset - cancels both the save and set plugin commands
 */

(function() {
    const parameters = PluginManager.parameters('ILB_DefaultChoices');
    const defaultChoiceVariableId = Number(parameters['Default choice variable ID'] || 0);
    
    const _Game_Message_setChoices = Game_Message.prototype.setChoices;
    const setChoiceFunction = function(choices, defaultType, cancelType) {
        const defaultChoiceFromVariable = $gameVariables.value(defaultChoiceVariableId);
        const defaultChoice = defaultChoiceFromVariable < 0 ? defaultType : defaultChoiceFromVariable;  // If the choice was "Cancel - Branch" revert back to using the built-in default
        _Game_Message_setChoices.call(this, choices, defaultChoice, cancelType);
        Game_Message.prototype.setChoices = _Game_Message_setChoices;
    };
    
    const _Game_Message_onChoice = Game_Message.prototype.onChoice;
    const saveChoiceFunction = function(n) {
        _Game_Message_onChoice.call(this, n);
        $gameVariables.setValue(defaultChoiceVariableId, n);
        Game_Message.prototype.onChoice = _Game_Message_onChoice;
    };

    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ILB_DefaultChoices') {
            switch (args[0]) {
                case 'set':
                    Game_Message.prototype.setChoices = setChoiceFunction;
                break;
                case 'save':
                    Game_Message.prototype.onChoice = saveChoiceFunction;
                break;
                case 'reset':
                    const resetArg = args[1];
                    if (!resetArg || resetArg === 'set') {
                        Game_Message.prototype.setChoices = _Game_Message_setChoices;
                    }
                    if (!resetArg || resetArg === 'save') {
                        Game_Message.prototype.onChoice = _Game_Message_onChoice;
                    }
                break;
            }
        }
    }

})();