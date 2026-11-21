export const asset = (name) => `/assets/research/${name}.svg`;

export const contourImage = (index) =>
  index % 2 === 0 ? "contour-light" : "contour-dark";
