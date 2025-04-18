//=============================================================================
// FullscreenButton.js
//=============================================================================

/*:
 * @plugindesc Adds a fullscreen button to the bottom right of the screen.
 * @author ChatGPT with my (I_LIKE_BREAD7) fixes
 *
 * @param Disable expression
 * @desc Eval expression to disable the plugin, the default disables for mobile app, to enable everywhere use false
 * @default window.cordova || window.navigator.standalone
 * 
 * @param Button text
 * @desc Text for the button
 * @default Fullscreen
 * 
 * @help This plugin adds a button to the bottom right of the screen
 * that allows players to toggle fullscreen mode in RPG Maker MV.
 * 
 * Plugin Command:
 *   FullscreenButton hide # Hides the button
 *   FullscreenButton show # Shows the button
 */

(function() {

    const parameters = PluginManager.parameters('FullscreenButton');
    const buttonText = parameters['Button text'] || '';
    const disableExpression = parameters['Disable expression'] || '';

    if (eval(disableExpression)) {
        return;
    }

    const normalBgColor = '#3689be';
    const hoverBgColor = '#0d517c';
    const buttonStyles = `
        position: absolute;
        bottom: 2px;
        right: 2px;
        padding: 2px;
        font-family: GameFont;
        width: 26px;
        height: 26px;
        background-color: ${normalBgColor};
        color: #ffffff;
        fill: #ffffff;
        border-style: solid;
        border-width: 1px;
        border-radius: 5px;
        border-color: #d6d6d6;
        cursor: pointer;
        z-index: 1000;
    `;

    let button;

    const createFullscreenButton = () => {
        button = document.createElement('button');
        button.innerHTML = buttonText;
        button.style.cssText = buttonStyles;
        
        button.onclick = () => {
            Graphics._switchFullScreen();
            button.blur();
        };

        button.onmouseover = () => {
            button.style.backgroundColor = hoverBgColor;
        };

        button.onmouseleave = () => {
            button.style.backgroundColor = normalBgColor;
        };

        document.body.appendChild(button);
    };

    // Wait until the game screen is ready, then add the button
    const _SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        _SceneManager_run.call(this, sceneClass);
        createFullscreenButton();
    };

    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'FullscreenButton') {
            if (!button) {
                return;
            }

            switch (args[0]) {
                case 'show':
                    button.style.display = '';
                break;
                case 'hide':
                    button.style.display = 'none';
                break;
            }
        }
    }

})();
