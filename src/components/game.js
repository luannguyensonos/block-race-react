import React, { useReducer, useState } from "react"
import { initialPieceStates } from "../components/piece"

export const GameContext = React.createContext({
    resetBoard: () => {},
    startGame: () => {},
    setSpaces: (obj) => {},
    setPieces: (obj) => {},
    setActivePiece: (str) => {},
    setPreview: (obj) => {},
    setRecord: (int) => {},
    setPuzzleId: (str) => {},
    setTimer: (date) => {},
    setDone: (date) => {},
    spaces: {},
    pieces: {},
    activePiece: "",
    preview: {},
    timer: null,
    doneTime: null,
    puzzleId: null,
    record: false
  })
  
export const RANGE = [1,2,3,4,5,6];
const DICE = [
    [11,31,41,42,52,63],
    [12,13,21,22,23,32],
    [14,25,35,36,46,66],
    [24,33,34,43,44,53],
    [45,54,55,56,64,65],
    [15,15,26,51,62,62],
    [16,16,16,61,61,61]
]
const diceIndex = () => { return Math.floor(Math.random() * 6) }; // 0 to 5

const spaceReducer = (state, action) => {
    switch (action.type) {
        case "CLEAR":
        return {}
        case "LIFT":
        const oldSpaces = Object.keys(state).reduce((obj, s) => {
            if (state[s] === action.item) obj[s] = "FREE";
            return obj;
        }, {});
        return {
            ...state,
            ...oldSpaces
        }
        default:
        return {
            ...state,
            ...action.item
        }
    }
}

const pieceReducer = (state, action) => {
    switch (action.type) {
        case "RESET":
        return initialPieceStates
        default:
        return {
            ...state,
            ...action.item
        }
    }
}

export const serializedBlockers = (bArr) => {
    return bArr.sort().reduce((str, b) => {
        return str + b;
    }, "")
}

export const loadBlockersFromString = (preset) => {
    return [0,2,4,6,8,10,12].reduce((arr, i) => {
        arr.push(Number.parseInt(preset.substr(i,2)));
        return arr;
    }, [])
}

export const generateBlockers = () => {
    return DICE.reduce((arr, d) => {
        arr.push(d[diceIndex()]);
        return arr;
    }, []);
}

const GameProvider = ({children}) => {
    const [spaces, setSpaces] = useReducer(spaceReducer, {});
    const [pieces, setPieces] = useReducer(pieceReducer, initialPieceStates);
    const [activePiece, setActivePiece] = useState(Object.keys(initialPieceStates)[0]);
    const [preview, setPreview] = useState({});
    const [timer, setTimer] = useState(null);
    const [doneTime, setDone] = useState(null);
    const [puzzleId, setPuzzleId] = useState("");
    const [record, setRecord] = useState(0);
    
    const resetBoard = () => {
      setSpaces({ type: "CLEAR" });
      setPieces({ type: "RESET" });
      const blockers = generateBlockers();
      setPuzzleId(serializedBlockers(blockers));
      setTimer(null);
      setDone(null);
      setRecord(0);
      setActivePiece(Object.keys(initialPieceStates)[0]);
    }
  
    const startGame = () => {
      const blockers = loadBlockersFromString(puzzleId);
      RANGE.forEach(i => {
        RANGE.forEach(j => {
            const thisSpace = Number.parseInt(`${i}${j}`);
            const status = blockers.includes(thisSpace) ? "BLOCK" : "FREE";
            setSpaces({ item: { [thisSpace] : status} })
        })
      })
      setTimer(new Date());
      setDone(null);
    }
  
    return (
        <GameContext.Provider value={{
            setSpaces,
            resetBoard,
            startGame,
            spaces,
            pieces,
            setPieces,
            activePiece,
            setActivePiece,
            preview,
            setPreview,
            timer,
            setTimer,
            doneTime,
            setDone,
            puzzleId,
            setPuzzleId,
            record,
            setRecord
        }}>
            {children}
        </GameContext.Provider>
    )
}

export default GameProvider