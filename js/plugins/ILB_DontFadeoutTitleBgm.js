//=============================================================================
// ILB_DontFadeoutTitleBgm.js
//=============================================================================

/*:
 * @plugindesc Makes the title bgm (and sound and music effects) not disappear after starting the game
 *
 * @author I_LIKE_BREAD7
 *
 * @help This plugin does not provide plugin commands.
 */

(function() {

    Scene_Title.prototype.fadeOutAll = function() {
        this.startFadeOut(this.slowFadeSpeed());
    }

})();