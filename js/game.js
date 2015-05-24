/* 
    
    ~ game.js
    handles initial scene drawing, overall game settings  

*/ 

var Game = Game || new ( function() {
    var _self      = this;

    _self._gravity = 5; 
    _self._magnitude = 500; 

    // ball
    _self._ball     = undefined;
    _self._ballRadius = 5; 
    _self._initBallPos = new THREE.Vector3(50, 0, 0); 

    // inner bowl 
    _self._innerBowl     = undefined;
    _self._initInnerBowlPos = new THREE.Vector3(0, 0, 0); 
    _self._innerBowlRad = 55; 

    // outer bowl 
    _self._outerBowl     = undefined;
    _self._initOuterBowlPos = new THREE.Vector3(0, 0, 0); 
    _self._outerBowlRad = 63; 

    // bowl rim connecting inner/outer bowls 
    _self._bowlRim     = undefined; // ring to close the two hemispheres 
    _self._initBowlRimPos = new THREE.Vector3(0, 0, 0);

    // x-magnitude bar 
    _self._magnitudeBar = undefined; 
    _self._magnitudeBarHeight = 1; // initial height  
    _self._magnitudeBarHeightMax = 10; 
    _self._initMagnitudeBarPos = new THREE.Vector3(50, 0, (_self._ballRadius + _self._magnitudeBarHeight/2)); 
    _self._magnitudeMax = 500; 

    // gravity bar 
    _self._gravityBar = undefined; 
    _self._gravityBarHeight = 5; // initial height
    _self._gravityBarHeightMax = 10; 
    _self._initGravityBarPos = new THREE.Vector3(50, -(_self._ballRadius + _self._magnitudeBarHeight/2), 0); 
    _self._gravityMax = 10; 

    // rings 
    _self._rings = [];
    _self._rings_tube_centers = [];
    _self._rings_to_pass = [];

    //lives
    _self._lives = undefined;


    _self.addBall = function() { 

        // add ball
        var geometry = new THREE.SphereGeometry( _self._ballRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI);
        var material = new THREE.MeshPhongMaterial();
        material.map    = THREE.ImageUtils.loadTexture('images/earthmap1k.jpg');

        _self._ball = new THREE.Mesh( geometry, material );
        _self._ball.position.copy(_self._initBallPos); 

        Scene.addObject( _self._ball );

    };

    _self.addBowls = function() { 
        // add bowl (two hemispheres and a connective ring)
        var mat1 = new THREE.MeshPhongMaterial( {color: 0x444444, emissive:0x442222, side: THREE.BackSide } ); // inner
        var mat2 = new THREE.MeshPhongMaterial( {color: 0x444444, emissive:0x442222, side: THREE.FrontSide } ); // outer
        var mat3 = new THREE.MeshPhongMaterial( {color: 0x444444, emissive:0x442222, side: THREE.DoubleSide } ); // rim 
        
        mat1.map = THREE.ImageUtils.loadTexture('images/asteroidmap.jpg');
        mat2.map = THREE.ImageUtils.loadTexture('images/asteroidmap.jpg');
        mat3.map = THREE.ImageUtils.loadTexture('images/asteroidmap.jpg');
        mat1.wireframe = true; 
        mat2.wireframe = true; 
        mat3.wireframe = false; 
        
        var geom1 = new THREE.SphereGeometry( _self._innerBowlRad, 128, 128, 0, Math.PI * 2, Math.PI/2, 0.93 * Math.PI/2);
        var geom2 = new THREE.SphereGeometry( _self._outerBowlRad, 128, 128, 0, Math.PI * 2, Math.PI/2, 0.93 * Math.PI/2);
        var geom3 = new THREE.RingGeometry( _self._innerBowlRad, _self._outerBowlRad, 128, 8, 0, Math.PI * 2 );
        
        _self._innerBowl = new THREE.Mesh( geom1, mat1 );
        _self._outerBowl = new THREE.Mesh( geom2, mat2 );
        _self._bowlRim = new THREE.Mesh( geom3, mat3 );
       
        _self._innerBowl.position.copy(_self._initInnerBowlPos); 
        _self._outerBowl.position.copy(_self._initOuterBowlPos);
        _self._bowlRim.position.copy(_self._initBowlRimPos);
        _self._bowlRim.rotation.x = Math.PI/2;
        
        Scene.addObject( _self._innerBowl );
        Scene.addObject( _self._outerBowl );
        Scene.addObject( _self._bowlRim );
    };

    _self.addMagnitudeBar = function() { 
        var geometry = new THREE.CylinderGeometry( 0.5, 0.5, _self._magnitudeBarHeight, 32 );
        var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, emissive:0x00ff01} );
        _self._magnitudeBar = new THREE.Mesh( geometry, material );
        _self._magnitudeBar.position.copy(_self._initMagnitudeBarPos); 
        _self._magnitudeBar.rotation.x = Math.PI/2; 

        Scene.addObject( _self._magnitudeBar );

    };

    _self.addGravityBar = function() { 

        var geometry = new THREE.CylinderGeometry( 0.5, 0.5, _self._gravityBarHeight, 32 );
        var material = new THREE.MeshPhongMaterial( {color: 0xff0000, emissive:0xff0001} );
        _self._gravityBar = new THREE.Mesh( geometry, material );
        _self._gravityBar.position.copy(_self._initGravityBarPos); 

        Scene.addObject( _self._gravityBar );

    };

    _self.moveInteractiveRing = function( hoopPosition ) {

        var current_angle = new THREE.Vector3(0, 0, 1).angleTo(_self._rings[0].position);
        var new_angle = hoopPosition * Math.PI / 180.0 - current_angle;

        _self._rings[0].position.applyAxisAngle( new THREE.Vector3(1, 0, 0), new_angle );
    
    };

    _self.addRing = function( i, level, rad ) {
        var z   = (-0.1 - 0.8 * Math.abs(Math.random())) * rad; // only account for z values in the lower half
        var phi = 2.0 * Math.PI * i / level;
        var d   = Math.sqrt( rad * rad - z * z );
        var px  = d * Math.cos(phi);
        var py  = d * Math.sin(phi);
        var pz  = z;  
        var tPos = new THREE.Vector3( py, pz, px );
        var tGeom = new THREE.TorusGeometry( 12, 0.7, 100, 100, Math.PI * 2 );

        var material = new THREE.MeshBasicMaterial(); 
        material.color.setRGB(1, 0, 0); 
        var tMesh = new THREE.Mesh( tGeom, material );

        tMesh.position.copy( tPos );
        tMesh.rotation.y = phi + Math.PI/2; // to orient hoop with center.
        Scene.addObject( tMesh );

        _self._rings.push(tMesh); // save ring in array
        _self._rings_to_pass.push(tMesh);
    };

    _self.addRings = function(level) {
        
        // add light blue randomized toroidal hoops
        var rad = 50; // radius in which rings are added 
      
        _self._rings = [];
        _self._rings_to_pass = []; 

        // for interactive mode
        if (level == 0) {
            _self.addRing( 1, 1, rad);
        }
        else {
            for ( var i = 0; i < level; i++ ) {
                _self.addRing(i, level, rad);
            }
        }

        _self.calculateRingPoints();
    };

    _self.calculateRingPoints = function( rings ) {
        _self._rings_tube_centers = [];

        for (var i = 0; i < _self._rings.length; i++) {
            var ring_center = new THREE.Vector3(0, 0, 0);
            ring_center.copy( _self._rings[i].position );

            var ring_radius = _self._rings[i].geometry.parameters.radius;
            var tube_radius = _self._rings[i].geometry.parameters.tube;

            var center_bowl_center_ring = new THREE.Vector3(0, 0, 0);
            center_bowl_center_ring.copy( _self._initInnerBowlPos );
            center_bowl_center_ring.sub( _self._rings[i].position );

            var center_bowl_projection = new THREE.Vector3(0, -1, 0); // project onto y axis

            var center_bowl_you = new THREE.Vector3(0, 0, 0);
            center_bowl_you.copy(center_bowl_projection.cross( center_bowl_center_ring ));
            
            var rotation_angle = Math.atan( (ring_radius + tube_radius) / center_bowl_center_ring.length() );

            var center1 = new THREE.Vector3(0, 0, 0);
            center1.copy( _self._rings[i].position );
            center1.applyAxisAngle( center_bowl_you.normalize(), rotation_angle );

            var center2 = new THREE.Vector3(0, 0, 0);
            center2.copy( _self._rings[i].position );
            center2.applyAxisAngle( center_bowl_you.normalize(), (-rotation_angle) );

            centers = [];
            centers.push( center1 );
            centers.push( center2 );
            _self._rings_tube_centers.push( centers );
        }
    };


    _self.initScene = function () {

        // add objects 
        _self.addBall(); 
        _self.addBowls(); 
        _self.addRings(_self.getLevel()); 
        _self.addMagnitudeBar(); 
        _self.addGravityBar(); 

    };

    // if reset = true, set score to 'score', else add 'score' to current score 
    _self.updateScore = function(score, reset) { 
        if (reset) document.getElementById("score").innerHTML = "" + score;
        else {
            var oldScore = parseInt(document.getElementById("score").innerHTML); 
            document.getElementById("score").innerHTML = "" + (oldScore + score); 
        }
    };

    _self.getScore = function() { 
        var score = parseInt(document.getElementById("score").innerHTML); 
        return score;
    };

    // if reset = true, set level to 'level', else add 'level' to current level 
    _self.updateLevel = function(level, reset) { 
        if (reset) document.getElementById("level").innerHTML = "" + level;
        else {
            var oldLevel = parseInt(document.getElementById("level").innerHTML); 
            document.getElementById("level").innerHTML = "" + (oldLevel + level); 
        }
    };

    _self.getLevel = function() { 
        var level = parseInt(document.getElementById("level").innerHTML); 
        return level;
    };

    // if reset = true, set lives to 'numLives', else add 'numLives' to current number of lives 
    _self.updateLives = function(numLives, reset) { 
        if (reset) { 
            var table = document.getElementById("lives"); 
            var row = table.rows[0]; 

            var oldNumLives = row.cells.length; 
            // remove current hearts
            for (var i = 0; i < oldNumLives; i++) { 
                row.deleteCell(); 
            }

            // add new hearts 
            for (var i = 0; i < numLives; i++) { 
                var cell = row.insertCell(i);                 
                cell.innerHTML = "<img src='images/heart.png' width='30px'></img>"; // heart 
            }
        }
        else {
            var table = document.getElementById("lives");
            var row = table.rows[0];  
            var oldNumLives = row.cells.length; 

            for (var i = 0; i < numLives; i++) { 
                var cell = row.insertCell(oldNumLives + i);                 
                cell.innerHTML = "<img src='images/heart.png' width='30px'></img>"; // heart 
            }
        }
    };

    _self.getLives = function() { 
        var table = document.getElementById("lives"); 
        return table.rows[0].cells.length; 
    };

    return _self;
})();