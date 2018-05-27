import App from '../../app/_js';

describe('App', () => {
  let view;

  beforeEach(() => {
    document.body.innerHTML = `<div class='js-Marginotes'></div>`;

    App.prototype.init = jest.fn();

    view = new App({
      marginotes: document.querySelector('.js-Marginotes'),
    });
  });

  test('initializes correctly', () => {
    expect(view.marginotes).toBeDefined();
  });

  describe('init', () => {
    test('initializes scroller correctly', () => {
      view.init();

      expect(App.prototype.init).toHaveBeenCalled();
    });
  });
});
