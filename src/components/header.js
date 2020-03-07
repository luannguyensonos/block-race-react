import { Link } from "gatsby"
import PropTypes from "prop-types"
import React, {useContext} from "react"
import { GameContext } from "../pages/index"

const Header = () => {
  const {resetBoard, timer, doneTime} = useContext(GameContext);

  const formatTime = (start) => {
    const curr = doneTime != null ? doneTime : new Date();
    const seconds = Math.floor((curr.getTime() - start.getTime()) / 1000);
  
    if (seconds >= 60) {
      return `${Math.floor(seconds/60)}m ${seconds%60}s`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <header
      style={{
        background: `${doneTime != null ? "green" : "#333"}`,
        marginBottom: `1.5rem`,
      }}
    >
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `1rem`,
          display: `flex`
        }}
      >
        <h1 
          style={{ 
            margin: `auto 0`,
            fontSize: `1.5rem` 
          }}
        >
          <Link
            to="/"
            style={{
              color: `white`,
              textDecoration: `none`,
            }}
          >
            {`${timer == null ? "Block Race" : formatTime(timer)}`}
          </Link>
        </h1>
        <button 
          type="button"
          style={{
            margin: `0 0 0 auto`,
            maxWidth: 960,
            padding: `0.5rem 1rem`,
            background: `orange`,
            color: `#FFF`
          }}
          onClick={resetBoard}
        >
          {`${timer == null ? "New" : "Reset"}`}
        </button>
      </div>
    </header>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
