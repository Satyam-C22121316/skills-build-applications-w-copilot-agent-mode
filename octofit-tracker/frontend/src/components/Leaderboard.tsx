import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

type ApiResponse = {
  leaderboard: LeaderboardEntry[];
};

export default function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getJson<ApiResponse>('/api/leaderboard');
        setLeaderboard(data.leaderboard);
      } catch (err) {
        setError('Unable to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        {loading && <p role="status">Loading...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && leaderboard.length === 0 && <p>No leaderboard rankings available.</p>}
        {!loading && !error && leaderboard.length > 0 && (
          <ul className="list-group">
            {leaderboard.map((entry) => (
              <li key={entry.rank} className="list-group-item">
                <strong>#{entry.rank}</strong> - {entry.teamName}: {entry.totalPoints} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
