import { Link } from "gatsby"
import React, {useContext, useState, useEffect} from "react"
import { useAsyncFn, useEffectOnce } from 'react-use'
import Button, { LeftButton, RightButton } from "../components/button"
import { formatSeconds } from "../pages/index"
import PacmanLoader from "react-spinners/PacmanLoader"
import { 
  GameContext,
	serializedBlockers,
} from "../components/game"

const H2HHeader = (id) => {
  const {
    startGame,
    timer,
    doneTime,
    puzzleId,
    setDone,
    setPuzzleId,
    spaces,
    generateBlockers
  } = useContext(GameContext);

  const [title, setTitle] = useState("");
  const [doneSeconds, setDoneSeconds] = useState(0);
  const [initials, setInitials] = useState("");
  const [challengeId, setChallengeId] = useState(null);
  const [challengeState, setChallengeState] = useState(0);
  const [trueChallenge, setTrueChallenge] = useState({});
  const [updateRetries, setUpdateRetries] = useState(0);
  /*
    Challenge states
    0 - nothing yet, not even an id
    1 - challenge created (or existing one retrieved)
      - If no players yet, leave at 1
    2 - If one player has already played
    3 - If both players have played

    Challenge looks like this:
    {
      puzzleId: "1234567890",
      player1: "LKN",
      player1time: 62,
      player2: "",
      player2time: 999
    }
  */

  const [retrievedChallenge, retrieveChallenge] = useAsyncFn(async (cid) => {
    const thisRecord = await fetch(`/.netlify/functions/getChallenge?id=${cid}`)
      .then(res => res.json())
    if (thisRecord.data) {
      if (thisRecord.data.player2 && thisRecord.data.player2.length > 0)
        setChallengeState(3);
      else if (thisRecord.data.player1 && thisRecord.data.player1.length > 0 && thisRecord.data.player1time < 999)
        setChallengeState(2);
      else if (thisRecord.data.player1 && thisRecord.data.player1.length > 0 && thisRecord.data.player1time === 999) {
        setChallengeState(1);
        setInitials(thisRecord.data.player1)
      }

      setChallengeId(cid)
      setPuzzleId(thisRecord.data.puzzleId)
      setTrueChallenge(thisRecord.data)
    } else {
      return { failed: true }
    }
    return thisRecord.data
  }, [setChallengeId, setChallengeState, setPuzzleId, setInitials])

  const [generatedChallenge, generateChallenge] = useAsyncFn(async () => {
    const thisRecord = await fetch(`/.netlify/functions/createChallenge`, {
      method: "POST",
      body: JSON.stringify({
        puzzleId,
        player1: initials.toUpperCase(),
        player1time: 999,
        player2: "",
        player2time: 999
      })
    })
      .then(res => res.json());
    if (thisRecord.ref && thisRecord.data) {
      setChallengeId(thisRecord.ref["@ref"].id);
      setChallengeState(1);
      setTrueChallenge(thisRecord.data)
    } else {
      return { failed: true }
    }
    return thisRecord.data
  }, [puzzleId, initials, setChallengeId, setChallengeState])

  const [startedChallenge, startChallenge] = useAsyncFn(async () => {
    if (challengeState === 0 && puzzleId.length > 0) {
      await generateChallenge().then(ret => {
        if (ret.puzzleId) // This assumes the call succeeded 
        {
          startGame();
          return ret;
        }
      })
    } else if (challengeState === 1) {
      startGame();
      return retrievedChallenge.value;
    } else if (challengeState === 2) {
      await updateChallenge().then(ret => {
        if (ret.puzzleId) // This assumes the call succeeded 
        {
          startGame();
          return ret;
        }
      })
    }
    return false;
  }, [
    challengeState, 
    generateChallenge, 
    timer, 
    startGame,
    retrievedChallenge
  ])

  const [updatedChallenge, updateChallenge] = useAsyncFn(async (secs, manual) => {
    const thisChallenge = {...trueChallenge}

    if (!thisChallenge.puzzleId) return { failed: true }

    let newState;
    if (secs) {
      if (thisChallenge.player1time === 999) {
        thisChallenge.player1time = secs;
      } else if (thisChallenge.player2time === 999) {
        thisChallenge.player2time = secs;
        newState = 3;
      }

      // For debugging purposes
      if (manual) thisChallenge.manual = true;
    } else {
      thisChallenge.player2 = initials.toUpperCase()
    }

    const thisRecord = await fetch(`/.netlify/functions/updateChallenge`, {
      method: "POST",
      body: JSON.stringify({
        ref: challengeId,
        ...thisChallenge
      })
    })
      .then(res => res.json());
    if (!thisRecord || !thisRecord.ref || !thisRecord.data) {
      return { failed: true }
    }
    setTrueChallenge(thisRecord.data)
    if (newState) setChallengeState(newState)
    return thisRecord.data
  }, [trueChallenge,
    setTrueChallenge,
    initials
  ])

  useEffectOnce(() => {
    if (id && id.id && !challengeId) {
      retrieveChallenge(id.id)
    } else {
      if (!puzzleId || puzzleId.length < 14) {
        const newPuzzle = serializedBlockers(generateBlockers());
        setPuzzleId(newPuzzle);
      }
    }
  }, [id, 
    challengeId, 
    retrieveChallenge,
    puzzleId,
    serializedBlockers,
    generateBlockers,
    setPuzzleId
  ])

  useEffect(() => {
    const isDone = Object.keys(spaces).every(s => spaces[s] !== "FREE");
    if (timer && isDone) {
      setDone(new Date());
    }
  }, [timer, spaces, setDone]);

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
      if (doneTime && doneSeconds) {
        if ((!updatedChallenge.value || 
          (updatedChallenge.value.player1time === 999) ||
          (updatedChallenge.value.player2.length > 0 && updatedChallenge.value.player2time === 999)) && 
          !updatedChallenge.loading) 
        {
          updateChallenge(doneSeconds)
        }
      }
    }
  }, [timer,
    title,
    doneTime,
    doneSeconds
  ]);

  // Testing out an auto-retry mechanism
  useEffect(() => {
    if (doneSeconds &&
        updateRetries <= 2 &&
        !updatedChallenge.loading &&
        ((updatedChallenge.value && updatedChallenge.value.failed) || updatedChallenge.error)
    ){
      setUpdateRetries(updateRetries+1)
      updateChallenge(doneSeconds);
    }
  }, [updatedChallenge.value, updateChallenge.error])
  
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
            {`${timer == null ? "Head-to-Head" : title}`}
          </Link>
        </h1>
        {initials.length > 0 && !timer ? (
          <RightButton
            onClick={() => {
              if (!generatedChallenge.loading) {
                startChallenge()
              }
            }}
          >
            {generatedChallenge.loading ? `Get ready!` : 
              generatedChallenge.value && generatedChallenge.value.failed ? `Try again` :
              `Let's Go!`}
          </RightButton>
        ) : null}
      </div>
      {(retrievedChallenge.value && retrievedChallenge.value.failed) || retrievedChallenge.error ?
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
              Hrm. Couldn't find your challenge.
            </h1>
            <a href={`/h2h`}>
              <LeftButton>
                Let's start a new one
              </LeftButton>
            </a>
          </div>
        ) : !timer && !retrievedChallenge.loading && challengeState < 3 ?
        (
          <div
            style={{
              margin: `0 auto`,
              maxWidth: 540,
              padding: `0.75rem 0.75rem 2rem 0.75rem`,
              display: `flex`,
              flexDirection: `column`,
              textAlign: `center`
            }}
          >
              <h1
                style={{
                  margin: `0.25rem auto`,
                  fontSize: `1rem`
                }}
              >
                { 
                  challengeState <= 1 ? 
                    `Player 1, are you ready?` :
                    `Player 2, you've been challenged!` 
                }
              </h1>
              <h1
                style={{
                  margin: `0.25rem auto 0.5rem auto`,
                  fontSize: `1rem`
                }}
              >
                { 
                  `Enter your initials to begin:` 
                }
              </h1>
              <input 
                type="text" 
                placeholder={initials.length > 0 ? initials : `AAA`}
                maxLength={3}
                size={5}
                onChange={e => setInitials(e.target.value)}
                style={{
                  margin: `0 auto`,
                }}
              ></input>
            </div>
        ) : !timer && retrievedChallenge.loading ?
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
        ) : null
      }
      {(doneTime || challengeState >= 3) && challengeId ?
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
                fontSize: `0.9rem`
              }}
            >
              { challengeState < 3 ? 
                (
                  <span>
                    Important! Send to a friend or enemy:
                    <br/>
                    (Goes to open challenges in 3 hours)
                  </span>
                ) : 
                (
                  <span>
                    {`Player ${trueChallenge.player1time < trueChallenge.player2time ? "1" : "2"} prevailed!`}
                  </span>
                )
              }
            </h1>
            {challengeState < 3 ? 
              (
                <h1
                  style={{
                    margin: `auto 0`,
                    fontSize: `0.6rem`
                  }}
                >
                  <Link
                    to={`/h2h/?id=${challengeId}`}
                    style={{
                      color: `white`,
                      textDecoration: `none`,
                    }}
                  >
                    {`https://block-race.netlify.com/h2h/?id=${challengeId}`}
                  </Link>
                </h1>
              ): null
            }
            {
              (updatedChallenge.value && updatedChallenge.value.failed) || updatedChallenge.error ?
              (
                <div
                  style={{
                    margin: `2rem 0 1rem 0`,
                    fontSize: `1rem`,
                    display: `flex`
                  }}
                >
                  <Button
                    onClick={() => {
                      updateChallenge(doneSeconds, true);
                    }}
                  >
                    Oops. Click here to reload the results.
                  </Button>
                </div>
              ) : (trueChallenge && trueChallenge.puzzleId) ?
              (
                <div
                  style={{
                    margin: `0.5rem 0`,
                    fontSize: `1rem`,
                    display: `flex`,
                    flexDirection: `column`
                  }}
                >
                  <h1
                    style={{
                      margin: `1rem 0 0.5rem 0`,
                      fontSize: `1rem`
                    }}
                  >
                    Results:
                  </h1>
                  <h1
                    style={{
                      margin: `0.25rem 0`,
                      fontSize: `1rem`
                    }}
                  >{`Player 1: ${trueChallenge.player1} - ${formatSeconds(trueChallenge.player1time)}`}</h1>
                  <h1
                    style={{
                      margin: `0.25rem 0`,
                      fontSize: `1rem`
                    }}
                  >
                    {trueChallenge.player2 && trueChallenge.player2.length > 0 ?
                      `Player 2: ${trueChallenge.player2} - ${formatSeconds(trueChallenge.player2time)}` :
                      `Player 2 hasn't played yet.`}
                  </h1>
                </div>
              ) : null
            }
          </div>
        )
        : null
      }
    </header>
  )
}

export default H2HHeader
