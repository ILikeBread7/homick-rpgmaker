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
 * @param End common event ID
 * @desc ID of the common event used when the game is finished (0 if not used)
 * @default 3
 * 
 * @param Result variable ID
 * @desc ID of the variable used to store the result of the race (0 if not used)
 * @default 1
 * 
 * @param Final position variable ID
 * @desc ID of the variable used to store the final position of the player (0 if not used)
 * @default 2
 *
 * @help This plugin does not provide plugin commands.
 */

var ILB_HR = ILB_HR || {};

(function() {
    const parameters = PluginManager.parameters('ILB_HomickRacer');
    const startCommonEventId = Number(parameters['Start common event ID'] || 0);
    const pauseCommonEventId = Number(parameters['Pause common event ID'] || 0);
    const endCommonEventId = Number(parameters['End common event ID'] || 0);
    const resultVarId = Number(parameters['Result variable ID'] || 0);
    const finalPositionVarId = Number(parameters['Final position variable ID'] || 0);

    const STORY_MODE = 0;
    const MULTIPLAYER_MODE = 1;
    const ENDLESS_MODE = 2;

    const NUM_OF_LEVELS = 16;
    const LEVEL_BACKGROUNDS = new Map([
        [1, 'plains'],
        [2, 'desert'],
        [3, 'jungle'],
        [4, 'tundra'],
        [5, 'moon'],
        [6, 'mars'],
        [7, 'saturn'],
        [8, 'asteroid_belt'],
        [9, 'sun'],
        [10, 'alpha_centauri'],
        [11, 'sirius'],
        [12, 'procyon'],
        [13, 'black_hole_outskirts'],
        [14, 'black_hole_plunging_region'],
        [15, 'black_hole_event_horizon'],
        [16, 'black_hole_singularity'],
    ]);

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

    const DEFAULT_BGM = 'Battle2';
    const BOSS_BGM = 'tanyao_2';
    const FINAL_BOSS_BGM = 'mirakuru_max_daakunesu_2';
    let bgImageName;

    function getRandomBgImage() {
        return LEVEL_BACKGROUNDS.get(Math.floor(Math.random() * LEVEL_BACKGROUNDS.size) + 1);
    }

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
        this._bgSprite = new Sprite();
        this._bgSprite.initialize(ImageManager.loadPicture(bgImageName));
        this.addChildToBack(this._bgSprite);

        resetScoreVar();
        window = this;
        race = startFunction(window);
        previousTime = performance.now();
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

        const now = performance.now();
        if (!this.updateInterpreter()) {
            const deltaTime = now - previousTime;
            race.update(deltaTime);

            if ((resultVarId || finalPositionVarId) && !resultSet && race.isFinished) {
                if (resultVarId) {
                    $gameVariables.setValue(resultVarId, race.playerScore);
                }
                if (finalPositionVarId) {
                    $gameVariables.setValue(finalPositionVarId, race.playerFinalPosition);
                }
                resultSet = true;
            }
    
            if (pauseCommonEventId && Input.isTriggered('cancel')) {
                this.playCommonEvent(pauseCommonEventId);
            }
    
            if (
                race.isFinished &&
                (Input.isTriggered('ok') || Input.isTriggered('player1') || Input.isTriggered('player2') || Input.isTriggered('player3') || Input.isTriggered('player4'))
            ) {
                if (endCommonEventId) {
                    this.playCommonEvent(endCommonEventId);
                } else {
                    AudioManager.stopBgm();
                    this.popScene();
                }
            }
        }

        previousTime = now;
        $gameScreen.update();
        this._window.refresh();
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

    function resetScoreVar() {
        if (resultVarId) {
            $gameVariables.setValue(resultVarId, 0);
            resultSet = false;
        }
    }

    function getBgmForLevel(level) {
        const mappedLevel = mapHardModeLevel(level);

        // Final boss or bonus
        if (mappedLevel === 16) {
            return FINAL_BOSS_BGM;
        }

        // Regular boss level
        if (mappedLevel % 4 === 0) {
            return BOSS_BGM;
        }

        return DEFAULT_BGM;
    }

    function getBackgroundForLevel(level) {
        const mappedLevel = mapHardModeLevel(level);
        return LEVEL_BACKGROUNDS.get(mappedLevel);
    }

    function mapHardModeLevel(level) {
        if (level > NUM_OF_LEVELS) {
            level -= NUM_OF_LEVELS;

            // Bonus level
            if (level > NUM_OF_LEVELS) {
                level--;
            }
        }
        return level;
    }

    ILB_HR.startLevel = function(level) {
        bgImageName = getBackgroundForLevel(level);
        mode = STORY_MODE;
        const bgmName = getBgmForLevel(level);
        startFunction = window => HomickRacer.startLevel(window, bgmName, level);
        SceneManager.push(Scene_HomickRacer);
    };

    ILB_HR.startEndlessMode = function() {
        bgImageName = getRandomBgImage()
        mode = ENDLESS_MODE;
        startFunction = window => HomickRacer.startEndlessMode(window, DEFAULT_BGM);
        SceneManager.push(Scene_HomickRacer);
    };

    ILB_HR.startMultiplayer = function(level, numberOfHumanPlayers, numberOfCpuPlayers, cpuDifficulty) {
        bgImageName = getRandomBgImage()
        mode = MULTIPLAYER_MODE;
        startFunction = window => HomickRacer.startMultiplayer(window, DEFAULT_BGM, level, numberOfHumanPlayers, numberOfCpuPlayers, cpuDifficulty);
        SceneManager.push(Scene_HomickRacer);
    }

    ILB_HR.stopRace = function() {
        AudioManager.stopBgm();
        SceneManager.pop();
    }

    ILB_HR.restartRace = function() {
        AudioManager.stopBgm();
        resetScoreVar();
        race = startFunction(window);
    }

    ILB_HR.getMode = function() {
        return mode;
    }

    ILB_HR.getScore = function() {
        return race ? race.playerScore : 0;
    }

    ILB_HR.getEndlessBoostScore = function() {
        return race ? race.boostScore : 0;
    }

    ILB_HR.getEndlessDistance = function() {
        return race ? race.endlessDistance : 0;
    }

    ILB_HR.getLevelBackground = function(level) {
        const totalLevels = LEVEL_BACKGROUNDS.size;
        if (level > totalLevels) {
            level -= totalLevels;
        }

        return LEVEL_BACKGROUNDS.get(level);
    }

    ILB_HR.CPU_EASY = 0;
    ILB_HR.CPU_NORMAL = 1;
    ILB_HR.CPU_HARD = 2;
    ILB_HR.CPU_VERY_HARD = 3;

    ILB_HR.STORY_MODE = STORY_MODE;
    ILB_HR.MULTIPLAYER_MODE = MULTIPLAYER_MODE;
    ILB_HR.ENDLESS_MODE = ENDLESS_MODE;
})();