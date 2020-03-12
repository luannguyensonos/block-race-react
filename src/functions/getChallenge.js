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
  console.log("GETTING CHALLENGE", event.queryStringParameters)
  return client.query(
    q.Get(
      q.Ref(q.Collection('challenges'), event.queryStringParameters.id)
    )
  )
    .then((response) => {
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(response)
      })
    }).catch((error) => {
      console.log("[Error]", error)
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(null)
      })
    })
}