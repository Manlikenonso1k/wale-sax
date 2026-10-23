'use client';

import { useRef, useSyncExternalStore, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react';
import { springs, fadeOff } from '@/lib/motion-tokens';
import { useMotionEnabled } from '@/lib/motion-preference';
import { getOverlay } from '@/lib/overlay-store';
import { site } from '@/content/site';
import { Icon } from '@/components/ui/Icon';

const PHONE = '(max-width: 639.98px)';
function subscribeMq(cb: () => void) {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
export const useIsPhone = () =>
  useSyncExternalStore(subscribeMq, () => window.matchMedia(PHONE).matches, () => false);

/** Velocity projection (§9.7): where a throw would come to rest (deceleration 0.99/ms). */
export const project = (offset: number, velocityPxPerS: number) => offset + (velocityPxPerS / 1000) * (0.99 / (1 - 0.99));

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** 'console': centred panel on desktop, bottom sheet on phones. 'sheet': always a bottom sheet. */
  mode?: 'console' | 'sheet';
  children: ReactNode;
  className?: string;
  /** Called instead of returning focus to the trigger (e.g. the Mobile Sheet scrolls to a section). */
  onClosed?: () => boolean | void;
};

/**
 * Shared modal surface for the consoles and the Mobile Sheet (§9.1):
 * Radix Dialog (focus trap, Esc, inert background, scroll lock) + Motion.
 * Materialises from its trigger (scale 0.96→1 from the trigger's position) and exits the same way;
 * phones get a bottom sheet with 1:1 drag-to-dismiss and velocity projection. Motion off: 150ms fade.
 */
export function ModalShell({ open, onClose, title, description, mode = 'console', children, className = '', onClosed }: Props) {
  const motionOn = useMotionEnabled() !== false;
  const isPhone = useIsPhone();
  const sheet = mode === 'sheet' || isPhone;
  const drag = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);

  // Grow from the trigger: transform-origin relative to the centred panel.
  const rect = getOverlay().originRect;
  const origin =
    rect && typeof window !== 'undefined'
      ? `calc(50% + ${Math.round(rect.left + rect.width / 2 - window.innerWidth / 2)}px) calc(50% + ${Math.round(
          rect.top + rect.height / 2 - window.innerHeight / 2,
        )}px)`
      : '50% 50%';

  const panelMotion = !motionOn
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: fadeOff }
    : sheet
      ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: springs.sheet }
      : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96 }, transition: springs.ui };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const h = panelRef.current?.offsetHeight ?? 400;
    if (project(info.offset.y, info.velocity.y) > h * 0.5) onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="modal__scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={motionOn ? { duration: 0.25 } : fadeOff}
              />
            </Dialog.Overlay>
            <div className={`modal__frame ${sheet ? 'modal__frame--sheet' : ''}`}>
              <Dialog.Content
                asChild
                forceMount
                {...(description ? {} : { 'aria-describedby': undefined })}
                onOpenAutoFocus={(e) => {
                  e.preventDefault();
                  const first =
                    panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ??
                    panelRef.current?.querySelector<HTMLElement>('input, a[href], button:not(.modal__close)');
                  first?.focus({ preventScroll: true });
                }}
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                  if (onClosed?.()) return;
                  getOverlay().trigger?.focus({ preventScroll: true });
                }}
              >
                <motion.div
                  ref={panelRef}
                  className={`modal__panel ${sheet ? 'modal__panel--sheet' : ''} ${className}`.trim()}
                  style={{ transformOrigin: sheet ? '50% 100%' : origin }}
                  {...panelMotion}
                  drag={sheet ? 'y' : false}
                  dragControls={drag}
                  dragListener={mode === 'sheet'}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.06, bottom: 1 }}
                  dragSnapToOrigin
                  dragTransition={{ bounceStiffness: 500, bounceDamping: 40 }}
                  onDragEnd={onDragEnd}
                >
                  {sheet && (
                    <div className="modal__grab" onPointerDown={(e) => drag.start(e)} aria-hidden="true">
                      <span className="modal__handle" />
                    </div>
                  )}
                  <header className="modal__head" onPointerDown={sheet ? (e) => drag.start(e) : undefined}>
                    <Dialog.Title className="modal__title">{title}</Dialog.Title>
                    {description ? (
                      <Dialog.Description className="modal__subtitle">{description}</Dialog.Description>
                    ) : null}
                  </header>
                  <Dialog.Close className="modal__close press" aria-label={site.ui.close}>
                    <Icon name="close" size={20} />
                  </Dialog.Close>
                  <div className="modal__body" data-lenis-prevent>
                    {children}
                  </div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
