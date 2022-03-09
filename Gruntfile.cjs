module.exports = function (grunt) {
	grunt.initConfig({
		clean: ["dist"],
		copy: {
			main: {
				files: [{
					expand: true,
					src: [
						"./room-config.json",
						"./locale.json",
						"./public/assets/**",
						"./public/css/index.min.css",
						"./public/css/bootstrap.min.css",
					],
					dest: "dist"
				}]
			}
		},
		htmlmin: {
			main: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					"dist/public/index.html": "public/index.html"
				}
			}
		},
		update_json: {
			options: {
				indent: "\t",
				src: "package.json",
			},
			package: {
				dest: "dist/package.json",
				fields: [
					"main",
					"name",
					{
						scripts: () => ({
							"start": "node index.cjs",
						})
					},
					"type",
					"version"
				]
			}
		},
		webpack: {
			myConfig: require("./webpack.config.cjs")
		},
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-htmlmin");
	grunt.loadNpmTasks("grunt-update-json");
	grunt.loadNpmTasks("grunt-webpack");

	grunt.registerTask("default", ["clean", "copy", "htmlmin", "update_json", "webpack"]);
};
