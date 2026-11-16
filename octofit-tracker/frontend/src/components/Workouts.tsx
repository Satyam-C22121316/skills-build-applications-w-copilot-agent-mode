import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Suggestion = {
  title: string;
  focus: string;
  reason: string;
};

type ApiResponse = {
  suggestions: Suggestion[];
};

export default function Workouts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getJson<ApiResponse>('/api/workouts/suggestions/mona@example.com');
        setSuggestions(data.suggestions);
      } catch (err) {
        setError('Unable to load workout suggestions');
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        {loading && <p role="status">Loading...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && suggestions.length === 0 && <p>No workout suggestions available.</p>}
        {!loading && !error && suggestions.length > 0 && (
          <ul className="list-group">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="list-group-item">
                <strong>{suggestion.title}</strong> ({suggestion.focus}) - {suggestion.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
