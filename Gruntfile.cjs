module.exports = function (grunt) {
	grunt.initConfig({
		clean: ["build"],
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
					dest: "build"
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
					"build/public/index.html": "public/index.html"
				}
			}
		},
		update_json: {
			options: {
				indent: "\t",
				src: "package.json",
			},
			package: {
				dest: "build/package.json",
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
		ts: {
			default: {
				tsconfig: "./tsconfig.json",
				options: {
					failOnTypeErrors: false,
				}
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
	grunt.loadNpmTasks("grunt-ts");
	grunt.loadNpmTasks("grunt-webpack");

	grunt.registerTask("default", ["clean", "copy", "htmlmin", "update_json", "ts", "webpack"]);
};
