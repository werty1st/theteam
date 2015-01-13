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