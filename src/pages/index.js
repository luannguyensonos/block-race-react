import React, { useEffect, useState } from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { useAsyncFn } from 'react-use'
import { formatSeconds } from "../components/header"

const IndexPage = () => {

  const [recent, setRecent] = useState([]);
  const [most, setMost] = useState([]);
  const [allRecords, retrieveRecords] = useAsyncFn(async () => {
    const thisRecord = await fetch(`/.netlify/functions/getAllRecords`)
      .then(res => res.json())
    console.log("Got all records:", thisRecord)
    const reduce = thisRecord.reduce((obj, r) => {
      if (obj.rArr.length < 5) obj.rArr.push(r.data);
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
          height: `90vh`
        }}
      >
        <div
          style={{
            margin: `0.5rem 0`
          }}
        >
          <h2>Recent records</h2>
          { allRecords.loading ?
              "Loading..." :
              allRecords.value ?
              (
                <ul>
                  {recent.map(r => (
                    <li>
                      <Link to={`/puzzle/?id=${r.puzzleId}`}>
                        {`${r.puzzleId} - ${r.name} - ${formatSeconds(r.best)}`}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : "Nothing to see here"
          }
        </div>
        <div
          style={{
            margin: `0.5rem 0`
          }}
        >
          <h2>Most records</h2>
          { allRecords.loading ?
              "Loading..." :
              allRecords.value ?
              (
                <ul>
                  {most.map(r => (
                    <li>
                      {`${r[0]} - ${r[1]}`}
                    </li>
                  ))}
                </ul>
              ) : "Wow, such empty"
          }
        </div>
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
                background: `orange`,
                color: `#FFF`
              }}
            >
              Try a Random Puzzle
            </button>

          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default IndexPage
