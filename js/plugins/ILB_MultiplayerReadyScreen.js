//=============================================================================
// ILB_MultiplayerReadyScreen.js
//=============================================================================

/*:
 * @plugindesc Plugin specifically for the game Homick Racer, creates a ready screen for multiplayer mode
 * 
 * @author I_LIKE_BREAD7
 * 
 * @param Number of players var ID
 * @desc ID of the variable that keeps the number of players
 * @default 1
 * 
 * @param Ready sound effect
 * @desc The sound effect played when a player is ready
 * @default {"name":"Absorb1","volume":90,"pitch":100,"pan":0}
 * 
 * @help Plugin specifically for the game Homick Racer.
 * 
 * Plugin Command:
 *   ILB_MultiplayerReadyScreen # Starts the scene
 */

(function() {

    const parameters = PluginManager.parameters('ILB_MultiplayerReadyScreen');
    const numOfPlayersVarId = Number(parameters['Number of players var ID'] || 1);
    const readySoundEffect = JSON.parse(parameters['Ready sound effect'] || '{"name":"Absorb1","volume":90,"pitch":100,"pan":0}');

    const _COLORS = [
        '#66cc40',
        '#4387b9',
        '#8d7e1e',
        '#894e99'
    ];

    const _PLAYER_KEYS = [
        'Q',
        'P',
        'C',
        'M'
    ];

    let maxAreaWidth;
    let numOfPlayers;
    let areas;
    let playersReady;
    let readyTexts;

    function Window_MultiplayerReady() {
        this.initialize.apply(this, arguments);
    }

    Window_MultiplayerReady.prototype = Object.create(Window_Base.prototype);
    Window_MultiplayerReady.prototype.constructor = Window_MultiplayerReady;

    Window_MultiplayerReady.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        
        areas.forEach((area, index) => {
            const bitmap = new Bitmap(area.w, area.h);
            bitmap.fillRect(0, 0, area.w, area.h, _COLORS[index]);
            
            const sprite = new Sprite();
            sprite.initialize(bitmap);
            sprite.move(area.x, area.y);
            this.addChild(sprite);
        });

        readyTexts = areas.map(_mapAreaToText);
        readyTexts.forEach(text => this.addChild(text));
    };

    Window_MultiplayerReady.prototype.standardPadding = function() {
        return 0;
    }

    function Scene_MultiplayerReady() {
        this.initialize.apply(this, arguments);
    }

    Scene_MultiplayerReady.prototype = Object.create(Scene_Base.prototype);
    Scene_MultiplayerReady.prototype.constructor = Scene_MultiplayerReady;

    Scene_MultiplayerReady.prototype.initialize = function() {
        maxAreaWidth = Graphics.boxWidth / 2;
        numOfPlayers = $gameVariables.value(numOfPlayersVarId);
        areas = _getAreas(numOfPlayers);
        playersReady = areas.map(_ => false);

        Scene_Base.prototype.initialize.call(this);
    };

    Scene_MultiplayerReady.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this._window = new Window_MultiplayerReady(0, 0, Graphics.width, Graphics.height);
        this.addChild(this._window);
    };

    Scene_MultiplayerReady.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        this.updateScene();
    };

    Scene_MultiplayerReady.prototype.updateScene = function() {
        areas.forEach((area, index) => {
            if (Input.isTriggered(`player${index + 1}`) ||
                (TouchInput.isTriggered() && _touchInputInArea(area, TouchInput.x, TouchInput.y))
            ) {
                _triggerReady(index);
            }
        });

        if (Input.isTriggered('ok')) {
            _triggerReady(0);
        }

        // If all players are ready
        if (!playersReady.contains(false)) {
            this.popScene();
        }
    }

    function _touchInputInArea(area, x, y) {
        return x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h;
    }

    function _triggerReady(playerIndex) {
        if (!playersReady[playerIndex]) {
            AudioManager.playSe(readySoundEffect);
            playersReady[playerIndex] = true;
            _drawReadyText(readyTexts[playerIndex].bitmap, playerIndex, maxAreaWidth, true);
        }
    }

    function _mapAreaToText(area, index) {
        const maxHeight = Graphics.boxHeight / 2;
        const offsetY = Math.floor(area.h / 8);

        const bitmap = new Bitmap(maxAreaWidth, maxHeight);
        _drawReadyText(bitmap, index, maxAreaWidth, false);
       
        const sprite = new Sprite();
        sprite.initialize(bitmap);
        sprite.move(area.x + Math.floor((area.w - maxAreaWidth) / 2), area.y + offsetY + Math.floor((area.h - maxHeight) / 2));

        return sprite;
    }

    function _drawReadyText(bitmap, index, width, ready) {
        bitmap.clear();
        const text =
            `Player ${index + 1}
            Press ${_PLAYER_KEYS[index]}
            or tap
            the screen.

            ${ready ? 'Ready!' : 'Waiting...'}`;

        const lineHeight = 28;
        text.split('\n')
            .forEach((line, index) => bitmap.drawText(line.trim(), 0, index * lineHeight, width, lineHeight, 'center'));
    }

    function _getAreas(numOfPlayers) {
        switch (numOfPlayers) {
            case 1:
                return [ { x: 0, y: 0, w: Graphics.boxWidth, h: Graphics.boxHeight } ];
            case 2:
                return [
                    { x: 0, y: 0, w: Graphics.boxWidth / 2, h: Graphics.boxHeight },
                    { x: Graphics.boxWidth / 2, y: 0, w: Graphics.boxWidth / 2, h: Graphics.boxHeight }
                ];
            case 3:
                return [
                    { x: 0, y: 0, w: Graphics.boxWidth / 2, h: Graphics.boxHeight / 2 },
                    { x: Graphics.boxWidth / 2, y: 0, w: Graphics.boxWidth / 2, h: Graphics.boxHeight / 2 },
                    { x: 0, y: Graphics.boxHeight / 2, w: Graphics.boxWidth, h: Graphics.boxHeight / 2 },
                ]
            case 4:
                return [
                    { x: 0, y: 0, w: Graphics.boxWidth / 2, h: Graphics.boxHeight / 2 },
                    { x: Graphics.boxWidth / 2, y: 0, w: Graphics.boxWidth / 2, h: Graphics.boxHeight / 2 },
                    { x: 0, y: Graphics.boxHeight / 2, w: Graphics.boxWidth / 2, h: Graphics.boxHeight / 2 },
                    { x: Graphics.boxWidth / 2, y: Graphics.boxHeight / 2, w: Graphics.boxWidth / 2, h: Graphics.boxHeight / 2 }
                ]
        }
    }

    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ILB_MultiplayerReadyScreen') {
            SceneManager.push(Scene_MultiplayerReady);
        }
    };

})();