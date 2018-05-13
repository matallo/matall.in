class Marginotes {
  constructor(options) {
    if (options.container === undefined) {
      throw new Error('container option is required');
    }

    this.container = options.container;
    this.marginote = this.container.querySelector('.js-Marginote');
  }

  init() {
    this.initEvents();
  }

  initEvents() {
    const footNotes = this.container.querySelectorAll('.js-Footnote');

    footNotes.forEach((footNote) => {
      footNote.addEventListener('mouseover', event => this.onMouseoverFootnote(event));
      footNote.addEventListener('mouseout', event => this.onMouseoutFootnote(event));
    });
  }

  onMouseoverFootnote(event) {
    const { target } = event;
    const text = document.getElementById(target.href.split('#')[1]).innerHTML;
    const top = target.offsetTop;

    this.marginote.innerHTML = text;
    this.marginote.style.top = `${top}px`;
    this.marginote.style.display = '';

    setTimeout(() => {
      this.marginote.classList.add('is-active');
    }, 1);
  }

  onMouseoutFootnote() {
    this.marginote.classList.remove('is-active');

    setTimeout(() => {
      this.marginote.style.display = 'none';
    }, 201);
  }
}

export default Marginotes;
