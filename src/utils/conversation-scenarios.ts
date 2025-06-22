export interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  context: string;
  sampleQuestions: string[];
}

export const conversationScenarios: ConversationScenario[] = [
  {
    id: 'restaurant',
    title: 'At the Restaurant',
    description: 'Practice ordering food and making reservations at a restaurant',
    difficulty: 'Beginner',
    context: 'You are at a restaurant. Practice common phrases and vocabulary related to ordering food, asking about menu items, and making reservations.',
    sampleQuestions: [
      'Can I make a reservation for tonight?',
      'What are today\'s specials?',
      'Could you recommend a dish?',
      'Can I get the check, please?'
    ]
  },
  {
    id: 'shopping',
    title: 'Shopping',
    description: 'Practice shopping-related conversations',
    difficulty: 'Beginner',
    context: 'You are at a shopping mall. Practice asking about prices, sizes, colors, and making purchases.',
    sampleQuestions: [
      'Do you have this in a different size?',
      'How much does this cost?',
      'Can I try this on?',
      'Is this on sale?'
    ]
  },
  {
    id: 'interview',
    title: 'Job Interview',
    description: 'Practice common job interview questions and responses',
    difficulty: 'Intermediate',
    context: 'You are in a job interview. Practice answering common interview questions and discussing your qualifications.',
    sampleQuestions: [
      'Tell me about yourself',
      'Why are you interested in this position?',
      'What are your strengths and weaknesses?',
      'Where do you see yourself in 5 years?'
    ]
  },
  {
    id: 'business',
    title: 'Business Meeting',
    description: 'Practice business-related discussions and negotiations',
    difficulty: 'Advanced',
    context: 'You are in a business meeting. Practice discussing projects, making presentations, and negotiating deals.',
    sampleQuestions: [
      'Could you walk us through your proposal?',
      'What are the projected outcomes?',
      'How do you plan to address these challenges?',
      'Can we discuss the budget allocation?'
    ]
  },
  {
    id: 'travel',
    title: 'Travel',
    description: 'Practice travel-related conversations',
    difficulty: 'Beginner',
    context: 'You are planning a trip or already traveling. Practice conversations about booking tickets, asking for directions, and dealing with common travel situations.',
    sampleQuestions: [
      'How do I get to the airport?',
      'Can you recommend any good hotels?',
      'What are the must-see attractions?',
      'Is there a train station nearby?'
    ]
  }
];
