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