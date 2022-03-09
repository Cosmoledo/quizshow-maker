const path = require("path");

module.exports = {
	entry: {
		"index.cjs": "./src/index.js",
		"public/js/index.js": "./public/js/index.js",
	},
	mode: "production",
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "[name]",
	},
	optimization: {
		minimize: true,
	},
	target: "node",
};
