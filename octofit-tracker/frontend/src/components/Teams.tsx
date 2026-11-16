import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = {
  name: string;
  mascot: string;
  members: string[];
};

type ApiResponse = {
  teams: Team[];
};

export default function Teams() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getJson<ApiResponse>('/api/teams');
        setTeams(data.teams);
      } catch (err) {
        setError('Unable to load teams');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        {loading && <p role="status">Loading...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && teams.length === 0 && <p>No teams found.</p>}
        {!loading && !error && teams.length > 0 && (
          <ul className="list-group">
            {teams.map((team, idx) => (
              <li key={idx} className="list-group-item">
                <strong>{team.name}</strong> ({team.mascot}) - {team.members.length} member{team.members.length !== 1 ? 's' : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
