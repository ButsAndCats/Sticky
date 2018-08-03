/* ===================================================================================== @preserve =

Sticky
Author: George Butter - github.com/butsandcats
version v0.0.1
ISC License

================================================================================================= */

const Sticky = function(configuration) {
  const config = confguration || {};
  const defaultConfig = {
    container: 'body',
    target: '[data-sticky]',
    activeClass: 'fixed',
    top: 0,
    method: null,
    padding: null,
    lowestElement: null,
    lowestOffset: 0
  }

  // Merge configs
  this.config = Object.assign(defaultConfig, config);
  this.doc = document.documentElement;
  this.target = this.config.target;
  this.element = document.querySelector(this.target);
  this.containerElement = document.querySelector(this.config.container)
  this.lowestElement = document.querySelector(this.config.lowestElement)
  this.width = null;
  this.padding = this.config.padding;
  this.position = 'top';
  this.method = this.config.method || '';
  this.minHeightElement = document.querySelector(this.config.minHeightElement)
  this.minHeight = this.minHeightElement.offsetHeight;
  this.setTop();
  this.buildEventListeners();
  this.resize();
  Sticky.elements[this.target] = this;
};

// Store all of ur elements in an object so they can be accessed globally
Sticky.elements = {};

// Build the required event listeners
Sticky.prototype.buildEventListeners = function() {
  // Listeners
  document.removeEventListener("scroll", this.scroll.bind(this));
  window.removeEventListener("resize", this.resize.bind(this));
  window.removeEventListener("orientationchange", this.resize.bind(this));
};

// Handle on scroll event
Sticky.prototype.scroll = function() {
  let scrollTop = this.scrollTop();
  let condition = false;

  if(this.minHeight >= this.height) {
    if(this.method == 'attach') {
      if(scrollTop <= this.top) {
        condition = true;
      }
    } else {
      if(scrollTop >= this.top) {
        condition = true;
      }
    }
  }

  if(condition) {
    if(!this.width) {
      this.element.style.width = this.element.offsetWidth;
    }
    this.element.classList.add(this.config.activeClass)
    this.element.style.top = 0
    if(this.postion !== 'bottom' && this.padding) {
      this.containerElement.style.paddingTop = `${height}px`
    }
  } else if(this.element.classList.contains(this.config.active)) {
    this.element.classList.remove(this.config.activeClass)
    this.elemennt.removeAttribute('style')
    if(this.width) {
      this.element.style.width = 'auto'
    }
    if(this.position != 'bottom' && this.padding) {
      this.containerElement.style.paddingTop = 0
    }
  }
  if(this.config.lowestElement) {
    const lowestTop = this.lowestElement.getBoundingClientRect().top
    this.lowestElementBottom = lowestTop + this.lowestElement.offsetHeight;

    if((scrollTop + window.innerHeight)) >= this.lowestElementBottom) {
      this.bottom = window.innerHeight - (this.lowestElementBottom - scrollTop) + this.config.lowestOffset;
      this.element.style.bottom = this.bottom
    } else {
      this.element.style.bottom = 0
    }
  }
}

Sticky.prototype.resize = function() {
  this.element.classList.remove(this.config.activeClass)
  this.height = this.element.outerHeight
  const computedWidth = this.element.parentNode.clientWidth
  if(!this.width) {
    this.element.style.width = computedWidth
  }
  this.scroll();
}

Sticky.prototype.update = function() {
  if(!this.element.classList.contains(this.config.active)) {
    this.height = this.element.offsetHeight;
  }
  this.scroll();
}

Sticky.prototype.scrollTop = function() {
  return (window.pageYOffset || this.doc.scrollTop)  - (this.doc.clientTop || 0);
}

Sticky.prototype.setTop = function() {
  const elem = this.element
  const elemOffset = elem.getBoundingClientRect()
  // Assign the top value depending on whether we are sticking it to the top or bottom
  this.top = this.position == 'bottom' ? elemOffset.top + elemOffset.height - window.innerHeight : elemOffset.top;
}
