import React from 'react';
import { useAppState } from '../AppContext';
import Leaderboard from '../components/Leaderboard';

const LeaderboardPage: React.FC = () => {
  const {
    state,
    language,
    accounts,
    currentAccount,
    setCurrentTab
  } = useAppState();

  return (
    <Leaderboard
      accounts={accounts}
      state={state}
      currentAccount={currentAccount}
      language={language}
      setCurrentTab={(tab) => setCurrentTab(tab)}
    />
  );
};

export default LeaderboardPage;
