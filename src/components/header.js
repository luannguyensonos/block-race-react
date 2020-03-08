import { Link } from "gatsby"
import PropTypes from "prop-types"
import React, {useContext, useState, useEffect} from "react"
import { GameContext } from "../pages/index"

const Header = () => {
  const {resetBoard, timer, doneTime} = useContext(GameContext);

  const [title, setTitle] = useState("");
  const [best, setBest] = useState(99999);

  const formatTime = (start) => {
    const curr = doneTime != null ? doneTime : new Date();
    const seconds = Math.floor((curr.getTime() - start.getTime()) / 1000);

    if (doneTime != null) {
      if (seconds < best) setBest(seconds);
    }

    return formatSeconds(seconds);
  }

  const formatSeconds = (secs) => {
    if (secs >= 60) {
      return `${Math.floor(secs/60)}m ${secs%60}s`
    } else {
      return `${secs}s`
    }
  }

  useEffect(() => {
    if (timer != null) {
      setTimeout(() => {
        const prefix = doneTime != null ? "Completed in " : "";
        setTitle(prefix+formatTime(timer));
      }, 1000)
    }
  }, [timer, doneTime, title]);

  return (
    <header
      style={{
        background: `${timer != null && doneTime != null ? "green" : "#333"}`,
        color: `white`
      }}
    >
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 540,
          padding: `0.5rem`,
          display: `flex`
        }}
      >
        <h1 
          style={{ 
            margin: `auto auto auto 0`,
            fontSize: `1rem`
          }}
        >
          <Link
            to="/"
            style={{
              color: `white`,
              textDecoration: `none`,
            }}
          >
            {`${timer == null ? "Block Race" : title}`}
          </Link>
        </h1>
        <h1
          style={{
            margin: `auto auto`,
            fontSize: `0.75rem`
          }}
        >
          {best < 99999 ? `Best: ${formatSeconds(best)}` : ""}
        </h1>
        <button 
          type="button"
          style={{
            margin: `0 0 0 auto`,
            padding: `0.25rem 1rem`,
            background: `orange`,
            color: `#FFF`
          }}
          onClick={() => {resetBoard()}}
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
