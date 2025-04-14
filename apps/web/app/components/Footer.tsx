import styles from "./Footer.module.scss";

export interface FooterProps {
  commit?: string;
  ref?: string;
}

export default function Footer({ commit, ref }: FooterProps) {
  return (
    <footer className={styles.footer}>
      Critic @{" "}
      {commit ? (
        <a href={`https://github.com/pvcnt/critic/commit/${commit}`}>
          {ref ?? commit.substring(0, 7)}
        </a>
      ) : (
        "devel"
      )}
    </footer>
  );
}
