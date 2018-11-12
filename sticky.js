/*
@preserve
Sticky
Author: George Butter - github.com/butsandcats
version v0.0.6
ISC License
*/

/*
  configuration
  activeClass: the calss that will be applied to the element
  method: Use attach if the element is already stuck and you wish for it to attach
  lowestElement: fixed objects will remain stuck but go no lower than this elements
  lowestOffset: distance above the lowest element
  fillHeight: add padding to the place where the element was once it has become fixed
  heightElements: Array of selectors to get height from these elements instead of the target,
                  good for variable height elements like accordions and navs
*/
const Sticky = function (configuration) {
  const config = configuration || {}
  const defaultConfig = {
    container: 'body',
    target: '[data-sticky]',
    activeClass: 'fixed',
    heightElements: null,
    method: null,
    padding: null,
    lowestElement: null,
    lowestOffset: 0,
    fillHeight: null
  }

  // Merge configs
  this.config = Object.assign(defaultConfig, config)

  // Capture all the required data for calculations
  this.doc = document.documentElement
  this.target = this.config.target
  if (!this.target) {
    return console.error(`Sticky: No target element provided`)
  }
  this.element = document.querySelector(this.target)
  this.containerElement = document.querySelector(this.config.container)
  this.lowestElement = document.querySelector(this.config.lowestElement)
  this.width = null
  this.padding = this.config.padding
  this.position = 'top'
  this.method = this.config.method || ''
  this.minHeightElement = document.querySelector(this.config.minHeightElement)
  if (this.minHeightElement) {
    this.minHeight = this.minHeightElement.offsetHeight
  }
  if (!this.element) {
    return console.error(`Sticky: ${this.target} element does not exist`)
  }
  this.heightElements = null
  if (this.config.heightElements) {
    this.heightElements = []
    for (let elem = 0; elem < this.config.heightElements.length; elem += 1) {
      this.heightElements.push(document.querySelector(this.config.heightElements[elem]))
    }
  }

  // Wrap the element in an arbitray container so that we can safely use parentNode
  this.wrapElement()
  // Calculate the value of the sticky element from the top of the document
  this.setTop()
  // Create all the required evenr listeners with this bound
  this.buildEventListeners()
  // Trigger a resize event incase the element should be sticky already.
  this.resize()
  // Add the element to sticky elements for global usage
  Sticky.elements[this.target] = this
}

// Store all of ur elements in an object so they can be accessed globally
Sticky.elements = {}
// Version of sticky
Sticky.version = '0.0.8'

// Build the required event listeners
Sticky.prototype.buildEventListeners = function buildStickyEventListeners () {
  document.addEventListener('scroll', this.scroll.bind(this))
  window.addEventListener('load', this.resize.bind(this))
  window.addEventListener('resize', this.resize.bind(this))
  window.addEventListener('orientationchange', this.resize.bind(this))
}

// Handle on scroll event
Sticky.prototype.scroll = function handleScrollEvents () {
  let scrollTop = this.scrollTop()
  let condition = false

  // Calculate whether the element should be stuck or not based on the cofniguration
  if (this.config.minHeightElement) {
    if (this.minHeight >= this.height) {
      if (this.method === 'attach') {
        if (scrollTop <= this.top) {
          condition = true
        }
      } else {
        if (scrollTop >= this.top) {
          condition = true
        }
      }
    }
  } else {
    if (this.method === 'attach') {
      if (scrollTop <= this.top) {
        condition = true
      }
    } else {
      if (scrollTop >= this.top) {
        condition = true
      }
    }
  }
  if (condition) {
    this.stick()
  } else if (this.element.classList.contains(this.config.activeClass)) {
    this.unstick()
  }

  if (this.config.lowestElement) {
    const lowestTop = this.lowestElement.getBoundingClientRect().top
    this.lowestElementBottom = lowestTop + this.lowestElement.offsetHeight

    if ((scrollTop + window.innerHeight) >= this.lowestElementBottom) {
      this.bottom = window.innerHeight - (this.lowestElementBottom - scrollTop) + this.config.lowestOffset
      this.element.style.bottom = this.bottom
    } else {
      this.element.style.bottom = 0
    }
  }
}

// Wrap the element in a div for consistency
Sticky.prototype.wrapElement = function wrapElementInArbitraryDiv () {
  const wrapper = document.createElement('div')
  wrapper.classList.add('sticky-wrapper')
  this.element.parentNode.insertBefore(wrapper, this.element)
  wrapper.appendChild(this.element)
}

Sticky.prototype.setFillHeight = function calcaulateHowMuchPaddingToAddToTheWrapper () {
  if (this.heightElements) {
    let height = 0
    for (let elem = 0; elem < this.heightElements.length; elem += 1) {
      height += this.heightElements[elem].offsetHeight
    }
    this.fillHeight = height
  } else {
    this.fillHeight = this.height
  }

}

Sticky.prototype.resize = function handleResizeEvents () {
  this.element.classList.remove(this.config.activeClass)
  this.height = this.element.offsetHeight
  this.setFillHeight()
  const computedWidth = this.element.parentNode.clientWidth+'px'
  if (!this.width) {
    this.element.style.width = computedWidth
  }
  this.scroll()
}

Sticky.prototype.update = function () {
  if (!this.element.classList.contains(this.config.active)) {
    this.height = this.element.offsetHeight
    this.setFillHeight()
  }
  this.scroll()
}

Sticky.prototype.stick = function () {
  if (this.config.fillHeight) {
    this.element.parentNode.style.paddingTop = `${this.fillHeight}px`
  }
  if (!this.width) {
    const computedWidth = this.element.parentNode.clientWidth+'px'
    this.element.style.width = computedWidth
  }

  this.element.classList.add(this.config.activeClass)
  if (this.postion !== 'bottom' && this.padding) {
    this.containerElement.style.paddingTop = `${this.height}px`
  }
}

Sticky.prototype.unstick = function () {
  if (this.config.fillHeight) {
    this.element.parentNode.style.paddingTop = null
  }
  this.element.classList.remove(this.config.activeClass)
  this.element.removeAttribute('style')
  if (this.width) {
    this.element.style.width = 'auto'
  }
  if (this.position !== 'bottom' && this.padding) {
    this.containerElement.style.paddingTop = 0
  }
}

Sticky.prototype.scrollTop = function calculateTheDistanceScrolledFromTheTop () {
  return (window.pageYOffset || this.doc.scrollTop) - (this.doc.clientTop || 0)
}

Sticky.prototype.setTop = function setTheTopValue () {
  const elem = this.element
  const elemOffset = elem.getBoundingClientRect()
  const scrollTop = this.scrollTop()
  const docTop = elemOffset.top + scrollTop
  // Assign the top value depending on whether we are sticking it to the top or bottom
  if (this.position === 'bottom') {
    this.top = docTop + elemOffset.height - window.innerHeight
  } else {
    this.top = docTop
  }
}

export {Sticky}
