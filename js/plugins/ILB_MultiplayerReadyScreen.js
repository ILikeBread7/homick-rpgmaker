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
 * @param Background picture
 * @desc The picture displayed as the background
 * 
 * @param Background tile size
 * @desc Size of the background picture tile for scrolling, 0 to not scroll
 * @default 64
 * 
 * @param Home icon picture normal
 * @desc The picture to display as the exit icon
 * @default home_icon
 * 
 * @param Home icon picture hovered
 * @desc The picture to display as the exit icon when hovered
 * @default home_icon_hovered
 * 
 * @help Plugin specifically for the game Homick Racer.
 * 
 * Plugin Command:
 *   ILB_MultiplayerReadyScreen # Starts the scene
 */

var ILB_HR = ILB_HR || {};

(function() {

    const parameters = PluginManager.parameters('ILB_MultiplayerReadyScreen');
    const numOfPlayersVarId = Number(parameters['Number of players var ID'] || 1);
    const readySoundEffect = JSON.parse(parameters['Ready sound effect'] || '{"name":"Absorb1","volume":90,"pitch":100,"pan":0}');
    const backgroundPicture = parameters['Background picture'];
    const backgroundTileSize = Number(parameters['Background tile size'] || 0);
    const homeIconNormal = parameters['Home icon picture normal'];
    const homeIconHovered = parameters['Home icon picture hovered'];

    const lineHeight = 28;
    
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

    let numOfPlayers;
    let areas;
    let playersReady;
    let readyTexts;
    let bgSprite;
    let homeSprite;
    let homeBitmapNormal;
    let homeBitmapHovered;

    let cancelled = false;

    function Window_MultiplayerReady() {
        this.initialize.apply(this, arguments);
    }

    Window_MultiplayerReady.prototype = Object.create(Window_Base.prototype);
    Window_MultiplayerReady.prototype.constructor = Window_MultiplayerReady;

    Window_MultiplayerReady.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        
        bgSprite = new Sprite();
        bgSprite.initialize(ImageManager.loadPicture(backgroundPicture));
        bgSprite.move(-backgroundTileSize, -backgroundTileSize);
        this.addChildToBack(bgSprite);

        areas.forEach((area, index) => {
            const bitmap = new Bitmap(area.w, area.h);
            bitmap.fillRect(0, 0, area.w, area.h, _COLORS[index]);
            
            const sprite = new Sprite();
            sprite.initialize(bitmap);
            sprite.opacity = 128;
            sprite.move(area.x, area.y);
            this.addChild(sprite);
        });

        readyTexts = areas.map(_mapAreaToText);
        readyTexts.forEach(text => this.addChild(text));


        homeBitmapNormal = ImageManager.loadPicture(homeIconNormal);
        homeBitmapHovered = ImageManager.loadPicture(homeIconHovered);
        homeSprite = new Sprite();
        homeSprite.initialize(homeBitmapNormal);
        this.addChild(homeSprite);
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
        cancelled = false;
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
        if (backgroundTileSize > 0) {
            bgSprite.move(
                ((bgSprite.x + 1 + backgroundTileSize) % backgroundTileSize) - backgroundTileSize,
                ((bgSprite.y + 1 + backgroundTileSize) % backgroundTileSize) - backgroundTileSize
            );
        }

        // Can't move the sprite on initialization
        // because the sprite loading is deferred
        // and its width is not known at that point.
        homeSprite.x = Graphics.boxWidth - homeSprite.width;
        
        if (TouchInput.x >= (Graphics.boxWidth - homeSprite.width) && TouchInput.y <= homeSprite.height) {
            if (TouchInput.isTriggered()) {
                cancelScene();
                return;
            }
            homeSprite.bitmap = homeBitmapHovered;
        } else {
            homeSprite.bitmap = homeBitmapNormal;
        }

        if (
            Input.isTriggered('cancel')
            || TouchInput.isCancelled()
        ) {
            cancelScene();
        }

        areas.forEach((area, index) => {
            if (Input.isTriggered(`player${index + 1}`) ||
                (TouchInput.isTriggered() && _touchInputInArea(area, TouchInput.x, TouchInput.y))
            ) {
                _triggerReady(area, index);
            }
        });

        // Player 1 can also use the ok (ENTER / SPACE/ Z) button
        if (Input.isTriggered('ok')) {
            _triggerReady(areas[0], 0);
        }

        // If all players are ready
        if (!playersReady.contains(false)) {
            this.popScene();
        }
    }

    function cancelScene() {
        cancelled = true;
        SceneManager.pop();
    }

    function _touchInputInArea(area, x, y) {
        return x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h;
    }

    function _triggerReady(area, playerIndex) {
        if (!playersReady[playerIndex]) {
            AudioManager.playSe(HomickUtils.makeSeVariedPitch(readySoundEffect));
            playersReady[playerIndex] = true;
            _drawReadyText(readyTexts[playerIndex].bitmap, playerIndex, area.w, true);
        }
    }

    function _mapAreaToText(area, index) {
        // I don't know why 7.5, but if it's 7 or lower
        // the text gets cut off.
        // The actual number of lines is 6.
        const maxHeight = Math.floor(lineHeight * 7.5);
        const offsetY = Math.floor((area.h - maxHeight) / 2);

        const bitmap = new Bitmap(area.w, maxHeight);
        _drawReadyText(bitmap, index, area.w, false);
       
        const sprite = new Sprite();
        sprite.initialize(bitmap);
        sprite.move(area.x, area.y + offsetY);

        return sprite;
    }

    function _drawReadyText(bitmap, index, width, ready) {
        bitmap.clear();
        const text =
            `Player ${index + 1}
            Press ${_PLAYER_KEYS[index]}
            or tap
            the screen.`;
        const textReadyWaiting = ready ? 'Ready!' : 'Waiting...';

        const textLines = text.split('\n');
        const linesNumber = textLines.length + 2;

        textLines
            .forEach((line, index) => bitmap.drawText(line.trim(), 0, index * lineHeight, width, lineHeight, 'center'));
        bitmap.textColor = ready ? '#66cc40' : '#ffcc20';
        bitmap.drawText(textReadyWaiting, 0, linesNumber * lineHeight, width, lineHeight, 'center');
        bitmap.textColor = '#ffffff';
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

    ILB_HR.multiplayerReadyCancelled = function() {
        return cancelled;
    }

})();