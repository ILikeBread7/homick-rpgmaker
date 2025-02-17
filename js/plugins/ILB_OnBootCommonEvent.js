//=============================================================================
// ILB_OnBootCommonEvent.js
//=============================================================================

/*:
 * @plugindesc Runs a common event on game startup (before the title screen)
 * 
 * @author I_LIKE_BREAD7
 * 
 * @param Common Event ID
 * @desc The ID of the common event to be ran at game startup
 * @default 1
 * 
 * @help This plugin does not provide plugin commands.
 */

(function() {

    var parameters = PluginManager.parameters('ILB_OnBootCommonEvent');
    var commonEventId = Number(parameters['Common Event ID'] || 1);

    function Scene_PreTitle() {
        this.initialize.apply(this, arguments);
    }

    Scene_PreTitle.prototype = Object.create(Scene_Base.prototype);
    Scene_PreTitle.prototype.constructor = Scene_PreTitle;

    Scene_PreTitle.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._interpreter = null;
    }

    Scene_PreTitle.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this._messageWindow = new Window_Message();
        this.addChild(this._messageWindow);
        this._messageWindow.subWindows().forEach(function(window) {
            this.addChild(window);
        }, this);
        this.playCommonEvent(commonEventId);
    };

    Scene_PreTitle.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        if (this._interpreter.isRunning()) {
            this._interpreter.update();
        }
        if (!this._interpreter.isRunning()) {
            this._interpreter = null;
            SceneManager.goto(Scene_Title);
        }
    };

    Scene_PreTitle.prototype.playCommonEvent = function(commonEventId) {
        var commonEvent = $dataCommonEvents[commonEventId];
        this._interpreter = new Game_Interpreter();
        this._interpreter.setup(commonEvent.list);
    }

    Scene_Boot.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        SoundManager.preloadImportantSounds();
        if (DataManager.isBattleTest()) {
            DataManager.setupBattleTest();
            SceneManager.goto(Scene_Battle);
        } else if (DataManager.isEventTest()) {
            DataManager.setupEventTest();
            SceneManager.goto(Scene_Map);
        } else {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            SceneManager.goto(Scene_PreTitle);
            Window_TitleCommand.initCommandPosition();
        }
        this.updateDocumentTitle();
    };

})();