/* 
    
    ~ ballRoller.js
    controls animation of rolling ball 
*/ 

var BallRoller = BallRoller || new ( function() {
    var _self      = this;

    // Instance variables - list of emitters, and global delta time
    _self._prev_t     = undefined;
    _self._cur_t      = undefined;
    _self._isRolling  = false;
    _self._gravity = undefined;
    _self._magnitude = undefined;
    _self._prev_magnitude = Gui.values.magnitude;;

    _self.start = function () {
        _self._prev_t = Date.now();
        _self._cur_t  = Date.now();
        _self._isRolling = true;

        BallRoller._magnitude = Gui.values.magnitude;
        BallRoller._gravity = Gui.values.gravity; 
        
        PhysicsEngine._gravity = Gui.values.gravity; 
        PhysicsEngine._magnitude = Gui.values.magnitude; 
        PhysicsEngine.gameStarted = true;

        // remove magnitude & gravity bars 
        Scene.removeObject(Game._magnitudeBar); 
        Scene.removeObject(Game._gravityBar); 
    };

    _self.step = function () {
        // deal with time
        _self._cur_t = Date.now();
        var elapsed = (_self._cur_t - _self._prev_t) / 1000.0;
        _self._prev_t = _self._cur_t;

        if ( !_self._isRolling ) elapsed = 0.0;
        else {
            if (Game._magnitude != BallRoller._prev_magnitude) { // user has adjusted speedX
                PhysicsEngine.setSpeedX( Game._magnitude );
                BallRoller._prev_magnitude = Game._magnitude;
            }
            PhysicsEngine.update(elapsed);
        }
    };

    _self.stop = function () {
        _self._isRolling = false;
    },

    _self.pause = function () {
        if ( _self._isRolling ) {
            _self.stop();
        } else {
            _self.start();
        }
    };

    _self.reset = function () {
        _self.stop();

        // reset camera
        Renderer._camera.position.set( 0, 40, 100 );

        // reset ball 
        Game._ball.position.copy( Game._initBallPos ); 

        // reset physicsEngine global variables 
        PhysicsEngine.sphere_radius = 5; // m
        PhysicsEngine.sphere_mass = 5; // kg

        PhysicsEngine.sphere_current_speedX = Game._magnitude;

        PhysicsEngine.sphere_initial_speedY = 0; // m/s
        PhysicsEngine.sphere_current_speedY = PhysicsEngine.sphere_initial_speedY;
        
        PhysicsEngine.sphere_previous_position = new THREE.Vector3(); 
        PhysicsEngine.sphere_previous_position.copy(Game._initBallPos);

        PhysicsEngine.sphere_current_position = new THREE.Vector3(); 
        PhysicsEngine.sphere_current_position.copy(Game._initBallPos);
                    
        PhysicsEngine.thetaX = 0;
        
        PhysicsEngine.sign = 1;
        PhysicsEngine.old_helper_axis_length = 10000;
        PhysicsEngine.old_old_helper_axis_length = 10001;

        PhysicsEngine.hasCollisionOccurred = false;
        PhysicsEngine.gameOver = false;
        PhysicsEngine.gameStarted = true;
        PhysicsEngine.gameWon = false;
    };

    return _self;
})();


