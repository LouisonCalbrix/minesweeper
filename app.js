import * as mines from "./mines.js";
/* Picker component:
 * Return a group of radio buttons.
 * Expected props:
 *      - name: the html name for the group of radio buttons
 *      - descriptions: a sequence of strings that each describes an option in the
 *          group
 *      - defaultPick: the index of the description for the default option picked
 *      - onChange: a function called when the radio button checked changes, this
 *          function can take as an argument an object of the form
 *          { description, indexOfDescription }
 *      - radioClass: the class name for every option of the Picker
 * Additional props will be attached to the wrapping div.
 */

const Picker = function ({
  name,
  descriptions,
  defaultPick,
  onChange,
  radioClass,
  ...rest
}) {
  return /*#__PURE__*/ React.createElement(
    "div",
    rest,
    descriptions.map((description, i) => {
      return /*#__PURE__*/ React.createElement(
        "span",
        {
          className: radioClass
        },
        /*#__PURE__*/ React.createElement("input", {
          type: "radio",
          name: name,
          value: description,
          id: `${name}-${description}`,
          defaultChecked: i === defaultPick,
          onChange: () =>
            onChange({
              description,
              i
            })
        }),
        /*#__PURE__*/ React.createElement(
          "label",
          {
            htmlFor: `${name}-${description}`
          },
          description
        )
      );
    })
  );
};
/* Return the value of the radio button checked in the group of radio buttons
 * that is named groupName.
 * Will throw an error if no such group is found.
 */

const checkedRadio = function (groupName) {
  const grp = document.querySelectorAll(`input[name=${groupName}`);

  for (const node of grp) if (node.checked) return node.value;

  throw new Error(`no radio group of name ${groupName}`);
}; //----------------------------------------Matrix component and related

/* Matrix component:
 * Return a table-like element.
 * Expected props:
 *      - array: the 2D array that must be translated into a pseudo-table
 *      - rowClass: the class name for every row in the Matrix
 *      - onClick, onContextMenu: functions to be called when a cell of the
 *          Matrix is respectively left-clicked or right-clicked
 *      - cellComponent: a component to be instanciated for every cell of the
 *          given 2D array. Such a component should accept props of the form
 *          { cell, x, y, onClick, onContextMenu }
 * Additional props will be attached to the wrapping div.
 */

const Matrix = function ({
  array,
  rowClass,
  onClick,
  onContextMenu,
  cellComponent,
  ...rest
}) {
  return /*#__PURE__*/ React.createElement(
    "div",
    rest,
    array.map((row, y) => {
      return /*#__PURE__*/ React.createElement(Row, {
        className: rowClass,
        row: row,
        y: y,
        onClick: onClick,
        onContextMenu: onContextMenu,
        cellComponent: cellComponent
      });
    })
  );
};
/* Row component:
 * Return a flat sequence of cells. This component is meant to be instanciated
 * by the Matrix component.
 * Expected props:
 *      - row: the flat (1D) array that must be translated into a Row
 *      - y: the number of the Row in the Matrix
 *      - onClick, onContextMenu: functions to be called when a cell of the
 *          Row is respectively left-clicked or right-clicked
 *      - cellComponent: a component to be instanciated for every cell of the
 *          given 2D array. Such a component should accept props of the form
 *          { cell, x, y, onClick, onContextMenu }
 * Additional props will be attached to the wrapping div.
 */

const Row = function ({
  row,
  y,
  onClick,
  onContextMenu,
  cellComponent,
  ...rest
}) {
  return /*#__PURE__*/ React.createElement(
    "div",
    rest,
    row.map((cell, x) =>
      cellComponent({
        x,
        y,
        onClick,
        onContextMenu,
        cell
      })
    )
  );
}; // Map to determine the CSS class of a cell based on its value

const cellClasses = new Map([
  [mines.UNREV, "tile-unrevealed"],
  [mines.BOMB, "tile-bomb"],
  [mines.FLAG, "tile-flag"]
]); // Cell component for the Minesweeper game

const mineCell = function ({ x, y, onClick, onContextMenu, cell }) {
  let className = cellClasses.get(cell);
  return /*#__PURE__*/ React.createElement(
    "span",
    {
      className: className,
      onClick: () => onClick(x, y),
      onContextMenu: (evt) => {
        evt.preventDefault();
        onContextMenu(x, y);
      }
    },
    cell
  );
}; //-------------------------------------------App component and related
// Dummy minefield used when the game hasn't started yet

const DUMMY = "du";

const dummyMinefield = function ([width, height, _]) {
  return {
    view: Array(height).fill(Array(width).fill(mines.UNREV)),
    state: DUMMY
  };
}; // App component

const App = function (props) {
  React.Component.call(this, props);
  Object.defineProperty(this, "difficulty", {
    enumerable: true,
    get: function () {
      return checkedRadio("difficulty");
    }
  });
  this.state = {
    minefield: dummyMinefield(mines.difficulties.get(descriptions[1]))
  };
};

App.prototype = Object.create(React.Component.prototype);
App.prototype.constructor = App; // Change the difficulty picked

App.prototype.changeDifficulty = function () {
  this.setState({
    minefield: dummyMinefield(mines.difficulties.get(this.difficulty))
  });
}; // Reset the on-going game of minesweeper

App.prototype.resetGame = function () {
  this.setState({
    minefield: dummyMinefield(mines.difficulties.get(this.difficulty))
  });
}; // Handle click events on the Matrix component that represents the minefield

/* Handle left click events
 * Reveal the minefield's cell at coordinates x, y if the minefield is not a dummy.
 * Create a minefield otherwise
 */

App.prototype.mineviewLeftClick = function (x, y) {
  if (this.state.minefield.state === DUMMY) {
    const [width, height, bombs] = mines.difficulties.get(this.difficulty);
    const minefield = new mines.Minefield(width, height, [x, y], bombs);
    this.setState({
      minefield
    });
  } else {
    const minefield = this.state.minefield.reveal([x, y]);
    this.setState({
      minefield
    });
  }
};
/* Handle right click events
 * Flag the minefield's cell at coordinates x, y if the minefield is not a dummy.
 */

App.prototype.mineviewRightClick = function (x, y) {
  if (this.state.minefield.state !== DUMMY) {
    const minefield = this.state.minefield.flag([x, y]);
    this.setState({
      minefield
    });
  }
}; // labels for the difficulty settings

const descriptions = Array.from(mines.difficulties.keys()); // Map to determine the reset button css class depending on the minefield state

const resetClasses = new Map([
  [mines.WON, "reset-won"],
  [mines.LOST, "reset-lost"],
  [mines.PLAYING, "reset-normal"]
]);

App.prototype.render = function () {
  const minefield = this.state.minefield;
  let resetButtonClass = resetClasses.get(minefield.state);
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      id: "app"
    },
    /*#__PURE__*/ React.createElement(Picker, {
      id: "picker",
      descriptions: descriptions,
      name: "difficulty",
      defaultPick: 1,
      onChange: () => this.changeDifficulty(),
      radioClass: "radio-button"
    }),
    /*#__PURE__*/ React.createElement("button", {
      id: "reset-button",
      className: resetButtonClass,
      onClick: () => this.resetGame(),
      alt: "button to reset the game"
    }),
    /*#__PURE__*/ React.createElement(Matrix, {
      id: "game",
      array: minefield.view,
      rowClass: "mines-row",
      onClick: (x, y) => this.mineviewLeftClick(x, y),
      onContextMenu: (x, y) => this.mineviewRightClick(x, y),
      cellComponent: mineCell
    })
  );
};

ReactDOM.render(
  /*#__PURE__*/ React.createElement(App, null),
  document.querySelector("#root")
);
