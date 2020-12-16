/* Louison Calbrix
 * July 2020
 * Minesweeper game in plain javascript
 * This file provides a function for building minesweeper game grid. It is 
 * possible to play a game of minesweeper with only the content of that file 
 * but that would be inside a javascript console, and would require the user
 * to know the functions of the Minesweeper prototype (probably not the best
 * experience there is).
 */

'use strict';

/* Auxiliary/helper functions:
 * These functions are not strictly related to the Minesweeper game and are not
 * meant to be used outside this file.
 */

// Return random integer between lowerbound and upperbound (upperbound not included)
const randInt = function(lowerbound, upperbound=undefined) {
    if (upperbound===undefined)                   // function used with one argument
        return Math.floor(Math.random() * lowerbound);

    const range = upperbound - lowerbound;
    if (range<=0)
        throw new Error(`randInt: lowerbound (${ lowerbound }) should be less than upperbound (${ upperbound }).`);

    return lowerbound + Math.floor(Math.random() * range);
}

/* Return true if posA and posB are equal
 * positions should be array-like objects containing coordinates for different axes
 */
const eqPos = function(posA, posB) {
    if (posA.length!==posB.length)
        throw new Error(`eqPos: ${ posA } and ${ posB } have different lengths.`);
    for (let i=0; i<posA.length; i++) {
        if (posA[i]!==posB[i])
            return false;
    }
    return true;
}

// Return true if any position in array is equal to pos
const posIn = function(array, pos) {
    return array.some(position => eqPos(position, pos));
}


//-----------------------------------------------------------Minefield

// default difficulties
const difficulties = new Map(
    [['EASY', [9, 9, 10]],
    ['MEDIUM', [16, 14, 40]],
    ['HARD', [30, 16, 99]]]
);

// Special character used to represent flags, bombs and unrevealed positions
const BOMB = 'X';
const FLAG = 'P';
const UNREV = '.';
const EMPTY = ' ';

// Values to represent the state of the current game: lost, playing, won
const PLAYING = 'pl';
const LOST = 'lo';
const WON = 'wo';

// Constructor
const Minefield = function(width, height, pos, nbBombs) {
    this.state = PLAYING

    this.nbBombs = nbBombs;
    this.nbFlags = 0;
    this.width = width;
    this.height = height;

    this.bombs = new Array(height);
    this.view = new Array(height);
    for (let i=0; i<height; i++) {
        this.bombs[i] = new Array(width).fill(0);
        this.view[i] = new Array(width).fill(UNREV);
    }

    // randomly pick nbBombs position where bombs will be located
    const bombArray = new Array();
    while (bombArray.length!==nbBombs) {
        const [posX, posY] = [randInt(width), randInt(height)];
        if (!eqPos([posX, posY], pos) && !posIn(bombArray, [posX, posY])) {
            this.bombs[posY][posX] = BOMB;
            bombArray.push([posX, posY]);
        }
    }

    // for each bomb add one to all neighboors
    for (const [bombX, bombY] of bombArray)
        for (const [posX, posY] of this._neighbors([bombX, bombY]))
            if (this.bombs[posY][posX] !== BOMB)
                this.bombs[posY][posX]++;
    this.bombs = this.bombs.map(row => row.map(tile => tile.toString()));

    // debug
    console.log(this.bombs.map(row => row.join(' ')).join('\n'));

    return this.reveal(pos);
}

// Interface for instances of Minefield

// Return a Minefield instance where the view has the given position revealed
Minefield.prototype.reveal = function([posX, posY]) {
    if (this.state !== PLAYING)
        return this;

    const view = this._explore([posX, posY]);
    if (view[posY][posX]===BOMB)
        return Minefield.from(this, {state: LOST, view});
    else
        return Minefield.from(this, {view});
}

// Return a Minefield instance where the view has a flag at the given position 
Minefield.prototype.flag = function([posX, posY]) {
    if (this.state!==PLAYING)
        return this;

    const view = Array.from(this.view);
    let nbFlags = this.nbFlags;
    let state = this.state;
    if (this.view[posY][posX]===UNREV) {
        nbFlags++;
        view[posY][posX] = FLAG;
        if (this._checkWin(view, nbFlags))
            state = WON;
    }
    else if (this.view[posY][posX]===FLAG) {
        nbFlags--;
        view[posY][posX] = UNREV;
    }
    else 
        return this;
    return Minefield.from(this, {view, nbFlags, state});
}

// Private functions of the Minefield prototype

// Return an array containing all the positions adjacent to the given pos
Object.defineProperty(Minefield.prototype, '_neighbors', {
    value: function([posX, posY]) {
        const locations = new Array();
        for (let i=-1; i<2; i++)
            for (let j=-1; j<2; j++)
                if (posX+i >= 0 && posX+i < this.width &&
                    posY+j >= 0 && posY+j < this.height &&
                    (i !== 0 || j !== 0))
                    locations.push([posX+i, posY+j]);
        return locations;
    }
});

// Return a view array that has been explored around the given position
Object.defineProperty(Minefield.prototype, '_explore', {
    value: function([exploreX, exploreY]) {
        const viewCopy = Array.from(this.view);
        const locations = [[exploreX, exploreY]];
        let index = 0;
        while(index < locations.length) {
            [exploreX, exploreY] = locations[index]
            if (viewCopy[exploreY][exploreX] === UNREV) {
                viewCopy[exploreY][exploreX] = this.bombs[exploreY][exploreX];
                if (viewCopy[exploreY][exploreX] == 0) {
                    viewCopy[exploreY][exploreX] = EMPTY;
                    for (const [posX, posY] of this._neighbors([exploreX, exploreY]))
                        locations.push([posX, posY]);
                }
            }
            index++;
        }
        return viewCopy;
    }
});

// Return true if the all bombs are flaged
Object.defineProperty(Minefield.prototype, '_checkWin', {
    value: function(view, nbFlags) {
        if (nbFlags!==this.nbBombs)
            return false;
        for (let row=0; row<this.height; row++)
            for (let col=0; col<this.width; col++)
                if (this.bombs[row][col]===BOMB && view[row][col]!==FLAG)
                    return false;
        return true;
    }
});

// Function property of Minefield

// Return a copy of instance with attributes present in changes updated
Minefield.from = function(instance, changes={}) {
    const instance2 = Object.create(Minefield.prototype);
    for (const attr in instance)
        instance2[attr] = changes.hasOwnProperty(attr) ? changes[attr] :  instance[attr];
    return instance2;
}


// Export
export { Minefield, difficulties, UNREV, FLAG, BOMB, EMPTY, PLAYING, LOST, WON };
