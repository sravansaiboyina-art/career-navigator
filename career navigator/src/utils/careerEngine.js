import { store } from '../store.js';
import { CAREER_ROADMAPS, mapClassToStage } from '../data/roadmapData.js';

/**
 * Returns practical, stage-appropriate actions from the same roadmap source used
 * by the Roadmap page, so dashboard actions and progress counts stay in sync.
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

  const roadmap = CAREER_ROADMAPS[career.id];
  const stageId = mapClassToStage(String(profile.class || '11'));
  const stageData = roadmap?.stages?.[stageId];
  if (!stageData) return fallback;

  const progress = store.getProgress();
  const completedIds = new Set(progress.completedMilestones || []);
  const milestones = stageData.milestones || [];
  const incomplete = milestones.filter(milestone => !completedIds.has(milestone.id));

  return {
    title: stageData.focus || 'Focus on your current education stage',
    actions: (incomplete.length ? incomplete : milestones).slice(0, 3).map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      priority: milestone.priority || 'medium',
      weeks: milestone.weeks,
      completed: completedIds.has(milestone.id)
    }))
  };
}
