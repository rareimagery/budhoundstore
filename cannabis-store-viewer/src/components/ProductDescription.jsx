/**
 * ProductDescription
 *
 * Renders the Leafly strain description with an attribution link.
 * Used as an expandable row inside the StorePage product table.
 */
export default function ProductDescription({ description, leaflyUrl }) {
  if (!description) return null;

  return (
    <div className="product-description">
      <p className="product-description__text">{description}</p>
      {leaflyUrl && (
        <a
          className="product-description__source"
          href={leaflyUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Leafly ↗
        </a>
      )}
    </div>
  );
}
