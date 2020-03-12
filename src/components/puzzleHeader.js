import { Link } from "gatsby"
import React, {useContext, useState, useEffect} from "react"
import { useAsyncFn, useLocalStorage } from 'react-use'
import { LeftButton, RightButton } from "../components/button"
import PacmanLoader from "react-spinners/PacmanLoader"
import { formatSeconds } from "../pages/index"
import { 
  GameContext,
	generateBlockers,
	serializedBlockers,
	loadBlockersFromString
} from "../components/game"

const PuzzleHeader = (id) => {
  const {
    resetBoard,
    startGame,
    timer,
    doneTime,
    puzzleId,
    record,
    setRecord,
    setDone,
    setPuzzleId,
    spaces
  } = useContext(GameContext);

  const [title, setTitle] = useState("");
  const [doneSeconds, setDoneSeconds] = useState(0);
  const [initials, setInitials] = useState("");
  const [local, setLocal] = useLocalStorage("recent", []);

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
    const isDone = Object.keys(spaces).every(s => spaces[s] !== "FREE");
    if (timer && isDone) {
      setDone(new Date());
      
      const recent = [...local];
      recent.unshift(puzzleId);
      recent.length = 20;
      setLocal(recent);
    }
  }, [spaces, setDone]);

  useEffect(() => {
    if (timer != null) {
      setTimeout(() => {
        const curr = doneTime ? doneTime : new Date();
        const secs = Math.floor((curr.getTime() - timer.getTime()) / 1000);
        if (doneTime) {
          setDoneSeconds(secs);
        }
        const formattedTime = secs >= 60 ? `${Math.floor(secs/60)}m ${secs%60}s` : `${secs}s`
        setTitle(`${doneTime ? "Completed in " : ""}${formattedTime}`);
      }, 1000)
    }
    if (doneTime && doneSeconds) {
      if ((!retrievedRecord.value || record <= 0) && !(retrievedRecord.loading || retrievedRecord.error)) {
        retrieveRecord(puzzleId);
      }
    }
  }, [
    timer,
    doneTime,
    doneSeconds,
    title
  ]);

  if (!puzzleId) {
    const initialBlockers = id && id.id && id.id.length === 14 ?
      loadBlockersFromString(id.id) :
      generateBlockers();
    setPuzzleId(serializedBlockers(initialBlockers));
  }
  
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
          padding: `0.75rem`,
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
            {`${timer == null ? "Puzzle Mode" : title}`}
          </Link>
        </h1>
        {puzzleId ? (
          <RightButton
            onClick={() => {
              timer == null && !local.includes(puzzleId) ?
                startGame() :
                resetBoard()
            }}
          >
            {`${timer == null && !local.includes(puzzleId) ? "Start" : "Reset"}`}
          </RightButton>
        ) : null}
      </div>
      {timer && doneTime && doneSeconds && puzzleId && record > 0 ?
        (
          <div
            style={{
              margin: `0 auto`,
              maxWidth: 540,
              padding: `0.75rem 0.75rem 1rem 0.75rem`,
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
                      <LeftButton
                        onClick={() => {
                          if (initials.length > 0 && initials.length <= 3) {
                            submitNewRecord();
                          }
                        }}
                      >
                        {submittedRecord.value && submittedRecord.value.failed ? `Try submitting again` : `Submit your initials`}
                      </LeftButton>
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
        : retrievedRecord.loading ?
        (
          <div
            style={{
              margin: `0 auto`,
              maxWidth: 540,
              padding: `0.75rem 0.75rem 1rem 0.75rem`,
            }}
          >
            <PacmanLoader color="white" size={10}/>
          </div>
        )
        : !timer && puzzleId && local.includes(puzzleId) ?
        (
          <div
            style={{
              margin: `0 auto`,
              maxWidth: 540,
              padding: `0.75rem 0.75rem 1rem 0.75rem`,
              display: `flex`
            }}
          >
            <h1
              style={{
                margin: `auto auto`,
                fontSize: `1rem`,
                textAlign: `center`
              }}
            >
              You've already played this puzzle.<br/>
              Let's try a new one.
            </h1>
          </div>
        )
        : null
      }
    </header>
  )
}

export default PuzzleHeader
