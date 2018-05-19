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
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App({
    marginotesEl: document.querySelector('.js-Marginotes'),
  });

  app.init();
});
