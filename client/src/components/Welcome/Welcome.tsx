import { Anchor, Text, Title } from '@mantine/core';
import classes from './Welcome.module.css';

import { ethers } from "ethers";

export function Welcome() {
  if ((window as any).ethereum) {
    let provider = new ethers.BrowserProvider((window as any).ethereum)
    provider.getSigner().then((signer) => {
      console.log(signer);
    });
  } else {
    console.log("Metamask not installed")
  }
  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
          Mantine
        </Text>
      </Title>
      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
        This starter Vite project includes a minimal setup, if you want to learn more on Mantine +
        Vite integration follow{' '}
        <Anchor href="https://mantine.dev/guides/vite/" size="lg">
          this guide
        </Anchor>
        . To get started edit pages/Home.page.tsx file.
      </Text>
    </>
  );
}
