import { useState } from 'react';
import { Tabs } from '@mantine/core';
import { TableReviews } from '@/components/Competiton/Competiton';
import { CreateCompetition } from '@/components/Competiton/CreateCompetiton';
import { NavbarSimple } from '@/components/Navbar/NavBar';

type TabValue = 'table-reviews' | 'create-competition';

export function HomePage() {
  const [activeTab, setActiveTab] = useState<TabValue>('table-reviews');

  const handleTabChange = (value: string | null) => {
    if (value) {
      setActiveTab(value as TabValue);
    }
  };

  const handleNavChange = (value: TabValue) => {
    setActiveTab(value);
  };

  return (
    <div style={{ display: 'flex' }}>
      <NavbarSimple activeTab={activeTab} onTabChange={handleNavChange} />
      <div style={{ flex: 1, padding: '20px' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="table-reviews">Table Reviews</Tabs.Tab>
            <Tabs.Tab value="create-competition">Create Competition</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="table-reviews">
            <TableReviews />
          </Tabs.Panel>

          <Tabs.Panel value="create-competition">
            <CreateCompetition />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}
