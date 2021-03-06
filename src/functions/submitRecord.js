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

  // Forced failure case
  if (data.name === "!@#") {
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(null)
    })
  } else if (data.previous <= 0) {
    console.log("Creating a NEW record", data)
    /* construct the fauna query */
    return client.query(
      q.Create(
        q.Ref(q.Collection('records'), data.puzzleId), 
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
  } else {
    console.log("Updating an existing record", data)
    return client.query(
      q.Let(
        {"thisRecord": q.Get(q.Ref(q.Collection('records'), data.puzzleId))},
        q.Let(
          {
            "thisBest": q.Select(["data", "best"], q.Var("thisRecord")),
            "thisName": q.Select(["data", "name"], q.Var("thisRecord"))
          },
          q.If(
            q.Equals(q.Var("thisName"), data.name),
            { ref: {error: "Sorry! You cannot improve your own score."} },
            q.If(
              q.GT(q.Var("thisBest"), data.best),
              q.Do(
                q.Update(
                  q.Ref(q.Collection("records"), data.puzzleId),
                  {data}
                )
              ),
              { ref: {error: "Oh no! Someone beat you in the meantime."} }
            )
          )
        )
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
        statusCode: 400,
        body: JSON.stringify(error)
      })
    })  
  }
}