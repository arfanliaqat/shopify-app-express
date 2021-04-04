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
				SHOPIFY_APP_URL: JSON.stringify(process.env.SHOPIFY_APP_URL || "https://shopify-app.dev"),
				APP_NAME: JSON.stringify(process.env.APP_NAME || "DATE_PICKER")
			}),
			new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /nl|en|en\-au|en\-ca|en\-gb|fr|fr\-ca|de|id|it|pl|pt|pt\-br|ro|ru|es|sv/),
	],
	output: {
		filename: process.env.WIDGET_SCRIPT_NAME || "h10-ship-by-date.js",
		path: path.resolve(__dirname, "public/build")
	}
}
