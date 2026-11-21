import { useState } from "react";
import { useSearchParams } from "react-router";
import { indexCards } from "../mocks/researchData";

export function useResearchFilters() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = params.get("q") || "";
  const order = params.get("order") || "default";
  const visible = indexCards.filter((card) =>
    `${card.title} ${card.description}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  if (order === "reverse") visible.reverse();
  function update(key, value) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  return {
    visible,
    filtersOpen,
    setFiltersOpen,
    query,
    order,
    update,
    reset: () => setParams({}),
  };
}
