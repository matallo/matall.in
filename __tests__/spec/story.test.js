import Story from '../../app/_js/story';

describe('Story', () => {
  let view;

  beforeEach(() => {
    document.body.innerHTML = `<div class='js-Scroll'></div>`;

    Story.prototype.init = jest.fn();

    view = new Story({
      scrollmap: document.querySelector('.js-Scroll'),
    });
  });

  test('initializes correctly', () => {
    expect(view.scrollmap).toBeDefined();
  });

  describe('init', () => {
    test('initializes scroller correctly', () => {
      view.init();

      expect(Story.prototype.init).toHaveBeenCalled();
    });
  });
});
