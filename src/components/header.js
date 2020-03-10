import { Link } from "gatsby"
import PropTypes from "prop-types"
import React, {useContext, useState, useEffect} from "react"
import { useAsyncFn } from 'react-use'
import { GameContext } from "../pages/puzzle"

export const formatSeconds = (secs) => {
  if (secs >= 60) {
    return `${Math.floor(secs/60)}m ${secs%60}s`
  } else {
    return `${secs}s`
  }
}

const Header = () => {
  const {
    resetBoard,
    startGame,
    timer,
    doneTime,
    puzzleId,
    record,
    setRecord
  } = useContext(GameContext);

  const [title, setTitle] = useState("");
  const [doneSeconds, setDoneSeconds] = useState(0);
  const [initials, setInitials] = useState("");

  const [retrievedRecord, retrieveRecord] = useAsyncFn(async (pid) => {
    const thisRecord = await fetch(`/.netlify/functions/getRecord?id=${pid}`)
      .then(res => res.json())
    setRecord(1);
    if (!thisRecord.data) {
      return {
        puzzleId,
        best: 0,
        name: "AAA"
      }
    }
    return thisRecord.data
  }, [record])

  const [submittedRecord, submitNewRecord] = useAsyncFn(async () => {
    const thisRecord = await fetch(`/.netlify/functions/submitRecord`, {
      method: "POST",
      body: JSON.stringify({
        puzzleId,
        name: initials.toUpperCase(),
        best: doneSeconds,
        previous: retrievedRecord.value.best
      })
    })
      .then(res => res.json())
    if (!thisRecord.ref) {
      return { failed: true }
    }

    setInitials("");
    setRecord(2);
    return thisRecord
  }, [puzzleId, initials, doneSeconds, retrievedRecord])



  useEffect(() => {
    if (timer != null) {
      setTimeout(() => {
        const curr = doneTime ? doneTime : new Date();
        const secs = Math.floor((curr.getTime() - timer.getTime()) / 1000);
        console.log("Calc", doneTime, secs)
        if (doneTime) {
          setDoneSeconds(secs);
          if (record < 1 && !(retrievedRecord.loading || retrievedRecord.error)) {
            retrieveRecord(puzzleId);
          }
        }
        const formattedTime = secs >= 60 ? `${Math.floor(secs/60)}m ${secs%60}s` : `${secs}s`
        setTitle(`${doneTime ? "Completed in " : ""}${formattedTime}`);
      }, 1000)
    }
  }, [timer,
    puzzleId,
    doneTime,
    doneSeconds,
    setDoneSeconds,
    retrievedRecord.loading,
    retrievedRecord.error,
    retrieveRecord,
    title,
    record]);

  return (
    <header
      style={{
        background: `${timer != null && doneTime != null ? "#006600" : "#111"}`,
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
        {puzzleId ? (
          <button
            type="button"
            style={{
              margin: `0 0 0 auto`,
              padding: `0.25rem 1rem`,
              background: `#DF950C`,
              color: `#FFF`
            }}
            onClick={() => {
              timer == null ?
                startGame() :
                resetBoard()
            }}
          >
            {`${timer == null ? "Start" : "Reset"}`}
          </button>
        ) : null}
      </div>
      {(!timer || doneTime) && puzzleId ?
        (
          <div
            style={{
              margin: `0 auto`,
              maxWidth: 540,
              padding: `0.5rem 0.5rem 1rem 0.5rem`,
              display: `flex`,
              flexDirection: `column`
            }}
          >
            <h1
              style={{
                margin: `0.5rem 0`,
                fontSize: `1rem`
              }}
            >
              { timer ? `Challenge a friend:` : `Send to a friend:` }
            </h1>
            <h1
              style={{
                margin: `auto 0`,
                fontSize: `0.7rem`
              }}
            >
              <Link
                to={`/puzzle/?id=${puzzleId}`}
                style={{
                  color: `white`,
                  textDecoration: `none`,
                }}
              >
                {`https://block-race.netlify.com/puzzle/?id=${puzzleId}`}
              </Link>
            </h1>
          </div>
        )
        : null
      }
      {timer && doneTime && doneSeconds && puzzleId && record > 0 ?
        (
          <div
            style={{
              margin: `0 auto`,
              maxWidth: 540,
              padding: `0.5rem 0.5rem 1rem 0.5rem`,
              display: `flex`,
              flexDirection: `column`
            }}
          >
            <h1
              style={{
                margin: `0.5rem 0`,
                fontSize: `1rem`
              }}
            >
              { 
                retrievedRecord.value && 
                retrievedRecord.value.best > 0 && 
                retrievedRecord.value.best <= doneSeconds &&
                record === 1 ? 
                  `Record for this puzzle:` :
                  `You just set a new record!` 
              }
            </h1>
            <h1
              style={{
                margin: `auto 0`,
                fontSize: `1rem`
              }}
            >
              {
                retrievedRecord.value && 
                retrievedRecord.value.best > 0 && 
                retrievedRecord.value.best <= doneSeconds &&
                record === 1 ? 
                  `${retrievedRecord.value.name} - ${formatSeconds(retrievedRecord.value.best)}` :
                  record === 1 && !submittedRecord.loading ? 
                  (
                    <div
                      style={{
                        display: "flex"
                      }}
                    >
                      <input 
                        type="text" 
                        placeholder="AAA"
                        maxLength={3}
                        size={5}
                        onChange={e => setInitials(e.target.value)}
                        style={{
                          margin: `0 1rem 0 auto`,
                        }}
                      ></input>
                      <button
                        type="button"
                        style={{
                          margin: `0 auto 0 1rem`,
                          padding: `0.25rem 1rem`,
                          background: `#DF950C`,
                          color: `#FFF`
                        }}
                        onClick={() => {
                          if (initials.length > 0 && initials.length <= 3) {
                            submitNewRecord();
                          }
                        }}
                      >
                        {submittedRecord.value && submittedRecord.value.failed ? `Try submitting again` : `Submit your initials`}
                      </button>
                    </div>
                  ) :
                  (
                    <div>
                      {submittedRecord.loading ? 
                        `Submitting...` :
                          submittedRecord.value.ref && submittedRecord.value.ref.error ?
                            `${submittedRecord.value.ref.error}` :
                            `You're in the record books!`}
                    </div>
                  )
              }
            </h1>
          </div>
        )
        : null
      }
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
