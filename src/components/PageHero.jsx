import './PageHero.css';

export default function PageHero({ image, title, description, className = '', children }) {
  return (
    <section className={`page-hero${className ? ` ${className}` : ''}`} aria-label={title}>
      <img className="page-hero-image" src={image} alt="" />
      <div className="page-hero-shade" />
      <div className="page-hero-content">
        <div className="page-hero-copy">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children && <div className="page-hero-aside">{children}</div>}
      </div>
    </section>
  );
}
