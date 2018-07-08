import Scrollmap from '../../app/_js/components/scroll-map';
import jsonFile from '../../app/_includes/js/data/vietnam.json';

describe('Scrollmap', () => {
  let view;
  let scrollmapFile;
  let scrollmapCenter;

  beforeEach(() => {
    document.body.innerHTML = `<div class='js-Scroll'>
      <div class='js-Scroll-graphic'></div>
      <div class='js-Scroll-text'>
        <div class='js-Scroll-step'></div>
      </div>
    </div>`;

    Scrollmap.prototype.initScroller = jest.fn();

    scrollmapFile = jsonFile;
    scrollmapCenter = [101.3097594, 15.8565707];

    view = new Scrollmap({
      container: document.querySelector('.js-Scroll'),
      scrollmapFile,
      scrollmapCenter,
    });
  });

  test('initializes correctly', () => {
    expect(view.container).toBeDefined();
    expect(view.scrollmapFile).toBe(scrollmapFile);
    expect(view.scrollmapCenter).toBe(scrollmapCenter);
  });

  describe('init', () => {
    test('initializes scroller correctly', () => {
      view.init();

      expect(Scrollmap.prototype.initScroller).toHaveBeenCalled();
    });
  });
});
