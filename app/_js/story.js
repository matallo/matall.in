import Scrollmap from './components/scroll-map';

const Story = class Story {
  constructor(options) {
    this.scrollmap = options.scrollmap;
    this.scrollmapFile = options.scrollmapFile;
    this.scrollmapCenter = options.scrollmapCenter;
  }

  init() {
    if (this.scrollmap) {
      const scrollmap = new Scrollmap({
        container: this.scrollmap,
        scrollmapFile: this.scrollmapFile,
        scrollmapCenter: this.scrollmapCenter,
      });

      scrollmap.init();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const story = new Story({
    scrollmap: document.querySelector('.js-Scroll'),
    scrollmapFile: window.scrollmapFile,
    scrollmapCenter: window.scrollmapCenter,
  });

  story.init();
});

export default Story;
