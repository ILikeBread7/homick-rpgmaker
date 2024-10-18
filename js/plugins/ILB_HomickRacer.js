//=============================================================================
// ILB_HomickRacer.js
//=============================================================================

/*:
 * @plugindesc Plugin for the Homick Racer game
 * @author I_LIKE_BREAD7
 * 
 * @param Start common event ID
 * @desc ID of the common event used when the game is started (0 if not used)
 * @default 1
 * 
 * @param Pause common event ID
 * @desc ID of the common event used when the game is paused (0 if not used)
 * @default 2
 * 
 * @param Result variable ID
 * @desc ID of the variable used to store the result of the race (0 if not used)
 * @default 1
 *
 * @help This plugin does not provide plugin commands.
 */

var ILB_HR = ILB_HR || {};

(function() {
    const parameters = PluginManager.parameters('ILB_HomickRacer');
    const startCommonEventId = Number(parameters['Start common event ID'] || 0);
    const pauseCommonEventId = Number(parameters['Pause common event ID'] || 0);
    const resultVarId = Number(parameters['Result variable ID'] || 0);

    const SINGLEPLAYER_MODE = 0;
    const MULTIPLAYER_MODE = 1;
    const ENDLESS_MODE = 2;

    [
        'global-constants.js',
        'utils.js',
        'human-player.js',
        'simple-ai.js',
        'homick.js',
        'obstacles.js',
        'race.js',
        'main.js'
    ].forEach(loadScript);

    // Key mappings for multiplayer
    Input.keyMapper[81] = 'player1'; // Q
    Input.keyMapper[80] = 'player2'; // P
    Input.keyMapper[67] = 'player3'; // C
    Input.keyMapper[77] = 'player4'; // M

    let startFunction;
    let race;
    let previousTime;
    let resultSet = false;
    let mode;
    let window;

    // Spriteset to handle pictures in common events
    function Spriteset_Homick() {
        this.initialize.apply(this, arguments);
    }
    
    Spriteset_Homick.prototype = Object.create(Spriteset_Base.prototype);
    Spriteset_Homick.prototype.constructor = Spriteset_Homick;
    
    Spriteset_Homick.prototype.initialize = function() {
        Spriteset_Base.prototype.initialize.call(this);
    };
    
    Spriteset_Homick.prototype.createBaseSprite = function() {
        this._baseSprite = new Sprite();
        this._baseSprite.setFrame(0, 0, this.width, this.height);
        this.addChild(this._baseSprite);
    };

    function Window_HomickRacer() {
        this.initialize.apply(this, arguments);
    }

    Window_HomickRacer.prototype = Object.create(Window_Base.prototype);
    Window_HomickRacer.prototype.constructor = Window_HomickRacer;

    Window_HomickRacer.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        // this._bgSprite = new Sprite();
        // this._bgSprite.initialize(ImageManager.loadBitmapFromPath(bgImagePath));
        // this.addChildToBack(this._bgSprite);

        if (resultVarId) {
            $gameVariables.setValue(resultVarId, 0);
            resultSet = false;
        }

        window = this;
        race = startFunction(window);
        previousTime = Date.now();
    };

    Window_HomickRacer.prototype.refresh = function() {
        this.contents.clear();
        race.draw();
    };

    Window_HomickRacer.prototype.standardPadding = function() {
        return 0;
    }

    function Scene_HomickRacer() {
        this.initialize.apply(this, arguments);
    }

    Scene_HomickRacer.prototype = Object.create(Scene_Base.prototype);
    Scene_HomickRacer.prototype.constructor = Scene_HomickRacer;

    Scene_HomickRacer.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._interpreter = null;
    };

    Scene_HomickRacer.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this._window = new Window_HomickRacer(0, 0, Graphics.width, Graphics.height);
        this.addChild(this._window);
        this._messageWindow = new Window_Message();
        this.addChild(this._messageWindow);
        this._messageWindow.subWindows().forEach(function(window) {
            this.addChild(window);
        }, this);
        this.createSpriteset();
        if (startCommonEventId) {
            this.playCommonEvent(startCommonEventId);
        }
    };

    Scene_HomickRacer.prototype.createSpriteset = function() {
        this._spriteset = new Spriteset_Homick();
        this.addChild(this._spriteset);
    };

    Scene_HomickRacer.prototype.update = function() {
        Scene_Base.prototype.update.call(this);

        const now = Date.now();
        
        if (!this.updateInterpreter()) {
            const deltaTime = now - previousTime;
            race.update(deltaTime);
        }

        $gameScreen.update();
        this._window.refresh();
        previousTime = now;

        if (resultVarId && !resultSet && race.isFinished) {
            $gameVariables.setValue(resultVarId, race.playerScore);
            resultSet = true;
        }

        if (pauseCommonEventId && Input.isTriggered('cancel')) {
            this.playCommonEvent(pauseCommonEventId);
        }

        if (
            race.isFinished &&
            (Input.isTriggered('ok') || Input.isTriggered('player1') || Input.isTriggered('player2') || Input.isTriggered('player3') || Input.isTriggered('player4'))
        ) {
            this.popScene();
        }
    };

    Scene_HomickRacer.prototype.playCommonEvent = function(commonEventId) {
        var commonEvent = $dataCommonEvents[commonEventId];
        this._interpreter = new Game_Interpreter();
        this._interpreter.setup(commonEvent.list);
    }

    /**
     * @returns True if the interpreter kepps running, false otherwise
     */
    Scene_HomickRacer.prototype.updateInterpreter = function() {
        if (this._interpreter) {
            if (this._interpreter.isRunning()) {
                this._interpreter.update();
            }
            if (!this._interpreter.isRunning()) {
                this._interpreter = null;
            }
            return true;
        }
        return false;
    }

    function loadScript(filename) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `js/plugins/homick/${filename}`;
        script.async = false;
        script.onerror = loadError;
        document.body.appendChild(script);
    }

    function loadError(e) {
        console.error(e);
    }

    ILB_HR.startLevel = function(level) {
        mode = SINGLEPLAYER_MODE;
        startFunction = window => HomickRacer.startLevel(window, level);
        SceneManager.push(Scene_HomickRacer);
    };

    ILB_HR.startEndlessMode = function() {
        mode = ENDLESS_MODE;
        startFunction = window => HomickRacer.startEndlessMode(window);
        SceneManager.push(Scene_HomickRacer);
    };

    ILB_HR.startMultiplayer = function(level, numberOfHumanPlayers, numberOfCpuPlayers, cpuDifficulty) {
        mode = MULTIPLAYER_MODE;
        startFunction = window => HomickRacer.startMultiplayer(window, level, numberOfHumanPlayers, numberOfCpuPlayers, cpuDifficulty);
        SceneManager.push(Scene_HomickRacer);
    }

    ILB_HR.stopRace = function() {
        SceneManager.pop();
    }

    ILB_HR.restartRace = function() {
        race = startFunction(window);
    }

    ILB_HR.CPU_EASY = 0;
    ILB_HR.CPU_NORMAL = 1;
    ILB_HR.CPU_HARD = 2;
})();