import Scrollmap from "../../app/_js/components/scroll-map";

describe("Scrollmap", () => {
  let view;
  let scrollmapFile;

  beforeEach(() => {
    document.body.innerHTML = "<div class=\"js-Scrollmap\"></div>";

    Scrollmap.prototype._initScrollmap = jest.fn();

    scrollmapFile = {};

    view = new Scrollmap({
      el: document.querySelector(".js-Scrollmap"),
      scrollmapFile: scrollmapFile
    });
  });

  test("initializes correctly", () => {    
    expect(view.el).toBeDefined();
    expect(view._scrollmapFile).toBe(scrollmapFile);
    expect(Scrollmap.prototype._initScrollmap).toHaveBeenCalled();
  });
});
