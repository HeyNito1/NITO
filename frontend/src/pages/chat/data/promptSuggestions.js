
const promptSuggestions = [
  // Technology
  ["Understanding RAG", "Explain retrieval-augmented generation and when I should use it."],
  ["Explore Artificial Intelligence", "Explain the latest developments in artificial intelligence."],
  ["Learn React", "Help me create a roadmap for learning React."],
  ["Understand Blockchain", "Explain blockchain technology in simple terms."],
  ["Explore AI Agents", "Explain how AI agents work with practical examples."],

  // Health and fitness
  ["7-day Workout Routine", "Help me put together a beginner-friendly 7-day workout routine."],
  ["Healthy Meal Plan", "Create a balanced and nutritious weekly meal plan."],
  ["Improve Sleep Quality", "Suggest practical ways to improve my sleep quality."],
  ["Build Healthy Habits", "Help me develop sustainable healthy daily habits."],
  ["Plan a Fitness Routine", "Help me design a personalised fitness routine."],

  // Productivity
  ["Plan Your Day", "Help me organise my day to be more productive."],
  ["Improve Time Management", "Suggest effective time management techniques."],
  ["Build a Study Schedule", "Help me create an effective study schedule."],
  ["Set Weekly Goals", "Help me set realistic and achievable weekly goals."],
  ["Overcome Procrastination", "Suggest practical strategies to overcome procrastination."],

  // Business
  ["Generate Startup Ideas", "Suggest innovative startup ideas and explain their potential."],
  ["Create a Business Plan", "Help me structure a business plan for a new startup."],
  ["Explore Marketing Strategies", "Suggest effective digital marketing strategies."],
  ["Improve Your Resume", "Help me improve my resume for job applications."],
  ["Prepare for an Interview", "Help me prepare for a professional job interview."],

  // Creativity
  ["Write a Short Story", "Help me write an interesting and creative short story."],
  ["Generate Content Ideas", "Suggest creative content ideas for social media."],
  ["Write a Professional Email", "Help me draft a clear and professional email."],
  ["Brainstorm New Ideas", "Help me brainstorm creative ideas for a personal project."],
  ["Improve Your Writing", "Suggest practical ways to improve my writing skills."],

  // General knowledge
  ["Learn Something New", "Teach me an interesting concept that I might not know."],
  ["Understand Space Exploration", "Explain recent developments in space exploration."],
  ["Explore World History", "Tell me about an important historical event."],
  ["Understand Personal Finance", "Explain the basics of personal finance and budgeting."],
  ["Learn a New Skill", "Help me create a 30-day plan for learning a new skill."],
];

function getRandomSuggestions(count = 3) {
  const shuffled = [...promptSuggestions];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

export const pageSuggestions = getRandomSuggestions(3);
