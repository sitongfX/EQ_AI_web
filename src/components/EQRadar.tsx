'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eqDimensions } from '@/data/eq-dimensions';
import { Brain, Sliders, Eye, Users } from 'lucide-react';

interface EQScore {
  dimension: string;
  score: number;
}

const iconMap: Record<string, React.ElementType> = {
  Brain,
  Sliders,
  Eye,
  Users,
};

interface EQRadarProps {
  scores: EQScore[];
  size?: number;
  showLabels?: boolean;
  animated?: boolean;
  hasData?: boolean; // Whether there's actual EQ data (user has sent messages)
}

export function EQRadar({ scores, size = 200, showLabels = true, hasData = true }: EQRadarProps) {
  // Always show scores starting at 50, not 0
  const [animatedScores, setAnimatedScores] = useState(scores.map(() => 50));

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedScores(scores.map(s => s.score));
    }, 100);
    return () => clearTimeout(timeout);
  }, [scores]);

  const centerX = size / 2;
  const radius = size / 2 * 0.85;

  const getPoint = (index: number, value: number) => {
    const angle = (2 * Math.PI * index) / scores.length - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerX + Math.sin(angle) * distance,
    };
  };

  const polygonPoints = animatedScores
    .map((score, index) => {
      const point = getPoint(index, score);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={centerX}
            r={radius * scale}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-200"
          />
        ))}

        {/* Axis lines */}
        {scores.map((_, index) => {
          const point = getPoint(index, 100);
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerX}
              x2={point.x}
              y2={point.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-200"
            />
          );
        })}

        {/* Score polygon - always show */}
        <motion.polygon
          points={polygonPoints}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="#6366F1"
          strokeWidth="2.5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Score points - always show */}
        {animatedScores.map((score, index) => {
          const point = getPoint(index, score);
          const color = eqDimensions[scores[index].dimension].color;
          return (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={6}
              fill={color}
              stroke="white"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="drop-shadow-md"
            />
          );
        })}
      </svg>

      {showLabels && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {scores.map((score, index) => {
            const dimension = eqDimensions[score.dimension];
            const IconComponent = iconMap[dimension.icon];
            return (
              <motion.div
                key={score.dimension}
                className="flex items-center gap-2 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${dimension.color}20` }}
                >
                  {IconComponent && (
                    <IconComponent className="w-4 h-4" style={{ color: dimension.color }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-500 truncate">{dimension.name}</div>
                  <motion.div
                    className="text-sm font-semibold"
                    style={{ color: dimension.color }}
                    key={animatedScores[index]}
                  >
                    {Math.round(animatedScores[index])}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const shortNames: Record<string, string> = {
  selfAwareness: 'Aware',
  selfManagement: 'Manage',
  socialAwareness: 'Empathy',
  relationshipManagement: 'Relate',
};

interface CompactEQRadarProps {
  scores: EQScore[];
  hasData?: boolean;
  size?: number; // For mobile responsiveness
}

export function CompactEQRadar({ scores, hasData = true, size = 100 }: CompactEQRadarProps) {
  const isSmall = size <= 70;
  const isMedium = size > 70 && size <= 90;
  
  return (
    <div className={`flex items-center ${isSmall ? 'gap-2' : isMedium ? 'gap-3' : 'gap-4'}`}>
      <EQRadar scores={scores} size={size} showLabels={false} hasData={hasData} />
      <div className={`flex flex-col ${isSmall ? 'gap-0.5' : isMedium ? 'gap-1' : 'gap-1.5'}`}>
        {scores.map(score => {
          const dimension = eqDimensions[score.dimension];
          const shortName = shortNames[score.dimension] || dimension.name.slice(0, 4);
          return (
            <div 
              key={score.dimension} 
              className={`flex items-center ${
                isSmall ? 'gap-1 text-[9px]' : 
                isMedium ? 'gap-1.5 text-[10px]' : 
                'gap-2 text-xs'
              }`}
            >
              <div
                className={`${
                  isSmall ? 'w-1.5 h-1.5' : 
                  isMedium ? 'w-2 h-2' : 
                  'w-2.5 h-2.5'
                } rounded-full`}
                style={{ backgroundColor: dimension.color }}
              />
              <span className={`text-slate-500 ${
                isSmall ? 'w-10' : 
                isMedium ? 'w-12' : 
                'w-14'
              } font-medium`}>{shortName}</span>
              <span 
                className="font-bold tabular-nums" 
                style={{ color: dimension.color }}
              >
                {Math.round(score.score)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
