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
