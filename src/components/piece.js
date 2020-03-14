import React, { useContext, useState } from "react"
import styled from "styled-components"
import { GameContext } from "../components/game"
import { isMobile, isBrowser } from "react-device-detect"

const range = [1,2,3,4];

export const initialPieceStates = {
    "four": {
      placed: false,
      orientation: 0,
      maxOrientation: 2
    },
    "three": {
      placed: false,
      orientation: 0,
      maxOrientation: 2
    },
    "two": {
      placed: false,
      orientation: 0,
      maxOrientation: 2
    },
    "one": {
      placed: false,
      orientation: 0,
      maxOrientation: 1
    },
    "corner": {
      placed: false,
      orientation: 0,
      maxOrientation: 4
    },
    "l": {
      placed: false,
      orientation: 0,
      maxOrientation: 8
    },
    "nub": {
      placed: false,
      orientation: 0,
      maxOrientation: 4
    },
    "zig": {
      placed: false,
      orientation: 0,
      maxOrientation: 4
    },
    "box": {
      placed: false,
      orientation: 0,
      maxOrientation: 1
    }
} 

export const pieceColors = {
    "four": "#AAA",
    "three": "#F5990B",
    "two": "#BA7811",
    "one": "#4464F1",
    "corner": "#A244F1",
    "l": "#45C8EE",
    "nub": "gold",
    "zig": "#EC332E",
    "box": "#38E235"
}

const Piece = ({ name, className }) => {

    const {
        activePiece, 
        setActivePiece, 
        pieces, 
        setPieces
    } = useContext(GameContext)

    const handleTouchOrClick = ({noTurn}) => {
        const thisPiece = pieces[name];
        if ((activePiece === name || thisPiece.placed) && !noTurn) {
            const newPiece = {...thisPiece};
            newPiece.orientation = (thisPiece.orientation+1) % thisPiece.maxOrientation;
            setPieces({ item: { [name] : newPiece } })
        } else if (!thisPiece.placed) {
            setActivePiece(name)
        }
    }

    return (
        <div
            id={name}
            key={pieces[name] || Math.random()}
            role="button"
            className={className + 
                ` ${activePiece === name ? "active" : "inactive"}` +
                ` ori${pieces[name].orientation}` +
                ` ${name}` +
                ` ${pieces[name].placed ? "placed" : ""}`
            }
            onClick={()=>{
                if (isMobile) return;
                handleTouchOrClick({})
            }}
            onTouchEnd={()=>{
                if (isBrowser) return;
                handleTouchOrClick({})
            }}
            onTouchStart={()=>{
                if (isBrowser) return;
                handleTouchOrClick({noTurn: true})
            }}
            onKeyPress={()=>{}}
        >
            {range.map(i => {
                const row = [];
                range.forEach(j => {
                    row.push(<div className={`${name}${i}${j}`}></div>)
                })
                return row;
            })}
        </div>
    )
}

const StyledPiece = styled(Piece)`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    touch-action: none;

    &.active {
        border: 2px solid red;
    }

    & > div {
        border: 0.5px solid #303030;
    }

    &.ori1 {
        transform: rotate(90deg);
    }

    &.ori2 {
        transform: rotate(180deg);
    }

    &.ori3 {
        transform: rotate(270deg);
    }

    &.l,
    &.zig {
        &.ori2 {
            transform: rotate(90deg);
        }
    
        &.ori4 {
            transform: rotate(180deg);
        }
    
        &.ori6 {
            transform: rotate(270deg);
        }
    
        &.ori1 {
            transform: scale(-1, 1);
        }
    
        &.ori3 {
            transform: scale(-1, 1) rotate(270deg);
        }
    
        &.ori5 {
            transform: scale(-1, 1) rotate(180deg);
        }
    
        &.ori7 {
            transform: scale(-1, 1) rotate(90deg);
        }
    }

    .one22 {
        background: ${pieceColors.one};
    }

    .two22,
    .two23 {
        background: ${pieceColors.two};
    }

    .three22,
    .three23,
    .three24 {
        background: ${pieceColors.three};
    }

    .corner23,
    .corner32,
    .corner33 {
        background: ${pieceColors.corner};
    }

    .l13,
    .l23,
    .l32,
    .l33 {
        background: ${pieceColors.l};
    }

    .nub22,
    .nub31,
    .nub32,
    .nub33 {
        background: ${pieceColors.nub};
    }

    .zig31,
    .zig32,
    .zig22,
    .zig23 {
        background: ${pieceColors.zig};
    }

    .box22,
    .box23,
    .box32,
    .box33 {
        background: ${pieceColors.box};
    }

    .four21,
    .four22,
    .four23,
    .four24 {
        background: ${pieceColors.four};
    }

    .four22,
    .three23,
    .two22,
    .corner33,
    .l33,
    .nub32,
    .zig32,
    .box22 {
        border-radius: 50%;
    }

    &.placed {
        .one22,
        .two22,
        .two23,
        .three22,
        .three23,
        .three24,
        .corner23,
        .corner32,
        .corner33,
        .l13,
        .l23,
        .l32,
        .l33,
        .nub22,
        .nub31,
        .nub32,
        .nub33,
        .zig31,
        .zig32,
        .zig22,
        .zig23,
        .box22,
        .box23,
        .box32,
        .box33,
        .four21,
        .four22,
        .four23,
        .four24 {
            background: #232323;
        }
    }


`

export default StyledPiece
