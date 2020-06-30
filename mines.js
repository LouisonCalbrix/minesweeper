// Louison Calbrix
// July 2020
// Minesweeper game in plain javascript

// Return random integer between lowerbound and upperbound (upperbound not included)
const randInt = function(lowerbound, upperbound) {
    let range = upperbound - lowerbound;
    if (range<=0) {
        throw new Error(`randInt: lowerbound (${ lowerbound }) should be less than upperbound (${ upperbound }).`);
    }
    return lowerbound + Math.floor(Math.random() * range);
}

/////////////////////////////////////////////////////////////Minefield

// TODO: 
// * random bombs
// * first position is not a bomb!
let Grid = function(width, height) {
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.array = new Array();
    for (let i=0; i<height; i++) {
        let row = new Array();
        for (let j=0; j<width; j++) {
            row.push(randInt(1, 11));
        }
        this.array.push(row);
    }
}

const difficulty = [
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

let gridA = new Grid(5, 5);
const proxyArray = ProxyArray(gridA);

