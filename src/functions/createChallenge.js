// For more info, check https://www.netlify.com/docs/functions/#javascript-lambda-functions
import faunadb from 'faunadb' /* Import faunaDB sdk */

let faunaKey = process.env.FAUNADB_SERVER_SECRET; // Should work in Production
if (!faunaKey) {
    const env = require("../util/loadEnvironmentVars")
    faunaKey = env.FAUNADB_SERVER_SECRET
}

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: faunaKey
})

export function handler(event, context, callback) {
  const data = JSON.parse(event.body)
  console.log("Creating a challenge", data)

  // Forced failure case
  if (data.player1 === "!@#" || data.player2 === "!@#") {
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(null)
    })
  } else {
    /* construct the fauna query */
    return client.query(
      q.Create(
        q.Collection('challenges'), 
        {data}
      )
    )
    .then((response) => {
      /* Success! return the response with statusCode 200 */
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(response)
      })
    }).catch((error) => {
      console.log("[Error]", error)
      /* Error! return the error with statusCode 400 */
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify(error)
      })
    })
  }
}