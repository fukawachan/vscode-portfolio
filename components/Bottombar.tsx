import { Frame } from '@react95/core';
import {
  VscBell,
  VscCheck,
  VscError,
  VscWarning,
  VscSourceControl,
} from 'react-icons/vsc';

import styles from '@/styles/Bottombar.module.css';

const Bottombar = () => {
  return (
    <Frame
      as="footer"
      className={styles.bottomBar}
      backgroundColor="$material"
      boxShadow="$out"
      padding="$2"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <div className={styles.group}>
        <Frame
          as="a"
          href="https://github.com/itsnitinr/vscode-portfolio"
          target="_blank"
          rel="noreferrer noopener"
          className={styles.section}
          display="flex"
          alignItems="center"
          gap="$2"
          paddingX="$2"
          paddingY="$1"
          boxShadow="$in"
        >
          <VscSourceControl className={styles.icon} />
          <p>main</p>
        </Frame>
        <Frame
          className={styles.section}
          display="flex"
          alignItems="center"
          gap="$1"
          paddingX="$2"
          paddingY="$1"
          boxShadow="$in"
        >
          <VscError className={styles.icon} />
          <p className={styles.errorText}>0</p>
          <VscWarning className={styles.icon} />
          <p className={styles.warningText}>0</p>
        </Frame>
      </div>
      <div className={styles.group}>
        <Frame
          className={styles.section}
          display="flex"
          alignItems="center"
          gap="$2"
          paddingX="$2"
          paddingY="$1"
          boxShadow="$in"
        >
          <VscCheck className={styles.icon} />
          <p>Prettier</p>
        </Frame>
        <Frame
          className={styles.section}
          display="flex"
          alignItems="center"
          paddingX="$2"
          paddingY="$1"
          boxShadow="$in"
          aria-label="Notifications"
        >
          <VscBell />
        </Frame>
      </div>
    </Frame>
  );
};

export default Bottombar;
