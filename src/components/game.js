import React, { useReducer, useState } from "react"
import { initialPieceStates, initialKPieceStates } from "../components/piece"

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
    layPiece: (int, obj) => {},
    liftPiece: (int) => {},
    setTouchSpace: (str) => {},
    setDislodged: (str) => {},
    handleClickEnding: (bool, int) => {},
    generateBlockers: () => {},
    spaces: {},
    pieces: {},
    activePiece: "",
    preview: {},
    timer: null,
    doneTime: null,
    puzzleId: null,
    debugMsg: "",
    touchSpace: null,
    dislodged: false,
    isKids: false
  })
  
export const RANGE = [1,2,3,4,5,6];
export const kRANGEY = [1,2,3,4,5,6,7,8,9,10,11];
export const kRANGEX = [1,2,3];
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

export const serializedBlockers = (bArr) => {
    return bArr.sort().reduce((str, b) => {
        return str + b;
    }, "")
}

export const loadBlockersFromString = (preset) => {
    return preset.length === 14 ?
        [0,2,4,6,8,10,12].reduce((arr, i) => {
            arr.push(Number.parseInt(preset.substr(i,2)));
            return arr;
        }, []) :
        // Fuck it, just generate from scratch
        getKidBlockers()
}

const diceIndex = () => { return Math.floor(Math.random() * 6) }; // 0 to 5
const getKidBlockers = () => {
    const row = Math.floor(Math.random() * 11) + 1
    const coinFlip = Math.random() > 0.5
    if (row === 1 || row === 11 || coinFlip)
        return [`${row}1`, `${row}2`, `${row}3`]
    else
        return [`${row-1}2`, `${row}2`, `${row+1}2`]
}

const GameProvider = ({children, debug = false, mode = null}) => {
    const [isKids, setKids] = useState(mode && mode === "kids");
    const initialPieces = isKids ? initialKPieceStates : initialPieceStates

    const pieceReducer = (state, action) => {
        switch (action.type) {
            case "RESET":
            return initialPieces
            default:
            return {
                ...state,
                ...action.item
            }
        }
    }

    const [spaces, setSpaces] = useReducer(spaceReducer, {});
    const [pieces, setPieces] = useReducer(pieceReducer, initialPieces);
    const [activePiece, setActivePiece] = useState(Object.keys(initialPieces)[0]);
    const [timer, setTimer] = useState(null);
    const [doneTime, setDone] = useState(null);
    const [puzzleId, setPuzzleId] = useState("");
    const [justActioned, setJustActioned] = useState(null);
    const [debugMsg, setDebugMsg] = useState("");
    const [clientRect, setClientRect] = useState(null);
    const [touchSpace, setTouchSpace] = useState(null);
    const [dislodged, setDislodged] = useState(null);
    const [preview, setPreview] = useReducer((prev, curr) => {
        if (Object.keys(curr).length === 0 && curr.constructor === Object) {
            setDislodged(null)
        }
        return curr
    }, {});

    const generateBlockers = () => {
        return isKids ?
            getKidBlockers() :
            DICE.reduce((arr, d) => {
                arr.push(d[diceIndex()]);
                return arr;
            }, []);
    }

    const resetBoard = () => {
        const blockers = generateBlockers();
        setPuzzleId(serializedBlockers(blockers));
        setSpaces({ type: "CLEAR" });
        setPieces({ type: "RESET" });
        setTimer(null);
        setDone(null);
        setActivePiece(Object.keys(initialPieces)[0]);
        setPreview({});
        setDislodged(null);
    }
  
    const startGame = () => {
      const blockers = loadBlockersFromString(puzzleId);
      const iRange = isKids ? kRANGEY : RANGE;
      const jRange = isKids ? kRANGEX : RANGE;

      iRange.forEach(i => {
        jRange.forEach(j => {
            const thisSpace = Number.parseInt(`${i}${j}`);
            const status = blockers.includes(thisSpace) || blockers.includes(`${i}${j}`) ? "BLOCK" : "FREE";
            setSpaces({ item: { [thisSpace] : status} })
        })
      })
      setTimer(new Date());
      setDone(null);
    }

    const calculatePreview = (spaceNum = preview.spaceNum, overrides = {}) => {
        if (!activePiece || !pieces[activePiece] || !spaceNum) return;


        const ap = overrides.activePiece || activePiece;
        const thisPiece = overrides.piece || pieces[ap];
        const ori = thisPiece.orientation;
        const map = isKids ? ap.replace(/k[a|b]?/, "") : ap;
        let spots = moves[map+ori](spaceNum);

        // Logic here to bump the preview back into the board
        const adjs = spots.reduce((obj, s) => {
            const fst = Math.floor(s/10);
            const snd = s % 10;
            const borders = {
                bottom: isKids ? 11 : 6,
                right: isKids ? 3 : 6
            }
            if (fst === 0) obj.top = Math.max(1, obj.top)
            if (fst === -1) obj.top = Math.max(2, obj.top)
            if (fst === borders.bottom+1) obj.bottom = Math.max(1, obj.bottom)
            if (fst === borders.bottom+2) obj.bottom = Math.max(2, obj.bottom)
            if (snd === 0) obj.left = Math.max(1, obj.left)
            if (snd === 9) obj.left = Math.max(2, obj.left)
            if (snd === borders.right+1) obj.right = Math.max(1, obj.right)
            if (snd === borders.right+2) obj.right = Math.max(2, obj.right)
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
            spots = moves[map+ori](proposedSpace)
        }
        const thisPreview = {
            color: 
                spots.every(s => spaces[s] && (spaces[s] === "FREE" || spaces[s] === ap)) ? ap : false,
            spaces: spots,
            overrides,
            spaceNum
        }
        setPreview(thisPreview)
        return thisPreview
    }

    const layPiece = (spaceNum = null, overrides = {}) => {
        const thisPreview = overrides.preview ?
            overrides.preview :
                preview.spaces ? 
                    preview : 
                        spaceNum ?
                            calculatePreview(spaceNum) :
                                {}
        if (thisPreview.color) {
            if (activePiece === justActioned && !overrides.force) return "SKIPPED"

            setJustActioned(activePiece);
            setTimeout(() => {
                setJustActioned(null);
            }, 100);
            const oldAP = { [activePiece] : {...pieces[activePiece]} };
            oldAP[activePiece].placed = true;
            oldAP[activePiece].spaceNum = spaceNum || thisPreview.spaceNum;
            setPieces({ item: oldAP });

            // make sure we don't overwrite any blockers
            let blockerFound = false;
            const newSpaces = thisPreview.spaces.reduce((obj, s) => {
                if (spaces[s] === "BLOCK") blockerFound = true;
                obj[s] = activePiece;
                return obj;
            }, {});

            if (!blockerFound) {
                setSpaces({ item: newSpaces });
                const newAP = Object.keys(pieces).find(pk => pk !== activePiece && !pieces[pk].placed);
                setActivePiece(newAP);
            }
            setPreview({});
        }
    }

    const liftPiece = (spaceNum, overrides = {}) => {
        if (
            (overrides.name && overrides.piece) || 
            (spaceNum &&
            spaces[spaceNum] &&
            spaces[spaceNum] !== "FREE" &&
            spaces[spaceNum] !== "BLOCK"))
        {
            // Lift the piece
            const pieceToLift = overrides.name || spaces[spaceNum];
            if (pieceToLift !== justActioned) {
                setJustActioned(pieceToLift);
                setTimeout(() => {
                    setJustActioned(null);
                }, 100);
                setActivePiece(pieceToLift);

                const oldPiece = overrides.piece ? {...overrides.piece} : {...pieces[pieceToLift]}

                const newPiece = { [pieceToLift] : oldPiece };
                newPiece[pieceToLift].placed = false;
                setPieces({ item: newPiece });

                setSpaces({ type: "LIFT", item: pieceToLift });
                if (!overrides.retainPreview) setPreview({});
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

    const handleClickEnding = (isPreview, spaceNum = null) => {
        if (dislodged) {
            if (isPreview)
            {
                // Clicking on the actual dislodged piece
                const newPiece = turnPiece(activePiece)
                calculatePreview(spaceNum, {
                    piece: newPiece
                })
            } else if (preview.color) {
                // Clicking elsewhere, but piece is in valid place
                layPiece(spaceNum)
            } else {
                // Clicking elsewhere and piece *was* invalid

                // Move the preview to the new click position
                const newPreview = calculatePreview(spaceNum)
                if (newPreview && newPreview.color) {
                    // If it fits, lay it
                    layPiece(spaceNum, {preview: newPreview})
                } else {
                    // If not, remove it
                    setPreview({})
                }
            }
        } else {
            // Handle the end of a "click"
            // The preview object *should* exist
            if (preview.color) {
                // "Click" into a valid spot
                const lay = layPiece(spaceNum)

                // // This supports the "dislodge" functionality
                // if (lay === "SKIPPED") {
                //     // "Click" onto existing piece
                //     // Dislodge the piece and turn it
                //     if (isTurnable(activePiece)) {
                //         setDislodged(activePiece)
                //         const newPiece = turnPiece(activePiece)
                //         calculatePreview(spaceNum, {
                //             piece: newPiece
                //         })
                //     } else {
                //         // Non turnable piece, force it back down
                //         layPiece(spaceNum, {force: true})
                //     }
                // }

                // This is for the "click to remove" feature
                if (lay === "SKIPPED") {
                    setPreview({})
                }
            } else if (touchSpace || spaceNum) {
                // Two cases
                // 1) Either tried to "click" a piece from the tray into the board,
                // 2) Or dragged a piece from the board off,
                setPreview({})
            } else {
                setPreview({})
            }
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
            setDislodged,
            handleClickEnding,
            isKids,
            generateBlockers
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