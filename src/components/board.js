import React, {useContext, useState} from "react"
import styled from "styled-components"
import { GameContext, RANGE } from "../components/game"
import { pieceColors } from "../components/piece"
import { isMobile, isBrowser } from "react-device-detect"

const Board = ({ className }) => {
    const {
        spaces,
        preview, setPreview,
        doneTime,
        calculatePreview,
        layOrLiftPiece
    } = useContext(GameContext);

    const handleTouchOrClick = (spaceNum) => {
        if (!doneTime) {
            layOrLiftPiece(spaceNum)
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
                                if (
                                    spaces[`${i}${j}`] === "FREE" ||
                                    spaces[`${i}${j}`] === "BLOCK"
                                )
                                    calculatePreview(spaceNum)
                                else
                                    setPreview({})
                            }}
                            onClick={()=>{
                                if (isMobile) return;
                                handleTouchOrClick(spaceNum)
                            }}
                            onTouchStart={()=>{
                                if (isBrowser) return;
                                calculatePreview(spaceNum)
                                handleTouchOrClick(spaceNum)
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
    touch-action: none;

    & > div {
        background: #000;
        border: 1px solid #333;
        height: calc((100vw - 4rem) / 6);
        max-height: 78px;
        border-radius: 10%;
        touch-action: none;

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
