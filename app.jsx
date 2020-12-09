import { Minefield, difficulties } from './mines.js'

/* Picker component:
 * Given an array choices of {choice, description} and an index picked, it builds
 * a list of radio button to chose an option from. A function onChange is also
 * expected to be passed, which will be called by the selected radio button with
 * its index in choice as an argument. (the radio button for choice[i] will call
 * onChange(i))
 */
const Picker = function({name, descriptions, picked, onChange, buttonClass, ...rest}) {
    return (
        <div {...rest}>
            {descriptions.map((description, i) => {
                return (
                    <span className={buttonClass}>
                    <input type='radio'
                               name={name}
                               value={i}
                               id={`${name}-${description}`}
                               onChange={() => onChange(i)}
                               checked={i===picked}/>
                    <label htmlFor={`${name}-${description}`}>{description}</label>
                    </span>); 
            })}
        </div>
    );
}

/* Mineview component:
 *
 */
const BOMB = 'X';
const FLAG = 'P';
const UNREV = '.';
const tileClasses = new Map(
    [[UNREV, 'tile-unrevealed'],
    [BOMB, 'tile-bomb'],
    [FLAG, 'tile-flag']]
);
const Row = function({rowArray, y, onClick, onContextMenu}) {
    return (
        <div className='mines-row'>
            {rowArray.map((tile, x) => (
                <div 
                  onClick={() => onClick(x, y)}
                  onContextMenu={evt => {evt.preventDefault(); onContextMenu(x, y)}}
                  className={tileClasses.get(tile)}>
                    {tile}
                </div>
            ))}
        </div>
    );
}
const Mineview = function({minefield, width, height, onClick, onContextMenu}) {
    const view = minefield ? minefield.view : Array(height).fill(Array(width).fill(UNREV));
    return (
      <div id='game'>
        {view.map((row, y) => {
            return (
                <Row 
                  y={y}
                  rowArray={row}
                  onClick={onClick}
                  onContextMenu={onContextMenu} />
            );
        })}
      </div>
    );
}

// App component
const App = function(props) {
    React.Component.call(this, props);
    this.state = {
        difficulty: 0,
        minefield: undefined,
        started: false
    };
}
App.prototype = Object.create(React.Component.prototype);
App.prototype.constructor = App;

App.prototype.mineviewLeftClick = function(i, j) {
    if (!this.state.started) {
        const [height, width, bombs] = difficulties[this.state.difficulty];
        const minefield = new Minefield(width, height, [i, j], bombs);
        this.setState({minefield, started: true});
    }
    else {
        const minefield = this.state.minefield.reveal([i, j]);
        this.setState({minefield});
    }
}
App.prototype.mineviewRightClick = function(i, j) {
    if (this.state.started) {
        const minefield = this.state.minefield.flag([i, j]);
        this.setState({minefield});
    }
}

App.prototype.render = function() {
    const descriptions = ['EASY', 'MEDIUM', 'HARD'];
    const picked = this.state.difficulty;
    const [height, width, bombs] = difficulties[picked];
    const minefield = this.state.minefield;
    let resetButtonClass = 'sun-normal';
    if (minefield !== undefined) {
        if (minefield.win)
            resetButtonClass = resetButtonClass.replace('normal', 'won');
        else if (minefield.gameOver)
            resetButtonClass = resetButtonClass.replace('normal', 'lost');
    }
    return (
        <div id='app'>
            <Picker 
              className='picker'
              descriptions={ descriptions } 
              name='difficulty'
              picked={ picked }
              onChange={(i) => this.setState({
                  difficulty: i,
                  started: false,
                  minefield: undefined})}
              buttonClass='radio-button'/>
            <button 
              id='reset-button'
              className={resetButtonClass}
              onClick={() => this.setState({
                  started: false,
                  minefield: undefined
              })}
              alt='button to reset the game'>
            </button>
            <Mineview 
              width={width}
              height={height}
              minefield={minefield} 
              onClick={(i, j) => this.mineviewLeftClick(i, j)}
              onContextMenu={(i, j) => this.mineviewRightClick(i, j)}/>
        </div>
    );
}

ReactDOM.render(<App />, document.querySelector('#root'));
