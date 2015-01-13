module.exports = (grunt) ->

    #Project configuration
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'

        #CoffeeScript
        coffee:
            app:
                options:
                    bare: true

                files:
                    'js/app.js': [
                        'coffee/**/*.coffee'
                    ]

        #LESS
        less:
            web:
                options:
                    paths: ['styles']
                files:
                    'styles/broen.css': 'styles/**/*.less'

        #Concat
        concat:
            options:
                separator: ';'

            dist:
                src: ['js/config.js', 'js/app.js']
                #src: ['js/libs/*.js', 'js/config.js', 'js/app.js']
                dest: 'js/broen.js'

        #Watch
        watch:
            coffee:
                files: ['coffee/**/*.coffee']
                tasks: ['coffee', 'concat', 'shell:kansopush']

            styles:
                files: ['styles/**/*.less']
                tasks: ['less', 'shell:kansopush']

            data:
                files: ['data.json','index.html','vote.html','templates/**','lib/**','img/**']
                tasks: ['shell:kansopush']

            kanso:
                files: ['kanso.json']
                tasks: ['shell:kansoinstall', 'shell:kansopush']

        #shell
        shell:
            kansopush:
                command:
                  if "dev" in grunt.cli.tasks
                      "kanso push"
                  else if "live" in grunt.cli.tasks
                      "kanso push live"
                  else
                      "kanso push"
                options:
                    stdout: true

            kansoinstall:
                command:
                      "kanso install"
                options:
                    stdout: true                    


    #Load the plugins
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-less'
    grunt.loadNpmTasks 'grunt-contrib-concat'
    grunt.loadNpmTasks 'grunt-shell'

    #Register tasks
    grunt.registerTask 'dev', ['coffee', 'less', 'concat', 'shell:kansopush', 'watch']
    grunt.registerTask 'live', ['coffee', 'less', 'concat', 'shell:kansopush', 'watch']
    
    
    