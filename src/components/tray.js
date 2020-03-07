import React from "react"
import styled from "styled-components"
import { GameContext } from "../pages/index"
import Piece from "../components/piece"

const Tray = ({ className }) => {

    return (
        <GameContext.Consumer>
            {({pieces}) => (
                <div className={className}>
                    {Object.keys(pieces).map(i => (
                        <Piece name={i}/>
                    ))}            
                </div>
            )}
        </GameContext.Consumer>
    )
}

const StyledTray = styled(Tray)`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 0.5rem 2.75rem;
    height: calc(100vw - 8rem);
    max-height: 375px;
`

export default StyledTray
