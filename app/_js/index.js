import lozad from 'lozad';

import Marginotes from './components/marginotes';

class App {
  constructor(options) {
    this.marginotesEl = options.marginotesEl;
  }

  init() {
    if (this.marginotesEl) {
      const marginotes = new Marginotes({
        container: this.marginotesEl,
      });

      marginotes.init();
    }

    const observer = lozad('.lazyload', {
      load: (el) => {
          el.src = el.dataset.src;

          el.onload = function() {
            el.classList.add('a-fade');
          }
      }
    });
    observer.observe();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App({
    marginotesEl: document.querySelector('.js-Marginotes'),
  });

  app.init();
});
