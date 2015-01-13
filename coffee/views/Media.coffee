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