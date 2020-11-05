const path = require("path")

module.exports = {
    entry: "./src/app.tsx",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "app.js",
        path: path.resolve(__dirname, "public/js-build"),
    },
}
