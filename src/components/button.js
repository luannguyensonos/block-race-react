import React from "react"
import styled from "styled-components"

const Button = ({ className, children, onClick }) => (
    <button 
        type="button" 
        className={className} 
        onClick={onClick}
    >
        {children}
    </button>
)

const StyledButton = styled(Button)`
    margin: 0 auto;
    padding: 0.25rem 1rem;
    background: #DF950C;
    color: #FFF;
    font-weight: bold;
`

export const MutedButton = styled(StyledButton)`
    background: #888;
`

export const RightButton = styled(StyledButton)`
    margin: 0 0 0 auto;
`

export const LeftButton = styled(StyledButton)`
    margin: 0 auto 0 0;
`

export default StyledButton
