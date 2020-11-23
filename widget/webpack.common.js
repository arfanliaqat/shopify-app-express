const path = require("path")

module.exports = {
	entry: "./src/app.tsx",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"]
			}
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	output: {
		filename: "available-date-picker-10a.js",
		path: path.resolve(__dirname, "build")
	}
}
