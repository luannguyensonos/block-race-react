import React, { useEffect, useState } from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { useAsyncFn } from 'react-use'
import { formatSeconds } from "../components/header"

const odds = (n,x) => { return Math.random() * n <= n/(10+2*x) };

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

  useEffect(() => {
    if (!allRecords.value &&
        !(allRecords.loading || allRecords.error))
    {
      retrieveRecords();
    }
  }, [allRecords]);

  return (
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
            margin: `0.5rem auto`
          }}
        >
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
              Try a Random Puzzle
            </button>

          </Link>
        </div>
        <div
          style={{
            margin: `0.5rem 0`
          }}
        >
          <h4>Most Records</h4>
          { allRecords.loading ?
              "Loading..." :
              allRecords.value ?
              (
                <ul>
                  {most.map(r => (
                    <li
                      style={{
                        display: `grid`,
                        gridTemplateColumns: `1fr 3fr`,
                      }}
                    >
                      <span style={{ fontWeight: `bold` }}>{r[0]}</span>
                      <span>{`${r[1]} records`}</span>
                    </li>
                  ))}
                </ul>
              ) : "Wow, such empty"
          }
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
  )
}

export default IndexPage
