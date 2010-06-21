/*!
 * Droapps Custom Select
 * Creates a skinned version of a select tag form
 *
 * Version
 *   0.9
 *
 * Author:
 *   Diego Tres /// D3
 *
 * Contact:
 *   me@diegotres.com
 * 
 * Dual licensed under the MIT and GPL licenses.
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function( $ ) {

$.widget( "droapps-ui.customselect", {
	
	options: {
		value			: 0,
		text			: '',
		visible			: 'auto',
		position		: 'bottom',
		duration		: 200,
		easing			: 'linear',
		classname		: 'd3',
		selected_class	: 'selected',
		open			: null,
		close			: null
	},
	
	_create: function() {
		var self 	= this
			o		= this.options;
			
		this.element_width = this.element.outerWidth( true );
		o.disabled         = this.element.is( ":disabled" );
		this.items         = $( 'option' , this.element );
		this.selected_item = $( ':selected' , this.element );
		this.skinned       = $(
			'<dl class="droapps-ui-customselect ui-widget ui-widget-content ui-corner-all">' +
				'<dt class="droapps-ui-customselect-value droapps-ui-customselect-handler" />' +
				'<dd class="droapps-ui-customselect-holder-list"><ul class="droapps-ui-customselect-holder-items" /></dd>' +
			'</dl>'
		);
		this.element.addClass('droapps-ui-customselect-skinned');
		this.skinned.addClass(function(){
			return [ o.classname , o.position ].join(' ');
		});
		this.doc_body      = $( 'body' );
		this.handler       = $( '.droapps-ui-customselect-handler' , this.skinned );
		this.holder_list   = $( '.droapps-ui-customselect-holder-list' , this.skinned );
		this.holder_items  = $( '.droapps-ui-customselect-holder-items' , this.skinned );
		this._feed();
		this.items         = $( '.droapps-ui-customselect-item' , this.holder_items );
		this._bind();
		this._render();
		this._dimensions();
		this._position();
		
		// TODO: pull out $.Widget's handling for the disabled option into
		// $.Widget.prototype._setOptionDisabled so it's easy to proxy and can
		// be overridden by individual plugins
		this._setOption( 'disabled' , this.options.disabled );
	},
	
	_feed: function() {
		var self           = this,
			o              = this.options,
			val            = this.selected_item.val() || o.value,
			holder_items   = this.holder_items,
			selected_class = '';
		
		this.handler.text( this.selected_item.text() || o.text );
		this.items.each(function( i , item ){
			selected_class = val == $(item).val() ? o.selected_class : '';
			// console.log( $(item).val() );
			holder_items.append(
				'<li>' +
					'<a ' +
						'class="droapps-ui-customselect-item '+ selected_class +'"' +
						'rel="' + $(item).val() + '" ' +
						'href="#">' + 
							$(item).text() +
					'</a>' +
				'</li>'
			);
		});
	},
	
	_bind: function() {
		var self = this,
			o    = this.options;
			
		this.doc_body.bind( 'click.select' , $.proxy( this._close , this ) );
		
		this.skinned.bind( 'click.select' , function(e){ e.stopPropagation(); } );
		
		this.handler.bind( 'click.select' , function(e) {
			if( self.options.disabled ) { return; }
			self._toggle( e );
		});
		
		this.holder_items.bind( 'click.select' , function(e) {
			if( self.options.disabled ) { return; }
			self._toggle( e );
		});
		
		this.items.bind( 'click.select-setvalues' , function(e) {
			e.preventDefault();
			e.stopPropagation();
			if( self.options.disabled || $(e.currentTarget).hasClass( o.selected_class ) ) { return; }
			self.value({
				value: $(e.currentTarget).attr('rel'),
				label: $(e.currentTarget).text()
			});
		});
	},
	
	_render: function() {
		// we insert the skinned element before all operations
		// because we need to get some values that's
		// only possible when element is at dom.
		this.skinned
			.fadeTo(0,0)
			.insertAfter( this.element );
	},
	
	_position: function() {
		var self                 = this,
			o                    = this.options,
			skinned_height       = this.skinned.outerHeight( true ),
			pos                  = this.options.position,
			holder_list_css      = {};
			
		switch ( pos ) {
			case 'top':
			case 'up':
				holder_list_css = {
					top		: 'auto',
					bottom	: skinned_height || 0
				};
				break;
				
			case 'middle':
			case 'center':
				holder_list_css = {
					top		: skinned_height / 2,
					bottom	: 'auto'
				};
				break;
			
			case 'bottom':
			case 'down':
				holder_list_css = {
					top		: skinned_height,
					bottom	: 'auto'
				};
				break;
				
			default:
				holder_list_css = {
					top		: skinned_height,
					bottom	: 'auto'
				};
		}
		
		this.holder_list
			.css( holder_list_css )
			.hide();
	},
	
	_dimensions: function() {
		var self                 = this,
			o                    = this.options,
			skinned_before_width = this.skinned.outerWidth( true ),
			skinned_width        = skinned_before_width > this.element_width ? skinned_before_width : this.element_width,
			skinned_height       = this.skinned.outerHeight( true );
			
		this.skinned
			.width( skinned_width || 'auto' )
			.fadeTo(0,1);
			
		this.height_items = this.items
							.not('.' + o.selected_class)
							.first()
							.parent()
							.outerHeight( true );

		if ( typeof o.visible === 'number' && this.items.length > o.visible ) {

			this.holder_list_height = this.height_items * o.visible;

			this.holder_items
				.height( this.holder_list_height )
				.css({ overflowY: 'auto', overflowX: 'hidden' });

		} else {

			this.holder_list_height = this.height_items * this.items.length;

			this.holder_items
				.height( 'auto' )
				.css({ overflow: 'hidden' });

		}
	},
	
	_toggle: function( e ) {
		e.stopPropagation();
		e.preventDefault();
		
		if( this.holder_list.is(':visible') ) { 
			this._close(e);
		} else { 
			this._open(e);
		}
	},
	
	_open: function( e ) {
		var self    = this,
			o       = this.options,
			context = o.context ? o.context : this.skinned,
			top     = this.holder_list.css('top');
		
		if( this.holder_list.not(':visible') ) {
			
			if ( o.position == 'middle' || o.position == 'center' ) {
				top = - this.holder_list_height / 2 + this.skinned.outerHeight( true ) / 2;
			}
			
			this.holder_list
				.height(0)
				.css({ display: 'block' })
				.animate({
					top		: top,
					height	: this.holder_list_height
				},{
					duration: o.duration,
					easing	: o.easing,
					complete: function() {
						if( o.open ) { o.open.apply( context , arguments ); }
					}
				});
		}
	},
	
	_close: function( e ) {
		var self    = this,
			o       = this.options,
			context = o.context ? o.context : this.skinned,
			top     = this.holder_list.css('top');
			
		if( this.holder_list.is(':visible') ) {
			
			if ( o.position == 'middle' || o.position == 'center' ) {
				top = this.skinned.outerHeight( true )/2;
			}
			
			this.holder_list
				.css({ overflow: 'hidden'})
				.animate({
					top		: top,
					height	: 0
				},{
					duration: o.duration,
					easing	: o.easing,
					complete: function() {
						$(this).height(0).css({display: 'none'});
						if( o.close ) { o.close.apply( context , arguments ); }
					}
				});
		}
	},

	destroy: function() {
		this.element.removeClass('droapps-ui-customselect-skinned');
		this.skinned.remove();
		
		$.Widget.prototype.destroy.apply( this, arguments );
	},
	
	value: function( new_value ) {
		var self    = this,
			o       = this.options,
			val     = new_value.value || o.value,
			txt     = new_value.label || o.text;
		
		this.items
			.removeClass( o.selected_class )
			.filter('[rel='+ val +']')
			.addClass( o.selected_class );
		
		this.element.val( val );
		this.handler.text( txt );
		this._close();
		if ( new_value === undefined ) {
			return this._value();
		}
		this._setOption( 'value' , val );
		return this;
	},
	
	_setOption: function( key, value ) {
		var self    = this,
			o       = this.options;
			
		$.Widget.prototype._setOption.apply( this, arguments );
		
		switch ( key ) {
			case 'value':
				o.value = value;
				this.element.trigger( 'change' );
				this._trigger( 'change', null, value );
				break;
			case 'disabled':
				this.skinned[ value ? 'addClass' : 'removeClass']('disabled');
				break;
		}
	},

	_value: function() {
		var self    = this,
			o       = this.options;
			
		return o.value;
	},
	
	widget: function() {
		return this.skinned || this.element;
	}
	
});

})( jQuery );