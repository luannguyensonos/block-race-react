import React, { useContext, useState } from "react"
import styled from "styled-components"
import { GameContext } from "../components/game"
import { isMobile, isBrowser } from "react-device-detect"
import {FiRotateCw} from "react-icons/fi"


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

export const initialKPieceStates = {
    "fourk": {
      placed: false,
      orientation: 1,
      maxOrientation: 1
    },
    "threeka": {
      placed: false,
      orientation: 0,
      maxOrientation: 2
    },
    "threekb": {
        placed: false,
        orientation: 1,
        maxOrientation: 2
    },
    "twoka": {
      placed: false,
      orientation: 0,
      maxOrientation: 2
    },
    "twokb": {
        placed: false,
        orientation: 1,
        maxOrientation: 2
    },
    "onek": {
      placed: false,
      orientation: 0,
      maxOrientation: 1
    },
    "cornerk": {
      placed: false,
      orientation: 0,
      maxOrientation: 4
    },
    "lk": {
      placed: false,
      orientation: 0,
      maxOrientation: 8
    },
    "nubk": {
      placed: false,
      orientation: 0,
      maxOrientation: 4
    },
    "zigk": {
      placed: false,
      orientation: 2,
      maxOrientation: 4
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
    "box": "#38E235",
    // Kids pieces
    "fourk": "#EC332E",
    "threeka": "#3DADDE",
    "threekb": "#EE1DD1",
    "twoka": "#1D9200",
    "twokb": "#53EA02",
    "onek": "#EE691D",
    "cornerk": "#EE8F1D",
    "lk": "#1374AB",
    "nubk": "#FFF000",
    "zigk": "#33CB0E",
}

const Piece = ({ name, className }) => {

    const {
        activePiece, 
        setActivePiece, 
        pieces, 
        turnPiece,
        touchSpace,
        setTouchSpace,
        layPiece,
        liftPiece,
        preview,
        dislodged,
        setDislodged,
        handleClickEnding,
        calculatePreview,
        isKids
    } = useContext(GameContext)


    const isTurnable = (piece) => {
        return isKids ?
            initialKPieceStates[piece].maxOrientation > 1 :
            initialPieceStates[piece].maxOrientation > 1
    }

    const [justSet, setJustSet] = useState(null)
    const setOrTurn = ({set, turn}) => {
        const thisPiece = pieces[name];
        if (turn &&
            justSet !== activePiece &&
            isTurnable(name) &&
            (activePiece === name || thisPiece.placed)) {

            const turnedPiece = turnPiece(name);

            if (thisPiece.placed) {
                liftPiece(null, {name, piece: turnedPiece, retainPreview: true})
                setActivePiece(name)
                setDislodged(name)
                calculatePreview(thisPiece.spaceNum, {
                    activePiece: name,
                    piece: turnedPiece
                })
            } else if (dislodged && dislodged === name && preview.spaceNum) {
                calculatePreview(preview.spaceNum, {
                    piece: turnedPiece
                })
            }
        } else if (set && activePiece !== name && !thisPiece.placed) {
            setJustSet(name);
            setTimeout(() => {
                setJustSet(null);
            }, 100);
            setActivePiece(name)
        }
    }

    return (
        <div
            style={{
                position: `relative`
            }}
            className={`${className} ${isKids ? "kids" : ""}`}
        >
            <div
                id={name}
                key={pieces[name] || Math.random()}
                role="button"
                className={className +
                    ` piece` +
                    ` ${activePiece === name ? "active" : "inactive"}` +
                    ` ori${pieces[name].orientation}` +
                    ` ${name}` +
                    ` ${pieces[name].placed ? "placed" : ""}`
                }
                onClick={()=>{
                    if (isMobile) return;
                    setOrTurn({
                        set: true,
                        turn: true
                    })
                }}
                onTouchStart={()=>{
                    if (isBrowser) return;

                    // If a piece on the board is in a dislodged state
                    // If it's a different piece, just handle it now
                    // If it's the same piece, handle it on touch end
                    if (dislodged && dislodged !== name) {
                        handleClickEnding(false)
                    }

                    // Setting up a click or a drag
                    setTouchSpace(null)
                    setOrTurn({
                        set: true,
                        turn: false
                    })
                }}
                onTouchEnd={()=>{
                    if (isBrowser) return;
                    if (!touchSpace)
                        // They clicked on the piece
                        setOrTurn({
                            set: true,
                            turn: true
                        })
                    else if (preview.color)
                        // They dragged to a valid spot
                        layPiece(touchSpace)
                    else
                        // They dragged to an invalid spot
                        setDislodged(activePiece)
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
            { isTurnable(name) && (activePiece === name || pieces[name].placed) ?
                <FiRotateCw className={`icon`}/> :
                null
            }
        </div>
    )
}

const StyledPiece = styled(Piece)`
    & > svg {
        position: absolute;
        width: 40%;
        height: 40%;
        top: 50%;
        left: 50%;
        transform: translate3d(-50%, -50%, 0);
        pointer-events:none;
        touch-action:none;
        opacity: 25%;
    }

    & > div.piece {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        touch-action: none;
        position: relative;
        height: 100%;
    
        &.icon {
            position: absolute;
        }
    
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
        &.lk,
        &.zig,
        &.zigk {
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

        .onek22 {
            background: ${pieceColors.onek};
        }
    
        .two22,
        .two23 {
            background: ${pieceColors.two};
        }

        .twoka22,
        .twoka23 {
            background: ${pieceColors.twoka};
        }

        .twokb22,
        .twokb23 {
            background: ${pieceColors.twokb};
        }
    
        .three22,
        .three23,
        .three24 {
            background: ${pieceColors.three};
        }

        .threeka22,
        .threeka23,
        .threeka24 {
            background: ${pieceColors.threeka};
        }

        .threekb22,
        .threekb23,
        .threekb24 {
            background: ${pieceColors.threekb};
        }
    
        .corner23,
        .corner32,
        .corner33 {
            background: ${pieceColors.corner};
        }

        .cornerk23,
        .cornerk32,
        .cornerk33 {
            background: ${pieceColors.cornerk};
        }
    
        .l13,
        .l23,
        .l32,
        .l33 {
            background: ${pieceColors.l};
        }

        .lk13,
        .lk23,
        .lk32,
        .lk33 {
            background: ${pieceColors.lk};
        }
    
        .nub22,
        .nub31,
        .nub32,
        .nub33 {
            background: ${pieceColors.nub};
        }

        .nubk22,
        .nubk31,
        .nubk32,
        .nubk33 {
            background: ${pieceColors.nubk};
        }
    
        .zig31,
        .zig32,
        .zig22,
        .zig23 {
            background: ${pieceColors.zig};
        }

        .zigk31,
        .zigk32,
        .zigk22,
        .zigk23 {
            background: ${pieceColors.zigk};
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
        .fourk21,
        .fourk22,
        .fourk23,
        .fourk24 {
            background: ${pieceColors.fourk};
        }
    
        .four22,
        .three23,
        .two22,
        .corner33,
        .l33,
        .nub32,
        .zig32,
        .fourk22,
        .threeka23,
        .threekb23,
        .twoka22,
        .twokb22,
        .cornerk33,
        .lk33,
        .nubk32,
        .zigk32,
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
            .four24,
            .onek22,
            .twoka22,
            .twoka23,
            .twokb22,
            .twokb23,
            .threeka22,
            .threeka23,
            .threeka24,
            .threekb22,
            .threekb23,
            .threekb24,
            .cornerk23,
            .cornerk32,
            .cornerk33,
            .lk13,
            .lk23,
            .lk32,
            .lk33,
            .nubk22,
            .nubk31,
            .nubk32,
            .nubk33,
            .zigk31,
            .zigk32,
            .zigk22,
            .zigk23,
            .fourk21,
            .fourk22,
            .fourk23,
            .fourk24 {
                background: #232323;
            }
        }
    }

    &.kids > div.piece {
        height: 4rem;
        width: 4rem;
    }
`

export default StyledPiece
