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
        let [posX, posY] = [randInt(width), randInt(height)];
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

Minefield.prototype.toString = function() {
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
    return stringRep;
}

Minefield.prototype.print = function() {
    console.log(this.toString());
}

const difficulties = [
    [9, 9, 10],
    [14, 16, 40],
    [16, 30, 99]
];

/////////////////////////////////////////////////////////Visualization

const gameSec = document.querySelector('#game-section');
let arrayTiles = [];

// callback function for when a tile is clicked
let clickTile = function(pos) {
    if (!clicked) {
        clicked = true;
        minefield = new Minefield(cols, rows, pos, bombs);
    }
    minefield.reveal(pos);
    refreshInterface(minefield);
    minefield.print();
}

// create a graphical interface for minefield using html elements
let initInterface = function(nbRows, nbCols) {
    // remove previously created interface
    let children = gameSec.childNodes;
    while (gameSec.childElementCount>0)
        gameSec.removeChild(children[0]);
    arrayTiles = [];
    for (let row=0; row<nbRows; row++) {
        let divRow = document.createElement('div');
        divRow.classList.add('row');
        gameSec.appendChild(divRow);
        let rowTiles = [];
        for (let column=0; column<nbCols; column++) {
            let divTile = document.createElement('div');
            divTile.classList.add('tile');
            divTile.addEventListener('click', event => clickTile([column, row]));
            divRow.appendChild(divTile);
            rowTiles.push(divTile);
        }
        arrayTiles.push(rowTiles);
    }
}

// give user graphic feedback of the minefield state
let refreshInterface = function(minefield) {
    let strRows = minefield.toString().split('\n');
    for (let y=0; y<strRows.length; y++) {
        for (let x=0; x<strRows[y].length; x++) {
            arrayTiles[y][x].innerText = strRows[y][x];
        }
    }
}

/////////////////////////////////////////////////////////HTML controls

let initGame = function(event) {
    rows = Number(rowRange.value);
    cols = Number(colRange.value);
    bombs = Number(bombRange.value);
    if (bombs<=rows*cols/2) {
        initInterface(rows, cols);
    }
    clicked = false;
}

const rowRange = document.querySelector('#rows');
const colRange = document.querySelector('#cols');
const bombRange = document.querySelector('#bombs');
const playButton = document.querySelector('#play');
playButton.addEventListener('click', initGame)

let rows = 0;
let cols = 0;
let bombs = 0;
let clicked = false;

//////////////////////////////////////////////////////////////////Test

var minefield;
