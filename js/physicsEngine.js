/* 
    
    ~ physicsEngine.js
    handles collisions, updates ball position and rotation according to 
    gravity, drag/friction, and other forces (any others?)  

*/ 

var PhysicsEngine = PhysicsEngine || new ( function() {
    var _self      = this;

    // global variables -- initial settings  
    _self.sphere_radius = 5; // m
    _self.sphere_mass = 5; // kg

    _self.sphere_current_speedX = Game._magnitude;

    _self.sphere_initial_speedY = 0; // m/s
    _self.sphere_current_speedY = _self.sphere_initial_speedY;
    
    _self.sphere_previous_position = new THREE.Vector3(); 
    _self.sphere_previous_position.copy(Game._initBallPos);

    _self.sphere_current_position = new THREE.Vector3(); 
    _self.sphere_current_position.copy(Game._initBallPos);
                
    _self.thetaX = 0;
    
    _self.sign = 1;
    _self.old_helper_axis_length = 10000;
    _self.old_old_helper_axis_length = 10001;

    _self.hasCollisionOccurred = false; // was there collision in the previous step?
    _self.gameOver = false;
    _self.gameLiveLost = false;
    _self.gameStarted = true;

    _self.setSpeedX = function ( speedX ) {
        _self.sphere_current_speedX = speedX;
    };

    _self.update = function ( elapsed ) {
        var axisX = new THREE.Vector3(-1, 0, 0);
        var axisY = new THREE.Vector3(0, -1, 0);

        if (_self.gameLiveLost) {
            var displacement = new THREE.Vector3(0, -1, 0);
            Game._ball.position.x = 0;
            Game._ball.position.z = 0;
            Game._ball.position.add(displacement);
            Game._ball.rotation.x += 0.2;
            if (Game._ball.position.y < -100) {
                var initial = new THREE.Vector3(50, 50, 0);
                Game._ball.position.copy(initial);
                _self.gameLiveLost = false;
                _self.gameStarted = false;
            }
            return;
        }

        if (!_self.gameStarted) {
            var displacement = new THREE.Vector3(0, -1, 0);
            Game._ball.position.add(displacement);
            Game._ball.rotation.x += 0.2;
            if (Game._ball.position.y < 0) {
                _self.gameStarted = true;

                if (_self.gameOver) {
                    //Game._rings_to_pass = Game._rings.slice(0);
                    if (_self.gameWon) {
                        var level = 7;
                        if (Game.getLevel() == 1) {
                            level = 4;
                        }
                        else if (Game.getLevel() == 0) {
                            level = 0;
                        }
                        _self.gameWon = false;
                        Gui.reset(Game.getScore() + 100, level, Game.getLives());
                    }
                    else {
                        //Gui.reset(0, 1, 3);
                    }

                    _self.gameOver = false;
                }
                else { // a life was lost
                    //Game._rings_to_pass = Game._rings.slice(0);
                    if (Game.getLives() == 0) {
                        Gui.reset(0, 1, 3);
                    }
                    else {
                        Gui.reset(Game.getScore(), Game.getLevel(), Game.getLives() - 1);
                    }
                }
            }
            return;
        }

        var helper_axis = new THREE.Vector3(0, 0, 0);
        var copy_axis = new THREE.Vector3(0, 0, 0);
        copy_axis.copy(_self.sphere_current_position);
        helper_axis.copy(copy_axis.cross(axisY));
        var helper_axis_length = helper_axis.length();

        var alpha = axisY.angleTo(_self.sphere_current_position);

        // don't let the ball go above the bowl
        if (alpha > Math.PI / 2.0) {
            _self.sphere_current_speedY = -_self.sphere_current_speedY;
            _self.sign = (-1) * _self.sign;
        }

        var forceY = _self.sphere_mass * Game._gravity * Math.sin(alpha);
        var accY = forceY * _self.sphere_mass;

        // should the ball change direction? track it's trajectory
        if (!_self.hasCollisionOccurred) {
            if (_self.old_helper_axis_length < helper_axis_length &&
             _self.old_helper_axis_length < _self.old_old_helper_axis_length) {
                _self.sign = (-1) * _self.sign;
            }
        }

        accY = _self.sign * accY;

        _self.old_old_helper_axis_length = _self.old_helper_axis_length;
        _self.old_helper_axis_length = helper_axis_length;

        // correct for rounding errors
        _self.sphere_current_speedY = _self.sphere_current_speedY * 0.9975; /// ??????????????

        var speedY = _self.sphere_current_speedY + accY * elapsed;
        var displacementY = _self.sphere_current_speedY * elapsed + (accY * elapsed * elapsed) / 2.0;

        var speedX = _self.sphere_current_speedX;
        var displacementX = _self.sphere_current_speedX * elapsed;

        var center_center = new THREE.Vector3(0, 0, 0);
        center_center.copy(_self.sphere_current_position);
        center_center.sub(Game._initInnerBowlPos);

        // displacement angle
        var betaY = 2.0 * Math.asin((displacementY / 2.0) / center_center.length());
        var betaX = 2.0 * Math.asin((displacementX / 2.0) / center_center.length());

        var copy_center_center = new THREE.Vector3(0, 0, 0);

        var rotation_axisX = new THREE.Vector3(0, 0, 0);
        copy_center_center.copy(center_center);
        rotation_axisX.copy(copy_center_center.cross(axisX));

        _self.thetaX = (_self.thetaX + betaX) % (Math.PI * 2.0);

        var rotation_axisY = new THREE.Vector3(0, 0, 0);
        var rotation_helperY = new THREE.Vector3(1, 0, 0);
        rotation_helperY.applyAxisAngle(new THREE.Vector3(0, -1, 0), _self.thetaX + Math.PI / 2.0);
        rotation_axisY.copy(rotation_helperY);

        _self.sphere_current_position.applyAxisAngle(axisY, betaX);
        _self.sphere_current_position.applyAxisAngle(rotation_axisY.normalize().negate(), betaY);

        _self.sphere_current_speedY = speedY;
        _self.sphere_current_speedX = speedX;


        // ROTATION
        var path_traveledX = Game._innerBowlRad * betaX;
        var rotation_angleX = path_traveledX / _self.sphere_radius;

        var path_traveledY = Game._innerBowlRad * betaY;
        var rotation_angleY = path_traveledY / _self.sphere_radius;

        quaternionX = new THREE.Quaternion().setFromAxisAngle( axisY.negate(), rotation_angleX );
        var qX = new THREE.Euler().setFromQuaternion( quaternionX );

        quaternionY = new THREE.Quaternion().setFromAxisAngle( rotation_helperY, rotation_angleY );
        var qY = new THREE.Euler().setFromQuaternion( quaternionY );

        Game._ball.rotation.x += qX.x + qY.x;
        Game._ball.rotation.y += qX.y + qY.y;
        Game._ball.rotation.z += qX.z + qY.z;
        
        // CHECK FOR PASS-THROUGHS  

        // is the ball falling through? check it's distance from the whole
        var bowl_center_projection = new THREE.Vector3(0, (-Game._innerBowlRad), 0);
        if (_self.sphere_current_position.distanceTo(bowl_center_projection) < Game._ballRadius * 1.3) {
            Game._lives -= 1;
            _self.gameLiveLost = true;
            _self.gameStarted = false;

            var audio = new Audio('sounds/Basso.mp3');
            audio.play();

            if (Game.getLives() == 0) {
                var audio = new Audio('sounds/fail.mp3');
                audio.play();
            }

            if (Game._lives <= 0) {
               _self.gameOver = true;
            }
        }

        _self.isPassingThrough();

        Game._ball.position.copy(_self.sphere_current_position);

    };

    _self.isPassingThrough = function ( ) {
        if (Game.getLevel() == 0) { // interactive mode
            Game.calculateRingPoints(); // calculate the new points of the rings
        }

        var hasCollision = false;
        for (var i = 0; i < Game._rings.length; i++) {
            var ring_radius = Game._rings[i].geometry.parameters.radius;
            var tube_radius = Game._rings[i].geometry.parameters.tube;

            var center_ball_center_ring = new THREE.Vector3(0, 0, 0);
            center_ball_center_ring.copy( Game._ball.position );
            center_ball_center_ring.sub( Game._rings[i].position );

            var center1 = Game._rings_tube_centers[i][0];
            var center2 = Game._rings_tube_centers[i][1];

            if (!_self.hasCollisionOccurred) {

                if ( center_ball_center_ring.length() < (ring_radius + Game._ballRadius + tube_radius)) {

                    if (_self.collide( center1, center2, tube_radius )) {
                        //return 1000 + i;
                        hasCollision = true;
                    }
                }
            }

            if ( center_ball_center_ring.length() < (ring_radius - Game._ballRadius - tube_radius) ) {

                if ( center1.distanceTo(Game._ball.position) +  center2.distanceTo(Game._ball.position) <
                    ring_radius * 5 + Game._ballRadius ) {
                    Game.updateScore(1, false); 

                    var audio = new Audio('sounds/Purr.mp3');
                    audio.play();

                    // mark this ring as passed
                    var index = Game._rings_to_pass.indexOf(Game._rings[i]);
                    if (index !== (-1)) {
                        Game._rings_to_pass.splice(index, 1);
                    }

                    if (Game._rings_to_pass.length <= 0) {
                        _self.gameOver = true;
                        _self.gameWon = true;

                        if (Game.getLevel() != 0) {
                            var audio = new Audio('sounds/cheer.mp3');
                            audio.play();
                        }
                    }
                    
                    // change the hoop color 
                    var hoop = Game._rings[i];

                    hoop.material.color.setRGB (0, 1, 0);       
                }  
                return i;
            }
        }
        hasCollisionOccurred = hasCollision;
        return -1;
    };


    _self.collide = function ( center1, center2, tube_radius ) {
        if ( center1.distanceTo(_self.sphere_current_position) <  (Game._ballRadius + tube_radius) ) {
            _self.reflect( center1 );
            return true;
        }
        else if ( center1.distanceTo(_self.sphere_current_position) <  (Game._ballRadius + tube_radius) ) {
            _self.reflect( center2 );
            return true;
        }

        // otherwise there is no actual collision
        return false;
    };

    _self.reflect = function ( tube_center ) {
        
        var audio = new Audio('sounds/Ping.mp3');
        audio.play();

        var center_ball_center_tube = new THREE.Vector3(0, 0, 0);
        center_ball_center_tube.copy(_self.sphere_current_position);
        center_ball_center_tube.sub(tube_center);

        var center_ball_center_bowl = new THREE.Vector3(0, 0, 0);
        center_ball_center_bowl.copy(Game._initInnerBowlPos);
        center_ball_center_bowl.sub(_self.sphere_current_position);

        var alpha = center_ball_center_tube.angleTo(center_ball_center_bowl);

        // determine quadrant
        var axisX = new THREE.Vector3(1, 0, 0);
        var angle_x_tube_center = tube_center.angleTo(axisX);
        var angle_x_ball_center = _self.sphere_current_position.angleTo(axisX);

        if (tube_center.z * _self.sphere_current_position.z < 0) { //z's have different directions
            //console.log("I'm a special case!");
        }
        else if (tube_center.z > 0 && _self.sphere_current_position.z > 0) { // both z's are positive
            if ( angle_x_tube_center < angle_x_ball_center) {
                alpha = alpha + Math.PI / 2.0;
            }
            else {
                alpha = Math.PI / 2.0 - alpha;
            }
        }
        else if (tube_center.z < 0) { // both z's are negative
            if ( angle_x_tube_center < angle_x_ball_center) {
                alpha = Math.PI / 2.0 - alpha;
            }
            else {
                alpha = alpha + Math.PI / 2.0;
            }
        }


        var axisZ = new THREE.Vector3(0, 0, 1);
        var speed3 = new THREE.Vector3(_self.sphere_current_speedX, _self.sphere_current_speedY, 0);

        speed3.applyAxisAngle(axisZ, (Math.PI - alpha));

        // negate the y speed
        speed3.x = -speed3.x
        speed3.applyAxisAngle(axisZ, -(Math.PI - alpha));

        _self.sphere_current_speedX = speed3.x;
        _self.sphere_current_speedY = speed3.y;

    }

    return _self;
})();