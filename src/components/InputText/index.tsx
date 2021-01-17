import { forwardRef, useCallback, useState } from 'react';

import styles from './index.module.css';

export interface InputTextProps {
    initialValue?: string;
    placeholder?: string;
    disabled?: true;
    onInput?: (value: string) => void;
}

export const InputText = forwardRef((
    { initialValue, placeholder, disabled, onInput }: InputTextProps,
    ref,
) => {
    const [value, setValue] = useState<string>(initialValue || '');

    const onLocalInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        onInput && onInput(event.target.value);
    }, [onInput]);

    return <input
        ref={ref as React.MutableRefObject<HTMLInputElement>}
        placeholder={placeholder}
        type="text"
        className={styles.Input}
        value={value}
        onInput={onLocalInput}
        disabled={Boolean(disabled)}
    />;
});
