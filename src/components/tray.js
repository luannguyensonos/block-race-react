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
    height: calc(100vw - 2rem);
    max-height: 500px;
    margin-top: 1rem;
`

export default StyledTray
