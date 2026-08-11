import { SafeAreaView } from 'react-native';
import { ResultCard } from '@/features/results/components/ResultCard';

export default function Results() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-50 p-4">
      <ResultCard
        result={{
          id: '1',
          match: { id: 'm1', team1: 'Raja', team2: 'Wydad', kickoffAt: new Date() },
          prediction: 'team1',
          actualResult: 'team1',
          pointsAwarded: 3,
          outcome: 'correct',
        }}
      />
    </SafeAreaView>
  );
}
