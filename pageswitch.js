;(function($) {
	var PageSwitch = (function() {
		var PageSwitch = function(ele, opts) {
			this.ele = ele;
			this.settings = $.extend({}, true, $.fn.PageSwitch.DEFAULTS, opts || {});	// 深拷贝
			this.init();
		};
		$.extend(PageSwitch.prototype, {
			init: function() {
				this.selectors = this.settings.selectors;
				this.direction = this.settings.direction === 'vertical' ? true : false;
				this.sections = this.ele.find(this.selectors.sections);
				this.section = this.ele.find(this.selectors.section);
				this.pagesCount = this.pagesCount();
				var index = this.settings.index;
				this.index = (index >= 0 && index <= this.pagesCount) ? index : 0;
				this.canScroll = true;

				if(!this.direction) {
					this._initLayout();
				}

				if(this.settings.pagination) {
					this._initPaging();
				}

				this._initEvent();
			},
			pagesCount: function() {
				return this.section.length;
			},
			// 获取横屏（宽度）或竖屏（高度）内容长度
			switchLength: function() {
				return this.direction ? this.section.eq(this.index).height() : this.section.eq(this.index).width();
			},
			_prev: function() {
				if(this.index > 0) {
					this.index --;
				} else if(this.settings.loop) {
					this.index = this.pagesCount - 1;
				}
				this._scrollPage();
			},
			_next: function() {
				if(this.index < this.pagesCount - 1) {
					this.index ++;
				} else if(this.settings.loop) {
					this.index = 0;
				}
				this._scrollPage();
			},
			_scrollPage: function() {
				this.canScroll = false;
				var pos = this.section.eq(this.index).position();
				var translateValue = this.direction ? pos.top : pos.left;
				var objStyle = {};
				['WebkitTransform', 'MozTransform', 'msTransform', 'transform'].forEach(function(value) {
					if(this.direction) {
						objStyle[value] = 'translateY(-' + translateValue + 'px)';
					} else {
						objStyle[value] = 'translateX(-' + translateValue + 'px)';
					}
				});
				this.sections.css(objStyle);

				if(this.settings.pagination) {
					this.pageItems.eq(this.index).addClass('active').siblings().removeClass('active');
				}
			},
			_initEvent: function() {
				if(this.settings.pagination) {
					this.pageItems.on('click', function(e) {
						this.index = $(e.target).index();
						this._scrollPage();
					}.bind(this));
				}

				if(this.settings.keyboard) {
					$(window).keydown(function(e) {
						var keyCode = e.keyCode;
						if(keyCode === 37 || keyCode === 38) {
							this._prev();
						} else if(keyCode === 39 || keyCode === 40) {
							this._next();
						}
					}.bind(this));
				}

				this.ele.on('mousewheel DOMMouseScroll', function(e) {
					var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
					if(this.canScroll) {
						if(delta < 0 && (!this.settings.loop && this.index < this.pagesCount - 1 || this.settings.loop)) {
							this._next();
						} else if(delta > 0 && (this.index && !this.settings.loop || this.settings.loop)) {
							this._prev();
						}
					}
				}.bind(this));

				// 绑定窗口改变事件
				// 为了不频繁调用resize的回调方法，做延迟处理
				var resizeId;
				$(window).resize(function(e) {
					clearTimeout(resizeId);
					resizeId = setTimeout(function() {
						var switchLength = this.switchLength();
						var sectionInDocument = this.section.eq(this.index).offset();
						var offset = this.direction ? sectionInDocument.top : sectionInDocument.left;
						if(Math.abs(offset) > switchLength / 2 && this.index < this.pagesCount - 1) {
							this.index ++;
							if(this.index) {
								this._scrollPage();
							}
						}
					}.bind(this), 500);
				}.bind(this));

				// 动画结束事件
				this.sections.on('transitionend webkitTransitionEnd oTransitionEnd otransitionEnd', function() {
					this.canScroll = true;
					var callback = this.settings.callback;
					if(callback && $.type(callback) === 'function') {
						callback();
					}
				}.bind(this));
			},
			// 横屏布局
			_initLayout: function() {
				var width = (this.pagesCount * 100) + '%',
					cellWidth = (100 / this.pagesCount).toFixed(2) + '%';
				this.sections.width(width);
				this.section.width(cellWidth).css({ float: 'left' });
			},
			// 初始化分页
			_initPaging: function() {
				var pageClass = this.settings.selectors.page.substring(1),
					activeClass = this.settings.selectors.active.substring(1);
				var pageHtml = '<ul class="' + pageClass + '">';
				for(var i = 0; i < this.pagesCount; i++) {
					pageHtml += '<li></li>';
				}
				pageHtml += '</ul>';
				this.ele.append(pageHtml);
				var pages = this.ele.find(this.selectors.page);
				this.pageItems = pages.find('li');
				this.pageItems.eq(this.index).addClass(activeClass);
				if(this.direction) {
					pages.addClass('vertical');
				} else {
					pages.addClass('horizontal');
				}
			}
		});
		return PageSwitch;
	})();

	$.fn.PageSwitch = function(props) {
		return this.each(function() {
			var $target = $(this),
				instance = $target.data('pageSwitch');
			if(!instance) {
				instance = new PageSwitch($target, props);
				$target.data('pageSwitch', instance);
			};
			if(typeof props === 'string') {
				instance[props]();
			}
		});
	};

	$.fn.PageSwitch.DEFAULTS = {
		// active：当前活动页
		selectors: {
			sections: '.sections',
			section: '.section',
			page: '.pages',
			active: '.active'
		},
		index: 0,	// 活动页下标
		easing: 'ease',	// 动画效果
		duration: 500,	// 动画持续时间
		loop: true,	// 是否轮播
		pagination: true,	// 是否进行分页
		keyboard: true,	// 键盘事件
		direction: 'vertical',	// 滑动方向 vertical horizontal
		callback: ''	// 回调函数
	};

	$('.container').PageSwitch({ direction: 'horizontal' });
})(jQuery)