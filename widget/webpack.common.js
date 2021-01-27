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
			},
			{
				test: /\.less$/,
				exclude: /node_modules/,
				use: ["style-loader", "css-loader", "less-loader"]
			}
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	output: {
		filename: "h10-stock-by-date.js",
		path: path.resolve(__dirname, "public/build")
	}
}
