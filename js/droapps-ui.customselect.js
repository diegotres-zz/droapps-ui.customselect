/*!
 * Droapps Custom Select
 * Creates a skinned version of a select tag form
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
		duration		: 300,
		classname		: '',
		selected_class	: 'selected',
		open			: null,
		close			: null
	},
	
	_create: function() {
		var self = this;
		this.element_width = this.element.outerWidth( true );
		this.element.addClass('droapps-ui-customselect-skinned');
		this.options.disabled = this.element.is( ":disabled" );
		this.items         = $( 'option' , this.element );
		this.selected_item = $( ':selected' , this.element );
		this.skinned       = $(
			'<dl class="droapps-ui-customselect ui-widget ui-widget-content ui-corner-all">' +
				'<dt class="droapps-ui-customselect-value droapps-ui-customselect-handler" />' +
				'<dd class="droapps-ui-customselect-holder-list"><ul class="droapps-ui-customselect-holder-items" /></dd>' +
			'</dl>'
		);
		this.skinned.addClass(function(){
			return [ self.options.classname , self.options.position ].join(' ');
		});
		this.doc_body      = $( 'body' );
		this.handler       = $( '.droapps-ui-customselect-handler' , this.skinned );
		this.holder_list   = $( '.droapps-ui-customselect-holder-list' , this.skinned );
		this.holder_items  = $( '.droapps-ui-customselect-holder-items' , this.skinned );
		this._feed();
		this.items         = $( '.droapps-ui-customselect-item' , this.holder_items );
		this._bind();
		this._render();
		this._fixHeight();
		
		// TODO: pull out $.Widget's handling for the disabled option into
		// $.Widget.prototype._setOptionDisabled so it's easy to proxy and can
		// be overridden by individual plugins
		this._setOption( 'disabled' , this.options.disabled );
	},
	
	_feed: function() {
		var self         = this,
			val          = this.selected_item.attr('rel') || this.options.value,
			holder_items = this.holder_items,
			selected_class;
		
		this.handler.text( this.selected_item.text() || this.options.text );
		this.items.each(function( i , item ){
			selected_class = val == $(item).val() ? self.options.selected_class : '';
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
		var self = this;
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
			if( self.options.disabled ) { return; }
			self.value({
				value: $(e.currentTarget).attr('rel'),
				label: $(e.currentTarget).text()
			});
		});
	},
	
	_render: function() {
		this.skinned.fadeTo(0,0).insertAfter( this.element );
		var skinned_before_width = this.skinned.outerWidth( true );
		var skinned_width = skinned_before_width > this.element_width ? 
							skinned_before_width : 
							this.element_width;
		var pos = this.options.position;
		this.skinned.width( skinned_width || 'auto' );
		
		switch ( pos ) {
			case 'top':
			case 'up':
				this.holder_list.css({
					top		: 'auto',
					bottom	: this.handler.outerHeight( true ) || 0
				});
				break;
				
			case 'middle':
			case 'center':
				this.holder_list.css({
					top		: this.handler.outerHeight( true )/2,
					bottom	: 'auto'
				});
				break;
			
			case 'bottom':
			case 'down':
			default:
				this.holder_list.css({
					top		: this.handler.outerHeight( true ),
					bottom	: 'auto'
				});
				break;
		}
		
		this.height_items = this.items
							.not('.' + this.options.selected_class)
							.first()
							.parent()
							.outerHeight( true );
							
		this.skinned.fadeTo(0,1);
		this.holder_list.hide();
	},
	
	_fixHeight: function() {
		if ( typeof this.options.visible === 'number' && this.items.length > this.options.visible ) {
			this.holder_list_height = this.height_items * this.options.visible;
			this.holder_items
				.height( this.holder_list_height )
				.css({ overflowY: 'auto', overflowX: 'hidden' });
		} else {
			this.holder_list_height = 0;
			this.holder_items
				.height( 'auto' )
				.css({ overflow: 'hidden' });
		}
	},
	
	_toggle: function( e ) {
		e.stopPropagation();
		e.preventDefault();
		if( this.holder_list.is(':visible') ) { this._close(e); } 
		else { this._open(e); }
	},
	
	_open: function( e ) {
		var self    = this,
			context = this.options.context ? this.options.context : this.skinned;
		
		if( this.holder_list.not(':visible') ) {
			if ( this.options.position == 'middle' || this.options.position == 'center' ) {
				this.holder_list.height(0).css({display: 'block'}).animate({
					top: -this.holder_list_height/2 + this.handler.outerHeight( true )/2,
					height: this.holder_list_height
				}, this.options.duration, function(){
					if( self.options.open ) { self.options.open.apply( context , arguments ); }
				});
			} else {
				this.holder_list.slideDown( this.options.duration , function(){
					if( self.options.open ) { self.options.open.apply( context , arguments ); }
				});
			}
		}
	},
	
	_close: function( e ) {
		var self    = this,
			context = this.options.context ? this.options.context : this.skinned;
			
		if( this.holder_list.is(':visible') ) {
			if ( this.options.position == 'middle' || this.options.position == 'center' ) {
				this.holder_list.animate({
					top: this.handler.outerHeight( true )/2,
					height: 0
				}, this.options.duration, function(){
					$(this).height(0).css({display: 'none'})
					if( self.options.close ) { self.options.close.apply( context , arguments ); }
				});
			} else {
				this.holder_list.css({ overflow: 'hidden'}).slideUp( this.options.duration , function(){
					if( self.options.close ) { self.options.close.apply( context , arguments ); }
				});
			}
		}
	},

	destroy: function() {
		this.element.removeClass('droapps-ui-customselect-skinned');
		this.skinned.remove();
		
		$.Widget.prototype.destroy.apply( this, arguments );
	},
	
	value: function( new_value ) {
		var val = new_value.value || this.options.value,
			txt = new_value.label || this.options.text;
		
		this.items
			.removeClass( this.options.selected_class )
			.filter('[rel='+ val +']')
			.addClass( this.options.selected_class );
		
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
		$.Widget.prototype._setOption.apply( this, arguments );
		
		switch ( key ) {
			case 'value':
				this.options.value = value;
				this.element.trigger( 'change' );
				this._trigger( 'change', null, value );
				break;
			case 'disabled':
				this.skinned[ value ? 'addClass' : 'removeClass']('disabled');
				break;
		}
	},

	_value: function() {
		return this.options.value;
	},
	
	widget: function() {
		return this.skinned || this.element;
	}
	
});

})( jQuery );