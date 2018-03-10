import Marginotes from "./components/marginotes.js";
import Scrollmap from "./components/scroll-map.js";

class App {
  constructor (options) {
    this._marginotesEl = options.marginotesEl;
    this._scrollmapEl = options.scrollmapEl;
    this._scrollmapFile = options.scrollmapFile;
    this._scrollmapCenter = options.scrollmapCenter;
  }

  init () {
    if (this._marginotesEl) {
      const marginotes = new Marginotes({
        container: this._marginotesEl
      });

      marginotes.init();
    }

    if (this._marginotesEl) {
      const scrollmap = new Scrollmap({
        containerEl: this._scrollmapEl,
        scrollmapFile: this._scrollmapFile,
        scrollmapCenter: this._scrollmapCenter
      });

      scrollmap.init();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App({
    marginotesEl: document.querySelector(".js-Marginotes"),
    scrollmapEl: document.querySelector(".js-Scroll"),
    scrollmapFile: window.scrollmapFile,
    scrollmapCenter: window.scrollmapCenter
  });

  app.init();
});
