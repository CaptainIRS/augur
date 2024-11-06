import {
  IconBellRinging,
  IconLogout,
  IconReceipt2,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { Code, Group } from '@mantine/core';
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './Navbar.module.css';

type TabValue = 'table-reviews' | 'create-competition';

interface NavbarSimpleProps {
  activeTab: TabValue;
  onTabChange: (value: TabValue) => void;
}

const data = [
  { value: 'table-reviews' as TabValue, label: 'Table Reviews', icon: IconBellRinging },
  { value: 'create-competition' as TabValue, label: 'Create Competition', icon: IconReceipt2 },
];

export function NavbarSimple({ activeTab, onTabChange }: NavbarSimpleProps) {
  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.value === activeTab || undefined}
      href="#"
      key={item.label}
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onTabChange(item.value);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          {/* <MantineLogo size={28} /> */}
          <Code fw={700}>v3.1.2</Code>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Change account</span>
        </a>

        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}
