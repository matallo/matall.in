import Scrollmap from "../../app/_js/components/scroll-map";
import jsonFile from "../../app/_includes/js/data/vietnam.json";

describe("Scrollmap", () => {
  let view;
  let scrollmapFile;
  let scrollmapCenter;

  beforeEach(() => {
    document.body.innerHTML = `<div class="js-Scroll">
      <div class="js-Scroll-graphic"></div>
      <div class="js-Scroll-text">
        <div class="js-Scroll-step"></div>
      </div>
    </div>`;

    Scrollmap.prototype._initScroller = jest.fn();

    scrollmapFile = jsonFile;
    scrollmapCenter = [101.3097594, 15.8565707];

    view = new Scrollmap({
      containerEl: document.querySelector(".js-Scroll"),
      scrollmapFile: scrollmapFile,
      scrollmapCenter: scrollmapCenter
    });
  });

  test("initializes correctly", () => {
    expect(view._containerEl).toBeDefined();
    expect(view._scrollmapFile).toBe(scrollmapFile);
    expect(view._scrollmapCenter).toBe(scrollmapCenter);
  });

  describe("init", () => {
    test("initializes scroller correctly", () => {
      view.init();

      expect(Scrollmap.prototype._initScroller).toHaveBeenCalled();
    });
  });
});
