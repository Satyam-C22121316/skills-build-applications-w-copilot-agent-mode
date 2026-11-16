import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = {
  type: string;
  minutes: number;
  points: number;
};

type ApiResponse = {
  activities: Activity[];
};

export default function Activities() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getJson<ApiResponse>('/api/activities');
        setActivities(data.activities);
      } catch (err) {
        setError('Unable to load activities');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        {loading && <p role="status">Loading...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && activities.length === 0 && <p>No activities found.</p>}
        {!loading && !error && activities.length > 0 && (
          <ul className="list-group">
            {activities.map((activity, idx) => (
              <li key={idx} className="list-group-item">
                <strong>{activity.type}</strong> - {activity.minutes} minutes, {activity.points} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
