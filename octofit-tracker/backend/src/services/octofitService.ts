import { Activity, Team, User, Workout } from '../models/index.js';
import { isValidObjectId } from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const data = input as Record<string, unknown>;

  if (!data.userId || !data.teamId || !data.type || data.minutes === undefined) {
    const error = new Error('Missing required fields: userId, teamId, type, minutes');
    Object.assign(error, { status: 400 });
    throw error;
  }

  if (!isValidObjectId(data.userId)) {
    const error = new Error('Invalid userId format');
    Object.assign(error, { status: 400 });
    throw error;
  }

  if (!isValidObjectId(data.teamId)) {
    const error = new Error('Invalid teamId format');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const user = await User.findById(data.userId);
  if (!user) {
    const error = new Error('User not found');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const team = await Team.findById(data.teamId);
  if (!team) {
    const error = new Error('Team not found');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const points = (data.minutes as number);
  const activity = await Activity.create({
    user: data.userId,
    team: data.teamId,
    type: data.type,
    minutes: data.minutes,
    points,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const data = input as Record<string, unknown>;

  if (!data.name || !data.mascot) {
    const error = new Error('Missing required fields: name, mascot');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const members = (data.members as string[]) || [];
  
  for (const memberId of members) {
    if (!isValidObjectId(memberId)) {
      const error = new Error('Invalid member ObjectId format');
      Object.assign(error, { status: 400 });
      throw error;
    }
  }

  const team = await Team.create({
    name: data.name,
    mascot: data.mascot,
    members,
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const teamPoints = await Activity.aggregate([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
    {
      $sort: { totalPoints: -1 },
    },
  ]);

  const leaderboard = [];
  for (let rank = 0; rank < teamPoints.length; rank++) {
    const { _id: teamId, totalPoints } = teamPoints[rank];
    const team = await Team.findById(teamId);
    if (team) {
      leaderboard.push({
        teamName: team.name,
        totalPoints,
        rank: rank + 1,
      });
    }
  }

  return leaderboard;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  
  if (!user) {
    const error = new Error('User not found');
    Object.assign(error, { status: 404 });
    throw error;
  }

  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(10)
    .lean();

  const activityTypes = new Set(recentActivities.map(a => a.type));
  const fitnessGoal = user.fitnessGoal;

  const workouts = await Workout.find().lean();
  const suggestions = [];

  for (const workout of workouts) {
    let reason = '';
    
    if (workout.focus === fitnessGoal) {
      reason = `Matches your fitness goal: ${fitnessGoal}`;
    } else if (activityTypes.has(workout.focus)) {
      reason = `Complements your recent ${Array.from(activityTypes)[0]} activity`;
    }

    if (reason) {
      suggestions.push({
        ...workout,
        reason,
      });
    }
  }

  return suggestions;
}

export { User };
