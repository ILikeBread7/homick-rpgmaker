//=============================================================================
// ILB_HomickRacer.js
//=============================================================================

/*:
 * @plugindesc Clears TouchInput when the mouse leaves the game window to prevent unintended input issues.
 * @author I_LIKE_BREAD7
 * 
* @help
 * This plugin adds an event listener that listens for the mouse leaving the game window.
 * When triggered, it clears any active TouchInput to prevent unintended input issues.
 */

(function() {

    document.addEventListener('mouseleave', function() {
        TouchInput.clear();
    });
    
})();
