interface Props {
  ingredients: string[];
}

export default function IngredientsList({ ingredients }: Props) {
  if (!ingredients.length) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        No ingredients data available.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map((ingredient, i) => (
        <span
          key={i}
          className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-sm"
        >
          {ingredient.trim()}
        </span>
      ))}
    </div>
  );
}
