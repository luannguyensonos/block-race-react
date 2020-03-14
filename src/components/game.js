import React, { useReducer, useState } from "react"
import { initialPieceStates } from "../components/piece"

export const GameContext = React.createContext({
    resetBoard: () => {},
    startGame: () => {},
    setSpaces: (obj) => {},
    setPieces: (obj) => {},
    turnPiece: (str) => {},
    setActivePiece: (str) => {},
    setPreview: (obj) => {},
    setPuzzleId: (str) => {},
    setTimer: (date) => {},
    setDone: (date) => {},
    calculatePreview: (int) => {},
    layPiece: (int) => {},
    liftPiece: (int) => {},
    setTouchSpace: (str) => {},
    setDislodged: (bool) => {},
    spaces: {},
    pieces: {},
    activePiece: "",
    preview: {},
    timer: null,
    doneTime: null,
    puzzleId: null,
    debugMsg: "",
    touchSpace: null,
    dislodged: false
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

const diceIndex = () => { return Math.floor(Math.random() * 6) }; // 0 to 5
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
    const [timer, setTimer] = useState(null);
    const [doneTime, setDone] = useState(null);
    const [puzzleId, setPuzzleId] = useState("");
    const [justActioned, setJustActioned] = useState(null);
    const [debugMsg, setDebugMsg] = useState("");
    const [clientRect, setClientRect] = useState(null);
    const [touchSpace, setTouchSpace] = useState(null);
    const [dislodged, setDislodged] = useState(false)
    const [preview, setPreview] = useReducer((prev, curr) => {
        if (Object.keys(curr).length === 0 && curr.constructor === Object) {
            setDislodged(false)
        }
        return curr
    }, {});

    const resetBoard = () => {
      setSpaces({ type: "CLEAR" });
      setPieces({ type: "RESET" });
      const blockers = generateBlockers();
      setPuzzleId(serializedBlockers(blockers));
      setTimer(null);
      setDone(null);
      setActivePiece(Object.keys(initialPieceStates)[0]);
      setPreview({});
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

    const calculatePreview = (spaceNum, overrides = {}) => {
        if (!activePiece || !pieces[activePiece]) return;

        const ap = overrides.activePiece || activePiece;
        const thisPiece = overrides.piece || pieces[ap];
        const ori = thisPiece.orientation;
        let spots = moves[ap+ori](spaceNum);
        // Logic here to bump the preview back into the board
        const adjs = spots.reduce((obj, s) => {
            const fst = Math.floor(s/10);
            const snd = s % 10;
            if (fst === 0) obj.top = Math.max(1, obj.top)
            if (fst === -1) obj.top = Math.max(2, obj.top)
            if (fst === 7) obj.bottom = Math.max(1, obj.bottom)
            if (fst === 8) obj.bottom = Math.max(2, obj.bottom)
            if (snd === 0) obj.left = Math.max(1, obj.left)
            if (snd === 9) obj.left = Math.max(2, obj.left)
            if (snd === 7) obj.right = Math.max(1, obj.right)
            if (snd === 8) obj.right = Math.max(2, obj.right)
            return obj
        }, {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        })
        const proposedSpace = spaceNum + 
            (adjs.top*10) + 
            (adjs.bottom*-10) +
            (adjs.left*1) +
            (adjs.right*-1);

        if (proposedSpace !== spaceNum) {
            spots = moves[ap+ori](proposedSpace)
        }
        const thisPreview = {
            color: 
                spots.every(s => spaces[s] && spaces[s] === "FREE") || 
                    overrides.activePiece ?
                        ap : false,
            spaces: spots,
            overrides
        }
        setPreview(thisPreview)
        return thisPreview
    }

    const layPiece = (spaceNum) => {
        const thisPreview = preview.spaces ? preview : calculatePreview(spaceNum)
        if (thisPreview.color) {
            if (activePiece === justActioned) return "SKIPPED"

            setJustActioned(activePiece);
            setTimeout(() => {
                setJustActioned(null);
            }, 200);
            const oldAP = { [activePiece] : {...pieces[activePiece]} };
            oldAP[activePiece].placed = true;
            setPieces({ item: oldAP });

            const newSpaces = thisPreview.spaces.reduce((obj, s) => {
                obj[s] = activePiece;
                return obj;
            }, {});
            setSpaces({ item: newSpaces });

            const newAP = Object.keys(pieces).find(pk => pk !== activePiece && !pieces[pk].placed);
            setActivePiece(newAP);
            setPreview({});
        }
    }

    const liftPiece = (spaceNum) => {
        if (
            spaceNum &&
            spaces[spaceNum] &&
            spaces[spaceNum] !== "FREE" &&
            spaces[spaceNum] !== "BLOCK")
        {
            // Lift the piece
            const pieceToLift = spaces[spaceNum];
            if (pieceToLift !== justActioned) {
                setJustActioned(pieceToLift);
                setTimeout(() => {
                    setJustActioned(null);
                }, 200);
                setActivePiece(pieceToLift);

                const newPiece = { [pieceToLift] : {...pieces[pieceToLift]} };
                newPiece[pieceToLift].placed = false;
                setPieces({ item: newPiece });

                setSpaces({ type: "LIFT", item: pieceToLift });
                setPreview({});
                return pieceToLift
            } else {
                setPreview({});
            }
        } else {
            setPreview({})
        }
    }

    const turnPiece = (name) => {
        const thisPiece = pieces[name];
        if (thisPiece) {
            const newPiece = {...thisPiece};
            newPiece.orientation = (thisPiece.orientation+1) % thisPiece.maxOrientation;
            setPieces({ item: { [name] : newPiece } })
            return newPiece
        }
    }

    const getSpaceNumFromEvent = (e) => {
        if (!clientRect) {
            const corner = document.getElementById("11")
            if (corner)
                setClientRect(corner.getBoundingClientRect())
        }
        const touch = e.touches && e.touches.length > 0 ? e.touches[0] : null;
        if (touch && clientRect) {
            const myI = Math.ceil((touch.clientY - clientRect.top) / clientRect.height);
            const myJ = Math.ceil((touch.clientX - clientRect.left) / clientRect.width);
            const predictedSpaceNum = `${myI}${myJ}`;
            if (debug) {
                setDebugMsg(`X:${Math.floor(touch.clientX)} Y:${Math.floor(touch.clientY)}`)
            }
            if (spaces[predictedSpaceNum]) {
                return Number.parseInt(predictedSpaceNum)
            }
        }
        return null
    }

    const [debounceTouch, setDebounceTouch] = useState(false)
    const handleTouchMove = (e) => {
        if (debounceTouch) return;

        const space = getSpaceNumFromEvent(e)
        setTouchSpace(space)
        if (space) {
            calculatePreview(space);
        } else {
            setPreview({});
        }

        setDebounceTouch(true)
        setTimeout(()=>{
            setDebounceTouch(false)
        }, 100)
    }
  
    return (
        <GameContext.Provider value={{
            setSpaces,
            resetBoard,
            startGame,
            spaces,
            pieces,
            setPieces,
            turnPiece,
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
            calculatePreview,
            layPiece,
            liftPiece,
            debugMsg,
            touchSpace,
            setTouchSpace,
            dislodged,
            setDislodged
        }}>
            <div
                onTouchMove={(e) => {
                    if (timer && !doneTime) handleTouchMove(e)
                }}
            >
                {children}
            </div>
        </GameContext.Provider>
    )
}

export default GameProvider