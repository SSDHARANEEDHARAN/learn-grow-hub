import { useRewardPoints } from '@/hooks/useRewardPoints';
import { Award, TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardPointsDisplayProps {
  variant?: 'compact' | 'full';
}

const RewardPointsDisplay = ({ variant = 'compact' }: RewardPointsDisplayProps) => {
  const { totalPoints, pointsHistory, isLoading } = useRewardPoints();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-secondary h-8 w-24" />
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div 
        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20"
        whileHover={{ scale: 1.05 }}
      >
        <Zap className="w-4 h-4 text-primary" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={totalPoints}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="font-bold text-primary"
          >
            {totalPoints.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        <span className="text-xs text-muted-foreground">pts</span>
      </motion.div>
    );
  }

  return (
    <div className="border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Reward Points</h3>
        <Award className="w-5 h-5 text-primary" />
      </div>

      <div className="flex items-end gap-2">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={totalPoints}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display font-bold text-4xl text-primary"
          >
            {totalPoints.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        <span className="text-muted-foreground mb-1">points</span>
      </div>

      {pointsHistory.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Recent Activity
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pointsHistory.slice(0, 5).map((entry) => (
              <div 
                key={entry.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground truncate flex-1">
                  {entry.description || entry.source}
                </span>
                <span className="font-medium text-primary ml-2">
                  +{entry.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardPointsDisplay;
