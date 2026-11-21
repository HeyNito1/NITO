export const researchIndexPath = "/discover/research-index";
export const introduction =
  "Exploring the frontiers of artificial intelligence, from advanced models and reasoning to autonomous agents and intelligent systems.";
export const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo sed nulla consequat tincidunt. Curabitur feugiat, sapien at posuere gravida, neque augue facilisis magna.";
export const shortCopy =
  "Blah Blah Blah and also Blah Blah Blah Blah and also Blah Blah Blah Blah and also Blah Blah Blah Blah also Blah Blah Blah Blah.";
export const longCopy = `${shortCopy}${shortCopy} ${shortCopy} lah Blah Blah Blah and also Blah Blah Blah Blah and also Blah Blah Blah Blah also Blah Blah Blah`;
export const programNames = [
  "Character Generation",
  "Software Development",
  "Marketing",
  "Content Creation",
  "Advertising Campaigns",
  "Business Growth",
  "Marketing",
  "Content Creation",
  "Character Generation",
  "Software Development",
  "Marketing",
  "Content Creation",
];
export const indexCards = [1, 2, 3, 4, 3, 4, 1, 2, 1, 2, 3].map(
  (image, index) => ({
    id: `research-${index + 1}`,
    image: `index-${image}`,
    title: "text",
    description: shortCopy,
  }),
);
