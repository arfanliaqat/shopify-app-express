const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
    entry: "./src/app.tsx",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        filename: "app.js",
        path: path.resolve(__dirname, "public/build")
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./node_modules/@shopify/app-bridge/umd/index.js", to: "./libs/app-bridge.js" },
                { from: "./node_modules/@shopify/polaris/dist/styles.css", to: "./css/polaris.css" }
            ]
        })
    ]
}
