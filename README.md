# Bowling
A simple 3D game with custom physics (made for COS 426 - Computer Graphics). 

---

## Instructions

1) The player specifies the initial magnitude of the ball’s speed in the tangent direction, as well as the magnitude of gravity.

2) The ball will roll and either pass through or collide with a number of randomly-generated hoops. 

3) Each time the ball passes through a hoop, the score is incremented by 1 point.

4) Once the ball slows and reaches the central hole at the bottom of of the bowl, it falls through, and the player must restart. 

The player can choose between four modes: **Basic**, **Intermediate**, **Advanced**, and **Interactive**. The difference between the first three modes is the number of hoops inside the bowl; the more hoops, the harder it is to roll the ball through all of them in one try.  

**Interactive** mode allows the player to control the position of the hoop along one direction in an attempt to ”catch” the ball as it rolls. The player can also control the tangential velocity of the ball, as well as the force of gravity, as it rolls.

## Implementation 

Created by *@rkaneriya, Violeta Ilieva, and Kai Okada*. 

Credits: 

* Modeling and rendering done using the [three.js framework](http://www.threejs.org "three.js")
* Audio files from Mac OS X’s system sound files
* Earth (Ball Texture): http://planetpixelemporium.com/earth.html
* Asteroid (Bowl Texture): http://www.spiralgraphics.biz/packs/terrain_desert_barren/?1
* Background: http://hdw.eweb4.com/search/galaxy/