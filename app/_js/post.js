import Marginotes from './modules/marginotes.js'

class Post {
  constructor (options) {
    const marginotes = new Marginotes(document.querySelector('.js-Marginotes'))
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const post = new Post()
})
