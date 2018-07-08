import Marginotes from './components/marginotes';

const App = class App {
  constructor(options) {
    this.marginotes = options.marginotes;
  }

  init() {
    if (this.marginotes) {
      const marginotes = new Marginotes({
        container: this.marginotes,
      });

      marginotes.init();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const app = new App({
    marginotes: document.querySelector('.js-Marginotes'),
  });

  app.init();
});

export default App;
