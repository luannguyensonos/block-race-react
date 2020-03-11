import React from "react"
import PacmanLoader from "react-spinners/ClipLoader"

const range = [1,2,3,4,5];
const once = [1];
const LoadingRows = ({ className }) => {

    return (
        <ul>
        {once.map(i => {
            const row = [];
            range.forEach(j => {
                const content = j===1 ? 
                    <PacmanLoader color={`#FFF`}/> : 
                    <span style={{color:`#333`}}>Loading...</span>;
                row.push(
                    <li
                        key={`${j}loader`}
                        style={{
                            display: `grid`,
                            gridTemplateColumns: `1fr 1fr`,
                        }}
                    >
                        {content}
                    </li>
                )
            })
            return row;
        })}
        </ul>
    )
}

export default LoadingRows
