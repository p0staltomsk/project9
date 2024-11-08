import React, { useState } from 'react'
import { Brain, Cpu, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'
import { Metrics } from '../types'

interface AIMetricsProps {
  metrics: Metrics;
}

export const AIMetrics: React.FC<AIMetricsProps> = ({ metrics }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mt-2 pt-2 border-t border-green-500/30">
      <div className="flex items-center space-x-4 text-sm">
        {/* AI Detection Score */}
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className={`${metrics.is_ai_generated ? 'text-red-400' : 'text-green-400'}`}>
            {metrics.is_ai_generated ? 'AI Generated' : 'Human-like'}
          </span>
        </div>

        {/* Human Likeness Score */}
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300">
            {metrics.human_likeness_score}% Human
          </span>
        </div>

        {/* Advanced Metrics Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-1 text-green-400 hover:text-green-300"
          onClick={() => setShowDetails(!showDetails)}
        >
          <Terminal className="w-4 h-4" />
          <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
        </motion.button>
      </div>

      {/* Detailed Metrics */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 grid grid-cols-3 gap-2 text-xs"
        >
          {metrics.metrics?.text_coherence_complexity && (
            <div className="p-2 rounded bg-black/30 border border-green-500/20">
              <div className="text-green-400 mb-1">Coherence</div>
              <div className="text-green-300">
                {(metrics.metrics.text_coherence_complexity.sentence_coherence * 100).toFixed(1)}%
              </div>
            </div>
          )}

          {metrics.metrics?.readability_metrics && (
            <div className="p-2 rounded bg-black/30 border border-green-500/20">
              <div className="text-green-400 mb-1">Readability</div>
              <div className="text-green-300">
                {(metrics.metrics.readability_metrics.flesch_score * 100).toFixed(1)}%
              </div>
            </div>
          )}

          {metrics.metrics?.vocabulary_lexical_diversity && (
            <div className="p-2 rounded bg-black/30 border border-green-500/20">
              <div className="text-green-400 mb-1">Vocabulary</div>
              <div className="text-green-300">
                {(metrics.metrics.vocabulary_lexical_diversity.lexical_diversity * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
