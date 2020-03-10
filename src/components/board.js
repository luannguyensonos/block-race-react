import React, {useContext, useState} from "react"
import styled from "styled-components"
import { GameContext, RANGE } from "../pages/puzzle"
import { pieceColors } from "../components/piece"

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

const Board = ({ className }) => {
    const {
        spaces, setSpaces, 
        pieces, setPieces, 
        activePiece, setActivePiece,
        preview, setPreview,
        doneTime
    } = useContext(GameContext);

    const [justLaid, setJustLaid] = useState(null);

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
        if (target) calculatePreview(Number.parseInt(target.id));
    }
    const handleTouchMove = (e) => {
        const touch = e.touches && e.touches.length > 0 ? e.touches[0] : null;
        if (touch) {
            const corner = document.getElementById("11");
            const clientRect = corner.getBoundingClientRect();
            const myI = Math.ceil((touch.clientY - clientRect.top) / clientRect.height);
            const myJ = Math.ceil((touch.clientX - clientRect.left) / clientRect.width);
            const predictedSpaceNum = `${myI}${myJ}`;
            if (spaces[predictedSpaceNum]) calculatePreview(Number.parseInt(predictedSpaceNum));
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
        <div className={className}>
            {RANGE.map(i => {
                const squares = [];
                RANGE.forEach(j => {
                    const spaceNum = Number.parseInt(`${i}${j}`);
                    const isPreview = preview.spaces && preview.spaces.includes(spaceNum);
                    squares.push(
                        <div
                            role="button"
                            tabIndex={0}
                            id={`${i}${j}`} 
                            key={`${i}${j}`}
                            className={
                                className + 
                                ` ${spaces[`${i}${j}`]}` + 
                                ` ${isPreview ? `${preview.color} ispreview` : ""}`
                            }
                            onMouseEnter={() => {calculatePreview(spaceNum)}}
                            onMouseLeave={() => {setPreview({})}}
                            onClick={() => {if (!doneTime) layPiece(spaceNum)}}
                            onTouchStart={(e) => {handleTouchStart(e)}}
                            onTouchMove={(e) => {handleTouchMove(e)}}
                            onTouchEnd={(e) => {handleTouchEnd(e)}}
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
