import React, { useEffect } from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Header from "../components/header"
import LoadingRows from "../components/loadingRows"
import {MutedButton} from "../components/button"
import SEO from "../components/seo"
import { useAsyncFn } from 'react-use'

const IndexPage = () => {

  const [allChal, retrieveChals] = useAsyncFn(async () => {
    const thisRecord = await fetch(`/.netlify/functions/getAllChallenges`)
      .then(res => res.json())

    const today = new Date(Date.now());
    today.setHours(today.getHours()-3);
    const reduce = thisRecord.reduce((obj, r) => {
      if (r.data.player1time < 999 && r.data.player2.length <= 0) {
        const secs = r.ts/1000;
        const date = new Date(secs);
        if (date < today) {
          obj.push({...r, dateStr: date.toLocaleString("en-us")})
        } else {
          console.log("Newer challenge", r)
        }
      }
      return obj;
    }, []);

    return reduce.slice(0,15)
  }, [])

  const reloadData = (manual = false) => {
    if (manual || (!allChal.value && !(allChal.loading || allChal.error)))
    {
      retrieveChals();
    }
  }

  useEffect(() => {
    reloadData()
  }, [allChal, retrieveChals]);

  return (
    <>
      <Header/>
      <Layout>
        <SEO title="Take a shot at these open challenges" />
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
              margin: `0.5rem 0`
            }}
          >
            <h4>Open Challenges</h4>
            <h5>Challenges older than 3 hours show here</h5>
            { allChal.loading ?
                (<LoadingRows/>) :
                allChal.value ?
                (
                  <ul>
                    {allChal.value.map(r => (
                      <li
                        key={r.data.ref}
                        style={{
                          display: `grid`,
                          gridTemplateColumns: `2.5fr 1fr`,
                        }}
                      >
                        <Link to={`/h2h/?id=${r.data.ref}`}>
                          {r.dateStr}
                        </Link>
                        <span style={{ fontWeight: `bold` }}>{r.data.player1}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div
                    style={{
                      display: `flex`,
                      flexDirection: `column`
                    }}
                  >
                    <span
                      style={{
                        marginBottom: `3rem`,
                      }}
                    >
                      Nothing to see here.
                    </span>
                    <MutedButton
                      onClick={() => {
                        reloadData(true)
                      }}
                    >
                      {`${allChal.loading ? `Hold up...` : `Oops! Let's try reloading the data`}`}
                    </MutedButton>
                  </div>
                )
            }
          </div>
        </div>
      </Layout>
    </>
  )
}

export default IndexPage
