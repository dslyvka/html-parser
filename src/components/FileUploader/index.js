import styles from "./styles.module.scss"

export const FileUploader = ({ onHtmlChange, innerRef }) => {
    return (
        <input
            ref={innerRef}
            type="file"
            accept=".html"
            onChange={onHtmlChange}
            className={styles.input} 
        />
    );
}