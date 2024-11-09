import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Metrics } from '../types'

interface AIMetricsProps {
  metrics: Metrics
}

export const AIMetrics: React.FC<AIMetricsProps> = ({ metrics }) => {
  const [showDetails, setShowDetails] = useState(false)

  const formatPercent = (value: number) => `${(value).toFixed(1)}%`
  const formatScore = (value: number) => value.toFixed(2)

  // Определяем, похож ли текст на человеческий
  const isHumanLike = metrics.human_likeness_score > 50
  const aiScore = 100 - metrics.human_likeness_score

  // Базовые метрики всегда видны
  const baseMetrics = (
    <div className="flex space-x-4 text-sm">
      <div className="flex items-center">
        {isHumanLike ? (
          <span className="text-cyan-400">👤 Human-Like: {formatPercent(metrics.human_likeness_score)}</span>
        ) : (
          <span className="text-cyan-400">🤖 AI Score: {formatPercent(aiScore)}</span>
        )}
      </div>
      <div className="flex items-center">
        <span className="text-purple-400">🧠 Coherence: {formatScore(metrics.metrics?.text_coherence_complexity?.sentence_coherence || 0)}</span>
      </div>
    </div>
  )

  // Расширенные метрики показываются по клику
  const detailedMetrics = showDetails && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mt-2 grid grid-cols-2 gap-4 text-xs"
    >
      <div className="space-y-1">
        <div className="text-green-400">
          📖 Readability:
          <div className="ml-2">
            • Flesch: {formatScore(metrics.metrics?.readability_metrics?.flesch_score || 0)}
            • Words/Sent: {formatScore(metrics.metrics?.readability_metrics?.avg_words_per_sentence || 0)}
          </div>
        </div>

        <div className="text-blue-400">
          🎯 Vocabulary:
          <div className="ml-2">
            • Unique Words: {formatPercent(metrics.metrics?.vocabulary_lexical_diversity?.unique_word_ratio || 0)}
            • Diversity: {formatPercent(metrics.metrics?.vocabulary_lexical_diversity?.lexical_diversity || 0)}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-orange-400">
          💡 Sentiment:
          <div className="ml-2">
            • Type: {metrics.metrics?.sentiment_subjectivity?.sentiment_label || 'neutral'}
            • Score: {formatScore(metrics.metrics?.sentiment_subjectivity?.sentiment_score || 0)}
          </div>
        </div>

        <div className="text-red-400">
          🎭 Style:
          <div className="ml-2">
            • Formality: {formatPercent(metrics.metrics?.stylistic_features?.formality || 0)}
            • Complexity: {formatScore(metrics.metrics?.text_coherence_complexity?.complexity_score || 0)}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="mt-2 p-2 bg-black bg-opacity-50 rounded border border-green-500/30">
      <div className="flex justify-between items-center">
        {baseMetrics}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-green-400 hover:text-green-300"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      {detailedMetrics}
    </div>
  )
}
