import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchStore, fetchProductsForStore, PRODUCT_TYPE_LABELS } from "../api";
import AddToCartButton from "./AddToCartButton";
import ProductDescription from "./ProductDescription";

export default function StorePage() {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setActiveCategory("all");

    Promise.all([fetchStore(storeId), fetchProductsForStore(storeId)])
      .then(([s, prods]) => {
        setStore(s);
        setProducts(prods);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [storeId]);

  const categories = useMemo(() => {
    const types = [...new Set(products.map((p) => p.type))];
    types.sort((a, b) => {
      const la = PRODUCT_TYPE_LABELS[a] || a;
      const lb = PRODUCT_TYPE_LABELS[b] || b;
      return la.localeCompare(lb);
    });
    return types;
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.type === activeCategory);
  }, [products, activeCategory]);

  if (loading) return <div className="page"><p>Loading store...</p></div>;
  if (error) return <div className="page error">Error: {error}</div>;
  if (!store) return <div className="page">Store not found. <Link to="/">Back to directory</Link></div>;

  const { name, address } = store.attributes;

  return (
    <div className="page">
      <Link to="/" className="back-link">&larr; All Stores</Link>

      <div className="store-header">
        <h1>{name}</h1>
        <p className="address">
          {address.address_line1}
          {address.address_line2 && `, ${address.address_line2}`}
          {" "}&mdash;{" "}
          {address.locality}, {address.administrative_area} {address.postal_code}
        </p>
      </div>

      <div className="menu-section">
        <h2>Product Menu <span className="product-count">({products.length} items)</span></h2>

        {categories.length > 1 && (
          <div className="category-tabs">
            <button
              className={`tab ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.type === cat).length;
              return (
                <button
                  key={cat}
                  className={`tab ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {PRODUCT_TYPE_LABELS[cat] || cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="empty">No products in this category.</p>
        ) : (
          <div className="product-table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th className="img-col"></th>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th className="price-col">Price</th>
                  <th className="atc-col"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isExpanded = expandedId === p.id;
                  return (
                    <>
                      <tr key={p.id}>
                        <td className="img-col">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="product-thumb"
                              loading="lazy"
                            />
                          ) : (
                            <div className="product-thumb product-thumb--placeholder" aria-hidden="true" />
                          )}
                        </td>
                        <td className="product-name">
                          <Link
                            className="product-name-btn"
                            to={`/store/${storeId}/product/${p.id}`}
                            state={{ product: p }}
                          >
                            {p.title}
                          </Link>
                          {p.onSale && <span className="sale-badge">Sale</span>}
                          {p.description && (
                            <button
                              className={`desc-toggle${isExpanded ? " desc-toggle--open" : ""}`}
                              onClick={() => setExpandedId(isExpanded ? null : p.id)}
                              aria-label={isExpanded ? "Hide description" : "Show description"}
                            >
                              {isExpanded ? "▲" : "▼"}
                            </button>
                          )}
                        </td>
                        <td>{p.brand || "\u2014"}</td>
                        <td><span className="category-badge">{p.typeLabel}</span></td>
                        <td className="price-col">
                          {p.onSale && p.salePrice !== null ? (
                            <>
                              <span className="price-original">${p.price?.toFixed(2)}</span>
                              <span className="price-sale">${p.salePrice.toFixed(2)}</span>
                            </>
                          ) : (
                            p.price !== null ? `$${p.price.toFixed(2)}` : "\u2014"
                          )}
                        </td>
                        <td className="atc-col">
                          <AddToCartButton
                            variationUuid={p.firstVariationUuid}
                            variationType={p.firstVariationType}
                          />
                        </td>
                      </tr>
                      {isExpanded && p.description && (
                        <tr key={`${p.id}-desc`} className="desc-row">
                          <td colSpan={6}>
                            <ProductDescription
                              description={p.description}
                              leaflyUrl={p.leaflyUrl}
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
