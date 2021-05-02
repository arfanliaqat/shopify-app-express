const dotenv = require("dotenv")
dotenv.config({ path: "../.env", debug: true })

const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")

module.exports = merge(common, {
	mode: "development"
})
