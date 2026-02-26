import ProductCard from "./ProductCard";

export default function ProductGrid({ products, emptyMessage, columns = 4 }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-muted text-lg">
          {emptyMessage || "No products found."}
        </p>
      </div>
    );
  }

  const gridClasses = {
    2: "grid grid-cols-2 gap-4",
    3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
    4: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6",
  };

  return (
    <div className={gridClasses[columns] || gridClasses[4]}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
