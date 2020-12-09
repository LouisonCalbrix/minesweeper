"use strict";

import { Minefield, difficulties } from './mines.js';

function _slicedToArray(arr, i) {
  return (
    _arrayWithHoles(arr) ||
    _iterableToArrayLimit(arr, i) ||
    _unsupportedIterableToArray(arr, i) ||
    _nonIterableRest()
  );
}

function _nonIterableRest() {
  throw new TypeError(
    "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr)))
    return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (
      var _i = arr[Symbol.iterator](), _s;
      !(_n = (_s = _i.next()).done);
      _n = true
    ) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

/* Picker component:
 * Given an array choices of {choice, description} and an index picked, it builds
 * a list of radio button to chose an option from. A function onChange is also
 * expected to be passed, which will be called by the selected radio button with
 * its index in choice as an argument. (the radio button for choice[i] will call
 * onChange(i))
 */
var Picker = function Picker(_ref) {
  var name = _ref.name,
    descriptions = _ref.descriptions,
    picked = _ref.picked,
    _onChange = _ref.onChange,
    buttonClass = _ref.buttonClass,
    rest = _objectWithoutProperties(_ref, [
      "name",
      "descriptions",
      "picked",
      "onChange",
      "buttonClass"
    ]);

  return /*#__PURE__*/ React.createElement(
    "div",
    rest,
    descriptions.map(function (description, i) {
      return /*#__PURE__*/ React.createElement(
        "span",
        {
          className: buttonClass
        },
        /*#__PURE__*/ React.createElement("input", {
          type: "radio",
          name: name,
          value: i,
          id: "".concat(name, "-").concat(description),
          onChange: function onChange() {
            return _onChange(i);
          },
          checked: i === picked
        }),
        /*#__PURE__*/ React.createElement(
          "label",
          {
            htmlFor: "".concat(name, "-").concat(description)
          },
          description
        )
      );
    })
  );
};
/* ResetButton component:
 * Can be clicked to reset the game, it also indicates whether the player
 * has won or lost.
 */

var SUN_WIN = "won";
var SUN_LOSE = "lost";
var SUN_NORMAL = "normal";

var ResetButton = function ResetButton(_ref2) {
  var gameState = _ref2.gameState,
    onClick = _ref2.onClick;
  return /*#__PURE__*/ React.createElement("button", {
    id: "reset",
    className: "sun-".concat(gameState),
    onClick: onClick,
    alt: "click here to reset game"
  });
};
/* Mineview component:
 *
 */

var BOMB = "X";
var FLAG = "P";
var UNREV = ".";
var tileClasses = new Map([
  [UNREV, "tile-unrevealed"],
  [BOMB, "tile-bomb"],
  [FLAG, "tile-flag"]
]);

var Row = function Row(_ref3) {
  var rowArray = _ref3.rowArray,
    y = _ref3.y,
    _onClick = _ref3.onClick,
    _onContextMenu = _ref3.onContextMenu;
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "mines-row"
    },
    rowArray.map(function (tile, x) {
      return /*#__PURE__*/ React.createElement(
        "div",
        {
          onClick: function onClick() {
            return _onClick(x, y);
          },
          onContextMenu: function onContextMenu(evt) {
            evt.preventDefault();

            _onContextMenu(x, y);
          },
          className: tileClasses.get(tile)
        },
        tile
      );
    })
  );
};

var Mineview = function Mineview(_ref4) {
  var minefield = _ref4.minefield,
    width = _ref4.width,
    height = _ref4.height,
    onClick = _ref4.onClick,
    onContextMenu = _ref4.onContextMenu;
  var view = minefield
    ? minefield.view
    : Array(height).fill(Array(width).fill(UNREV));
  return /*#__PURE__*/ React.createElement(
    "div",
    {id: 'game'},
    view.map(function (row, y) {
      return /*#__PURE__*/ React.createElement(Row, {
        y: y,
        rowArray: row,
        onClick: onClick,
        onContextMenu: onContextMenu
      });
    })
  );
}; // App component

var App = function App(props) {
  React.Component.call(this, props);
  this.state = {
    difficulty: 0,
    minefield: undefined,
    started: false
  };
};

App.prototype = Object.create(React.Component.prototype);
App.prototype.constructor = App;

App.prototype.mineviewLeftClick = function (i, j) {
  if (!this.state.started) {
    var _difficulties$this$st = _slicedToArray(
        difficulties[this.state.difficulty],
        3
      ),
      height = _difficulties$this$st[0],
      width = _difficulties$this$st[1],
      bombs = _difficulties$this$st[2];

    var minefield = new Minefield(width, height, [i, j], bombs);
    this.setState({
      minefield: minefield,
      started: true
    });
  } else {
    var _minefield = this.state.minefield.reveal([i, j]);

    this.setState({
      minefield: _minefield
    });
  }
};

App.prototype.mineviewRightClick = function (i, j) {
  if (this.state.started) {
    var minefield = this.state.minefield.flag([i, j]);
    this.setState({
      minefield: minefield
    });
  }
};

App.prototype.render = function () {
  var _this = this;

  var descriptions = ["EASY", "MEDIUM", "HARD"];
  var picked = this.state.difficulty;

  var _difficulties$picked = _slicedToArray(difficulties[picked], 3),
    height = _difficulties$picked[0],
    width = _difficulties$picked[1],
    bombs = _difficulties$picked[2];

  var minefield = this.state.minefield;
  var resetButtonClass = "sun-normal";

  if (minefield !== undefined) {
    if (minefield.win)
      resetButtonClass = resetButtonClass.replace("normal", "won");
    else if (minefield.gameOver)
      resetButtonClass = resetButtonClass.replace("normal", "lost");
  }

  return /*#__PURE__*/ React.createElement(
    "div",
    {
      id: "app"
    },
    /*#__PURE__*/ React.createElement(Picker, {
      className: 'picker',
      descriptions: descriptions,
      name: "difficulty",
      picked: picked,
      onChange: function onChange(i) {
        return _this.setState({
          difficulty: i,
          started: false,
          minefield: undefined
        });
      },
      buttonClass: "radio-button"
    }),
    /*#__PURE__*/ React.createElement("button", {
      onClick: function onClick() {
        return _this.setState({
          started: false,
          minefield: undefined
        });
      },
      id: 'reset-button',
      className: resetButtonClass,
      alt: "button to reset the game"
    }),
    /*#__PURE__*/ React.createElement(Mineview, {
      width: width,
      height: height,
      minefield: minefield,
      onClick: function onClick(i, j) {
        return _this.mineviewLeftClick(i, j);
      },
      onContextMenu: function onContextMenu(i, j) {
        return _this.mineviewRightClick(i, j);
      }
    })
  );
};

ReactDOM.render(
  /*#__PURE__*/ React.createElement(App, null),
  document.querySelector("#root")
);

