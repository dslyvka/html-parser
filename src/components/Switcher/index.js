import styles from './styles.module.scss'

export const Switcher = ({ toggleShowHtml, showHtml }) => {
    return (<label className={styles.switch}>
        <input type="checkbox" onChange={toggleShowHtml} checked={showHtml} />
        <span className={styles.slider}></span>
    </label>)
}