function PagePlaceholder({ eyebrow, title, description }) {
  return (
    <section className="dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>
      </div>
    </section>
  );
}

export default PagePlaceholder;