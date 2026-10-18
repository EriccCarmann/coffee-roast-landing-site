import T from '../language/T.jsx';

export default function Footer() {
  return (
    <section id="vb-w5c" className="vb-w5c" aria-label="Подвал сайта">
      <div className="vb-w5c__inner">
        <div>
          <p className="vb-w5c__brand"><T k="footer.brand" /></p>
          <p className="vb-w5c__text"><T k="footer.text" /></p>
        </div>
        <div>
          <p className="vb-w5c__contacts"><T k="footer.contacts" /></p>
        </div>
      </div>
    </section>
  );
}
