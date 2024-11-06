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
      // Replace with your API endpoint
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
