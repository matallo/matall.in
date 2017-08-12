import Marginotes from "./components/marginotes.js";
import Scrollmap from "./components/scroll-map.js";

class App {
  constructor () {
    const marginotes = new Marginotes({ // eslint-disable-line no-unused-vars
      el: document.querySelector(".js-Marginotes")
    });
    const scrollmap = new Scrollmap({ // eslint-disable-line no-unused-vars
      el: document.querySelector(".js-Scrollmap"),
      scrollmapFile: window.scrollmapFile
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App(); // eslint-disable-line no-unused-vars
});
