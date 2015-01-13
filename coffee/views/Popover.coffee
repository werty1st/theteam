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