/* 
    
    ~ gui.js
    controls sidebar GUI controls   

*/ 

"use strict";

var Gui = Gui || {};

// list of presets available in the GUI
Gui.sceneList = [];

Gui.windowSizes = [ "full","400x400","600x400","600x600","800x600","800x800" ];

// due to a bug in dat GUI we need to initialize floats to non-interger values (like 0.5)
// (the variable Gui.defaults below then carries their default values, which we set later)
Gui.values = {
    windowSize:  Gui.windowSizes[0],
    start: function () {},
    pause: function () {}, 
    reset: function () {},
    magnitude: 50,
    gravity: 5,
    level: 1,
    hoopPosition: 0
};

// defaults only hold actual mesh modifiers, no display
Gui.defaults = { 
    magnitude: 50,
    gravity: 5,
    level: 1,
    hoopPosition: 0
};

Gui.gc = {}; 

Gui.changeLevel = function (level) { 

    Game.updateLevel(level, true); 

    // refresh scene
    Scene.removeObjects(); 
    Game.initScene(); 
    
};


Gui.reset = function (score, level, numLives) { 
    // reset ball position 
    BallRoller.reset(); 

    // reset score
    Game.updateScore(score, true);

    // reset level (updates scene)
    Gui.changeLevel(level); 

    // reset number of lives 
    Game.updateLives(numLives, true); 

    // reset color of rings
    for (var i = 0; i < Game._rings.length; i++) { 
        var hoop = Game._rings[i]; 
        hoop.material.color.setRGB(1, 0, 0); 
    }

    // reset magnitude of magnitude bar 
    Gui.gc.magnitude.setValue( Gui.defaults.magnitude ); 

    Scene.removeObject( Game._magnitudeBar ); 

    var geometry = new THREE.CylinderGeometry( 0.5, 0.5, Game._magnitudeBarHeight, 32 );
    var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, emissive:0x00ff01} );
    Game._magnitudeBar = new THREE.Mesh( geometry, material );
    Game._magnitudeBar.position.copy(Game._initMagnitudeBarPos); 
    Game._magnitudeBar.rotation.x = Math.PI/2; 

    Scene.addObject( Game._magnitudeBar );

    // reset gravity of gravity bar 
    Gui.gc.gravity.setValue( Gui.defaults.gravity ); 

    Scene.removeObject( Game._gravityBar ); 

    var geometry = new THREE.CylinderGeometry( 0.5, 0.5, Game._gravityBarHeight, 32 );
    var material = new THREE.MeshPhongMaterial( {color: 0xff0000, emissive:0xff0001} );
    Game._gravityBar = new THREE.Mesh( geometry, material );
    Game._gravityBar.position.copy(Game._initGravityBarPos); 

    Scene.addObject( Game._gravityBar );


};

Gui.alertOnce = function( msg ) {
    var mainDiv = document.getElementById('main_div');
    mainDiv.style.opacity = "0.3";
    var alertDiv = document.getElementById('alert_div');
    alertDiv.innerHTML = '<p>'+msg + '</p><button id="ok" onclick="Gui.closeAlert()">ok</button>';
    alertDiv.style.display = 'inline';
};

Gui.closeAlert = function () {
    var mainDiv = document.getElementById('main_div');
    mainDiv.style.opacity = "1";
    var alertDiv = document.getElementById('alert_div');
    alertDiv.style.display = 'none';
};

Gui.toCommandString = function () {
    var url = '';
    for ( var prop in Gui.defaults ) {
        if( Gui.values[prop] !== undefined && Gui.values[prop] !== Gui.defaults[prop]) {
            url += "&";
            var val = Gui.values[prop];

            if( !isNaN(parseFloat(val)) && val.toString().indexOf('.')>=0 ) {
                val = val.toFixed(2);
             }
            url += prop + "=" + val;
        }
    }
    return url;
}

Gui.init = function ( meshChangeCallback, controlsChangeCallback, displayChangeCallback ) {
    // create top level controls
    var gui     = new dat.GUI( { width: 300 } );
    var size    = gui.add( Gui.values, 'windowSize', Gui.windowSizes ).name("Window Size");

    // gui controls are added to this object below
    // var Gui.gc = {};
    Gui.gc.start = gui.add( Gui.values, 'start' ).name("Roll Ball");
    Gui.gc.reset = gui.add( Gui.values, 'reset' ).name("Reset Game");
    Gui.gc.magnitude = gui.add( Gui.values, 'magnitude', 0, Game._magnitudeMax ).name("Magnitude"); 
    Gui.gc.gravity = gui.add( Gui.values, 'gravity', 0, Game._gravityMax ).name("Gravity"); 
    Gui.gc.level = gui.add( Gui.values, 'level', { Basic:1, Intermediate:4, Advanced:7, Interactive:0 } ).name("Level");
    Gui.gc.hoopPosition = gui.add( Gui.values, 'hoopPosition', 0, 180).name("Hoop Position"); 

    // REGISTER CALLBACKS FOR WHEN GUI CHANGES:
    size.onChange( Renderer.onWindowResize );

    Gui.gc.start.onChange( BallRoller.pause ); 

    Gui.gc.reset.onChange( function () { 
        Gui.reset(0, 1, 3); 
    });

    Gui.gc.magnitude.onChange( function (value) { 

        Game._magnitude = value; 

        if (!BallRoller._isRolling) { 
            // adjust length of settings bar
            var oldHeight = Game._magnitudeBarHeight; 
            var oldPos = Game._magnitudeBar.position.clone().sub(Game._ball.position); // relative to center of ball
            var norm = oldPos.clone().normalize();

            var oldRotation = Game._magnitudeBar.rotation.x; 

            var newHeight = Math.round((value / Game._magnitudeMax) * Game._magnitudeBarHeightMax); 
            var scale = (newHeight - oldHeight) / 2; 
            var newPos = Game._ball.position.clone().add(oldPos.add(norm.multiplyScalar(scale))); 

            // remove old bar 
            Scene.removeObject(Game._magnitudeBar); 

            // add new bar 
            var geometry = new THREE.CylinderGeometry( 0.5, 0.5, newHeight, 32 );
            var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, emissive:0x00ff01} );
          
            Game._magnitudeBar = new THREE.Mesh( geometry, material );
            Game._magnitudeBar.position.copy(newPos); 
            Game._magnitudeBar.rotation.x = oldRotation; 
            Game._magnitudeBarHeight = newHeight; 

            Scene.addObject( Game._magnitudeBar );
        }
    });

    Gui.gc.gravity.onChange( function (value) { 

        Game._gravity = value; 

        if (!BallRoller._isRolling) { 
            // adjust length of settings bar
            var oldHeight = Game._gravityBarHeight; 
            var oldPos = Game._gravityBar.position.clone().sub(Game._ball.position); // relative to center of ball
            var norm = oldPos.clone().normalize();

            var newHeight = Math.round((value / Game._gravityMax) * Game._gravityBarHeightMax); 
            var scale = (newHeight - oldHeight) / 2; 
            var newPos = Game._ball.position.clone().add(oldPos.add(norm.multiplyScalar(scale))); 

            // remove old bar 
            Scene.removeObject(Game._gravityBar); 

            // add new bar 
            var geometry = new THREE.CylinderGeometry( 0.5, 0.5, newHeight, 32 );
            var material = new THREE.MeshPhongMaterial( {color: 0xff0000, emissive:0xff0001} );
          
            Game._gravityBar = new THREE.Mesh( geometry, material );
            Game._gravityBar.position.copy(newPos); 
            Game._gravityBarHeight = newHeight; 

            Scene.addObject( Game._gravityBar );
        }

    });

    Gui.gc.level.onChange( function (value) { 
        Gui.changeLevel(value); 
    }); 

    Gui.gc.hoopPosition.onChange( function (value) { 
        // only do stuff if level is 0 (aka "Interactive")
        var level = parseInt(document.getElementById("level").innerHTML); 
        if (level == 0) {
            Game.moveInteractiveRing(value);
        }
    }); 
};


// non-implemented alert functionality
Gui.alertOnce = function( msg ) {
    var mainDiv = document.getElementById('main_div');
    mainDiv.style.opacity = "0.3";
    var alertDiv = document.getElementById('alert_div');
    alertDiv.innerHTML = '<p>'+ msg + '</p><button id="ok" onclick="Gui.closeAlert()">ok</button>';
    alertDiv.style.display = 'inline';
};

Gui.closeAlert = function () {
    var mainDiv = document.getElementById('main_div');
    mainDiv.style.opacity = "1";
    var alertDiv = document.getElementById('alert_div');
    alertDiv.style.display = 'none';
};

