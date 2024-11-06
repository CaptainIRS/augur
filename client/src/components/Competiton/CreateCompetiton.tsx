import { useState } from 'react';
import {
  Button,
  LoadingOverlay,
  NativeSelect,
  NumberInput,
  rem,
  Stack,
  TextInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';

interface CompetitionData {
  name: string;
  totalReward: string;
  totalRewardCurrency: string;
  rewardThreshold: string;
  rewardThresholdCurrency: string;
  startTime: Date | null;
  roundDuration: Date | null;
  totalRounds: number | '';
}

const currencyData = [
  { value: 'eur', label: '🇪🇺 EUR' },
  { value: 'usd', label: '🇺🇸 USD' },
  { value: 'cad', label: '🇨🇦 CAD' },
  { value: 'gbp', label: '🇬🇧 GBP' },
  { value: 'aud', label: '🇦🇺 AUD' },
];

export function CreateCompetition() {
  const [loading, setLoading] = useState(false);
  const [competitionName, setCompetitionName] = useState('');
  const [totalReward, setTotalReward] = useState('');
  const [totalRewardCurrency, setTotalRewardCurrency] = useState('usd');
  const [rewardThreshold, setRewardThreshold] = useState('');
  const [rewardThresholdCurrency, setRewardThresholdCurrency] = useState('usd');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [roundDuration, setRoundDuration] = useState<Date | null>(null);
  const [totalRounds, setTotalRounds] = useState<number | ''>(1);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation
    if (
      !competitionName ||
      !totalReward ||
      !rewardThreshold ||
      !startTime ||
      !roundDuration ||
      !totalRounds
    ) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all required fields',
        color: 'red',
      });
      return;
    }

    const competitionData: CompetitionData = {
      name: competitionName,
      totalReward,
      totalRewardCurrency,
      rewardThreshold,
      rewardThresholdCurrency,
      startTime,
      roundDuration,
      totalRounds,
    };

    try {
      setLoading(true);

      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(competitionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create competition');
      }

      notifications.show({
        title: 'Success',
        message: 'Competition created successfully',
        color: 'green',
      });

      // Reset form
      setCompetitionName('');
      setTotalReward('');
      setRewardThreshold('');
      setStartTime(null);
      setRoundDuration(null);
      setTotalRounds(1);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create competition',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const currencySelect = (currency: string, setCurrency: (value: string) => void) => (
    <NativeSelect
      data={currencyData}
      value={currency}
      onChange={(event) => setCurrency(event.currentTarget.value)}
      rightSectionWidth={28}
      styles={{
        input: {
          fontWeight: 500,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          width: rem(92),
          marginRight: rem(-2),
        },
      }}
    />
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack p="md" style={{ maxWidth: '500px', position: 'relative' }}>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />

        <TextInput
          label="Competition Name"
          placeholder="Enter competition name"
          value={competitionName}
          onChange={(event) => setCompetitionName(event.currentTarget.value)}
          required
        />

        <TextInput
          type="number"
          placeholder="1000"
          label="Total Reward"
          rightSection={currencySelect(totalRewardCurrency, setTotalRewardCurrency)}
          rightSectionWidth={92}
          value={totalReward}
          onChange={(event) => setTotalReward(event.currentTarget.value)}
          required
        />

        <TextInput
          type="number"
          placeholder="100"
          label="Reward Threshold"
          rightSection={currencySelect(rewardThresholdCurrency, setRewardThresholdCurrency)}
          rightSectionWidth={92}
          value={rewardThreshold}
          onChange={(event) => setRewardThreshold(event.currentTarget.value)}
          required
        />

        <DateTimePicker
          label="Start Time"
          placeholder="Pick start date and time"
          value={startTime}
          onChange={setStartTime}
          required
        />

        <DateTimePicker
          label="Round Duration"
          placeholder="Pick round duration"
          value={roundDuration}
          onChange={setRoundDuration}
          required
        />

        <NumberInput
          label="Total Rounds"
          placeholder="Enter number of rounds"
          min={1}
          value={totalRounds}
          onChange={(value) => setTotalRounds(value as number)}
          required
        />

        <Button type="submit" loading={loading} fullWidth>
          Create Competition
        </Button>
      </Stack>
    </form>
  );
}


/**
 * 
 * import React, { useState } from 'react';
import { ethers } from 'ethers';
import { TextInput, NumberInput, DatePicker, Button, Stack } from '@mantine/core';

const CreateCompetition = ({ contract }) => {
  const [metadata, setMetadata] = useState('');
  const [totalReward, setTotalReward] = useState(0);
  const [rewardThreshold, setRewardThreshold] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [roundDuration, setRoundDuration] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);

  const handleCreateContest = async () => {
    try {
      const tx = await contract.createContest(
        metadata,
        ethers.utils.parseEther(totalReward.toString()),
        rewardThreshold,
        Math.floor(startTime?.getTime() / 1000 || 0),
        roundDuration,
        totalRounds
      );
      await tx.wait();
      console.log('Contest created successfully');
    } catch (error) {
      console.error('Error creating contest:', error);
    }
  };

  return (
    <Stack spacing="xl">
      <TextInput
        label="Metadata"
        value={metadata}
        onChange={(e) => setMetadata(e.target.value)}
      />
      <NumberInput
        label="Total Reward"
        value={totalReward}
        onChange={(value) => setTotalReward(value || 0)}
      />
      <NumberInput
        label="Reward Threshold"
        value={rewardThreshold}
        onChange={(value) => setRewardThreshold(value || 0)}
      />
      <DatePicker
        label="Start Time"
        value={startTime}
        onChange={setStartTime}
      />
      <NumberInput
        label="Round Duration (seconds)"
        value={roundDuration}
        onChange={(value) => setRoundDuration(value || 0)}
      />
      <NumberInput
        label="Total Rounds"
        value={totalRounds}
        onChange={(value) => setTotalRounds(value || 0)}
      />
      <Button onClick={handleCreateContest}>Create Contest</Button>
    </Stack>
  );
};

export default CreateCompetition;
 */