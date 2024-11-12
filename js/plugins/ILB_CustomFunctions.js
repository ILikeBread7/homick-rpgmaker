//=============================================================================
// ILB_CustomFunctions.js
//=============================================================================

/*:
 * @plugindesc Exposes a global object $f to store custom functions for use in script calls.
 *
 * @author I_LIKE_BREAD7
 *
 * @help
 * This plugin creates a global object $f. You can add any functions you want to $f and 
 * then call them using script calls. This is useful for organizing custom game functions.
 * You can also include multiple copies of this plugin with different filenames for better
 * code separation.
 * 
 * Example usage:
 * Add a function to the plugin in the designated space like this
 *   $f.myFunction = function(param1, param2) {
 *       // Your code here
 *       console.log("Function called with params:", param1, param2);
 *   };
 *
 * Then in a script call, use like this:
 *   $f.myFunction("hello", 42);
 */

var $f = $f || {};

(function() {

    // You can add your functions here
    
    const _LEVEL_NAMES = new Map([
        [1, 'Plains'],
        [2, 'Desert'],
        [3, 'Jungle'],
        [4, 'Tundra'],
        [5, 'Moon'],
        [6, 'Mars'],
        [7, 'Saturn'],
        [8, 'Asteroid belt'],
        [9, 'Sun'],
        [10, 'Alpha centauri'],
        [11, 'Sirius'],
        [12, 'Procyon'],
        [13, 'Black hole outskirts'],
        [14, 'Black hole plunging region'],
        [15, 'Black hole event horizon'],
        [16, 'Black hole singularity']
    ]);

    $f.mapLevelOptionNames = function(stage) {
        const levelsPerStage = 4;
        const highscoreVarId = 7;
        const optionChoiceVarId = 41;
        
        for (let i = 0; i < levelsPerStage; i++) {
            const level = (stage - 1) * levelsPerStage + i + 1;
            const levelHighscoreVarId = highscoreVarId + level;

            // If previous stage was cleared
            const unlocked = level === 1 || $gameVariables.value(
                levelHighscoreVarId - 1
            ) > 0;

            const optionName = unlocked
                ? `${_LEVEL_NAMES.get(level)} ${$f.mapScoreToStars($gameVariables.value(levelHighscoreVarId))}`
                : '???';
            $gameVariables.setValue(optionChoiceVarId + i, optionName);
        }


    }

    $f.mapScoreToStars = function(score) {
        let starsString = '';
        for (let i = 0; i < score; i++) {
            starsString += '★';
        }

        for (let i = score; i < 3; i++) {
            starsString += '☆';
        }

        return starsString;
    }

})();
