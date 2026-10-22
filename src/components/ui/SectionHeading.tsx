import { RichText } from './RichText';

type Props = {
  id: string;
  text: string;
  as?: 'h1' | 'h2';
  size?: 'h1' | 'h2' | 'final';
  className?: string;
};

/** Section heading with `*emphasis*` support. `data-reveal` is inert until M2. */
export function SectionHeading({ id, text, as = 'h2', size = 'h2', className = '' }: Props) {
  const Tag = as;
  const cls = size === 'h1' ? 't-h1' : size === 'final' ? 't-h2-final' : 't-h2';
  return (
    <Tag id={id} className={`${cls} ${className}`.trim()} data-reveal="words">
      <RichText text={text} />
    </Tag>
  );
}
