import Marginotes from '../../../app/_js/components/marginotes';

describe('Marginotes', () => {
  let view;

  beforeEach(() => {
    document.body.innerHTML = `<div class='js-Marginotes'>
      <div class='js-Marginote'></div>
      <article>
        <p>We asked for holidays at work <a href="#fn:1" id="fnref:1" class="Footnote js-Footnote">1</a></p>

        <ol>
          <li id="fn:1" class="Footnotes-item js-Footnotes-item">Note for future self: buying plane tickets with a bar public wifi may not be the safest Internet practice. <a href="#fnref:1" class="Footnote-return">↩</a></li>
        </ol>
      </article>
    </div>`;

    view = new Marginotes({
      container: document.querySelector('.js-Marginotes'),
    });
  });

  test('initializes correctly', () => {
    expect(view.container).toBeDefined();
  });
});
