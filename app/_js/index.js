import Marginotes from './components/marginotes';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      err => {
        console.log('ServiceWorker registration failed: ', err);
      },
    );
  });
}

const App = class App {
  constructor(options) {
    this.marginotes = options.marginotes;
    this.animate = options.animate;
  }

  init() {
    if (this.marginotes) {
      const marginotes = new Marginotes({
        container: this.marginotes,
      });

      marginotes.init();
    }

    if (this.animate) {
      this.animate.classList.add('animate', 'animate--d4');

      setTimeout(() => {
        this.animate.classList.remove('animate', 'animate--d4');
      }, 1000);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const app = new App({
    marginotes: document.querySelector('.js-Marginotes'),
    animate: document.querySelector('.js-Animate'),
  });

  app.init();
});

export default App;
