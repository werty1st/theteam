
class DR.BroenGallery.App
    isIE: false
    isMobile: false
    
    data: null

    constructor: (containerId, episode=0) ->
        this.fetchData()
        this.featureDetect()

        @container = document.getElementById containerId
        @container.innerHTML = this.html()
        @homeLink = document.getElementById 'broen-home-link'

        @homeView = new HomeView this
        @personView = new PersonView this

        @episode = episode;

        this.initVoting()

        return this

    start: ->
        @router = new MooRouter this

    showHome: ->
        if @homeLink.className.indexOf('hide') is -1
            @homeLink.className += ' hide'
        
        @personView.hide()
        @homeView.show()

    showPerson: (slug) ->
        @homeView.hide()
        @homeLink.className = @homeLink.className.replace ' hide', ''
        @personView.show @data[slug]

    fetchData: ->
        dataUrl = DR.BroenGallery.config.jsonDataUrl

        d3.json dataUrl, (error, data) =>
            @data = data
            #window.global.data = data
            this.start()

    vote: (slug) ->
        @voteMachine.vote slug

    featureDetect: ->
        features = document.html.className
        if features.indexOf('mobile') isnt -1 then @isMobile = true
        if features.indexOf('ie7') isnt -1 then @isIE = true
        if features.indexOf('ie8') isnt -1 then @isIE = true

    initVoting: ->
        @voteMachine = new DR.BroenGallery.VoteMachine this

    html: ->
        """
        <div id="broen-gallery" class="section boxed container-green-light">
            <h2><a href="#home">Verdächtige</a><a id="broen-home-link" class="dr-icon-link-small dr-link-readmore hide" href="#home">Zur Übersicht</a></h2>

            <div id="broen-gallery-home" class="hide">
                <p class="intro-text">Die wichtigsten Personen und ihre Beziehungen zueinander</p>
                <div id="broen-gallery-home-persons"></div>
                <div id="broen-gallery-home-popover" class="hide container-green"></div>
            </div>
            
            <div id="broen-gallery-person">
                <div id="broen-gallery-person-info"></div>
                <div id="broen-gallery-graph">
                    <div id="broen-gallery-graph-popover" class="hide container-green"></div>
                </div>
            </div>
        </div>
        """