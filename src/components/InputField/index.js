import { useState } from 'react';
import { Button } from '@/components/Button';

import styles from "./styles.module.scss"

export const InputField = ({ index, updateImageSrc, restoreOriginalSrc, originalImageSrcs, imageUrls }) => {

    const [tempSrc, setTempSrc] = useState('');

    const handleInputChange = (e) => {
        setTempSrc(e.target.value);
    };

    const handleApplyChange = () => {
        updateImageSrc(index, tempSrc);
    };

    const handleRestoreOriginal = () => {
        restoreOriginalSrc(index);
    };

    return (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <div className={styles.textInputWrapper}>
                <input className={styles.textInput} type="text" placeholder={`Image ${index + 1} URL`} onChange={handleInputChange} />
            </div>

            <Button onClick={handleApplyChange} disabled={!tempSrc || originalImageSrcs[index].src !== imageUrls[index]}>Change</Button>
            <Button onClick={handleRestoreOriginal} disabled={!tempSrc || originalImageSrcs[index].src === imageUrls[index]}>Return</Button>
        </div>
    );
};
