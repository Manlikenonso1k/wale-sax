import { site } from '@/content/site';

export function PullQuote() {
  const q = site.pullQuote;
  return (
    <div className="section pull">
      <div className="container">
        <figure className={`pull__figure ${q.placeholder ? 'is-placeholder' : ''}`.trim()} data-reveal="fade">
          <span className="pull__mark" aria-hidden="true">
            “
          </span>
          <blockquote className="t-pull">
            <p>{q.quote}</p>
          </blockquote>
          <figcaption className="t-caption">{q.caption}</figcaption>
        </figure>
      </div>
    </div>
  );
}
