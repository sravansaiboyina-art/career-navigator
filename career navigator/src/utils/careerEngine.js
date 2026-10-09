import { store } from '../store.js';

/**
 * Returns practical, stage-appropriate actions for the student's selected career.
 * Roadmap content remains the source of truth; this helper only selects the
 * current stage's incomplete milestones.
 */
export function getCurrentStageAdvice(profile, career) {
  const fallback = {
    title: 'Start by exploring your interests',
    actions: [
      { title: 'Explore different career areas', priority: 'medium' },
      { title: 'Build strong academic fundamentals', priority: 'high' },
      { title: 'Choose a career goal when you feel ready', priority: 'medium' }
    ]
  };

  if (!profile || !career) return fallback;

  const stage = String(profile.class || '');
  const stageData = career.stages?.[stage];

  if (!stageData) {
    return {
      title: 'Explore the next step in your journey',
      actions: [
        { title: 'Review the full career roadmap', priority: 'high' },
        { title: 'Check the education and skills needed for this career', priority: 'medium' },
        { title: 'Explore relevant exams and opportunities', priority: 'medium' }
      ]
    };
  }

  const progress = store.getProgress();
  const completedIds = new Set(progress.completedMilestones || []);
  const milestones = stageData.milestones || [];
  const incomplete = milestones.filter(m => !completedIds.has(m.id));

  return {
    title: stageData.focus || 'Focus on your current education stage',
    actions: (incomplete.length ? incomplete : milestones).slice(0, 3).map(m => ({
      id: m.id,
      title: m.title,
      priority: m.priority || 'medium',
      weeks: m.weeks,
      completed: completedIds.has(m.id)
    }))
  };
}
