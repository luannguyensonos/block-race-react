import React from "react"
import styled from "styled-components"
import { GameContext } from "../components/game"
import Piece from "../components/piece"

const Tray = ({ className }) => {

    return (
        <GameContext.Consumer>
            {({pieces, timer, doneTime, isKids}) =>
                (
                    <div className={`${className} ${isKids ? "kids" : ""}`}>
                        {pieces && (timer || isKids) && !doneTime ? Object.keys(pieces).map(i => (
                            <Piece key={i} name={i}/>
                        )) : null}            
                    </div>
                )
            }
        </GameContext.Consumer>
    )
}

const StyledTray = styled(Tray)`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 0.5rem 2.75rem;
    height: calc(100vw - 8rem);
    max-height: 375px;
    touch-action: none;

    &.kids {
        grid-template-columns: repeat(2, 1fr);
        padding: 4rem 0 0 1.5rem;
        height: 30rem;
        max-height: 30rem;
        width: 50vw
    }
`

export default StyledTray
