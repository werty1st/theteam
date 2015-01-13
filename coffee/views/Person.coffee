class PersonView
    
    constructor: (app) ->
        @app = app
        @el = document.getElementById 'broen-gallery-person'
        @info = new PersonInfoView @app, document.getElementById 'broen-gallery-person-info'

        if @app.isMobile or @app.isIE
            @graph = new MobileGraph app, document.getElementById 'broen-gallery-graph'
            @app.container.className += ' mobile'
        else
            @graph = new D3Graph app, @el.getElementById 'broen-gallery-graph'

        this.hide()
        return this

    hide: ->
        @el.className = 'hide'

        if @graph.isD3
            @graph.popover.hide()

    show: (person) ->
        @el.className = ''

        # if person.durchstreichen <= @app.episode
        #     person.ude = true

        @info.show person
        @graph.show person