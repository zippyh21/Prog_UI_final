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
//@ = player1
//$ = player2
//# = wall

const scale = 20;
const playerXSpeed = 7;
const playerYSpeed = 7;

class Level {
    constructor(plan){
        let rows = plan.trim().split("\n").map(line => [...line]);
        

        this.height = rows.length;
        this.width = rows[0].length;
        this.rows = [];
        this.players = [];

        

        for (let y = 0; y < this.height; y++) {
            this.rows.push([]);
            for (let x = 0; x < this.width; x++) {
                let ch = rows[y][x];
              
                let type = levelChars[ch];
                // levelChars is defined below, after the Player, Coin
                // and Lava classes (because it references them).

                if (typeof type === Player) {
                    let pos = new Vec(x, y);
                    let player = Player.create()
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

    constructor(level, player, status) {
  
      this.level = level;
      this.player = player;
      this.status = status;
    }
  
    // As an alternative to the constructor, this method can be
    // used to create a new State object, given just a Level
    // object (actors will be taken from the Level object's
    // start actors, and the value of status will be "playing").
    static start(level) {
      return new State(level, level.player, "playing");
    }
  
    // Get the object representing the player at some point in
    // the game (includes Vec object to track the player's
    // position.)
    get player() {
      return player;
    }
  
    // From page 266 ("Motion and Collision").
    update(timeStep, keys) {
      let player = player.update(timeStep, this, keys);
    
      let newState = new State(this.level, player, this.status);
  
      //if (newState.status != "playing") return newState;
      
      return newState;
      //edit in goal logic here checking for collision with goal
      /*
        if (this.level.touches(player.pos, player.size, "obstacle")) {
      return new State(this.level, players, "lost");
  }
    */

  
      
      
    }
}

class Player{
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }
    
    static create(pos) {
      return new Player(pos, new Vec(0, 0));
    }
    
    get type() {
        return "Player";
    }
      
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
        return new Player(pos, new Vec(xSpeed, ySpeed));
      }
}
Player.prototype.size = new Vec(.8, .8);

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

  function drawGrid(level) {
  
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

  function drawActors(actors) {
    // Doesn't actually draw the actors.  Creates a tree of DOM
    // elements, with a <div> at the root, which if added to the
    // webpage will draw the actors.  Actors' style properties are
    // set so that they will show up on top of the background map.
  
    let rects = [];
    //console.log(actors);
    
      //console.log("1")
      //console.log(actor);
      //console.log(actor.type)
      let rect = elt("div", player);
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