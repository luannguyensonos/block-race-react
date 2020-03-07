import React, { useReducer, useState, useEffect } from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Board from "../components/board"
import Tray from "../components/tray"
import { initialPieceStates } from "../components/piece"

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
  doneTime: null
})

export const RANGE = [1,2,3,4,5,6];
const numSquares = RANGE.length * RANGE.length;
const numBlockers = 7;
const odds = (sqr, blr) => { return Math.ceil(Math.random() * sqr) <= blr }; 

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

const IndexPage = () => {

  const [spaces, setSpaces] = useReducer(spaceReducer, {});
  const [pieces, setPieces] = useReducer(pieceReducer, initialPieceStates);
  const [activePiece, setActivePiece] = useState("four");
  const [preview, setPreview] = useState({});
  const [timer, setTimer] = useState(null);
  const [doneTime, setDone] = useState(null);
  
  const resetBoard = () => {
    setSpaces({ type: "CLEAR" });
    setPieces({ type: "RESET" });
    let blockersRemaining = numBlockers;
    let squaresRemaining = numSquares;
    RANGE.forEach(i => {
        RANGE.forEach(j => {
            const block = 
                blockersRemaining > 0 && 
                (odds(squaresRemaining, blockersRemaining) || 
                    squaresRemaining === blockersRemaining);
            if (block) {
                blockersRemaining--;
                setSpaces({ item: { [`${i}${j}`] : "BLOCK"} })
            } else {
              setSpaces({ item: { [`${i}${j}`] : "FREE"} })
            }
            squaresRemaining--;
        })
    })
    setTimer(new Date());
    setDone(null);
  }

  useEffect(() => {
    const isDone = Object.keys(spaces).every(s => spaces[s] !== "FREE");
    if (isDone) {
      setDone(new Date());
    }
  }, [spaces])

  return (
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
        doneTime
    }}>
      <Layout>
        <SEO title="Block Race" />
        <Board/>
        <Tray/>
      </Layout>
    </GameContext.Provider>
  )
}

export default IndexPage
