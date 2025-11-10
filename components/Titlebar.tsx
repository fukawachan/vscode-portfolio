import Image from 'next/image';
import { TitleBar } from '@react95/core';

import styles from '@/styles/Titlebar.module.css';

const menuItems = ['File', 'Edit', 'View', 'Go', 'Run', 'Terminal', 'Help'];

const Titlebar = () => {
  const iconContent = (
    <div className={styles.leading}>
      <Image
        src="/logos/vscode_icon.svg"
        alt="VSCode Icon"
        height={18}
        width={18}
        className={styles.icon}
      />
      <nav className={styles.items} aria-label="VS Code menu">
        {menuItems.map((item) => (
          <button key={item} type="button" className={styles.menuButton}>
            {item}
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <TitleBar
      as="header"
      icon={iconContent}
      title="Nitin Ranganath - Visual Studio Code"
      className={styles.titlebar}
    >
      <div className={styles.controls}>
        <TitleBar.OptionsBox className={styles.windowButtons}>
          <TitleBar.Minimize aria-label="Minimize window" />
          <TitleBar.Maximize aria-label="Maximize window" />
          <TitleBar.Close aria-label="Close window" />
        </TitleBar.OptionsBox>
      </div>
    </TitleBar>
  );
};

export default Titlebar;
