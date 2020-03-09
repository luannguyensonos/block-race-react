const dotenv = require("dotenv")

const envVars = dotenv.config({
    path: `/Users/luan.nguyen/git/block-race/.env.development` // TODO: Get the path dynamically
});

module.exports = envVars.parsed
