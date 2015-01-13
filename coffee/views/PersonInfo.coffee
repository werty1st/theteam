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
                    <div class="#{ude}" >#{DR.BroenGallery.getFaceImg(person.image, 50)}</div>
                    <h2>#{person.name}</h2>
                    <p id="broen-gallery-person-text" data-maxlines="5" data-readmore="true" >#{person.longText}</p>
                """

        if DR.BroenGallery.config.votingEnabled
            html += """<div class="vote">Glauben Sie, dass #{person.name} hinter den Anschlägen steckt?<br /><button class="vote-btn">ja!</button></div>"""

        return html + "</div>"