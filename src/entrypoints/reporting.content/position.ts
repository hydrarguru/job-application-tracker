import { useEffect, useState, type CSSProperties, type RefObject } from 'react';

const GAP = 16;

/*
 * beside: to the right of the "Sökta jobb" section, scrolling with the page.
 * inline: inside the section, under its intro text, where the panel is inserted.
 * null: not measured yet.
 */
export type Placement = { mode: 'beside'; style: CSSProperties } | { mode: 'inline' } | null;

/*
 * Places the panel beside `section` when the window has room for it, otherwise inline.
 * `panel` is the panel's own element, used to find what its absolute position is relative to.
 */
export function usePlacement(section: Element, panel: RefObject<HTMLElement | null>, width: number): Placement {
    const [placement, setPlacement] = useState<Placement>(null);

    useEffect(() => {
        let frame = 0;
        let key = '';
        const update = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const rect = section.getBoundingClientRect();
                const fits = rect.right + GAP + width + GAP <= document.documentElement.clientWidth;
                if (!fits || !panel.current) {
                    if (key !== 'inline') setPlacement({ mode: 'inline' });
                    key = 'inline';
                    return;
                }
                const origin = containingBlockOrigin(panel.current);
                const left = Math.round(rect.right + GAP - origin.left);
                const top = Math.round(rect.top - origin.top);
                /* Only re-render when the position actually changed. */
                if (key === `${left},${top}`) return;
                key = `${left},${top}`;
                setPlacement({ mode: 'beside', style: { position: 'absolute', zIndex: 10, left, top, width } });
            });
        };
        update();
        window.addEventListener('resize', update);
        const observer = new ResizeObserver(update);
        observer.observe(section);
        observer.observe(document.body);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', update);
            observer.disconnect();
        };
    }, [section, panel, width]);

    return placement;
}

/*
 * Where (0, 0) is, in viewport coordinates, for an absolutely positioned element: the padding
 * box of its nearest positioned ancestor, or the top of the document when there is none.
 */
function containingBlockOrigin(element: HTMLElement) {
    const parent = element.offsetParent as HTMLElement | null;
    if (!parent || (parent === document.body && getComputedStyle(parent).position === 'static')) {
        return { left: -window.scrollX, top: -window.scrollY };
    }
    const rect = parent.getBoundingClientRect();
    return {
        left: rect.left + parent.clientLeft - parent.scrollLeft,
        top: rect.top + parent.clientTop - parent.scrollTop,
    };
}
