var DR = DR || {};
DR.BroenGallery = {};

DR.BroenGallery.config = {
    jsonDataUrl: '/diebruecke/_design/b2/_list/getDatajsonPersonwithMedia/personwithmedia/',
    jsonDataTestUrl: 'http://socialbld01.net.dr.dk/broen/test.json',

    votingEnabled: true,
    voteEndpoint: 'Quickpoll/front/vote',

    faces: {
        url: 'img/faces/',
        size: 80
    }
};

var host = document.location.host;
if(host == 'www.dr.dk') {
    DR.BroenGallery.config.jsonDataUrl = '/tjenester/broen2/data.json';
    DR.BroenGallery.config.faces.url   = '/tjenester/broen2/ansigter/';
};DR.BroenGallery.App = (function() {
  App.prototype.isIE = false;

  App.prototype.isMobile = false;

  App.prototype.data = null;

  function App(containerId, episode) {
    if (episode == null) {
      episode = 0;
    }
    this.fetchData();
    this.featureDetect();
    this.container = document.getElementById(containerId);
    this.container.innerHTML = this.html();
    this.homeLink = document.getElementById('broen-home-link');
    this.homeView = new HomeView(this);
    this.personView = new PersonView(this);
    this.episode = episode;
    this.initVoting();
    return this;
  }

  App.prototype.start = function() {
    return this.router = new MooRouter(this);
  };

  App.prototype.showHome = function() {
    if (this.homeLink.className.indexOf('hide') === -1) {
      this.homeLink.className += ' hide';
    }
    this.personView.hide();
    return this.homeView.show();
  };

  App.prototype.showPerson = function(slug) {
    this.homeView.hide();
    this.homeLink.className = this.homeLink.className.replace(' hide', '');
    return this.personView.show(this.data[slug]);
  };

  App.prototype.fetchData = function() {
    var dataUrl,
      _this = this;
    dataUrl = DR.BroenGallery.config.jsonDataUrl;
    return d3.json(dataUrl, function(error, data) {
      _this.data = data;
      return _this.start();
    });
  };

  App.prototype.vote = function(slug) {
    return this.voteMachine.vote(slug);
  };

  App.prototype.featureDetect = function() {
    var features;
    features = document.html.className;
    if (features.indexOf('mobile') !== -1) {
      this.isMobile = true;
    }
    if (features.indexOf('ie7') !== -1) {
      this.isIE = true;
    }
    if (features.indexOf('ie8') !== -1) {
      return this.isIE = true;
    }
  };

  App.prototype.initVoting = function() {
    return this.voteMachine = new DR.BroenGallery.VoteMachine(this);
  };

  App.prototype.html = function() {
    return "<div id=\"broen-gallery\" class=\"section boxed container-green-light\">\n    <h2><a href=\"#home\">Verdächtige</a><a id=\"broen-home-link\" class=\"dr-icon-link-small dr-link-readmore hide\" href=\"#home\">Zur Übersicht</a></h2>\n\n    <div id=\"broen-gallery-home\" class=\"hide\">\n        <p class=\"intro-text\">Die wichtigsten Personen und ihre Beziehungen zueinander</p>\n        <div id=\"broen-gallery-home-persons\"></div>\n        <div id=\"broen-gallery-home-popover\" class=\"hide container-green\"></div>\n    </div>\n    \n    <div id=\"broen-gallery-person\">\n        <div id=\"broen-gallery-person-info\"></div>\n        <div id=\"broen-gallery-graph\">\n            <div id=\"broen-gallery-graph-popover\" class=\"hide container-green\"></div>\n        </div>\n    </div>\n</div>";
  };

  return App;

})();

var MooRouter;

MooRouter = (function() {
  function MooRouter(app) {
    var router,
      _this = this;
    this.app = app;
    router = Router.implement({
      routes: {
        '': 'homeRoute',
        '#:slug': 'personRoute'
      },
      homeRoute: function() {
        _this.app.showHome();
        return window.ivw();
      },
      personRoute: function() {
        this.showPerson(this.param.slug);
        return window.ivw();
      },
      showPerson: function(slug) {
        var offset;
        if (slug === 'home') {
          return _this.app.showHome();
        }
        if (_this.app.isMobile) {
          offset = _this.app.container.offsetTop - 10;
          window.scrollTo(0, offset);
        }
        if (_this.app.data[slug]) {
          return _this.app.showPerson(slug);
        } else {
          return alert('Mangler data for ' + slug + '.');
        }
      }
    });
    return new router;
  }

  return MooRouter;

})();

DR.BroenGallery.VoteMachine = (function() {
  VoteMachine.prototype.hasVotedThisDay = false;

  function VoteMachine(app) {
    var _this = this;
    this.app = app;
    require(["js/libs/more"], function() {
      _this.cookie = new Hash.Cookie('benzErGud2', {
        duration: 60
      });
      _this.currentDay = Date.now();
      _this.hasVotedThisDay = _this.hasVotedThisDay();
      return _this;
    });
  }

  VoteMachine.prototype.hasVotedThisDay = function() {
    var lastVotedDay, timeover;
    lastVotedDay = this.cookie.get('day');
    timeover = lastVotedDay + 1000 * 3600 * 8;
    if (!lastVotedDay || (timeover < this.currentDay)) {
      return false;
    } else {
      return true;
    }
  };

  VoteMachine.prototype.vote = function(slug) {
    var myvote, voteId,
      _this = this;
    if (this.app.data[slug].ude) {
      alert('Für diese Person kann nicht mehr abgestimmt werden.');
      return;
    }
    if (this.hasVotedThisDay) {
      alert('Sie haben heute bereits einmal abgestimmt.');
      return;
    }
    voteId = this.app.data[slug].voteId + 1763;
    myvote = new Request({
      url: "http://vote.zdf.de/gate/",
      method: "POST",
      data: {
        aid: voteId,
        qid: 591,
        auth4: global.auth4,
        auth6: global.auth
      },
      onSuccess: function(json) {
        _this.cookie.set('day', _this.currentDay);
        _this.hasVotedThisDay = true;
        alert('Vielen Dank für Ihre Stimme. Sie können Morgen wieder abstimmen.');
      }
    });
    myvote.send();
  };

  return VoteMachine;

})();

window.log = function(x, y) {
  if (y == null) {
    y = '';
  }
  return console.log(x, y);
};

window.bindEvent = function(el, eventName, eventHandler) {
  if (el.addEventListener) {
    return el.addEventListener(eventName, eventHandler, false);
  } else if (el.attachEvent) {
    return el.attachEvent('on' + eventName, eventHandler);
  }
};

DR.BroenGallery.getImg = function(url, w, h) {
  return "<img class=\"floatleft\" src=\"" + (DR.BroenGallery.getResizedImg(url, w, h)) + "\" width=\"" + w + "\" height=\"" + h + "\" />";
};

DR.BroenGallery.getResizedImg = function(url, w, h) {
  return "" + url;
  /*
  host = document.location.host
  
  if host is 'www.dr.dk'
      "http://www.dr.dk/imagescaler/?file=#{url}&w=#{w}&h=#{h}&scaleAfter=crop"
  else
      "imagescaler/?file=#{url}&w=#{w}&h=#{h}&scaleAfter=crop&server=#{host}"
  */

};

DR.BroenGallery.getFaceImg = function(image, size) {
  var url;
  url = DR.BroenGallery.getFaceImgUrl(image);
  if (!size) {
    size = DR.BroenGallery.config.faces.size;
  }
  return DR.BroenGallery.getImg(url, size, size);
};

DR.BroenGallery.getFaceImgUrl = function(image) {
  return DR.BroenGallery.config.faces.url + image;
};

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
};

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  var i, len;
  i = 0;
  len = this.length;
  while (i < len) {
    if (this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
    i++;
  }
};

var D3Graph;

D3Graph = (function() {
  D3Graph.prototype.hasBeenInit = false;

  D3Graph.prototype.isD3 = true;

  function D3Graph(app, container) {
    this.app = app;
    this.container = container;
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    this.popover = new PopoverView(document.getElementById('broen-gallery-graph-popover'), this.app);
    return this;
  }

  D3Graph.prototype.init = function() {
    if (this.hasBeenInit) {
      d3.select('svg').remove();
    }
    this.initD3();
    this.hasBeenInit = true;
    this.selectedPerson = null;
    return this.popover.hide();
  };

  D3Graph.prototype.initD3 = function() {
    this.svg = d3.select(this.container).append('svg:svg');
    this.svg.attr('width', this.width).attr('height', this.height).append("defs").append("filter").attr("id", "saturate").append("feColorMatrix").attr("type", "matrix").attr("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0");
    this.svg;
    this.force = d3.layout.force().linkDistance(40).distance(130).charge(-1000).size([this.width, this.height]);
    this.nodes = this.force.nodes();
    return this.links = this.force.links();
  };

  D3Graph.prototype.show = function(person) {
    var centerNode, i, node, nodes, r, _i, _j, _len, _len1, _ref;
    this.init();
    _ref = person.relations;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      r = _ref[i];
      r.image = this.app.data[r.slug].image;
      if (this.app.data[r.slug].durchstreichen <= this.app.episode) {
        r.ude = true;
      }
      this.links.push({
        'source': i + 1,
        'target': 0
      });
    }
    centerNode = {
      'name': person.name,
      'slug': person.slug,
      'image': person.image,
      'ude': person.ude,
      'isCenter': true
    };
    nodes = [centerNode].concat(person.relations);
    for (_j = 0, _len1 = nodes.length; _j < _len1; _j++) {
      node = nodes[_j];
      this.nodes.push(node);
    }
    return this.update();
  };

  D3Graph.prototype.update = function() {
    var link, node, nodeEnter,
      _this = this;
    link = this.svg.selectAll('line.link').data(this.links);
    link.enter().insert('line').attr('class', 'link');
    link.exit().remove();
    node = this.svg.selectAll('g.node').data(this.nodes, function(d) {
      return d.slug;
    });
    nodeEnter = node.enter().append('g').attr('class', function(d) {
      if (d.isCenter) {
        return 'centerNode';
      } else {
        return 'node';
      }
    }).call(this.force.drag);
    nodeEnter.on('click', function(person) {
      if (person.index !== 0) {
        if (!_this.popover.open || person.slug !== _this.popover.person.slug) {
          _this.selectedPerson = person;
          _this.popover.updatePos(person.x + 30, person.y + 30);
          return _this.popover.show(person);
        } else {
          return _this.popover.hide();
        }
      }
    });
    nodeEnter.append('image').attr('xlink:href', function(d) {
      var size;
      size = 60;
      if (d.isCenter) {
        size = 90;
      }
      return DR.BroenGallery.getResizedImg(DR.BroenGallery.getFaceImgUrl(d.image), size, size);
    }).attr('x', function(d) {
      if (d.isCenter) {
        return -45;
      } else {
        return -30;
      }
    }).attr('y', function(d) {
      if (d.isCenter) {
        return -45;
      } else {
        return -30;
      }
    }).attr('width', function(d) {
      if (d.isCenter) {
        return 90;
      } else {
        return 60;
      }
    }).attr('height', function(d) {
      if (d.isCenter) {
        return 90;
      } else {
        return 60;
      }
    }).attr('filter', function(d) {
      if (d.ude) {
        return "url(#saturate)";
      } else {
        return "";
      }
    });
    node.append('text').attr('x', -20).attr('y', function(d) {
      if (d.isCenter) {
        return 5;
      } else {
        return 0;
      }
    }).attr('dy', '3.35em').text(function(d) {
      return d.name;
    });
    node.exit().remove();
    this.force.on('tick', function() {
      if (_this.selectedPerson) {
        _this.popover.updatePos(_this.selectedPerson.x + 20, _this.selectedPerson.y + 20);
      }
      link.attr('x1', function(d) {
        return d.source.x;
      }).attr('y1', function(d) {
        return d.source.y;
      }).attr('x2', function(d) {
        return d.target.x;
      }).attr('y2', function(d) {
        return d.target.y;
      });
      return node.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    });
    return this.force.start();
  };

  return D3Graph;

})();

var HomeView;

HomeView = (function() {
  HomeView.prototype.hasBeenShow = false;

  function HomeView(app) {
    this.app = app;
    this.el = document.getElementById('broen-gallery-home');
    this.personsEl = document.getElementById('broen-gallery-home-persons');
    this.popover = new SimplePopoverView(document.getElementById('broen-gallery-home-popover'));
    if (!this.app.isMobile) {
      this.addEvents();
    }
    return this;
  }

  HomeView.prototype.addEvents = function() {
    var _this = this;
    return bindEvent(this.el, 'mouseover', function(e) {
      var parent, slug, target;
      target = e.target ? e.target : window.event.srcElement;
      if (target.tagName.toLowerCase() === 'img') {
        parent = target.parentNode;
        slug = parent.getAttribute('data-person-slug');
        if (!_this.popover.open || slug !== _this.popover.person.slug) {
          if (_this.app.isMobile) {
            _this.popover.updatePos(parent.offsetLeft + 40, parent.offsetTop + 40);
          } else {
            _this.popover.updatePos(parent.offsetLeft + 30, parent.offsetTop + 55);
          }
          return _this.popover.show(_this.app.data[slug]);
        }
      } else if (target === _this.personsEl) {
        return _this.popover.hide();
      }
    });
  };

  HomeView.prototype.render = function() {
    var person, slug, _ref;
    _ref = this.app.data;
    for (slug in _ref) {
      person = _ref[slug];
      if (person.freischaltepisode <= this.app.episode) {
        if (person.durchstreichen <= this.app.episode) {
          person.ude = true;
          this.app.data[slug].ude = true;
        } else {
          this.app.data[slug].ude = false;
        }
        this.personsEl.innerHTML += this.personHTML(slug, person);
      }
    }
    return this.hasBeenShow = true;
  };

  HomeView.prototype.show = function() {
    if (!this.hasBeenShow) {
      this.render();
    }
    return this.el.className = '';
  };

  HomeView.prototype.hide = function() {
    this.el.className = 'hide';
    return this.popover.hide();
  };

  HomeView.prototype.personHTML = function(slug, person) {
    var ude;
    ude = (person.ude ? "ude" : "");
    return "<a href=\"#" + slug + "\" data-person-slug=\"" + slug + "\" class=\"person " + ude + "\">\n    " + (DR.BroenGallery.getFaceImg(person.image)) + "\n</a>";
  };

  return HomeView;

})();

var MediaView;

MediaView = (function() {
  MediaView.prototype.hasBeenOpened = false;

  function MediaView(name, media, isMobile, app) {
    this.name = name;
    this.media = media;
    this.isMobile = isMobile;
    this.app = app;
    this.player;
    this.el = document.createElement('div');
    this.el.setAttribute('id', 'broen-gallery-person-media');
    this.el.innerHTML = this.html();
    this.newh = this.getDocHeight();
    parent.postMessage(this.newh, 'http://www.zdf.de');
    this.addEvents();
    return this.el;
  }

  MediaView.prototype.getDocHeight = function() {
    var D;
    D = document;
    return Math.max(D.body.scrollHeight, D.documentElement.scrollHeight, D.body.offsetHeight, D.documentElement.offsetHeight, D.body.clientHeight, D.documentElement.clientHeight);
  };

  MediaView.prototype.addEvents = function() {
    var _this = this;
    return bindEvent(this.el, 'click', function(e) {
      var index, target;
      target = e.target ? e.target : window.event.srcElement;
      if ((target.tagName.toLowerCase()) === 'img' && (target.className !== "video")) {
        if (!_this.hasBeenOpened) {
          _this.initSlider();
        }
        target = $(target);
        if (target.getParent().hasClass('image-wrap')) {
          target = target.getParent();
        }
        index = target.getParent().getChildren().indexOf(target);
        _this.openSlider(index);
        if (e.preventDefault) {
          return e.preventDefault();
        } else {
          return e.returnValue = false;
        }
      } else if (target.className === 'dr-link-readmore dr-icon-close') {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
        return _this.closeSlider();
      } else if ((target.tagName.toLowerCase()) === 'img' && (target.className === "video")) {
        document.lastimage = target;
        target.className = "hide";
        return _this.playvideo(target);
      } else {
        return false;
      }
    });
  };

  MediaView.prototype.initSlider = function() {
    this.slider = document.getElementById('broen-gallery-person-media-slider');
    return this.slider.innerHTML = this.getSliderHTML();
  };

  MediaView.prototype.playvideo = function(target) {
    var url, video;
    document.stopvideo = this.stopvideo;
    console.log("play video");
    url = target.getAttribute("video-url");
    video = document.createElement('video');
    video.setAttribute("controls", "");
    video.setAttribute("preload", "auto");
    video.setAttribute("width", 720);
    video.setAttribute("height", 416);
    video.setAttribute("class", "video-js vjs-default-skin");
    video.id = 'myvideo';
    target.parentNode.insertBefore(video, target);
    console.log(url);
    require(["js/libs/video"], function(videojs) {
      return videojs("myvideo").ready(function() {
        var myPlayer;
        myPlayer = this;
        myPlayer.src(url);
        myPlayer.play();
        return document.myPlayer = myPlayer;
      });
    });
    return window.ivw();
  };

  MediaView.prototype.stopvideo = function() {
    var e, video;
    if ((video = document.getElementById('myvideo'))) {
      try {
        document.myPlayer.pause();
        video.remove();
        document.myPlayer.dispose();
        document.lastimage.className = "video";
        return document.lastimage = false;
      } catch (_error) {
        e = _error;
      }
    }
  };

  MediaView.prototype.openSlider = function(index) {
    var el,
      _this = this;
    this.slider.className = '';
    if (this.isMobile) {
      document.body.className = 'broen';
    }
    if (!this.hasBeenOpened) {
      el = $('broen-gallery-swipe-carousel');
      require(["dr-widget-swipe-carousel"], function(Swipe) {
        _this.swipe = new Swipe(el);
        _this.swipe.slide(index);
        window.fireEvent('dr-dom-inserted', [$$('span.image-wrap')]);
        return window.fireEvent('dr-dom-inserted', [$$('div.dr-widget-video-player')]);
      });
    } else {
      this.swipe.slide(index);
    }
    this.hasBeenOpened = true;
    this.stopvideo();
    return window.ivw();
  };

  MediaView.prototype.closeSlider = function() {
    this.slider.className = 'hide';
    if (this.isMobile) {
      document.body.className = '';
    }
    this.stopvideo();
    return window.ivw();
  };

  MediaView.prototype.html = function() {
    var html, media, _i, _len, _ref;
    html = '<div>';
    _ref = this.media;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      media = _ref[_i];
      if (media.type === 'image') {
        html += "" + (DR.BroenGallery.getImg(media.thumbnail, 79, 79));
      } else if (media.type === 'video') {
        html += "<span class=\"image-wrap dr-icon-play-boxed-small\">\n    " + (DR.BroenGallery.getImg(media.thumbnail, 79, 79)) + "\n</span>";
      }
    }
    return html + "</div><div id=\"broen-gallery-person-media-slider\" class=\"hide\"></div>";
  };

  MediaView.prototype.getSliderHTML = function() {
    var html, i, i1, media, _i, _len, _ref;
    html = "<div class=\"section boxed\">\n<h3>" + this.name + " - Fotos/Videos<a href=\"#\" class=\"dr-link-readmore dr-icon-close\">Schließen</a></h3>\n<div id=\"broen-gallery-swipe-carousel\" class=\"dr-widget-swipe-carousel\" data-min-item-span=\"8\">";
    i1 = 0;
    _ref = this.media;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      media = _ref[i];
      i1++;
      if (media.type === 'image') {
        html += "<div class=\"carousel-item\">\n    <div class=\"item\" >\n        <span role=\"presentation\" aria-hidden=\"true\" class=\"image-wrap ratio-16-9\">\n            <img src=\"" + media.image + "\" alt=\"\" width=\"0\" height=\"0\" role=\"presentation\" aria-hidden=\"true\" />                                    \n        </span>\n    </div>\n</div>";
      } else if (media.type === 'video') {
        html += "<div class=\"carousel-item\">\n    <div class=\"item\" >\n        <span role=\"presentation\" aria-hidden=\"true\" class=\"image-wrap ratio-16-9\">\n                <div class=\"icon-film play-overlay\" >\n                </div>\n                <div class=\"play-base\" >\n                    <img src=\"" + media.image + "\" id=\"video" + i + "\" class=\"video\" alt=\"\" width=\"0\" height=\"0\" role=\"presentation\" aria-hidden=\"true\" video-url=\"" + media.videouri + "\" /> \n                </div>\n        </span>\n    </div>\n</div>";
      }
    }
    return html + "</div></div>";
  };

  return MediaView;

})();

var MobileGraph;

MobileGraph = (function() {
  function MobileGraph(app, container) {
    this.app = app;
    this.container = container;
  }

  MobileGraph.prototype.show = function(person) {
    this.person = person;
    return this.container.innerHTML = this.html(person);
  };

  MobileGraph.prototype.html = function(person) {
    var faceImg, html, relation, _i, _len, _ref;
    faceImg = DR.BroenGallery.getFaceImg(person.slug);
    html = "<div class=\"section\">\n    <h2>Relationer</h2>\n    <ul>";
    _ref = person.relations;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      relation = _ref[_i];
      html += this.relationHtml(relation);
    }
    html += "</ul></div>";
    return html;
  };

  MobileGraph.prototype.relationHtml = function(relation) {
    var faceImg;
    faceImg = this.app.data[relation.slug].image;
    return "<li>\n    " + (DR.BroenGallery.getFaceImg(faceImg, 50)) + "\n    <a href=\"#" + relation.slug + "\" class=\"name\">" + relation.name + "</a>\n    <p>" + relation.text + "</p>\n    <a href=\"#" + relation.slug + "\" title=\"Mehr über " + relation.name + "\" class=\"dr-icon-link-small dr-link-readmore\">Mehr</a>\n</li>";
  };

  return MobileGraph;

})();

var PersonView;

PersonView = (function() {
  function PersonView(app) {
    this.app = app;
    this.el = document.getElementById('broen-gallery-person');
    this.info = new PersonInfoView(this.app, document.getElementById('broen-gallery-person-info'));
    if (this.app.isMobile || this.app.isIE) {
      this.graph = new MobileGraph(app, document.getElementById('broen-gallery-graph'));
      this.app.container.className += ' mobile';
    } else {
      this.graph = new D3Graph(app, this.el.getElementById('broen-gallery-graph'));
    }
    this.hide();
    return this;
  }

  PersonView.prototype.hide = function() {
    this.el.className = 'hide';
    if (this.graph.isD3) {
      return this.graph.popover.hide();
    }
  };

  PersonView.prototype.show = function(person) {
    this.el.className = '';
    this.info.show(person);
    return this.graph.show(person);
  };

  return PersonView;

})();

var PersonInfoView;

PersonInfoView = (function() {
  function PersonInfoView(app, container) {
    this.app = app;
    this.container = container;
    this.addEvents();
  }

  PersonInfoView.prototype.addEvents = function() {
    var _this = this;
    return bindEvent(this.container, 'click', function(e) {
      var target;
      target = e.target ? e.target : window.event.srcElement;
      if (target.className === 'vote-btn') {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
        return _this.app.vote(_this.person.slug);
      }
    });
  };

  PersonInfoView.prototype.show = function(person) {
    var inner, len, media, p;
    this.person = person;
    if (person.freischaltepisode <= this.app.episode) {
      if (person.durchstreichen <= this.app.episode) {
        person.ude = true;
        this.app.data[person.slug].ude = true;
      } else {
        this.app.data[person.slug].ude = false;
      }
    }
    this.container.innerHTML = this.html(person);
    p = document.getElementById('broen-gallery-person-text');
    window.fireEvent('dr-dom-inserted', [$$('p')]);
    len = this.person.media.length;
    while (len--) {
      media = person.media[len];
      if (media.freischaltepisode > this.app.episode) {
        this.person.media.splice(len, 1);
      }
    }
    if (person.media && person.media.length > 0) {
      inner = document.getElementById('broen-gallery-person-info-inner');
      return inner.appendChild(new MediaView(person.name, person.media, this.app.isMobile, this.app));
    }
  };

  PersonInfoView.prototype.html = function(person) {
    var html, ude;
    ude = (person.ude ? "ude" : "");
    html = "<div id=\"broen-gallery-person-info-inner\">\n    <div class=\"" + ude + "\" >" + (DR.BroenGallery.getFaceImg(person.image, 50)) + "</div>\n    <h2>" + person.name + "</h2>\n    <p id=\"broen-gallery-person-text\" data-maxlines=\"5\" data-readmore=\"true\" >" + person.longText + "</p>";
    if (DR.BroenGallery.config.votingEnabled) {
      html += "<div class=\"vote\">Glauben Sie, dass " + person.name + " hinter den Anschlägen steckt?<br /><button class=\"vote-btn\">ja!</button></div>";
    }
    return html + "</div>";
  };

  return PersonInfoView;

})();

var PopoverView;

PopoverView = (function() {
  PopoverView.prototype.open = false;

  function PopoverView(el, app) {
    this.el = el;
    this.app = app;
    this.addEvents();
    return this;
  }

  PopoverView.prototype.addEvents = function() {
    var _this = this;
    return bindEvent(this.el, 'click', function(e) {
      var target;
      target = e.target ? e.target : window.event.srcElement;
      if (e.target.className === 'dr-link-readmore dr-icon-close') {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
        return _this.hide();
      } else if (e.target.className === 'vote-btn') {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
        return _this.app.vote(_this.person.slug);
      }
    });
  };

  PopoverView.prototype.updatePos = function(x, y) {
    this.el.style.left = x + 'px';
    return this.el.style.top = y + 'px';
  };

  PopoverView.prototype.center = function() {
    this.el.style.left = '50%';
    this.el.style["margin-left"] = '-100px';
    return this.el.style.top = '50%';
  };

  PopoverView.prototype.show = function(person) {
    this.person = person;
    this.el.innerHTML = this.html(this.person);
    this.el.className = '';
    return this.open = true;
  };

  PopoverView.prototype.hide = function() {
    this.el.className = 'hide';
    return this.open = false;
  };

  PopoverView.prototype.html = function(person) {
    var html;
    person.text = this.app.data[person.slug].text;
    person.name = this.app.data[person.slug].name;
    html = "<h3><a href=\"#\" class=\"dr-link-readmore dr-icon-close\"></a><a href=\"#" + person.slug + "\">" + person.name + "</a></h3>\n<p>" + person.text + "</p>\n<a class=\"dr-icon-link-small dr-link-readmore\" href=\"#" + person.slug + "\">Mehr</a>";
    if (DR.BroenGallery.config.votingEnabled) {
      html += "   \n<div class=\"vote\">\n    <p>Steckt " + person.name + "<br /> hinter den Anschlägen?</p>\n    <button class=\"vote-btn\">ja!</button>\n</div>";
    }
    return html;
  };

  return PopoverView;

})();

var SimplePopoverView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SimplePopoverView = (function(_super) {
  __extends(SimplePopoverView, _super);

  function SimplePopoverView() {
    _ref = SimplePopoverView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SimplePopoverView.prototype.html = function(person) {
    return "<h3><a href=\"#" + person.slug + "\">" + person.name + "</a></h3>\n<p>" + person.text + "</p>";
  };

  return SimplePopoverView;

})(PopoverView);
