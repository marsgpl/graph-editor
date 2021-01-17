import { useMemo } from 'react';

import styles from './index.module.css';

export interface ButtonProps {
    theme: string;
    size: string;
    children: string | JSX.Element | JSX.Element[];
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    classNames?: string[];
    attributes?: Record<string, any>;
}

export function Button({
    classNames,
    theme,
    size,
    children,
    onClick,
    attributes,
}: ButtonProps) {
    const classList = useMemo(() => {
        const classList = [styles.Button];

        if (classNames) {
            classList.push(...classNames);
        }

        classList.push(styles[`Theme_${theme}`]);
        classList.push(styles[`Size_${size}`]);

        return classList;
    }, [classNames, theme, size]);

    return <button
        className={classList.join(' ')}
        onClick={onClick}
        {...attributes}
    >{children}</button>;
}
