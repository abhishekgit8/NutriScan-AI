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
    <div className="flex flex-wrap gap-1.5">
      {ingredients.map((ingredient, i) => (
        <span
          key={i}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          {ingredient.trim()}
        </span>
      ))}
    </div>
  );
}
