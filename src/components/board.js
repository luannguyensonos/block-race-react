import React, {useContext, useState} from "react"
import styled from "styled-components"
import { GameContext, RANGE } from "../components/game"
import { pieceColors } from "../components/piece"

const Board = ({ className }) => {
    const {
        spaces,
        preview, setPreview,
        doneTime,
        calculatePreview,
        layOrLiftPiece
    } = useContext(GameContext);

    const [justHandled, setJustHandled] = useState(false);
    const handleTouchOrClick = (spaceNum, {type}) => {
        if (!doneTime) {
            if (type === "touch") {
                const action = layOrLiftPiece(spaceNum, {type: "touch"})
                if (action === "LAID") {
                    setJustHandled(true)
                    setTimeout(() => {
                        setJustHandled(false)
                    }, 200)
                }
            } else {
                if (!justHandled) {
                    layOrLiftPiece(spaceNum, {type: "click"})
                }
            }
        }
    }

    return (
        <div 
            className={className}
            onMouseLeave={() => {setPreview({})}}
        >
            {RANGE.map(i => {
                const squares = [];
                RANGE.forEach(j => {
                    const spaceNum = Number.parseInt(`${i}${j}`);
                    const isPreview = preview.spaces && preview.spaces.includes(spaceNum);
                    squares.push(
                        <div
                            role="button"
                            id={`${i}${j}`} 
                            key={`${i}${j}`}
                            className={
                                className + 
                                ` ${spaces[`${i}${j}`]}` + 
                                ` ${isPreview ? `${preview.color} ispreview` : ""}`
                            }
                            onMouseEnter={() => {
                                calculatePreview(spaceNum)
                            }}
                            onClick={()=>{
                                handleTouchOrClick(spaceNum, {type: "click"})
                            }}
                            onTouchStart={()=>{
                                calculatePreview(spaceNum)
                                handleTouchOrClick(spaceNum, {type: "touch"})
                            }}
                            onKeyPress={()=>{}}
                        >
                        </div>
                    );
                })
                return squares
            })}            
        </div>
    )
}

const StyledBoard = styled(Board)`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    background: black;
    padding: 0.5rem;

    & > div {
        background: #000;
        border: 1px solid #333;
        height: calc((100vw - 4rem) / 6);
        max-height: 78px;
        border-radius: 10%;

        &.BLOCK {
            background: #ffdd99;
            border-radius: 50%;
        }

        &.FREE {
            background: #000;
        }

        &.four {
            background: ${pieceColors.four};
        }

        &.three {
            background: ${pieceColors.three};
        }

        &.two {
            background: ${pieceColors.two};
        }

        &.one {
            background: ${pieceColors.one};
        }

        &.corner {
            background: ${pieceColors.corner};
        }

        &.l {
            background: ${pieceColors.l};
        }

        &.nub {
            background: ${pieceColors.nub};
        }

        &.zig {
            background: ${pieceColors.zig};
        }

        &.box {
            background: ${pieceColors.box};
        }

        &.ispreview {
            opacity: .75;
            border-radius: 25%;
            box-shadow: 0px 0px 0.1rem 0.1rem #AAA;

            &.BLOCK {
                border-radius: 50%;
            }
        }

        &.false {
            background: #520101;
            box-shadow: 0px 0px 0.2rem 0.2rem red;
            cursor: not-allowed;
        }
    }
`

export default StyledBoard
