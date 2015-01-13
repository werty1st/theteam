/*jshint browser:true, mootools:true, devel:true */
/*global require */


/** Events:
*
* slideChanged - called when slide changes. Arguments: activeSlide, index, carouselInstance
* ajaxLoaded - called when new slides have been loaded with ajax. Arguments: carouselInstance
*/

define("dr-widget-swipe-carousel", ["swipejs"], function (Swipe) {

	'use strict';

	var methods = {

		setup: function () {

			var slides = $(this.element).getElements('.carousel-item');
			var width = this.container.getBoundingClientRect().width || this.container.offsetWidth;

			var count;
			this.limit = 5; // Number of pages loaded for every request

			if (this.minItemSpan) {
				// use data-min-item-span
				count = Math.floor(width / (80 * this.minItemSpan)) || 1;
			}
			else {
				// use data-breaks
				for (var idx = this.breakConfig.length - 1; idx >= 0; idx--) {
					if (width >= this.breakConfig[idx]) {
						count = idx + 2;
						break;
					}
				}
			}

			if (count && count != this.wrapped) {
				this.wrap(slides, count);
			} else if (!count && this.wrapped) {
				this.unwrap();
			}

			if (!count || (slides.length / count) < 2) {
				this.element.setStyle('width', width);
			}

			// call base
			Swipe.prototype.setup.apply(this, arguments);

			this.onSlideChanged();
		},

		wrap: function (slides, count) {

			if (this.wrapped && this.wrapped !== count) {
				this.unwrap();
			}

			for (var idx = 0; idx < slides.length; idx += count) {
				var group = $$(slides.slice(idx, idx + count));
				group.setStyles({
					position: 'static',
					width: (parseInt(this.container.getStyle('width'), 10) / count) + 'px',
					left: 0,
					webkitTransform: '',
					msTransform: '',
					MozTransform: '',
					OTransform: ''
				});

				var wrapper = new Element('div');
				wrapper.inject(group[0], 'before');
				wrapper.adopt(group);
			}

			this.index = Math.floor(this.index / count);
			this.wrapped = count;
		},

		unwrap: function () {

			var wrappers = $(this.element).getChildren();

			for (var idx = 0; idx < wrappers.length; idx++) {
				var wrapper = wrappers[idx];

				wrapper.getChildren()
                    .setStyles({ position: 'relative' })
                    .inject(wrapper, 'before');

				wrapper.destroy();
			}
			this.index = this.index * this.wrapped;
			this.wrapped = false;
		},

		stopplayback: function(){
			try{
	        	document.stopvideo();				
			} catch (e)
			{}
		},

		createButtons: function () {

			this.pagingPrev = new Element('a', {
				'class': 'carousel-button dr-icon-arrow-left-notext',
				//'class': 'carousel-button icon-arrow-left',
				events: { click: function (e) { if(!this.loading) { this.stopplayback(); this.prev(); this.toggleButtons(); } } .bind(this) }
			}).inject(this.container, 'after');

			this.pagingNext = new Element('a', {
				'class': 'carousel-button dr-icon-arrow-right-notext',
				//'class': 'carousel-button icon-arrow-right',
				events: { click: function (e) { if(!this.loading) { this.stopplayback(); this.next(); } this.toggleButtons(); } .bind(this) }
			}).inject(this.container, 'after');
		},

		toggleButtons: function () {
			if(this.index >= this.length - 2 && this.ajaxAction && this.ajaxTotal >= this.length && !this.endReached) {
				this.loading = true; // Buttons are disabled while new data is being loaded
			}
		},

		createOverlay: function () {
			this.loadingOverlay = new Element('div', {'class' : 'loading-async-content', 'html' : '<p>Henter indhold</p>' });
			$(this.element.getParent()).adopt(this.loadingOverlay);
		},

		onSlideChanged: function () {

			// trigger lazyloader on new slide
			var slide = $(this.element).getElements('.carousel-item')[this.index];
			window.fireEvent('dr-css-changed', [slide]);

			// update buttons
			if (this.index === this.length - 1) { this.pagingNext.addClass('disabled'); } else { this.pagingNext.removeClass('disabled'); }
			if (this.index === 0) { this.pagingPrev.addClass('disabled'); } else { this.pagingPrev.removeClass('disabled'); }

			if (this.index >= this.length - 2 && this.ajaxAction && this.ajaxTotal >= this.length && !this.endReached) {
				setTimeout(function(){ this.loadMore(); }.bind(this), this.speed + 100); // Add a teaspoon of wait just for good measure (and smooth animation)
			}

			this.fireEvent('slideChanged', [slide, this.index, this]);
		},

		loadMore: function () {

			var size = this.wrapped || 1;
			var url = this.ajaxAction.substitute({ limit: size * this.limit, offset: this.length * size });

			new Request.HTML({
				url: url,
				method: 'get',
				filter: '.carousel-item',
				onRequest: function () { 
					this.loading = true;
					this.loadingOverlay.setStyle('display', 'block');
					//this.loadingOverlay.focus();
					this.pagingNext.addClass('loading');
				}.bind(this),
				onError: function() {
					this.loadingOverlay.setStyle('display', 'none');
					this.pagingNext.removeClass('loading');
					this.loading = false;
				},
				//onComplete: function () { this.loading = false; } .bind(this),
				onSuccess: function (responseTree, responseElements, responseHTML) {

					this.pagingNext.removeClass('loading');

					this.loadingOverlay.setStyle('display', 'none');
					//$(this.element).focus();
					this.loading = false;

					if (!responseElements.length) {
						this.endReached = true;
						return;
					}

					if (this.wrapped) { this.unwrap(); }
					$(this.element).adopt(responseElements);
					this.setup();

					window.fireEvent('dr-dom-inserted', [responseElements], 10);
					this.fireEvent('ajaxLoaded', [this]);

				} .bind(this)
			}).send();
		},

		toElement: function () {
			return this.element;
		}
	};
	Object.append(methods, Events.prototype);


    var Pager = new Class({
        initialize: function (swipe) {
            this.swipe = swipe;
            this.element = new Element('span', {
                'class': 'swipe-pager',
                'aria-hidden': true,
                'role': 'presentation'
            });

            this.swipe.addEvent('slideChanged', this.update.bind(this));
            this.update();
        },

        getLength: function () {
            if (this.swipe.ajaxTotal) {
                return Math.ceil(this.swipe.ajaxTotal / (this.swipe.wrapped || 1));
            }
            return this.swipe.length;
        },

        update: function () {
            this.element.set('html', '<span>' + (this.swipe.index + 1) + '</span> / <span>' + this.getLength() + '</span>');
        },

        toElement: function () {
            return this.element;
        }
        
    });


	var DRSwipe = function (el, options) {

		if (!options) { options = {}; }

		// inject wrapper divs
		var swipe_el = new Element('div', { 'class': 'swipe' }).adopt(
            new Element('div', { 'class': 'swipe-wrap' }).adopt(
                el.getChildren()
            )
        );
		el.setStyle('display', 'block').adopt(swipe_el);

		// create SwipeJS and extend it
		var swipe = new Swipe(swipe_el, options);
		Object.append(swipe, methods);

		// hook into callback
		var _callback = swipe.callback;
		swipe.callback = function () {
			this.onSlideChanged();
			_callback.apply(this, arguments);
		};

		// handle options
		swipe.minItemSpan = options.minItemSpan || (el.get('data-min-item-span') || null);
		swipe.breakConfig = options.breaks || (el.get('data-breaks') || '').split(/\s*,\s*/g);
		swipe.ajaxTotal = options.ajaxTotal || Number(el.get('data-total'));
		swipe.ajaxAction = options.ajaxAction || el.get('data-action');
		swipe.enablePager = options.enablePager || el.get('data-enable-pager') !== null;

		swipe.cont = options.cont || false; // default SwipeJS to not continous

		// init
		swipe.createButtons();
		swipe.createOverlay();
		swipe.setup();

        if (swipe.enablePager) {
            el.grab(new Pager(swipe), 'after');
        }

        $(swipe).store('dr:swipe', swipe);

		return swipe;
	};

	return DRSwipe;
});


