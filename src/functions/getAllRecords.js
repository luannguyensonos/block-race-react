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
  console.log("GETTING ALL RECORDS")
  return client.query(
    q.Paginate(
      q.Match(
        q.Index('all_records')
      )
    )
  )
  .then((response) => {
    const refs = response.data
    console.log("refs", refs)
    console.log(`${refs.length} found`)
    // See. http://bit.ly/2LG3MLg
    const getAllDataQuery = refs.map((ref) => {
      return q.Get(ref)
    })
    // then query the refs
    return client.query(getAllDataQuery).then((ret) => {
      console.log("Got em", JSON.stringify(ret))
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(ret)
      })
    })
  }).catch((error) => {
    console.log("error", error)
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify(error)
    })
  })
}