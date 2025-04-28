import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      Critic is an <a href="https://github.com/pvcnt/critic">open source</a>{" "}
      software.
    </footer>
  );
}
