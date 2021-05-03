const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const webpack = require("webpack")

module.exports = {
	entry: "./src/app.tsx",
	mode: "development",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/
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
		filename: "app.js",
		path: path.resolve(__dirname, "public/build")
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: "./node_modules/@shopify/app-bridge/umd/index.js", to: "./libs/app-bridge.js" },
				{ from: "./node_modules/@shopify/polaris/dist/styles.css", to: "./css/polaris.css" }
			]
		}),
		new webpack.DefinePlugin({
			APP_NAME: JSON.stringify(process.env.APP_NAME || "DATE_PICKER"),
			ANCHOR_ID: JSON.stringify(process.env.ANCHOR_ID || "h10-ship-by-date"),
			SHOPIFY_API_PUBLIC_KEY: JSON.stringify(process.env.SHOPIFY_API_PUBLIC_KEY || ""),
			WIDGET_SCRIPT_NAME: JSON.stringify(process.env.WIDGET_SCRIPT_NAME || "")
		})
	]
}
