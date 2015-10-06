
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
            <h2><a href="#home">Who is Who</a><a id="broen-home-link" class="dr-icon-link-small dr-link-readmore hide" href="#home">Die Figuren im Überblick</a></h2>

            <div id="broen-gallery-home" class="hide">
                <p class="intro-text">Die wichtigsten Personen und ihre Beziehungen im Überblick</p>
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
class DR.BroenGallery.VoteMachine
    hasVotedThisDay: false 

    constructor: (app)->
        @app = app
        require ["js/libs/more"], =>
            @cookie = new Hash.Cookie 'benzErGud2',
                duration: 60

            @currentDay = Date.now()
            @hasVotedThisDay = this.hasVotedThisDay()
            return this

    hasVotedThisDay: ->
        lastVotedDay = @cookie.get 'day'

        timeover = lastVotedDay+1000*3600*8

        if not lastVotedDay or (timeover < @currentDay)
            return false
        else
            return true

    vote: (slug) ->
        if (@app.data[slug].ude)
            alert 'Für diese Person kann nicht mehr abgestimmt werden.'
            return

        if @hasVotedThisDay
            alert 'Sie haben heute bereits einmal abgestimmt.'
            return
        
        voteId = @app.data[slug].voteId + 1763
        myvote = new Request(
            url: "http://vote.zdf.de/gate/"
            method: "POST"
            data:
                aid: voteId
                qid: 591
                auth4: global.auth4
                auth6: global.auth

            onSuccess: (json) =>
                @cookie.set 'day', @currentDay
                @hasVotedThisDay = true
                alert 'Vielen Dank für Ihre Stimme. Sie können Morgen wieder abstimmen.'
                return
        )
        myvote.send()
        return


window.log = (x, y = '') ->
    console.log(x, y)


window.bindEvent = (el, eventName, eventHandler) ->
    if el.addEventListener
        el.addEventListener eventName, eventHandler, false
    else if el.attachEvent
        el.attachEvent 'on' + eventName, eventHandler


DR.BroenGallery.getImg = (url, w, h) ->
    return """<img class="floatleft" src="#{DR.BroenGallery.getResizedImg(url, w, h)}" width="#{w}" height="#{h}" />"""


DR.BroenGallery.getResizedImg = (url, w, h) ->

    "#{url}"
    ###
    host = document.location.host

    if host is 'www.dr.dk'
        "http://www.dr.dk/imagescaler/?file=#{url}&w=#{w}&h=#{h}&scaleAfter=crop"
    else
        "imagescaler/?file=#{url}&w=#{w}&h=#{h}&scaleAfter=crop&server=#{host}"
    ###

DR.BroenGallery.getFaceImg = (image, size) ->
    url = DR.BroenGallery.getFaceImgUrl image

    if not size
      size = DR.BroenGallery.config.faces.size

    return DR.BroenGallery.getImg url, size, size

DR.BroenGallery.getFaceImgUrl = (image) ->
    DR.BroenGallery.config.faces.url + image
    
Element::remove = ->
  @parentElement.removeChild this
  return

NodeList::remove = HTMLCollection::remove = ->
  i = 0
  len = @length

  while i < len
    this[i].parentElement.removeChild this[i]  if this[i] and this[i].parentElement
    i++
  return

class D3Graph
    hasBeenInit: false
    isD3: true

    constructor: (app, container) ->
        @app = app
        @container = container
        @width = container.offsetWidth
        @height = container.offsetHeight

        @popover = new PopoverView document.getElementById('broen-gallery-graph-popover'), @app
        return this

    init: ->
        if @hasBeenInit then d3.select('svg').remove()
        this.initD3()

        @hasBeenInit = true
        @selectedPerson = null
        @popover.hide()

    initD3: ->
        @svg = d3.select(@container).append('svg:svg')

        @svg.attr('width', @width)
            .attr('height', @height)
            .append("defs")
                .append("filter")
                    .attr("id","saturate")
                .append("feColorMatrix")
                    .attr("type","matrix")
                    .attr("values","0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0")
        @svg

        @force = d3.layout.force()
            .linkDistance(60)
            .distance(180)
            .charge(-1000)
            .size([@width, @height])

        @nodes = @force.nodes()
        @links = @force.links()

    show: (person) ->
        this.init()

        for r, i in person.relations
            r.image = @app.data[r.slug].image
            if @app.data[r.slug].durchstreichen <= @app.episode
                r.ude = true

            @links.push
                'source': i + 1
                'target': 0

        centerNode =
            'name': person.name
            'slug': person.slug
            'image': person.image
            'ude': person.ude
            'isCenter': true
        
        nodes = [centerNode].concat person.relations

        for node in nodes
            @nodes.push node

        this.update()

    update: ->
        link = @svg.selectAll('line.link').data(@links)
        link.enter().insert('line').attr('class', 'link')
        link.exit().remove()
        
        node = @svg.selectAll('g.node').data(@nodes, (d) -> return d.slug)

        nodeEnter = node.enter().append('g')
            .attr('class', (d) ->
                if d.isCenter
                    'centerNode'
                else
                    'node'
            )
            .call(@force.drag)

        nodeEnter.on 'click', (person) =>
            if person.index isnt 0
                if not @popover.open or person.slug isnt @popover.person.slug
                    @selectedPerson = person
                    @popover.updatePos person.x + 40, person.y + 40
                    @popover.show person
                else
                    @popover.hide()
 
        nodeEnter.append('image')
            .attr('xlink:href', (d) ->
                size = 80
                if d.isCenter then size = 90
                DR.BroenGallery.getResizedImg(DR.BroenGallery.getFaceImgUrl(d.image), size, size)
            )
            .attr('x', (d) ->
                if d.isCenter
                    -45
                else
                    -40
            )
            .attr('y', (d) ->
                if d.isCenter
                    -45
                else
                    -40
            )
            .attr('width', (d) ->
                if d.isCenter
                    90
                else
                    80
            )
            .attr('height', (d) ->
                if d.isCenter
                    90
                else
                    80
            )
            .attr('filter', (d) ->
                if (d.ude)
                    "url(#saturate)"
                else
                    ""
            )

        node.append('text')
            .attr('x', -20)
            .attr('y', (d) ->
                if d.isCenter
                    5
                else
                    0
            )
            .attr('dy', '3.35em')
            .text((d) -> d.name)

        node.exit().remove()

        @force.on 'tick', =>
            if @selectedPerson
                @popover.updatePos @selectedPerson.x + 20, @selectedPerson.y + 20

            link.attr('x1', (d) -> d.source.x )
                .attr('y1', (d) -> d.source.y )
                .attr('x2', (d) -> d.target.x )
                .attr('y2', (d) -> d.target.y )

            node.attr 'transform', (d) -> 'translate(' + d.x + ',' + d.y + ')'

        @force.start()
class HomeView
    hasBeenShow: false

    constructor: (app) ->
        @app = app

        @el = document.getElementById 'broen-gallery-home'
        @personsEl = document.getElementById 'broen-gallery-home-persons'
        #@popover = new PopoverView document.getElementById 'broen-gallery-home-popover'
        @popover = new SimplePopoverView document.getElementById 'broen-gallery-home-popover'
        this.addEvents() unless @app.isMobile

        return this

    addEvents: ->
        bindEvent @el, 'mouseover', (e) =>
            target = if e.target then e.target else window.event.srcElement

            if target.tagName.toLowerCase() is 'img'
                parent = target.parentNode
                slug = parent.getAttribute 'data-person-slug'

                if not @popover.open or slug isnt @popover.person.slug
                    if @app.isMobile
                        @popover.updatePos parent.offsetLeft + 40, parent.offsetTop + 40
                    else   
                        @popover.updatePos parent.offsetLeft + 30, parent.offsetTop + 55

                    @popover.show @app.data[slug]

            else if target is @personsEl
                @popover.hide()

    render: ->
        for slug, person of @app.data
            if person.freischaltepisode <= @app.episode
                if person.durchstreichen <= @app.episode
                    person.ude = true
                    @app.data[slug].ude = true
                else
                    @app.data[slug].ude = false

                @personsEl.innerHTML += this.personHTML slug, person

        @hasBeenShow = true

    show: ->
        this.render() unless @hasBeenShow
        @el.className = ''

    hide: ->
        @el.className = 'hide'
        @popover.hide()

    personHTML: (slug, person) ->
        ude = (if person.ude then "ude" else "")        
        """
        <a href="##{slug}" data-person-slug="#{slug}" class="person #{ude}">
            #{DR.BroenGallery.getFaceImg(person.image)}
        </a>
        """
class MediaView
    hasBeenOpened: false

    constructor: (name, media, isMobile, app) ->
        @name = name
        @media = media
        @isMobile = isMobile
        @app = app

        @player

        @el = document.createElement('div')
        @el.setAttribute 'id', 'broen-gallery-person-media'
        @el.innerHTML = this.html()
        
        @newh = this.getDocHeight()
        parent.postMessage(@newh, 'http://www.zdf.de');
        #parent.postMessage(@newh, 'http://cm2-prod-pre.zdf.de/');
        
        this.addEvents()        
        return @el


    getDocHeight: ->
        D = document;
        Math.max(
            D.body.scrollHeight,
            D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight,
            D.documentElement.clientHeight
        )
 

    addEvents: ->
        bindEvent @el, 'click', (e) =>
            target = if e.target then e.target else window.event.srcElement

            if ((target.tagName.toLowerCase()) is 'img' and (target.className != "video"))
                this.initSlider() unless @hasBeenOpened             

                target = $(target)
                if target.getParent().hasClass 'image-wrap'
                    target = target.getParent()

                index = target.getParent().getChildren().indexOf(target)
                this.openSlider(index)

                if e.preventDefault then e.preventDefault() else e.returnValue = false
            else if target.className is 'dr-link-readmore dr-icon-close'
                if e.preventDefault then e.preventDefault() else e.returnValue = false
                this.closeSlider()

            else if ((target.tagName.toLowerCase()) is 'img' and (target.className == "video"))
                #get playbase item
                document.lastimage = target
                target.className = "hide"
                this.playvideo(target)

            else
                false

    initSlider: ->
        @slider = document.getElementById 'broen-gallery-person-media-slider'
        @slider.innerHTML = this.getSliderHTML()


    playvideo: (target) ->
        document.stopvideo = this.stopvideo
        console.log "play video"
        url = target.getAttribute "video-url"
        # elid = target.id;
        video = document.createElement('video')
        video.setAttribute("controls","")
        video.setAttribute("preload","auto")
        video.setAttribute("width",720)
        video.setAttribute("height",416)
        video.setAttribute("class","video-js vjs-default-skin")
        video.id = 'myvideo'
        target.parentNode.insertBefore(video, target)

        console.log url

        require ["js/libs/video"], (videojs) ->
            videojs("myvideo").ready(->
                myPlayer = this
                myPlayer.src(url)
                myPlayer.play()
                document.myPlayer = myPlayer
            )
        window.ivw()


    stopvideo: ->
        if (video = document.getElementById('myvideo'))
            try
                document.myPlayer.pause()
                video.remove()
                document.myPlayer.dispose()
                document.lastimage.className = "video"        
                document.lastimage = false        
            catch e

            

    openSlider: (index) ->
        @slider.className = ''
        if @isMobile then document.body.className = 'broen'

        if not @hasBeenOpened
            el = $('broen-gallery-swipe-carousel')
            require ["dr-widget-swipe-carousel"], (Swipe) =>
                @swipe = new Swipe el

                @swipe.slide index
                window.fireEvent 'dr-dom-inserted', [$$('span.image-wrap')]
                window.fireEvent 'dr-dom-inserted', [$$('div.dr-widget-video-player')]
        else
            # if document.getElementById("myvideo")
            #     document.getElementById("myvideo").className = ""
            @swipe.slide index

        @hasBeenOpened = true
        this.stopvideo()
        window.ivw()

    closeSlider: ->
        @slider.className = 'hide'
        if @isMobile then document.body.className = ''
        this.stopvideo()
        window.ivw()


    html: ->
        html = '<div>'
        for media in @media
            if media.type is 'image'
                html += """
                        #{DR.BroenGallery.getImg(media.thumbnail, 79, 79)}
                        """
            else if media.type is 'video'
                html += """
                        <span class="image-wrap dr-icon-play-boxed-small">
                            #{DR.BroenGallery.getImg(media.thumbnail, 79, 79)}
                        </span>
                        """

        return html + """</div><div id="broen-gallery-person-media-slider" class="hide"></div>"""


    getSliderHTML: ->
        html = """<div class="section boxed">
                     <h3>#{@name} - Fotos/Videos<a href="#" class="dr-link-readmore dr-icon-close">Schließen</a></h3>
                     <div id="broen-gallery-swipe-carousel" class="dr-widget-swipe-carousel" data-min-item-span="8">"""

        i1=0        
        for media,i in @media
            i1++            
            if media.type is 'image'
                html += """
                        <div class="carousel-item">
                            <div class="item" >
                                <span role="presentation" aria-hidden="true" class="image-wrap ratio-16-9">
                                    <img src="#{media.image}" alt="" width="0" height="0" role="presentation" aria-hidden="true" />                                    
                                </span>
                            </div>
                        </div>
                        """
            else if media.type is 'video'
                html += """
                        <div class="carousel-item">
                            <div class="item" >
                                <span role="presentation" aria-hidden="true" class="image-wrap ratio-16-9">
                                        <div class="icon-film play-overlay" >
                                        </div>
                                        <div class="play-base" >
                                            <img src="#{media.image}" id="video#{i}" class="video" alt="" width="0" height="0" role="presentation" aria-hidden="true" video-url="#{media.videouri}" /> 
                                        </div>
                                </span>
                            </div>
                        </div>
                        """

        return html + "</div></div>"

#todo video playbutton overlay+function to laod player        
class MobileGraph

    constructor: (app, container) ->
        @app = app
        @container = container

    show: (person) ->
        @person = person
        @container.innerHTML = this.html person

    html: (person) ->
        faceImg = DR.BroenGallery.getFaceImg person.slug

        html = """
               <div class="section">
                   <h2>Relationer</h2>
                   <ul>
               """

        for relation in person.relations
            html += this.relationHtml relation

        html += "</ul></div>"
        return html

    relationHtml: (relation) ->
        faceImg = @app.data[relation.slug].image

        """
        <li>
            #{DR.BroenGallery.getFaceImg(faceImg, 50)}
            <a href="##{relation.slug}" class="name">#{relation.name}</a>
            <p>#{relation.text}</p>
            <a href="##{relation.slug}" title="Mehr über #{relation.name}" class="dr-icon-link-small dr-link-readmore">Mehr</a>
        </li>
        """
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
class PersonInfoView

    constructor: (app, container) ->
        @app = app
        @container = container
        this.addEvents()

    addEvents: ->
        bindEvent @container, 'click', (e) =>
            target = if e.target then e.target else window.event.srcElement
            
            if target.className is 'vote-btn'
                if e.preventDefault then e.preventDefault() else e.returnValue = false
                @app.vote @person.slug

    show: (person) ->        
        @person = person

        if person.freischaltepisode <= @app.episode
            if person.durchstreichen <= @app.episode
                person.ude = true
                @app.data[person.slug].ude = true
            else
                @app.data[person.slug].ude = false

        @container.innerHTML = this.html person
        p = document.getElementById 'broen-gallery-person-text'
        window.fireEvent 'dr-dom-inserted', [$$('p')]


        #unerlaubtes filtern
        len = @person.media.length
        while len--
            media = person.media[len]
            #console.log "elementfreigabe: #{media.freischaltepisode}"
            if (media.freischaltepisode > @app.episode)
                @person.media.splice(len,1)                
            


        if person.media and person.media.length > 0
            inner = document.getElementById 'broen-gallery-person-info-inner'
            inner.appendChild new MediaView person.name, person.media, @app.isMobile, @app

    html: (person) ->
        ude = (if person.ude then "ude" else "") 
        html =  """
                <div id="broen-gallery-person-info-inner">
                    <div class="#{ude}" >#{DR.BroenGallery.getFaceImg(person.image, 90)}</div>
                    <h2>#{person.name} #{person.realname}</h2>
                    <p id="broen-gallery-person-text" data-maxlines="5" data-readmore="true" >#{person.longText}</p>
                """

        if DR.BroenGallery.config.votingEnabled
            html += """<div class="vote">Glauben Sie, dass #{person.name} hinter den Anschlägen steckt?<br /><button class="vote-btn">ja!</button></div>"""

        return html + "</div>"
class PopoverView
    open: false

    constructor: (el, app) ->
        @el = el
        @app = app
        this.addEvents()
        return this

    addEvents: ->
        bindEvent @el, 'click', (e) =>
            target = if e.target then e.target else window.event.srcElement
            
            if e.target.className is 'dr-link-readmore dr-icon-close'
                if e.preventDefault then e.preventDefault() else e.returnValue = false
                this.hide()
            else if e.target.className is 'vote-btn'
                if e.preventDefault then e.preventDefault() else e.returnValue = false
                @app.vote @person.slug

    updatePos: (x, y) ->
        @el.style.left = x + 'px'
        @el.style.top = y + 'px'

    center: ->
        @el.style.left = '50%'
        @el.style["margin-left"] = '-100px'
        @el.style.top = '50%'

    show: (person) ->
        @person = person
        @el.innerHTML = this.html @person
        @el.className = ''

        @open = true

    hide: ->
        @el.className = 'hide'
        @open = false

    html: (person) ->
        person.text = @app.data[person.slug].text
        person.name = @app.data[person.slug].name
        html = """
               <h3><a href="#" class="dr-link-readmore dr-icon-close"></a><a href="##{person.slug}">#{person.name}</a></h3>
               <p>#{person.text}</p>
               <a class="dr-icon-link-small dr-link-readmore" href="##{person.slug}">Mehr</a>
               """

        if DR.BroenGallery.config.votingEnabled
            html += """   
                    <div class="vote">
                        <p>Steckt #{person.name}<br /> hinter den Anschlägen?</p>
                        <button class="vote-btn">ja!</button>
                    </div>
                    """

        return html
class SimplePopoverView extends PopoverView
    html: (person) ->
        """
        <h3><a href="##{person.slug}">#{person.name}</a></h3>
        <p>#{person.text}</p>
        """