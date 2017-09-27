import { Scrollmap } from './components/scroll-map.js';

class Story {
  constructor (options) {
    this.scrollmapEl = options.scrollmapEl;
    this.scrollmapFile = options.scrollmapFile;
    this.scrollmapCenter = options.scrollmapCenter;
  }

  init () {
    if (this.scrollmapEl) {
      const scrollmap = new Scrollmap({
        containerEl: this.scrollmapEl,
        scrollmapFile: this.scrollmapFile,
        scrollmapCenter: this.scrollmapCenter
      });

      scrollmap.init();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const story = new Story({
    scrollmapEl: document.querySelector('.js-Scroll'),
    scrollmapFile: window.scrollmapFile,
    scrollmapCenter: window.scrollmapCenter
  });

  story.init();
});
