import { forwardRef, useCallback, useState } from 'react';

import { InputText } from 'components/InputText';

import styles from './index.module.css';

type Key = string;
type Keys = string[];

export interface InputTextDropdownProps {
    onInput: (value: string) => Keys;
    renderRowContent: (key: Key) => string | JSX.Element | JSX.Element[];
    onRowSelect: (key: string) => void;
    placeholder?: string;
}

export const InputTextDropdown = forwardRef((
    { onInput, placeholder, renderRowContent, onRowSelect }: InputTextDropdownProps,
    ref,
) => {
    const [keys, setKeys] = useState<string[]>([]);

    const onInputLocal = useCallback((value: string) => {
        setKeys(onInput(value));
    }, [onInput]);

    const selectKey = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        setKeys([]);

        const el = event.target as HTMLDivElement;

        onRowSelect(el.dataset.key!);
    }, [onRowSelect]);

    const renderDropdown = useCallback(() => {
        if (!keys.length) {
            return null;
        }

        return (
            <div className={styles.Dropdown} onClick={selectKey}>
                {keys.map((key) => (
                    <div
                        key={key}
                        data-key={key}
                        className={styles.DropdownRow}
                    >{renderRowContent(key)}</div>
                ))}
            </div>
        );
    }, [
        keys,
        renderRowContent,
        selectKey,
    ]);

    return <div className={styles.Container}>
        <InputText
            ref={ref}
            onInput={onInputLocal}
            placeholder={placeholder}
        />
        {renderDropdown()}
    </div>;
});
