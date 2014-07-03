module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      all: {
        files: [{
            expand: true,
            cwd: 'js/',
            src: ['*.js', '!*.min.js'],
            dest: 'js/',
            ext: '.min.js'
        }]
      }
    },
    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      all: {
        expand: true,
        cwd: 'css/',
        src: ['*.css', '!*.min.css'],
        dest: 'css/',
        ext: '.min.css'
      }
    },
    sprite:{
      all: {
        src: 'image/t-shirts/*.png',
        destImg: 'image/t-shirts_sprite.png',
        destCSS: 'css/t-shirts.css',
        algorithm: 'left-right',
        padding: 1,
        cssTemplate: 'image/t-shirts/css_template.mustache'
      }
    },
    concat: {
      options: {
        separator: '\n',
      },
      all: {
        src: ['css/style.css', 'css/t-shirts.css'],
        dest: 'css/<%= pkg.name %>.css'
      }
    }
  });

  // Load in `grunt-spritesmith`
  grunt.loadNpmTasks('grunt-spritesmith');

  // Load in `grunt-contrib-concat`
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "CSS minify" task.
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['sprite','concat','cssmin','uglify']);

};