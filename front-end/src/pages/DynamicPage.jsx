import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductItem from "../components/Productitem";
import URLS from "../urls";

const DynamicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(URLS.pageBySlug(slug))
      .then((res) => res.json())
      .then((data) => setPage(data.page || null))
      .catch((err) => console.error("Error fetching page:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-[var(--text-muted)]">
        Loading page...
      </div>
    );
  }

  if (!page) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <h1 className="font-display text-4xl text-[var(--text-main)]">Page not found</h1>
          <p className="mt-3 text-[var(--text-muted)]">This page is not published or does not exist.</p>
        </div>
      </div>
    );
  }

  const renderBlock = (block) => {
    if (block.block_type === "slider") {
      return (
        <section
          key={block.id}
          className="relative overflow-hidden"
          style={{ minHeight: `${block.height || 520}px` }}
        >
          {block.image_url && (
            <img src={block.image_url} alt={block.title} className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
          <div className="relative z-10 flex min-h-[inherit] items-end px-6 py-14 md:px-14">
            <div className="max-w-3xl text-white">
              <p className="mb-4 text-xs font-light uppercase tracking-[0.28em] text-white/80">Rang Raaz</p>
              <h2 className="font-display text-4xl font-medium leading-none md:text-7xl">{block.title}</h2>
              {block.subtitle && <p className="mt-5 max-w-xl font-light leading-8 text-white/80">{block.subtitle}</p>}
            </div>
          </div>
        </section>
      );
    }

    if (block.block_type === "campaign") {
      return (
        <section key={block.id} className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface-card)] shadow-[var(--shadow-soft)] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative bg-black" style={{ minHeight: `${block.height || 460}px` }}>
              {block.video_url ? (
                <video src={block.video_url} controls className="h-full w-full object-cover" />
              ) : block.image_url ? (
                <img src={block.image_url} alt={block.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-white/60">Campaign media</div>
              )}
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="mb-4 text-xs font-light uppercase tracking-[0.26em] text-[var(--brand-pink)]">Campaign</p>
              <h2 className="font-display text-4xl font-medium text-[var(--text-main)] md:text-5xl">{block.title}</h2>
              {block.subtitle && <p className="mt-5 font-light leading-8 text-[var(--text-muted)]">{block.subtitle}</p>}
            </div>
          </div>
        </section>
      );
    }

    return (
      <section key={block.id} className="mx-auto max-w-[1440px] px-4 py-12 md:px-8">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-light uppercase tracking-[0.26em] text-[var(--brand-pink)]">Shop the edit</p>
          <h2 className="font-display text-4xl font-medium text-[var(--text-main)]">{block.title || "Featured Products"}</h2>
          {block.subtitle && <p className="mx-auto mt-3 max-w-2xl text-[var(--text-muted)]">{block.subtitle}</p>}
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {(block.products || []).map((product) => (
            <ProductItem
              key={product.id}
              {...product}
              title={product.product_name}
              originalPrice={product.original_price}
              sellPrice={product.sell_price}
              isSaleOn={product.is_sale_on}
              size_stocks={product.size_stocks}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <main>
      {(page.blocks || []).map(renderBlock)}
    </main>
  );
};

export default DynamicPage;
