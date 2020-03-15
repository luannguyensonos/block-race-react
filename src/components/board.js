import React, {useContext} from "react"
import styled from "styled-components"
import { GameContext, RANGE } from "../components/game"
import { pieceColors } from "../components/piece"
import { isMobile, isBrowser } from "react-device-detect"

const Board = ({ className }) => {
    const {
        activePiece,
        spaces,
        preview, setPreview,
        calculatePreview,
        layPiece,
        liftPiece,
        touchSpace,
        setTouchSpace,
        dislodged,
        setDislodged,
        handleClickEnding
    } = useContext(GameContext);

    const isPiece = (number) => {
        // These should use some global const/enum, but oh well
        return spaces[number] !== "FREE" && spaces[number] !== "BLOCK"
    }

    return (
        <div 
            className={className}
            onMouseLeave={() => {
                if (dislodged) {
                    handleClickEnding(false)
                }
            }}
        >
            {RANGE.map(i => {
                const squares = [];
                RANGE.forEach(j => {
                    const spaceNum = Number.parseInt(`${i}${j}`);
                    const isPreview = preview.spaces && preview.spaces.includes(spaceNum);
                    squares.push(
                        <div
                            role="button"
                            id={spaceNum} 
                            key={spaceNum}
                            className={
                                className + 
                                ` ${spaces[spaceNum]}` + 
                                ` ${isPreview ? 
                                        `${spaces[spaceNum] !== "FREE" ?
                                            preview.color : 
                                            `${activePiece} ${preview.color}Glow`} ispreview`: ""}`
                            }
                            onMouseEnter={() => {
                                if (isMobile) return;
                                calculatePreview(spaceNum)
                            }}
                            onClick={()=>{
                                if (isMobile) return;
                                if (isPiece(spaceNum)) {
                                    liftPiece(spaceNum)
                                    setPreview({})
                                }
                                else if (preview.color)
                                    layPiece(spaceNum)
                            }}
                            onTouchStart={()=>{
                                if (isBrowser) return;

                                // Resetting touchSpace will let us differentiate between
                                // a "click" and a drag in onTouchEnd
                                setTouchSpace(null)

                                if (!dislodged) {
                                    if (isPiece(spaceNum)) {
                                        // Getting ready to drag or dislodge
                                        const lifted = liftPiece(spaceNum)
                                        calculatePreview(spaceNum, {
                                            activePiece: lifted
                                        })
                                    }
                                    else
                                        // Setting up a "click-lay" into a free spot
                                        calculatePreview(spaceNum)
                                }
                            }}
                            onTouchEnd={(e)=>{
                                if (isBrowser) return;
                                if (touchSpace) {
                                    // Denotes a drag action
                                    if (!isPiece(touchSpace) && preview.color)
                                        // Dragged into a valid spot
                                        layPiece(touchSpace)
                                    else
                                        // Dragged into invalid spot
                                        setDislodged(true)
                                } else {
                                    // Two cases:
                                    // 1) Either you clicked onto the board
                                    // 2) You dragged off the board completely
                                    handleClickEnding(isPreview, spaceNum)
                                }
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
            opacity: .7;
            border-radius: 25%;
            box-shadow: 0px 0px 0.1rem 0.1rem #BBB;

            &.BLOCK {
                border-radius: 50%;
            }
        }

        &.false {
            background: #4A0000;
        }
        
        &.false,
        &.falseGlow {
            box-shadow: 0px 0px 0.2rem 0.2rem red;
            cursor: not-allowed;
        }

    }
`

export default StyledBoard
