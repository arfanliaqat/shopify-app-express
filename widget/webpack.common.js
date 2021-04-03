const path = require("path")
const webpack = require('webpack')

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
	plugins: [
			new webpack.DefinePlugin({
				SHOPIFY_APP_URL: JSON.stringify(process.env.SHOPIFY_APP_URL || "https://shopify-app.dev")
			})
	],
	output: {
		filename: process.env.WIDGET_SCRIPT_NAME || "h10-ship-by-date.js",
		path: path.resolve(__dirname, "public/build")
	}
}
