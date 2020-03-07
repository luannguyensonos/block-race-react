import React, {useContext} from "react"
import styled from "styled-components"
import { GameContext, RANGE } from "../pages/index"
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
    } = useContext(GameContext);

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

    const layPiece = (spaceNum) => {
        if (preview.color) {
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
        } else if (spaces[spaceNum] && spaces[spaceNum] !== "FREE" && spaces[spaceNum] !== "BLOCK") {
            // Lift the piece
            const newAP = spaces[spaceNum];
            setActivePiece(newAP);

            const newPiece = { [newAP] : {...pieces[newAP]} };
            newPiece[newAP].placed = false;
            setPieces({ item: newPiece });

            setSpaces({ type: "LIFT", item: newAP });
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
                            id={`${i}${j}`} 
                            key={`${i}${j}`}
                            className={
                                className + 
                                ` ${spaces[`${i}${j}`]}` + 
                                ` ${isPreview ? `${preview.color} ispreview` : ""}`
                            }
                            onMouseEnter={() => {calculatePreview(spaceNum)}}
                            onMouseLeave={() => {setPreview({})}}
                            onClick={() => {layPiece(spaceNum)}}
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
            background: #FDEBD0;
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
        }

        &.false {
            background: #B80D0D;
            box-shadow: 0px 0px 0.1rem 0.1rem red;
            cursor: not-allowed;
        }
    }
`

export default StyledBoard
