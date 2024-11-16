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
        [13, 'Outskirts'],
        [14, 'Plunging region'],
        [15, 'Event horizon'],
        [16, 'Singularity']
    ]);

    const _STAGE_NAMES = new Map([
        [1, 'Earth'],
        [2, 'Solar system'],
        [3, 'Milky way'],
        [4, 'Black hole']
    ]);

    $f.mapStageName = function(stage) {
        const numberOfStages = _STAGE_NAMES.size;
        let difficulty = '';
        if (stage > numberOfStages) {
            stage -= numberOfStages;
            difficulty = ' (Hard)';
        }

        // Center the name
        let name = _STAGE_NAMES.get(stage) + difficulty;
        const baseNameLength = name.length;
        const lineWidth = 23;
        for (let i = 0; i < Math.floor((lineWidth - baseNameLength) / 2); i++) {
            name = ' ' + name;
        }

        const stageNameVarId = 47;
        return $gameVariables.setValue(stageNameVarId, name);
    }

    $f.mapLevelOptionNames = function(stage) {
        const levelsPerStage = 4;
        const highscoreVarId = 7;
        const optionChoiceVarId = 41;
        const numOfLevels = _LEVEL_NAMES.size;
        
        for (let i = 0; i < levelsPerStage; i++) {
            const level = (stage - 1) * levelsPerStage + i + 1;
            const levelHighscoreVarId = highscoreVarId + level;

            // If previous stage was cleared
            const unlocked = level === 1 || $gameVariables.value(
                levelHighscoreVarId - 1
            ) > 0;

            let mappedLevel = level;
            if (level > numOfLevels) {
                mappedLevel -= numOfLevels;
            }
            const optionName = unlocked
                ? `${$f.mapScoreToStars($gameVariables.value(levelHighscoreVarId))} ${_LEVEL_NAMES.get(mappedLevel)}`
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

    $f.getMaxUnlockedStage = function() {
        const highscoreVarId = 7;
        const numberOfStages = _STAGE_NAMES.size * 2;
        const levelsPerStage = 4;

        for (let stage = numberOfStages; stage > 1; stage--) {
            const previousStageBossVarId = highscoreVarId + (stage - 1) * levelsPerStage;

            if ($gameVariables.value(previousStageBossVarId) > 0) {
                return stage;
            }
        }

        // If no stages are unlocked, only the first one is available
        return 1;
    }

})();
