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
            .linkDistance(40)
            .distance(130)
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
                    @popover.updatePos person.x + 30, person.y + 30
                    @popover.show person
                else
                    @popover.hide()
 
        nodeEnter.append('image')
            .attr('xlink:href', (d) ->
                size = 60
                if d.isCenter then size = 90
                DR.BroenGallery.getResizedImg(DR.BroenGallery.getFaceImgUrl(d.image), size, size)
            )
            .attr('x', (d) ->
                if d.isCenter
                    -45
                else
                    -30
            )
            .attr('y', (d) ->
                if d.isCenter
                    -45
                else
                    -30
            )
            .attr('width', (d) ->
                if d.isCenter
                    90
                else
                    60
            )
            .attr('height', (d) ->
                if d.isCenter
                    90
                else
                    60
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