class Marginotes {

  constructor (options) {
    if (options.container === void 0) {
      throw new Error("container option is required");
    }

    this._container = options.container;
    this._marginote = this._container.querySelector(".js-Marginote");
  }

  init () {
    this._initEvents();
  }

  _initEvents () {
    const footNotes = this._container.querySelectorAll(".js-Footnote");

    footNotes.forEach(footNote => {
      footNote.addEventListener("mouseover", (e) => this._onMouseoverFootnote(e));
      footNote.addEventListener("mouseout", (e) => this._onMouseoutFootnote(e));
    });
  }

  _onMouseoverFootnote (e) {
    const target = e.target;
    const text = document.getElementById(target.href.split("#")[1]).innerHTML;
    const top = target.offsetTop;

    this._marginote.innerHTML = text;
    this._marginote.style.top = `${top}px`;
    this._marginote.style.display = "";

    setTimeout(() => {
      this._marginote.classList.add("is-active");
    }, 1);
  }

  _onMouseoutFootnote () {
    this._marginote.classList.remove("is-active");

    setTimeout(() => {
      this._marginote.style.display = "none";
    }, 201);
  }

}

export default Marginotes;
