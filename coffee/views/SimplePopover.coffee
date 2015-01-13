class SimplePopoverView extends PopoverView
    html: (person) ->
        """
        <h3><a href="##{person.slug}">#{person.name}</a></h3>
        <p>#{person.text}</p>
        """