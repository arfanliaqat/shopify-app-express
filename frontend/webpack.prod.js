const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const TerserJSPlugin = require("terser-webpack-plugin")

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    optimization: {
        minimizer: [new TerserJSPlugin({ sourceMap: true })],
    },
})
