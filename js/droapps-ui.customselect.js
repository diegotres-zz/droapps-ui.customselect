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
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
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
		visible			: 5,
		duration		: 300,
		classname		: '',
		selected_class	: 'selected',
		open			: null,
		close			: null
	},
	
	_create: function() {
		var self = this;
		this.element_width = this.element.outerWidth( true );
		this.element.addClass('ui-select-skinned');
		this.items         = $( 'option' , this.element );
		this.selected_item = $( ':selected' , this.element );
		this.skinned       = $(
			'<dl class="ui-select ui-widget ui-widget-content ui-corner-all">' +
				'<dt class="ui-select-value ui-select-handler" />' +
				'<dd class="ui-select-holder-list"><ul class="ui-select-holder-items" /></dd>' +
			'</dl>'
		);
		this.skinned.addClass( self.options.classname || null );
		this.doc_body      = $( 'body' );
		this.handler       = $( '.ui-select-handler' , this.skinned );
		this.holder_list   = $( '.ui-select-holder-list' , this.skinned );
		this.holder_items  = $( '.ui-select-holder-items' , this.skinned );
		this._feed();
		this.items         = $( '.ui-select-item' , this.holder_items );
		this._bind();
		this._render();
		this._fixHeight();
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
						'class="ui-select-item '+ selected_class +'"' +
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
		this.handler.bind( 'click.select' , $.proxy( this._toggle , this ) );
		this.holder_items.bind( 'click.select' , $.proxy( this._toggle , this ) );
		this.items.bind( 'click.select-setvalues' , function(e) {
			e.preventDefault();
			e.stopPropagation();
			self.value({
				value: $(e.currentTarget).attr('rel'),
				label: $(e.currentTarget).text()
			});
		});
	},
	
	_render: function() {
		var skinned_before_width = this.skinned.outerWidth( true );
		var skinned_width = skinned_before_width > this.element_width ? 
							skinned_before_width : 
							this.element_width;
		this.skinned.insertAfter( this.element ).width( skinned_width || 'auto' );
		this.height_items = this.items
							.not('.' + this.options.selected_class)
							.first()
							.parent()
							.outerHeight( true );
		this.holder_list.hide();
	},
	
	_fixHeight: function() {
		if( this.items.length > this.options.visible ) {
			this.holder_items
			.height( this.height_items * this.options.visible )
			.css({ overflow: 'auto' });
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
			this.holder_list.slideDown( this.options.duration , function(){
				if( self.options.open ) { self.options.open.apply( context , arguments ); }
			});
		}
	},
	
	_close: function( e ) {
		var self    = this,
			context = this.options.context ? this.options.context : this.skinned;
			
		if( this.holder_list.is(':visible') ) {
			this.holder_list.css({ overflow: 'hidden'}).slideUp( this.options.duration , function(){
				if( self.options.close ) { self.options.close.apply( context , arguments ); }
			});
		}
	},

	destroy: function() {
		this.element.removeClass('ui-select-skinned');
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
		switch ( key ) {
			case 'value':
				this.options.value = value;
				this.element.trigger( 'change' );
				this._trigger( 'change', null, value );
				break;
		}
		
		$.Widget.prototype._setOption.apply( this, arguments );
	},

	_value: function() {
		return this.options.value;
	},
	
	widget: function() {
		return this.skinned || this.element;
	}
	
});

})( jQuery );