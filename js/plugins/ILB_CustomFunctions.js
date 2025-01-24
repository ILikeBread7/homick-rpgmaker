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
        // * 2 to include hard mode, +1 for bonus level
        const numberOfStages = _STAGE_NAMES.size * 2 + 1;
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

    $f.saveScore = function() {
        const score = ILB_HR.getScore();
        const highscoreUpdatedSwitchId = 1;
        const newLevelBeatenSwitchId = 5;
        let highscoreVarId = 7; // 7 = endless, 8 = level 1, ...

        if (ILB_HR.getMode() === ILB_HR.STORY_MODE) {
            const levelVarId = 6;
            highscoreVarId += $gameVariables.value(levelVarId);

            if (score > 0 && $gameVariables.value(highscoreVarId) === 0) {
                $gameSwitches.setValue(newLevelBeatenSwitchId, true);
            }
        }

        if (score > $gameVariables.value(highscoreVarId)) {
            $gameVariables.setValue(highscoreVarId, score);
            $gameSwitches.setValue(highscoreUpdatedSwitchId, true);
        }
    }

    $f.showLevelBackgroundOnMenu = function(level) {
        const highscoreVarId = 7;
        const levelHighscoreVarId = highscoreVarId + level;
        const unlocked = level === 1 || $gameVariables.value(levelHighscoreVarId - 1) > 0;

        if (unlocked) {
            const imageName = ILB_HR.getLevelBackground(level);
            $gameScreen.showPicture(1, imageName, 0, 0, 0, 100, 100, 255, 0);
            const homickImageName = _getBossHomickPictureForLevel(level);
            if (homickImageName) {
                $gameScreen.showPicture(2, homickImageName, 0, 170, 405, 100, 100, 255, 0);
            }
        } else {
            const inMenuSwitchId = 2;
            $gameSwitches.setValue(inMenuSwitchId, true);
        }
    }

    function _getBossHomickPictureForLevel(level) {
        if (level > 16) {
            level -= 16;
        }
        switch (level) {
            case 4:
                return 'tundra_homick';
            case 8:
                return 'roedent';
            case 12:
                return 'ginny';
            case 16:
                return 'brad';
            default:
                return undefined;
        }
    }

    $f.checkAllLevels3Stars = function() {
        const level1HighscoreVarId = 8;
        const levelLastHighscoreVarId = 40;

        for (let levelHighscoreVarId = levelLastHighscoreVarId; levelHighscoreVarId >= level1HighscoreVarId; levelHighscoreVarId--) {
            const highscore = $gameVariables.value(levelHighscoreVarId);
            if (highscore < 3) {
                return false;
            }
        }

        return true;
    }

    const _STORY_THEATRE_OPTIONS = [
        { name: 'Introduction', storyProgress: 0, background: 'plains', character: 'announcer' },
        { name: 'Le Mingue before', storyProgress: 4, background: 'tundra', character: 'tundra_homick' },
        { name: 'Le Mingue after', storyProgress: 6, background: 'tundra', character: 'tundra_homick' },
        { name: 'Test', storyProgress: 999, background: 'black_hole_singularity', character: 'brad' },
        { name: 'Test 2', storyProgress: 7, background: 'asteroid_belt', character: 'roedent' },
        { name: 'Test 3', storyProgress: 7, background: 'procyon', character: 'ginny' },
        { name: 'Test 4', storyProgress: 7, background: 'black_hole_singularity', character: 'brad' },
        { name: 'Test 5', storyProgress: 7, background: 'black_hole_singularity', character: 'brad' },
        { name: 'Test 6', storyProgress: 999, background: 'black_hole_singularity', character: 'brad' },
    ];

    $f.mapStoryTheatreOptionNames = function(page) {
        const storyProgressVarId = 50;
        const storyProgress = $gameVariables.value(storyProgressVarId);
        const optionsVarIds = [41, 42, 43, 44];
        optionsVarIds.forEach((varId, index) => {
            $gameVariables.setValue(varId, _mapPageAndIndexToStoryTheatreOptionName(page, index, storyProgress));
        });

        const nextPageStoryProgressVarId = 56;
        const nextOption = _STORY_THEATRE_OPTIONS[page * 4];
        $gameVariables.setValue(nextPageStoryProgressVarId, nextOption.storyProgress);
    }

    function _mapPageAndIndexToStoryTheatreOptionName(page, index, storyProgress) {
        const option = _STORY_THEATRE_OPTIONS[(page - 1) * 4 + index];
        return storyProgress >= option.storyProgress ? option.name : '???';
    }

    $f.showLevelBackgroundOnStoryTheatreMenu = function(index) {
        const storyProgressVarId = 50;
        const storyProgress = $gameVariables.value(storyProgressVarId);
        const option = _STORY_THEATRE_OPTIONS[index];

        if (storyProgress >= option.storyProgress) {
            $gameScreen.showPicture(1, option.background, 0, 0, 0, 100, 100, 255, 0);
            if (option.character === 'announcer') {
                $gameScreen.showPicture(2, option.character, 0, 0, 401, 100, 100, 255, 0);
            } else {
                $gameScreen.showPicture(2, option.character, 0, 170, 405, 100, 100, 255, 0);
            }
        } else {
            const inMenuSwitchId = 2;
            $gameSwitches.setValue(inMenuSwitchId, true);
        }
    }

})();
