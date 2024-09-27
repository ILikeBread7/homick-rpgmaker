//=============================================================================
// ILB_HomickRacer.js
//=============================================================================

/*:
 * @plugindesc Plugin for the Homick Racer game
 * @author I_LIKE_BREAD7
 *
 * @help This plugin does not provide plugin commands.
 */

var ILB_HR = ILB_HR || {};

(function() {
    const parameters = PluginManager.parameters('ILB_HomickRacer');
    const startCommonEventId = 0;

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
    let totalTime;
    let deltaTime;
    let previousTime;

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

        race = startFunction(this.contents);
        totalTime = 0;
        previousTime = Date.now();
    };

    Window_HomickRacer.prototype.refresh = function() {
        this.contents.clear();
        race.draw(totalTime);
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
        if (startCommonEventId) {
            this.playCommonEvent(startCommonEventId);
        }
    };

    Scene_HomickRacer.prototype.update = function() {
        Scene_Base.prototype.update.call(this);

        const now = Date.now();
        deltaTime = now - previousTime;
        totalTime += deltaTime;

        race.update(deltaTime, totalTime);
        this._window.refresh();
        previousTime = now;

        if (
            Input.isTriggered('cancel') || // to be changed later when we have a cancel common event
            (race.isFinished && (Input.isTriggered('ok') || Input.isTriggered('cancel') || Input.isTriggered('player1') || Input.isTriggered('player2') || Input.isTriggered('player3') || Input.isTriggered('player4')))
        ) {
            this.popScene();
        }
    };

    Scene_HomickRacer.prototype.playCommonEvent = function(commonEventId) {
        var commonEvent = $dataCommonEvents[commonEventId];
        this._interpreter = new Game_Interpreter();
        this._interpreter.setup(commonEvent.list);
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
        startFunction = contents => HomickRacer.startLevel(contents, level);
        SceneManager.push(Scene_HomickRacer);
    };

    ILB_HR.startEndlessMode = function() {
        startFunction = contents => HomickRacer.startEndlessMode(contents);
        SceneManager.push(Scene_HomickRacer);
    };

    ILB_HR.startMultiplayer = function(level, numberOfHumanPlayers, numberOfCpuPlayers, cpuDifficulty) {
        startFunction = contents => HomickRacer.startMultiplayer(contents, level, numberOfHumanPlayers, numberOfCpuPlayers, cpuDifficulty);
        SceneManager.push(Scene_HomickRacer);
    }

    ILB_HR.CPU_EASY = 0;
    ILB_HR.CPU_NORMAL = 1;
    ILB_HR.CPU_HARD = 2;
})();