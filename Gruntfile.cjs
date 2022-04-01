const sass = require("node-sass");

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
						"./room-config-schema.json",
						"./public/assets/**",
						"./existing-games/**",
					],
					dest: "build",
				}]
			}
		},
		htmlmin: {
			main: {
				options: {
					collapseWhitespace: true,
					removeComments: true,
				},
				files: {
					"build/public/index.html": "public/index.html",
				}
			}
		},
		sass: {
			options: {
				implementation: sass,
				outputStyle: "compressed",
			},
			dist: {
				files: {
					"./build/public/css/index.min.css": "./public/css/index.scss",
					"./build/public/css/bootstrap.min.css": "./public/css/bootstrap.scss",
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
					"author",
					"homepage",
					"license",
					"main",
					"name",
					"repository",
					{
						scripts: () => ({
							"start": "node index.cjs",
						})
					},
					"type",
					"version",
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
			myConfig: require("./webpack.config.cjs"),
		},
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-htmlmin");
	grunt.loadNpmTasks("grunt-sass");
	grunt.loadNpmTasks("grunt-update-json");
	grunt.loadNpmTasks("grunt-ts");
	grunt.loadNpmTasks("grunt-webpack");

	grunt.registerTask("default", ["clean", "copy", "htmlmin", "sass", "update_json", "ts", "webpack"]);
};
