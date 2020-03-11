import React, { useEffect, useState } from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Header from "../components/header"
import SEO from "../components/seo"
import { useAsyncFn } from 'react-use'

export const formatSeconds = (secs) => {
  if (secs >= 60) {
    return `${Math.floor(secs/60)}m ${secs%60}s`
  } else {
    return `${secs}s`
  }
}
const odds = (n,x) => { return Math.random() * n <= n/(10*x) };

const IndexPage = () => {

  const [recent, setRecent] = useState([]);
  const [most, setMost] = useState([]);
  const [allRecords, retrieveRecords] = useAsyncFn(async () => {
    const thisRecord = await fetch(`/.netlify/functions/getAllRecords`)
      .then(res => res.json())
    let recordsLeft = thisRecord.length;
    const usedNames = {};
    const reduce = thisRecord.reduce((obj, r) => {
      if ((obj.rArr.length < 10 &&
        ( !usedNames[r.data.name] ||
        odds(thisRecord.length, usedNames[r.data.name]))) ||
        recordsLeft <= 10-obj.rArr.length)
      {
        usedNames[r.data.name] = usedNames[r.data.name] ?
          usedNames[r.data.name]+1 : 1;
        obj.rArr.push(r.data);
      }
      recordsLeft--;
      if (!obj.hist[r.data.name]) obj.hist[r.data.name] = 0
      obj.hist[r.data.name]++;
      return obj;
    }, {
      rArr: [],
      hist: {}
    });
    setRecent(reduce.rArr);

    const sortable = [];
    for (var name in reduce.hist) {
        sortable.push([name, reduce.hist[name]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    setMost(sortable.slice(0,5));

    return thisRecord || "STOP!"
  }, [])

  const [wins, setWins] = useState([]);
  const [allChal, retrieveChals] = useAsyncFn(async () => {
    const thisRecord = await fetch(`/.netlify/functions/getAllChallenges`)
      .then(res => res.json())

    const reduce = thisRecord.reduce((obj, r) => {
      if (r.data.player1time < 999 && r.data.player2time < 999) {
        if (!obj[r.data.player1]) obj[r.data.player1] = {w:0, l:0, t:0};
        if (!obj[r.data.player2]) obj[r.data.player2] = {w:0, l:0, t:0};

        if (r.data.player1time < r.data.player2time) {
          obj[r.data.player1].w++;
          obj[r.data.player2].l++;
        } else if (r.data.player2time < r.data.player1time) {
          obj[r.data.player1].l++;
          obj[r.data.player2].w++;
        } else {
          obj[r.data.player1].t++;
          obj[r.data.player2].t++;
        }
      }
      return obj;
    }, {});

    const sortable = [];
    for (var name in reduce) {
        sortable.push([name, reduce[name].w, reduce[name].l, reduce[name].t]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    setWins(sortable.slice(0,5));

    return thisRecord || "STOP!"
  }, [])

  useEffect(() => {
    if (!allRecords.value &&
        !(allRecords.loading || allRecords.error))
    {
      retrieveRecords();
    }
    if (!allChal.value &&
      !(allChal.loading || allChal.error))
  {
    retrieveChals();
  }
  }, [allRecords, retrieveRecords, allChal, retrieveChals]);

  return (
    <>
      <Header/>
      <Layout>
        <SEO title="Block Race" />
        <div
          style={{
            display: `flex`,
            flexDirection: `column`,
            height: `90vh`,
            fontSize: `1rem`
          }}
        >
          <div
            style={{
              margin: `0.5rem 0`,
              display: `grid`,
              gridTemplateColumns: `1fr 1fr`
            }}
          >
            <div style={{ marginRight: `auto` }}>
              <Link
                to={`/puzzle/`}
                style={{
                  textDecoration: `none`,
                }}
              >
                <button
                  type="button"
                  style={{
                    margin: `auto auto`,
                    padding: `0.25rem 1rem`,
                    background: `#DF950C`,
                    color: `#FFF`
                  }}
                >
                  Single Puzzle
                </button>
              </Link>
              <div>
                <h4 style={{ marginTop: `1rem` }}>Most Records</h4>
                { allRecords.loading ?
                    "Loading..." :
                    allRecords.value ?
                    (
                      <ul>
                        {most.map(r => (
                          <li
                            key={r[0]}
                            style={{
                              display: `grid`,
                              gridTemplateColumns: `1fr 1fr`,
                            }}
                          >
                            <span style={{ fontWeight: `bold` }}>{r[0]}</span>
                            <span>{`${r[1]}`}</span>
                          </li>
                        ))}
                      </ul>
                    ) : "Oh noes!"
                }
              </div>
            </div>
            <div style={{ marginLeft: `auto` }}>
              <Link
                to={`/h2h/`}
                style={{
                  textDecoration: `none`,
                }}
              >
                <button
                  type="button"
                  style={{
                    margin: `auto auto`,
                    padding: `0.25rem 1rem`,
                    background: `#DF950C`,
                    color: `#FFF`
                  }}
                >
                  Head-to-Head
                </button>
              </Link>
              <div>
                <h4 style={{ marginTop: `1rem` }}>Most Wins</h4>
                { allChal.loading ?
                    "Loading..." :
                    allChal.value ?
                    (
                      <ul>
                        {wins.map(r => (
                          <li
                            key={r[0]}
                            style={{
                              display: `grid`,
                              gridTemplateColumns: `1fr 1fr`,
                            }}
                          >
                            <span style={{ fontWeight: `bold` }}>{r[0]}</span>
                            <span>{`${r[1]}-${r[2]}${r[3] > 0 ? `-${r[3]}` : ""}`}</span>
                          </li>
                        ))}
                      </ul>
                    ) : "Wow, such empty"
                }
              </div>
            </div>
          </div>
          <div
            style={{
              margin: `0.5rem 0`
            }}
          >
            <h4>Recent Records</h4>
            { allRecords.loading ?
                "Loading..." :
                allRecords.value ?
                (
                  <ul>
                    {recent.map(r => (
                      <li
                        key={r.puzzleId}
                        style={{
                          display: `grid`,
                          gridTemplateColumns: `2.5fr 1fr 1fr`,
                        }}
                      >
                        <Link to={`/puzzle/?id=${r.puzzleId}`}>
                          {r.puzzleId}
                        </Link>
                        <span style={{ fontWeight: `bold` }}>{r.name}</span>
                        <span>{formatSeconds(r.best)}</span>
                      </li>
                    ))}
                  </ul>
                ) : "Nothing to see here"
            }
          </div>
        </div>
      </Layout>
    </>
  )
}

export default IndexPage
