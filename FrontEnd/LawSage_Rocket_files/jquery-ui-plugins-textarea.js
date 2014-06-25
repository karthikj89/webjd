/*
 * jQuery UI Textarea 0.0.9
 *
 * Copyright 2012, Chad LaVigne
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php) 
 *
 * http://code.google.com/p/jquery-ui-plugins/wiki/Textarea
 *
 * Depends:
 *  jquery 1.8.2
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.plugins.core.js
 */
;(function($, undefined) {
	
	$.widget('uiplugins.textarea', {  
		options: {			
			"maxChars": -1, // number or function returning the number of chars allowed, using a function is valuable for dynamic limits, for example, when the limit depends on the contents of another textarea
			"charLimitMessage": "", // message displaying character limit info
			"pasteFlickerFix": true, // turning this off will help performance but you'll see a flicker in some browsers when text that's too long is pasted into the textarea
			"limitMessageStyle": {}, // css style applied to limit message
			"limitMessageClass": "" // css class applied to limit message,
		},
		_create: function() {
			var opts = this.options,				
				$textarea = this.element;
				$textarea.addClass('ui-textarea');
			
			this.$textarea = $textarea;
			
			if(opts.maxChars && opts.charLimitMessage) {				
				this._renderLimitMessage();
			}
			
			if(typeof opts.maxChars === 'function' || Number(opts.maxChars) >= 0) {
				this._initCharLimit();			
			}			
		},
		_setOption: function(option, value) {
			$.Widget.prototype._setOption.apply(this, arguments);
			var opts = this.options;

			switch(option) {				
				case 'maxChars':
					this._setMaxChars(value);					
					break;
				case 'charLimitMessage':
					if(value) {
						this.refresh();
					}
					break;								
				case 'limitMessageStyle':
					if(typeof opts.limitMessageStyle === 'string') {
						opts.limitMessageStyle = $.parseJSON(opts.limitMessageStyle);
					}					
					this.$limitMessage.css(opts.limitMessageStyle);					
					break;
				case 'limitMessageClass':
					opts.limitMessageClass += ' ui-char-limit-message';
					this.$limitMessage.attr('class', opts.limitMessageClass);
					break;
			}
		},
		_renderLimitMessage: function() {	
			var $textarea = this.$textarea;
			var opts = this.options;
			var $limitMessage = $('<div class="ui-char-limit-message"></div>').insertAfter($textarea);			
			$limitMessage.css(opts.limitMessageStyle);
			$limitMessage.addClass(opts.limitMessageClass);
			$textarea.parent('div').css('margin-bottom', $limitMessage.height() + 'px');
			this.$limitMessage = $limitMessage;
		},
		_getLimitMessageLoc: function() {
			var $textarea = this.$textarea;
			var location = $textarea.offset();
			location.top += $.browser.msie ? $textarea.height() + 7 : $textarea.height() + 3;
			location.left += 2;
			return location;
		},
		_handleKeyPress: function(event) {		
			this._trigger('beforeChange', event, this.element);
			var self = this;
			var opts = this.options;
			var max = typeof opts.maxChars === 'function' ? opts.maxChars.apply() : opts.maxChars;
			var key = event.which;
			var oldVal = self._getValueData();
			var newVal = oldVal.beforeCursor + String.fromCharCode(key) + this.afterCursor();									
			var emptyChar = (key >= $.ui.keyCode.SHIFT && key <= $.ui.keyCode.CAPS_LOCK) || key == $.ui.keyCode.ESCAPE || (key > $.ui.keyCode.SPACE && key <= $.ui.keyCode.DOWN) || key == $.ui.keyCode.INSERT || (key >= $.ui.keyCode.COMMAND && key <= $.ui.keyCode.COMMAND_RIGHT) || (key >= $.ui.keyCode.NUM_LOCK && key <= $.ui.keyCode.SCROLL_LOCK);			
			var alwaysValid = key == 0 || key == $.ui.keyCode.BACKSPACE || key == $.ui.keyCode.DELETE || (event.ctrlKey && key == $.ui.keyCode.A);
			
			if(!(emptyChar || alwaysValid)) {											
				if(newVal.length > max) {
					return false;
				}								
			}
			
			if(!emptyChar) {
				setTimeout(function() {
					self._trigger('afterChange', event, self.element);
				}, 0);	
			}			
		},
		_handlePaste: function(event) {		
			this._trigger('beforeChange', event, this.element);
			var self = this;
			// grab the value before the content gets pasted in
			var oldVal = self._getValueData();
			var opts = self.options;
			var max = typeof opts.maxChars === 'function' ? opts.maxChars.apply() : opts.maxChars;
			var $textarea = self.$textarea;
			var $textareaClone = null;
			
			// the paste flicker fix puts a text area containing a copy of the current value on top of the original text area so the original one is hidden, 
			// this hides the flicker that sometimes occurs when the pasted text is too long but we see it for a split second before it's truncated to fit				
			if(opts.pasteFlickerFix && opts.pasteFlickerFix !== 'false') {
				var location = self._getPasteFixLocation();
				
				$textareaClone = $('<textarea rows="' + $textarea.attr('rows') + '" cols="' + $textarea.attr('cols') + '"></textarea>')
					.addClass($textarea.attr('class'))
					.css({'position': 'absolute', 'top': location.top, 'left': location.left})
					.insertAfter($textarea)
					.val(oldVal.text);
			}
			
			// immediately after paste, trunc the pasted content if it's too long
			setTimeout(
				function() {
					var newVal = $textarea.val();
					var inserted = newVal.substring(oldVal.beforeCursor.length, newVal.length - oldVal.afterCursor.length);
					
					if(newVal.length > max) {
						var truncInserted = inserted.substring(0, max - oldVal.beforeCursor.length - oldVal.afterCursor.length);
						$textarea.val(oldVal.beforeCursor + truncInserted + oldVal.afterCursor);
					}
					
					$textarea.caret({'start': oldVal.beforeCursor.length, 'end': self._getValueData().text.length - oldVal.afterCursor.length});
					
					if($textareaClone) {
						$textareaClone.remove();						
					}					

					self.refresh(event);					
					self._trigger('afterChange', event, self.element);				
				}, 
			0);
		},
		_getPasteFixLocation: function() {
			var location = this.$textarea.offset();
			
			// for whatever reason, placing another textarea with absolute positioning at the exact same offset as the original text area is slightly off by different amounts in different browsers
			if($.browser.webkit) {
				location.top -= 2;
				location.left -= 2;
			} else if($.browser.mozilla) {
				location.top -= 1;
			}
			
			return location;
		},
		_showCharLimitMessage: function () {	
			var opts = this.options;
			var $textarea = this.$textarea;
			var max = typeof opts.maxChars === 'function' ? opts.maxChars.apply() : opts.maxChars;				
			var entered = $textarea.val().length;
			var messageText = opts.charLimitMessage.replace('{MAX}', max).replace('{ENTERED}', entered).replace('{REMAINING}', max - entered); 		
			$textarea.next('div.ui-char-limit-message').text(messageText);			
		},		
		_setMaxChars: function(max) {
			var $textarea = this.$textarea;
			var text = $textarea.val();
			if(text.length > Number(max)) {
				$textarea.val(text.substring(0, max));
			}
			this.refresh();
		},
		_initCharLimit: function() {
			var self = this;
			var opts = self.options;
			var $textarea = self.$textarea;
			
			$textarea.keydown(function(event) {
				return self._handleKeyPress(event);				
			});
			
			$textarea.bind('paste', function(event) {
				self._handlePaste(event);			
			});
			
			if(opts.charLimitMessage) {
				self._showCharLimitMessage();
				$textarea.keyup(function(event) {
					var key = event.which;
					if(!self._ignoreKeyPress(key)) {
						self.refresh(event);
					}					
				});				
			}
		},
		_getValueData: function() {
			var $textarea = this.$textarea;
			var selection = $textarea.caret();
			var text = $textarea.val();
			
			return {
				'selection': selection,
				'text': text,
				'beforeCursor': text.substring(0, selection.start),
				'afterCursor': text.substring(selection.end)
			};
		},
		_ignoreKeyPress: function(key) {
			return key == $.ui.keyCode.ALT ||
				key == $.ui.keyCode.CAPS_LOCK ||
				key == $.ui.keyCode.COMMAND ||
				key == $.ui.keyCode.COMMAND_LEFT ||
				key == $.ui.keyCode.COMMAND_RIGHT ||
				key == $.ui.keyCode.CONTROL ||
				key == $.ui.keyCode.DOWN ||
				key == $.ui.keyCode.END ||
				key == $.ui.keyCode.ESCAPE ||
				key == $.ui.keyCode.HOME ||
				key == $.ui.keyCode.INSERT ||
				key == $.ui.keyCode.LEFT ||
				key == $.ui.keyCode.PAGE_DOWN ||
				key == $.ui.keyCode.PAGE_UP ||
				key == $.ui.keyCode.RIGHT ||
				key == $.ui.keyCode.SHIFT ||
				key == $.ui.keyCode.UP;
		},		
		refresh: function(event) {	
			this._showCharLimitMessage();
		},
		selectedText: function(start, end) {
			if($.isNumeric(start) && $.isNumeric(end)) {
				this.$textarea.caret({'start': Number(start), 'end': Number(end)});
			} else {
				return this.$textarea.caret().text;
			}			
		},
		selectionStart: function() {
			return this.$textarea.caret().start;
		},
		selectionEnd: function() {
			return this.$textarea.caret().end;
		},
		replaceSelection: function(replacement) {
			var selection = this.$textarea.caret();
			
			if(selection.start != selection.end) {
				this.$textarea.val(selection.replace(replacement));
				this.selectedText(selection.start, selection.start + replacement.length);
				this.refresh();
			}			
		},		
		beforeCursor: function() {
			return this._getValueData().beforeCursor;			
		},
		afterCursor: function() {
			return this._getValueData().afterCursor;
		},	
		remaining: function() {
			var opts = this.options;
			var max = typeof opts.maxChars === 'function' ? opts.maxChars.apply() : opts.maxChars;				
			var entered = this.$textarea.val().length;			
			return max - entered;
		},
		enable: function() {			
			this.element.removeAttr('disabled');			
			$.Widget.prototype.enable.call(this);
			this._trigger('enable', null, this.element);
		},
		disable: function() {
			this.element.attr('disabled', 'disabled');
			$.Widget.prototype.disable.call(this);
			this._trigger('disable', null, this.element);
		},
		destroy: function() {
			var $textarea = this.$textarea;			
			$textarea.unbind();			
			$textarea.removeClass('ui-textarea');				
			
			if(this.options.charLimitMessage) {
				$textarea.next('.ui-char-limit-message').remove();
			}
			
			$.Widget.prototype.destroy.call(this);		
		}
	});
})(jQuery);

// include required jquery caret plugin
/*
 *
 * Copyright (c) 2010 C. F., Wong (<a href="http://cloudgen.w0ng.hk">Cloudgen Examplet Store</a>)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
;(function($, len, createRange, duplicate) {
    $.fn.caret = function(options, opt2) {
        var start, end, t = this[0], browser = $.browser.msie, s, e;
        if (typeof options === "object" && typeof options.start === "number" && typeof options.end === "number") {
            start = options.start;
            end = options.end;
        } else if (typeof options === "number" && typeof opt2 === "number") {
            start = options;
            end = opt2;
        } else if (typeof options === "string") {
            if ((start = t.value.indexOf(options)) > -1) end = start + options[len];
            else start = null;
        } else if (Object.prototype.toString.call(options) === "[object RegExp]") {
            var re = options.exec(t.value);
            if (re != null) {
                start = re.index;
                end = start + re[0][len];
            }
        }
        if (typeof start != "undefined") {
            if (browser) {
                var selRange = this[0].createTextRange();
                selRange.collapse(true);
                selRange.moveStart('character', start);
                selRange.moveEnd('character', end - start);
                selRange.select();
            } else {
                this[0].selectionStart = start;
                this[0].selectionEnd = end;
            }
            this[0].focus();
            return this
        } else {
            if (browser) {
                var selection = document.selection;
                if (this[0].tagName.toLowerCase() != "textarea") {
                    var val = this.val(), range = selection[createRange]()[duplicate]();
                    range.moveEnd("character", val[len]);
                    s = (range.text == "" ? val[len] : val.lastIndexOf(range.text));
                    range = selection[createRange]()[duplicate]();
                    range.moveStart("character", -val[len]);
                    e = range.text[len];
                } else {
                    range = selection[createRange](), stored_range = range[duplicate]();
                    stored_range.moveToElementText(this[0]);
                    stored_range.setEndPoint('EndToEnd', range);
                    s = stored_range.text[len] - range.text[len], e = s + range.text[len]
                }
            } else {
                s = t.selectionStart, e = t.selectionEnd;
            }
            var te = t.value.substring(s, e);
            return {start: s, end: e, text: te, replace: function(st) {
                var result = t.value.substring(0, s) + st + t.value.substring(e, t.value[len]);
                return result;
            }}
        }
    }
})(jQuery, "length", "createRange", "duplicate");