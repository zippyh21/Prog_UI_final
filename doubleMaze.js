const newLevel = `
......................
..#................#..
..#....@.$.........#..
..#................#..
..#........#####...#..
..#................#..
......#............#..
......##############..
......................`;

const exampleLevel = `
..............G.......
..#....#.............#.
..#.#....@.#....#.....#.
..#.#....#...#..........
..#.#.####.#.#####.###..
..#.......#.#....#.....#.
..###..###..#...#.#..#..
.#...#.....#.....#....#..
#....#.#.....#...#.....#.
.....#.....#.#...#.#..#..
.....#.#...#.#..#....#..
.#...#..#.####.#.#..#...
.#.#....#.....#.#..#....
...#.#...###.#....#.....#
....#.....#.#.#..#......#
.....#.#.#.#.#......#.
..$...###.#.#.#.#......#
......................#..
`;



//G = goal
//@ = player
//# = wall

//MAKE GOAL NOT AN ACTOR
//try getting rid of the whole actor component of the game

//it might be easier to just have 1 level with two charecters
//both getting to the same goal

const scale = 20;
const playerXSpeed = 7;
const playerYSpeed = 7;

class Level {
    constructor(plan){
        let rows = plan.trim().split("\n").map(line => [...line]);
        // At this point, rows is a 2D array of individual characters.
        // rows[0][0] is the character in the upper left corner, rows[0][1]
        // is the character to the right of rows[0][0], rows[1][0] is the
        // character below rows[0][0], etc.

        this.height = rows.length;
        this.width = rows[0].length;
        this.players = [];

        this.rows = [];
        for (let y = 0; y < this.height; y++) {
            this.rows.push([]);
            for (let x = 0; x < this.width; x++) {
                let ch = rows[y][x];
              
                let type = levelChars[ch];
                // levelChars is defined below, after the Player, Coin
                // and Lava classes (because it references them).

                if (typeof type != "string") {
                    let pos = new Vec(x, y);
                    //console.log("pushing player " + type);
                    this.players.push(type.create(pos, ch));
                    type = "empty";
                }

                this.rows[y].push(type);
                }
        }
    }

    touches(pos, size, type) {
        let xStart = Math.floor(pos.x);
        let xEnd = Math.ceil(pos.x + size.x);
        let yStart = Math.floor(pos.y);
        let yEnd = Math.ceil(pos.y + size.y);
    
        for (let y = yStart; y < yEnd; y++) {
          for (let x = xStart; x < xEnd; x++) {
    
            // Treat any potential movement to a position outside
            // the map as if it would collide with a wall.
            let isOutside =
              x < 0 || x >= this.width || y < 0 || y >= this.height;
            let here = isOutside ? "wall" : this.rows[y][x];
            
            if (here === type) return true;
          }
        }
    
        return false;
      }
}



class State {

    constructor(level, players, status) {
      // The current state of the game consists of 1) the level,
      // which contains the map of the board (as a 2D array of
      // types like "empty", "wall", "lava", etc.); 2) an array
      // of actors, which are Player, Lava or Coin objects (and
      // contain Vec objects to track the actor's position); and
      // 3) a status string ("playing" for example). 
  
      this.level = level;
      this.players = players;
      this.status = status;
    }
  
    // As an alternative to the constructor, this method can be
    // used to create a new State object, given just a Level
    // object (actors will be taken from the Level object's
    // start actors, and the value of status will be "playing").
    static start(level) {
      return new State(level, level.players, "playing");
    }
  
    // Get the object representing the player at some point in
    // the game (includes Vec object to track the player's
    // position.)
    get player1() {
      return this.players.find(a => a.type === "Player1");
    }
    get player2() {
      console.log("test1: " + players)
        return this.players[1];
      }
  
    // From page 266 ("Motion and Collision").
    update(timeStep, keys) {
      let players = this.players.map(
        player => player.update(timeStep, this, keys));
        //updates each player
      let newState = new State(this.level, players, this.status);
  
      //if (newState.status != "playing") return newState;
      
      return newState;
      //edit in goal logic here checking for collision with goal
      /*
        if (this.level.touches(player.pos, player.size, "obstacle")) {
      return new State(this.level, players, "lost");
  }
    */

  
      // From page 267 ("Motion and Collision").
      

      //checks if actors touch, not needed
      /*
      function overlap(actor1, actor2) {
        return actor1.pos.x + actor1.size.x > actor2.pos.x &&
              actor1.pos.x < actor2.pos.x + actor2.size.x &&
              actor1.pos.y + actor1.size.y > actor2.pos.y &&
              actor1.pos.y < actor2.pos.y + actor2.size.y;
      }

      
      for (let player of players) {
        //actor 
        if (overlap(actor, player)) {
          newState = actor.collide(newState);
        }
      }
      */
      
    }
}


class Vec {

    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    plus(other) {
      return new Vec(this.x + other.x, this.y + other.y);
    }
    times(factor) {
      return new Vec(this.x * factor, this.y * factor);
    }
}
  
  
class Player1 {
    //only slighlty different color
    //must be independant so that their collision physics are seperate
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }
    
      // As an alternative to the constructor, you can use this method
      // to create a Player object based on a Vec representing the
      // player's position, with initial speed zero.  (0.5 is subtracted
      // from the y coordinate of the player's position, because the
      // player is drawn more than one unit tall.)
    static create(pos) {
      //console.log(pos.x);
      return new Player1(pos, new Vec(0, 0));
    }
    
    get type() {
        return "Player1";
    }
      
      // From pages 268-269 ("Actor Updates").
    update(timeStep, state, keys) {
        let xSpeed = 0;
        let ySpeed = 0;
    
        if (keys.ArrowLeft) xSpeed -= playerXSpeed;
        if (keys.ArrowRight) xSpeed += playerXSpeed;
        if (keys.ArrowUp) ySpeed -= playerYSpeed;
        if (keys.ArrowDown) ySpeed += playerYSpeed;
    
        let pos = this.pos;
        let movedX = pos.plus(new Vec(xSpeed * timeStep, 0));
        
    
        if (!state.level.touches(movedX, this.size, "wall")) {
            pos = movedX;
        }

        let movedY = pos.plus(new Vec(0, ySpeed * timeStep));
        //console.log(state.Player2)
        // && !state.level.touches(state.Player1.pos.plus(new Vec(xSpeed * timeStep, 0)), this.size, "wall")
        if (!state.level.touches(movedY, this.size, "wall")) {
            pos = movedY;
        }
        return new Player1(pos, new Vec(xSpeed, ySpeed));
      }
}
    
Player1.prototype.size = new Vec(.8, .8);


class Player2 {
  constructor(pos, speed) {
    this.pos = pos;
    this.speed = speed;
  }

  // As an alternative to the constructor, you can use this method
  // to create a Player object based on a Vec representing the
  // player's position, with initial speed zero.  (0.5 is subtracted
  // from the y coordinate of the player's position, because the
  // player is drawn more than one unit tall.)
  static create(pos) {
    return new Player2(pos, new Vec(0, 0));
  }

  get type() {
    return "Player2";
  }
  
  // From pages 268-269 ("Actor Updates").
  update(timeStep, state, keys) {
    let xSpeed = 0;
    let ySpeed = 0;

    if (keys.ArrowLeft) xSpeed -= playerXSpeed;
    if (keys.ArrowRight) xSpeed += playerXSpeed;
    if (keys.ArrowUp) ySpeed -= playerYSpeed;
    if (keys.ArrowDown) ySpeed += playerYSpeed;

    let pos = this.pos;
    let movedX = pos.plus(new Vec(xSpeed * timeStep, 0));
    

    if (!state.level.touches(movedX, this.size, "wall")) {
        pos = movedX;
    }

    let movedY = pos.plus(new Vec(0, ySpeed * timeStep));
    if (!state.level.touches(movedY, this.size, "wall")) {
        pos = movedY;
    }
    return new Player2(pos, new Vec(xSpeed, ySpeed));
  }
    //only slighlty different color
    //must be independant so that their collision physics are seperate

}

Player2.prototype.size = new Vec(.8, .8);


/*** elt ***********************************************************/

// From page 260 ("Drawing").  This function creates a DOM
// element, adding attributes (i.e., properties like style etc.)
// and child elements.  (The child elements may have been
// created by this function.)
function elt(name, attrs, ...children) {
    // name here is, e.g., "div" or "tr".
  
    let dom = document.createElement(name);
  
    for (let attr of Object.keys(attrs)) {
      dom.setAttribute(attr, attrs[attr]);
        // attr here is the key ("style"); attrs[attr] is
        // the value ("height: 100px; width: 50px").
    }
  
    for (let child of children) {
      dom.appendChild(child);
    }
  
    return dom;
}
  
  
  /*** DOMDisplay ****************************************************/
  
  // From page 261 ("Drawing").
class DOMDisplay {
  
  constructor(parent, level) {
      this.dom = elt("div", { class: "game" }, drawGrid(level));
      this.actorLayer = null;
      parent.appendChild(this.dom);
  }
  
  clear() {
    this.dom.remove();
  }
  
    // From pages 262 ("Drawing").
  syncState(state) {
    //state is undefined
    if (this.actorLayer !== null) {
      this.actorLayer.remove();
    }
      this.actorLayer = drawActors(state.players);
      this.dom.appendChild(this.actorLayer);
      this.dom.className = `game ${ state.status }`;
  }
}

  
  /*** drawGrid, drawActors ******************************************/
  
  // From page 261 ("Drawing").  Modified to use a for loop.
function drawGrid(level) {
    // Doesn't actually draw the background map.  Creates a tree of
    // DOM elements, with a <table> at the root, which if added to the
    // webpage will draw the map.
  
    let trs = [];
  
    for (let row of level.rows) {
      let tds = row.map(type => elt("td", { class: type }));
      let tr = elt("tr", { style: `height: ${ scale }px` }, ...tds);
      trs.push(tr);
    }
  
    let attrs = {
      class: "background",
      style: `width: ${ level.width * scale }px`
    };
  
    return elt("table", attrs, ...trs);
  }
  
  // From page 262 ("Drawing").  Modified to use a for loop.
function drawActors(actors) {
    // Doesn't actually draw the actors.  Creates a tree of DOM
    // elements, with a <div> at the root, which if added to the
    // webpage will draw the actors.  Actors' style properties are
    // set so that they will show up on top of the background map.
  
    let rects = [];
    //console.log(actors);
    for (let actor of actors) {
      //console.log("1")
      //console.log(actor);
      //console.log(actor.type)
      let rect = elt("div", { class: `actor ${ actor.type }` });
        // rect element will have two classes:  "actor" and also
        // whatever class corresponds to its type ("empty",
        // "wall", etc.).
  
      rect.style.width = `${ actor.size.x * scale }px`;
      rect.style.height = `${ actor.size.y * scale }px`;
      rect.style.left = `${actor.pos.x * scale }px`;
      rect.style.top = `${actor.pos.y * scale }px`;
      rects.push(rect);
    }
  
    return elt("div", {}, ...rects);
  }
  
  
  /*** trackKeys, arrowKeys ******************************************/
  
  // From page 269 ("Tracking Keys").
function trackKeys(keys) {
    let down = Object.create(null);
      // Object.create(null) used here, instead of {}, so that
      // down will be created with no prototype and won't include
      // any default properties except what we add.  (See page 103, or
      // chapter 6 after heading "Maps.")
  
    function track(event) {
      if (keys.includes(event.key)) {
  
        down[event.key] = event.type === "keydown";
          // event.key will be "ArrowLeft", "ArrowRight", or
          // "ArrowUp".  down.ArrowLeft (for example) will
          // be set to true if track is called because of a
          // keydown event from the left arrow key; down.ArrowLeft
          // will be set to false if track is called because of
          // a keyup event from the left arrow key.
        
        event.preventDefault();
          // "ArrowLeft", "ArrowRight" and "ArrowUp" will only 
          // affect what's going on in the game; they won't have
          // default behaviors in the browser window.
      }
    }
  
    window.addEventListener("keydown", track);
    window.addEventListener("keyup", track);
  
    return down;
      // The object created in this function, and connected to
      // key events in the window via the inner function track,
      // is returned here so that other parts of the program
      // can be connected to key events via this object.
}
  
const arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

const levelChars = {
  ".": "empty",
  "#": "wall",
  "G": "goal",
  "@": Player1,
  "$": Player2
};

  
  /*** runAnimation, runLevel, runGame *******************************/
  
  // From page 270 ("Running the Game").
function runAnimation(frameFunc) {
    let prevTime = null;
  
    function frame(time) {
      // First time frame is called (via first call to
      // requestAnimationFrame), prevTime will be null.  When
      // frame is called again (recursively via
      // requestAnimationFrame), time-prevTime will be the
      // length of time since the last frame.  timeStep will
      // be that difference, converted from milliseconds to
      // seconds; up to a max of 0.1 seconds.
      
      if (prevTime != null) {
        let timeStep = Math.min(time - prevTime, 100) / 1000;
        
        if (frameFunc(timeStep) === false) return;
          // As long as frameFunc returns true, it will keep
          // getting called (recursively via
          // requestAnimationFrame).  Once it returns false,
          // it will stop getting called again.
      }
  
      prevTime = time;
      requestAnimationFrame(frame);
    }
  
    requestAnimationFrame(frame);
}
  
  // From pages 270-271 ("Running the Game").
function runLevel(level, Display) {
  let display = new Display(document.body, level);
  let state = State.start(level);
  let ending = 1; // 1 second delay between levels.
  
  return new Promise(resolve => {
    runAnimation(timeStep => {
      state = state.update(timeStep, arrowKeys);
      //^^ error here
          // arrowKeys here is the object returned when trackKeys
          // was called above.  It's connected to key events in
          // the window in such a way that (for example)
          // arrowKeys.ArrowLeft will be true after a keydown
          // event for the left arrow key, or false after a keyup
          // event for the left arrow key.
      //state is undefined
      display.syncState(state);
  
      if (state.status === "playing") {
        return true;
        
      } else if (ending > 0) {
        ending -= timeStep; 
        return true;
        
      } else {
        display.clear();
  
        resolve(state.status);
            // resolve call here ends await delay in runGame.
  
        return false;
            // return (false) here stops requestAnimationFrame
            // from being called (repeatedly) in runAnimation.
        }
      });
    });
  }
  
  // From page 271 ("Running the Game").
async function runGame(plans, Display) {

    for (let level = 0; level < plans.length; ) {
      let status = await runLevel(
        new Level(plans[level]), Display);
  
      if (status === "won") level++;
    }
  
    console.log("You've won!");
}
  
  

