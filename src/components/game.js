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
    calculatePreview: (int) => {},
    layPiece: (int) => {},
    spaces: {},
    pieces: {},
    activePiece: "",
    preview: {},
    timer: null,
    doneTime: null,
    puzzleId: null,
    record: false,
    debugMsg: ""
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

const moves = {
    "four0": (n) => { return [n-1, n, n+1, n+2] },
    "four1": (n) => { return [n-10, n, n+10, n+20] },
    "three0": (n) => { return [n-1, n, n+1] },
    "three1": (n) => { return [n-10, n, n+10] },
    "two0": (n) => { return [n, n+1] },
    "two1": (n) => { return [n, n+10] },
    "one0": (n) => { return [n] },
    "corner0": (n) => { return [n-10, n, n-1] },
    "corner1": (n) => { return [n-10, n, n+1] },
    "corner2": (n) => { return [n+10, n, n+1] },
    "corner3": (n) => { return [n-1, n, n+10] },
    "l0": (n) => { return [n-1, n, n-10, n-20] },
    "l1": (n) => { return [n+1, n, n-10, n-20] },
    "l2": (n) => { return [n-10, n, n+1, n+2] },
    "l3": (n) => { return [n+10, n, n+1, n+2] },
    "l4": (n) => { return [n+1, n, n+10, n+20] },
    "l5": (n) => { return [n-1, n, n+10, n+20] },
    "l6": (n) => { return [n+10, n, n-1, n-2] },
    "l7": (n) => { return [n-10, n, n-1, n-2] },
    "nub0": (n) => { return [n-1, n, n+1, n-10] },
    "nub1": (n) => { return [n-10, n, n+10, n+1] },
    "nub2": (n) => { return [n-1, n, n+1, n+10] },
    "nub3": (n) => { return [n-10, n, n+10, n-1] },
    "zig0": (n) => { return [n-1, n, n-10, n-9] },
    "zig1": (n) => { return [n+1, n, n-10, n-11] },
    "zig2": (n) => { return [n-10, n, n+1, n+11] },
    "zig3": (n) => { return [n+10, n, n+1, n-9] },
    "box0": (n) => { return [n+1, n, n+10, n+11] }
}

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

const GameProvider = ({children, debug = false}) => {
    const [spaces, setSpaces] = useReducer(spaceReducer, {});
    const [pieces, setPieces] = useReducer(pieceReducer, initialPieceStates);
    const [activePiece, setActivePiece] = useState(Object.keys(initialPieceStates)[0]);
    const [preview, setPreview] = useState({});
    const [timer, setTimer] = useState(null);
    const [doneTime, setDone] = useState(null);
    const [puzzleId, setPuzzleId] = useState("");
    const [record, setRecord] = useState(0);
    const [justLaid, setJustLaid] = useState(null);
    const [debugMsg, setDebugMsg] = useState("");
    
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

    const calculatePreview = (spaceNum) => {
        if (!activePiece || !pieces[activePiece]) return;

        const ori = pieces[activePiece].orientation;
        const spots = moves[activePiece+ori](spaceNum);
        setPreview({
            color: spots.every(s => spaces[s] && spaces[s] === "FREE") ?
                activePiece : false,
            spaces: spots
        });
    }

    const layPiece = (spaceNum = null) => {
        if (preview.color) {
            setJustLaid(activePiece);
            setTimeout(() => {
                setJustLaid(null);
            }, 800);
            const oldAP = { [activePiece] : {...pieces[activePiece]} };
            oldAP[activePiece].placed = true;
            setPieces({ item: oldAP });

            const newSpaces = preview.spaces.reduce((obj, s) => {
                obj[s] = activePiece;
                return obj;
            }, {});
            setSpaces({ item: newSpaces });

            const newAP = Object.keys(pieces).find(pk => pk !== activePiece && !pieces[pk].placed);
            setActivePiece(newAP);
            setPreview({});
        } else if (
            spaceNum &&
            spaces[spaceNum] &&
            spaces[spaceNum] !== "FREE" &&
            spaces[spaceNum] !== "BLOCK")
        {
            // Lift the piece
            const pieceToLift = spaces[spaceNum];
            if (pieceToLift !== justLaid) {
                setActivePiece(pieceToLift);

                const newPiece = { [pieceToLift] : {...pieces[pieceToLift]} };
                newPiece[pieceToLift].placed = false;
                setPieces({ item: newPiece });

                setSpaces({ type: "LIFT", item: pieceToLift });
                setPreview({});
            } else {
                setPreview({});
            }
        }
    }

    const handleTouchStart = (e) => {
        const target = e.touches && e.touches.length > 0 ? e.touches[0].target : null;
        if (target) {
            calculatePreview(Number.parseInt(target.id));
        }
    }

    const handleTouchMove = (e) => {
        const touch = e.touches && e.touches.length > 0 ? e.touches[0] : null;
        if (touch) {
            const corner = document.getElementById("11");
            const clientRect = corner.getBoundingClientRect();
            const myI = Math.ceil((touch.clientY - clientRect.top) / clientRect.height);
            const myJ = Math.ceil((touch.clientX - clientRect.left) / clientRect.width);
            const predictedSpaceNum = `${myI}${myJ}`;
            if (debug)
                setDebugMsg(`${Math.floor(touch.clientY)} x ${Math.floor(touch.clientX)}`)
            if (spaces[predictedSpaceNum])
                calculatePreview(Number.parseInt(predictedSpaceNum));
        }
    }

    const handleTouchEnd = (e) => {
        if (preview.color) {
            layPiece();
        } else {
            setPreview({});
        }
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
            setRecord,
            calculatePreview,
            layPiece,
            debugMsg
        }}>
            <div
                onTouchStart={(e) => {if(timer && !doneTime) handleTouchStart(e)}}
                onTouchMove={(e) => {if(timer && !doneTime) handleTouchMove(e)}}
                onTouchEnd={(e) => {if(timer && !doneTime) handleTouchEnd(e)}}
            >
                {children}
            </div>
        </GameContext.Provider>
    )
}

export default GameProvider