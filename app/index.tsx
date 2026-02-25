// app/index.tsx
import { useRouter } from 'expo-router';
import { HomeScreen } from '../components/HomeScreen';

export default function Home() {
  const router = useRouter();

  return <HomeScreen onNavigateToDashboard={(abbr) => router.push(`/dashboard/${abbr}`)} />;
}
