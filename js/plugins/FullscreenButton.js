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
        bottom: 1px;
        right: 1px;
        padding: 2px;
        font-family: GameFont;
        font-size: 12px;
        background-color: ${normalBgColor};
        color: #fff;
        border-style: solid;
        border-width: 1px;
        border-radius: 5px;
        border-color: #d6d6d6;
        cursor: pointer;
        z-index: 1000;
    `;

    const createFullscreenButton = () => {
        const button = document.createElement('button');
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
})();
