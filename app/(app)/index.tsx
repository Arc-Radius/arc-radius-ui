import { useRouter } from 'expo-router';

import { HomeScreen } from '../../components/HomeScreen';

export default function Home() {
  const router = useRouter();

  return (
    <HomeScreen
      onNavigateToState={(abbr) =>
        router.push({
          pathname: '/state/[state]',
          params: { state: abbr },
        })
      }
    />
  );
}
