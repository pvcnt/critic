import styles from "./Footer.module.scss";

interface FooterProps {
  commit: string | undefined;
}

export default function Footer({ commit }: FooterProps) {
  return (
    <footer className={styles.footer}>
      Mergeable @{" "}
      {commit ? (
        <a href={`https://github.com/pvcnt/critic/commit/${commit}`}>
          {commit.substring(0, 7)}
        </a>
      ) : (
        "devel"
      )}
    </footer>
  );
}
