// ============================================
// SURVEY QUESTIONS CONFIGURATION
// ============================================

import { SurveyQuestion } from '@/types'

export const surveyQuestions: SurveyQuestion[] = [
  // ==================== DEMOGRAPHICS ====================
  {
    id: 'year',
    category: 'demographics',
    text: 'What year are you in?',
    type: 'multiple_choice',
    options: [
      { value: '1st_year', label: '1st Year' },
      { value: '2nd_year', label: '2nd Year' },
      { value: '3rd_year', label: '3rd Year' },
      { value: '4th_year', label: '4th Year' },
      { value: '5th_year', label: '5th Year' },
      { value: 'graduate', label: 'Graduate Studies' },
    ],
    weight: 0.05,
    scoring_method: 'similarity',
    required: true,
  },
  {
    id: 'major',
    category: 'demographics',
    text: 'What is your major/course?',
    type: 'multiple_choice',
    options: [
      { value: 'cs', label: 'Computer Science' },
      { value: 'it', label: 'Information Technology' },
      { value: 'ce', label: 'Computer Engineering' },
      { value: 'ee', label: 'Electrical Engineering' },
      { value: 'me', label: 'Mechanical Engineering' },
      { value: 'ce_civil', label: 'Civil Engineering' },
      { value: 'archi', label: 'Architecture' },
      { value: 'ba', label: 'Business Administration' },
      { value: 'acctg', label: 'Accountancy' },
      { value: 'other', label: 'Other' },
    ],
    weight: 0.05,
    scoring_method: 'similarity',
    required: true,
  },
  {
    id: 'gender',
    category: 'demographics',
    text: 'What is your gender?',
    type: 'multiple_choice',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'non_binary', label: 'Non-binary' },
      { value: 'prefer_not_say', label: 'Prefer not to say' },
    ],
    weight: 0.0,
    scoring_method: 'match',
    required: true,
  },
  {
    id: 'seeking_gender',
    category: 'demographics',
    text: 'Who are you interested in matching with?',
    type: 'multi_select',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'non_binary', label: 'Non-binary' },
    ],
    weight: 0.0,
    scoring_method: 'match',
    required: true,
  },

  // ==================== PERSONALITY ====================
  {
    id: 'personality_introvert',
    category: 'personality',
    text: 'I am more of an introvert than an extrovert',
    type: 'scale',
    options: [
      { value: '1', label: 'Strongly Disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly Agree' },
    ],
    weight: 0.08,
    scoring_method: 'complement',
    required: true,
  },
  {
    id: 'personality_planner',
    category: 'personality',
    text: 'I prefer to plan everything in advance',
    type: 'scale',
    options: [
      { value: '1', label: 'Strongly Disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly Agree' },
    ],
    weight: 0.06,
    scoring_method: 'similarity',
    required: true,
  },
  {
    id: 'personality_social',
    category: 'personality',
    text: 'I enjoy socializing with new people',
    type: 'scale',
    options: [
      { value: '1', label: 'Strongly Disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly Agree' },
    ],
    weight: 0.07,
    scoring_method: 'complement',
    required: true,
  },
  {
    id: 'personality_adventurous',
    category: 'personality',
    text: 'I am adventurous and enjoy trying new things',
    type: 'scale',
    options: [
      { value: '1', label: 'Strongly Disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly Agree' },
    ],
    weight: 0.07,
    scoring_method: 'similarity',
    required: true,
  },

  // ==================== VALUES ====================
  {
    id: 'values_family',
    category: 'values',
    text: 'Family is very important to me',
    type: 'scale',
    options: [
      { value: '1', label: 'Strongly Disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly Agree' },
    ],
    weight: 0.08,
    scoring_method: 'similarity',
    required: true,
  },
  {
    id: 'values_career',
    category: 'values',
    text: 'Career success is my top priority right now',
    type: 'scale',
    options: [
      { value: '1', label: 'Strongly Disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly Agree' },
    ],
    weight: 0.07,
    scoring_method: 'similarity',
    required: true,
  },
  {
    id: 'values_religion',
    category: 'values',
    text: 'Religion/spirituality plays an important role in my life',
    type: 'scale',
    options: [
      { value: '1', label: 'Strongly Disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly Agree' },
    ],
    weight: 0.06,
    scoring_method: 'similarity',
    required: true,
  },
  {
    id: 'values_politics',
    category: 'values',
    text: 'I am interested in politics and social issues',
    type: 'scale',
    options: [
      { value: '1', label: 'Strongly Disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly Agree' },
    ],
    weight: 0.05,
    scoring_method: 'similarity',
    required: true,
  },

  // ==================== LIFESTYLE ====================
  {
    id: 'lifestyle_study_habits',
    category: 'lifestyle',
    text: 'How would you describe your study habits?',
    type: 'multiple_choice',
    options: [
      { value: 'night_owl', label: 'Night Owl - I study late at night' },
      { value: 'early_bird', label: 'Early Bird - I study in the morning' },
      { value: 'last_minute', label: 'Last Minute - I cram before exams' },
      { value: 'consistent', label: 'Consistent - I study regularly' },
    ],
    weight: 0.06,
    scoring_method: 'complement',
    required: true,
  },
  {
    id: 'lifestyle_weekend',
    category: 'lifestyle',
    text: 'What is your ideal weekend?',
    type: 'multiple_choice',
    options: [
      { value: 'party', label: 'Partying and social events' },
      { value: 'chill', label: 'Chilling at home' },
      { value: 'outdoors', label: 'Outdoor activities' },
      { value: 'hobbies', label: 'Pursuing hobbies' },
      { value: 'study', label: 'Studying or side projects' },
    ],
    weight: 0.07,
    scoring_method: 'similarity',
    required: true,
  },
  {
    id: 'lifestyle_cleanliness',
    category: 'lifestyle',
    text: 'I am very particular about cleanliness and organization',
    type: 'scale',
    options: [
      { value: '1', label: 'Strongly Disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly Agree' },
    ],
    weight: 0.05,
    scoring_method: 'similarity',
    required: true,
  },

  // ==================== INTERESTS ====================
  {
    id: 'interests_hobbies',
    category: 'interests',
    text: 'Select your hobbies and interests (select all that apply)',
    type: 'multi_select',
    options: [
      { value: 'gaming', label: '🎮 Gaming' },
      { value: 'music', label: '🎵 Music' },
      { value: 'sports', label: '⚽ Sports' },
      { value: 'reading', label: '📚 Reading' },
      { value: 'movies', label: '🎬 Movies & TV' },
      { value: 'cooking', label: '🍳 Cooking' },
      { value: 'travel', label: '✈️ Travel' },
      { value: 'photography', label: '📸 Photography' },
      { value: 'art', label: '🎨 Art & Design' },
      { value: 'fitness', label: '💪 Fitness' },
      { value: 'tech', label: '💻 Technology' },
      { value: 'anime', label: '🎌 Anime & Manga' },
      { value: 'kpop', label: '🎤 K-Pop' },
      { value: 'fashion', label: '👗 Fashion' },
      { value: 'writing', label: '✍️ Writing' },
    ],
    weight: 0.15,
    scoring_method: 'similarity',
    required: true,
  },
  {
    id: 'interests_music_genre',
    category: 'interests',
    text: 'What music genres do you like? (select all that apply)',
    type: 'multi_select',
    options: [
      { value: 'pop', label: 'Pop' },
      { value: 'rock', label: 'Rock' },
      { value: 'hiphop', label: 'Hip Hop / R&B' },
      { value: 'rnb', label: 'R&B' },
      { value: 'jazz', label: 'Jazz' },
      { value: 'classical', label: 'Classical' },
      { value: 'opm', label: 'OPM' },
      { value: 'kpop', label: 'K-Pop' },
      { value: 'electronic', label: 'Electronic / EDM' },
      { value: 'indie', label: 'Indie' },
    ],
    weight: 0.08,
    scoring_method: 'similarity',
    required: false,
  },

  // ==================== CRUSH LIST ====================
  {
    id: 'crush_list',
    category: 'demographics',
    text: 'Secretly list up to 5 people you\'re interested in (optional)',
    type: 'crush_list',
    weight: 0.0,
    scoring_method: 'match',
    required: false,
  },
]

// Get questions by category
export function getQuestionsByCategory(category: SurveyQuestion['category']): SurveyQuestion[] {
  return surveyQuestions.filter(q => q.category === category)
}

// Get question by ID
export function getQuestionById(id: string): SurveyQuestion | undefined {
  return surveyQuestions.find(q => q.id === id)
}

// Calculate total progress
export function calculateProgress(completedQuestions: number): number {
  return Math.round((completedQuestions / surveyQuestions.length) * 100)
}
