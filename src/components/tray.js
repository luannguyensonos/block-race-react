import React from "react"
import styled from "styled-components"
import { GameContext } from "../pages/puzzle"
import Piece from "../components/piece"

const Tray = ({ className }) => {

    return (
        <GameContext.Consumer>
            {({pieces, timer, doneTime}) =>
                (
                    <div className={className}>
                        {pieces && timer && !doneTime ? Object.keys(pieces).map(i => (
                            <Piece name={i}/>
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
`

export default StyledTray
