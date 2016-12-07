import Marginotes from './modules/marginotes.js'
import Scrollmap from './modules/scroll-map.js'

class App {
  constructor (options) {
    const marginotes = new Marginotes(document.querySelector('.js-Marginotes'))
    const scrollmap = new Scrollmap(document.querySelector('.js-Scrollmap'))
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App()
})
