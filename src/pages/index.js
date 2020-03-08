import React, { useReducer, useState, useEffect } from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Board from "../components/board"
import Tray from "../components/tray"
import { initialPieceStates } from "../components/piece"
import { Location } from '@reach/router'
import queryString from 'query-string'

export const GameContext = React.createContext({
  resetBoard: () => {},
  setSpaces: (obj) => {},
  setPieces: (obj) => {},
  setActivePiece: (str) => {},
  setPreview: (obj) => {},
  spaces: {},
  pieces: {},
  activePiece: "",
  preview: {},
  timer: null,
  doneTime: null,
  puzzleId: ""
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

const serializedBlockers = (bArr) => {
  return bArr.sort().reduce((str, b) => {
    return str + b;
  }, "")
}

const loadBlockersFromString = (preset) => {
  return [0,2,4,6,8,10,12].reduce((arr, i) => {
    arr.push(Number.parseInt(preset.substr(i,2)));
    return arr;
  }, [])
}

const IndexPage = () => {

  const [spaces, setSpaces] = useReducer(spaceReducer, {});
  const [pieces, setPieces] = useReducer(pieceReducer, initialPieceStates);
  const [activePiece, setActivePiece] = useState(Object.keys(initialPieceStates)[0]);
  const [preview, setPreview] = useState({});
  const [timer, setTimer] = useState(null);
  const [doneTime, setDone] = useState(null);
  const [puzzleId, setPuzzleId] = useState("");
  
  const resetBoard = (preset = null) => {
    setSpaces({ type: "CLEAR" });
    setPieces({ type: "RESET" });
    const blockers = preset != null && preset.length === 14 ?
      loadBlockersFromString(preset) :
      DICE.reduce((arr, d) => {
        arr.push(d[diceIndex()]);
        return arr;
      }, []);
    setPuzzleId(serializedBlockers(blockers));
    console.log("blockers", blockers, puzzleId);
    RANGE.forEach(i => {
        RANGE.forEach(j => {
            const thisSpace = Number.parseInt(`${i}${j}`);
            const status = blockers.includes(thisSpace) ? "BLOCK" : "FREE";
            setSpaces({ item: { [thisSpace] : status} })
        })
    })
    setTimer(new Date());
    setDone(null);
    setActivePiece(Object.keys(initialPieceStates)[0]);
  }

  useEffect(() => {
    const isDone = Object.keys(spaces).every(s => spaces[s] !== "FREE");
    if (isDone) {
      setDone(new Date());
    }
  }, [spaces])

  return (
    <Location>
      {({ location }) => (
        <GameContext.Provider value={{
            setSpaces,
            resetBoard,
            spaces,
            pieces,
            setPieces,
            activePiece,
            setActivePiece,
            preview,
            setPreview,
            timer,
            doneTime,
            puzzleId
        }}>
          <Layout
            qs={location.search ? queryString.parse(location.search) : {}}
          >
            <SEO title="Block Race" />
            <Board/>
            <Tray/>
          </Layout>
        </GameContext.Provider>
      )}
    </Location>
  )
}

export default IndexPage
