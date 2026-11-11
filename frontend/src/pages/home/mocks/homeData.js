const cardDescription =
  "text here";
export const homeData = {
  id: "nito-home",
  categories: [
    { id: "research", label: "Research" },
    { id: "api-platform", label: "API Platform" },
    { id: "creatives", label: "Creatives" },
    { id: "writing", label: "Write with NITO" },
    { id: "advisory", label: "Advisory" },
  ],
  capabilities: [1, 2, 3, 4, 5, 6].map((number) => ({
    id: `capability-${number}`,
    title: "text here",
    description: cardDescription,
    image: `/assets/images/capability-${((number - 1) % 3) + 1}.webp`,
  })),
  useCaseDescription: `${cardDescription} ${cardDescription} ${cardDescription}`,
  audiences: [
    {
      id: "students",
      label: "For Students",
      image: "/assets/images/audience-1.webp",
      category: "advisory",
      prompt: "Help me create a study plan for this week.",
    },
    {
      id: "researchers",
      label: "For Researchers",
      image: "/assets/images/audience-2.webp",
      category: "research",
      prompt: "Help me structure my next research project.",
    },
    {
      id: "student-creatives",
      label: "For Students",
      image: "/assets/images/audience-3.webp",
      category: "creatives",
      prompt: "Help me turn my idea into a creative project.",
    },
  ],
  metrics: [
    { id: "rating", value: "4.9/5.0", label: "Rating" },
    { id: "downloads", value: "50K+", label: "Downloads" },
    { id: "efficiency", value: "37%+", label: "Efficiency" },
  ],
  stories: [
    {
      id: "granny",
      image: "/assets/images/story-1.webp",
      alt: "A bird flying over a roof against clouds",
      caption: "Granny’s sweet cookies now got extra healthier as well!",
    },
    {
      id: "kevin",
      image: "/assets/images/story-2.webp",
      alt: "A person carrying a large wooden frame outdoors",
      caption: "Kevin’s cranky old proff finally approved his reseach paper.",
    },
    {
      id: "guitarist",
      image: "/assets/images/story-3.webp",
      alt: "A guitarist playing outdoors",
      caption:
        "Learnt flirting skills to get that “outta ma league” typa baddie.",
    },
    {
      id: "singer",
      image: "/assets/images/story-4.webp",
      alt: "A singer performing with a microphone",
      caption:
        "Learnt flirting skills to get that “outta ma league” typa baddie.",
    },
  ],
};
