import Marginotes from './modules/marginotes.js'
import Scrollmap from './modules/scroll-map.js'

class App {
  constructor (options) {
    const marginotes = new Marginotes(document.querySelector('.js-Marginotes')) // eslint-disable-line no-unused-vars
    const scrollmap = new Scrollmap(document.querySelector('.js-Scrollmap')) // eslint-disable-line no-unused-vars
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App() // eslint-disable-line no-unused-vars
})
