import { useCallback, useMemo, useRef } from 'react';

import styles from './index.module.css';

export interface PopupProps {
    title: string;
    body: string | JSX.Element | JSX.Element[];
    isVisible: boolean;
    setVisibility: Function;
    maxWidth?: number;
    marginTop?: number;
}

export function Popup({
    title,
    body,
    isVisible,
    setVisibility,
    maxWidth,
    marginTop,
}: PopupProps) {
    const refShadow = useRef<HTMLDivElement>(null);
    const refCloseButton = useRef<HTMLButtonElement>(null);

    const hide = useCallback(({ target }: React.MouseEvent<HTMLElement>) => {
        if (target === refShadow.current || target === refCloseButton.current) {
            setVisibility(false);
        }
    }, [setVisibility]);

    const windowCss = useMemo(() => {
        const windowCss: React.CSSProperties = {};

        if (maxWidth !== undefined) {
            windowCss.maxWidth = maxWidth + 'px';
        }

        if (marginTop !== undefined) {
            windowCss.marginTop = marginTop + 'px';
        }

        return windowCss;
    }, [maxWidth, marginTop]);

    if (!isVisible) {
        return null;
    }

    return (
        <div ref={refShadow} className={styles.Shadow} onClick={hide}>
            <div className={styles.Window} style={windowCss}>
                <h1 className={styles.WindowTitle}>{title}</h1>
                <button
                    ref={refCloseButton}
                    className={styles.WindowClose}
                    onClick={hide}
                />
                <div className={styles.WindowBody}>{body}</div>
            </div>
        </div>
    );
}
