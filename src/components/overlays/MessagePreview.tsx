import { HudFrame } from '@/components/ui/HudFrame';

/** “Your message”: the exact text that will be sent. aria-live off so it does not chatter (§9.2). */
export function MessagePreview({ title, text, id }: { title: string; text: string; id: string }) {
  return (
    <HudFrame leg={14} className="preview">
      <p className="preview__title" id={id}>
        {title}
      </p>
      <p className="preview__text" aria-live="off" aria-labelledby={id}>
        {text}
      </p>
    </HudFrame>
  );
}
