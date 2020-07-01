// Louison Calbrix
// July 2020
// Minesweeper game in plain javascript



// Return random integer between lowerbound and upperbound (upperbound not included)
const randInt = function(lowerbound, upperbound=0) {
    if (upperbound===0)                       // function used with one argument
        return Math.floor(Math.random() * lowerbound);

    let range = upperbound - lowerbound;
    if (range<=0)
        throw new Error(`randInt: lowerbound (${ lowerbound }) should be less than upperbound (${ upperbound }).`);

    return lowerbound + Math.floor(Math.random() * range);
}

/* compare two positions
 * positions should be array-like objects containing coordinates for different axes
 */
let eqPos = function(posA, posB) {
    if (posA.length!==posB.length)
        throw new Error(`eqPos: ${ posA } and ${ posB } have different lengths.`);
    for (let i=0; i<posA.length; i++) {
        if (posA[i]!==posB[i])
            return false;
    }
    return true;
}

// return true if any position in array is equal to pos
let posIn = function(array, pos) {
    return array.some(position => eqPos(position, pos));
}

/////////////////////////////////////////////////////////////Minefield

// TODO: 
// * reveal
// * graphic interface to see the result and ease testing
let Minefield = function(width, height, pos, nbBombs) {
    this.gameOver = false;

    this.nbBombs = nbBombs;
    this.width = width;
    this.height = height;

    this.array = new Array(height);
    for (let i=0; i<height; i++) {
        this.array[i] = new Array(width).fill(0);
    }
    this.view = new Array();

    // randomly pick nbBombs position where bombs will be located
    let bombArray = new Array();
    while (bombArray.length!==nbBombs) {
        [posX, posY] = [randInt(width), randInt(height)];
        if (!eqPos([posX, posY], pos) && !posIn(bombArray, [posX, posY])) {
            this.array[posY][posX] = 'X';
            bombArray.push([posX, posY]);
        }
    }

    // for each bomb add one to all neighboors
    for (let [posX, posY] of bombArray) {
        for (let i=-1; i<2; i++) {
            for (let j=-1; j<2; j++) {
                if (j!==0 || i!==0) {
                    if (posX+i>=0 && posX+i<width && posY+j>=0 && posY+j<height)
                        this.array[posY+j][posX+i]!=='X' ? this.array[posY+j][posX+i]++ : 0;
                }
            }
        }
    }
}

Minefield.prototype.reveal = function(pos) {
    if (!this.gameOver) {
        let [posX, posY] = pos;
        if (this.array[posY][posX]==='X') {
            this.view.push(pos);
            this.gameOver = true;
        }
        else if (!posIn(this.view, pos)) {
            this.view.push(pos);
            if (this.array[posY][posX]===0) {
                for (let i=-1; i<2; i++) {
                    for (let j=-1; j<2; j++) {
                        if (j!==0 || i!==0) {
                            if (posX+i>=0 && posX+i<this.width && posY+j>=0 && posY+j<this.height)
                                this.reveal([posX+i, posY+j]);
                        }
                    }
                }
            }
        }
    }
}

Minefield.prototype.print = function() {
    let stringRep = '';
    for (let y=0; y<this.array.length; y++) {
        for (let x=0; x<this.array[y].length; x++) {
            if (posIn(this.view, [x, y])) {
                stringRep += this.array[y][x];
            }
            else {
                stringRep += '.';
            }
        }
        stringRep += '\n';
    }
    console.log(stringRep);
}

const difficulties = [
    [9, 9, 10],
    [14, 16, 40],
    [16, 30, 99]
];

/////////////////////////////////////////////////////////////////Proxy

const handlerArray = {
    get: function(obj, prop) {
        if (isNaN(prop))
            return obj[prop];
        return obj.array[prop];
    }
}

const ProxyArray = grid => new Proxy(grid, handlerArray);

//////////////////////////////////////////////////////////////////Test

let gridA = new Minefield(9, 9, [2, 2], 10);
const proxyArray = ProxyArray(gridA);
