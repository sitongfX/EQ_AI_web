export interface EQDimension {
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const eqDimensions: Record<string, EQDimension> = {
  selfAwareness: {
    name: 'Self-Awareness',
    description: 'Recognize your emotions and understand how they affect your thoughts and behavior.',
    color: '#F59E0B',
    icon: 'Brain',
  },
  selfManagement: {
    name: 'Self-Management',
    description: 'Control impulsive feelings and adapt to changing circumstances effectively.',
    color: '#10B981',
    icon: 'Sliders',
  },
  socialAwareness: {
    name: 'Social Awareness',
    description: 'Understand the emotions, needs, and concerns of other people around you.',
    color: '#EC4899',
    icon: 'Eye',
  },
  relationshipManagement: {
    name: 'Relationship Skills',
    description: 'Build strong relationships, communicate clearly, and manage conflict constructively.',
    color: '#8B5CF6',
    icon: 'Users',
  },
};

export const categoryInfo: Record<string, { name: string; fullName: string; icon: string; color: string }> = {
  workplace: {
    name: 'Work',
    fullName: 'Workplace',
    icon: 'Briefcase',
    color: '#6366F1',
  },
  personal: {
    name: 'Personal',
    fullName: 'Personal',
    icon: 'Heart',
    color: '#EC4899',
  },
  advanced: {
    name: 'Advanced',
    fullName: 'Advanced',
    icon: 'Star',
    color: '#F59E0B',
  },
};

export const difficultyInfo: Record<string, { name: string; color: string }> = {
  beginner: {
    name: 'Beginner',
    color: '#10B981',
  },
  intermediate: {
    name: 'Intermediate',
    color: '#F59E0B',
  },
  advanced: {
    name: 'Advanced',
    color: '#EF4444',
  },
};

