
var Main = Main || { };



// when HTML is finished loading, do this
window.onload = function() {
    // Setup renderer, scene and gui
    Gui.init( Main.controlsChangeCallback,
              Main.displayChangeCallback );
    Scene.create();

    Game.initScene(); // draw the initial scene

    // initial settings 
    Game.updateScore(0, true);
    Game.updateLevel(1, true); 
    Game.updateLives(3, true); 

    Renderer.create( Scene, document.getElementById("canvas") );
    Renderer.update();
};


/* 

TO DO LIST: 
- keep track of lives and score
- add gifs for winning and losing

- magnitude bug (syncing slider value with initial magnitude)
*/