class Marginotes {

  constructor (options) {
    this.el = options.el;

    if (this.el === null) {
      return false;
    }

    this.marginote = this.el.querySelector(".js-Marginote");

    this._initEvents();
  }

  _initEvents () {
    const footNotes = this.el.querySelectorAll(".js-Footnote");

    footNotes.forEach(footNote => {
      footNote.addEventListener("mouseover", (e) => this._onMouseoverFootnote(e));
      footNote.addEventListener("mouseout", (e) => this._onMouseoutFootnote(e));
    });
  }

  _onMouseoverFootnote (e) {
    if (window.innerWidth < 1280) {
      return;
    }

    const target = e.target;
    const text = document.getElementById(target.href.split("#")[1]).innerHTML;
    const top = target.offsetTop;

    this.marginote.innerHTML = text;
    this.marginote.style.top = `${top}px`;
    this.marginote.style.display = "";
    setTimeout(() => {
      this.marginote.classList.add("is-active");
    }, 1);
  }

  _onMouseoutFootnote () {
    this.marginote.classList.remove("is-active");
    setTimeout(() => {
      this.marginote.style.display = "none";
    }, 201);
  }

}

export default Marginotes;
