class MooRouter
    constructor: (app) ->
        @app = app

        router = Router.implement
            routes:
                ''       : 'homeRoute'
                '#:slug' : 'personRoute'

            homeRoute: =>
                @app.showHome()
                window.ivw()

            personRoute: ->
                this.showPerson this.param.slug
                window.ivw()

            showPerson: (slug) =>
                if slug is 'home'
                    return @app.showHome()

                if @app.isMobile
                    offset = @app.container.offsetTop - 10
                    window.scrollTo 0, offset

                if @app.data[slug]
                    @app.showPerson slug
                else                    
                    alert 'Mangler data for ' + slug + '.'

        return new router