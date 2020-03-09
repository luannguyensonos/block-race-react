// For more info, check https://www.netlify.com/docs/functions/#javascript-lambda-functions

let faunaKey = process.env.FAUNADB_SERVER_SECRET; // Should work in Production
if (!faunaKey) {
    const env = require("../util/loadEnvironmentVars")
    faunaKey = env.FAUNADB_SERVER_SECRET
}

export function handler(event, context, callback) {
  console.log("queryStringParameters", event.queryStringParameters)
  callback(null, {
    // return null to show no errors
    statusCode: 200, // http status code
    body: JSON.stringify({
      msg: `Hello, World! ${faunaKey}` + Math.round(Math.random() * 10),
    }),
  })
}