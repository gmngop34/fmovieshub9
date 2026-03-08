interface Category {
  id: string;
  label: string;
}

interface CategoryFilterProps {
  categories: Category[];
  active: string;
  onChange: (id: string) => void;
}

export function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map((cat, idx) => (
        <button
          key={cat.id}
          type="button"
          data-ocid={`home.category_tab.${idx + 1}`}
          className={`category-pill ${active === cat.id ? "active" : ""}`}
          onClick={() => onChange(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
