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
    const settings = block.settings || {};
    const overlayPosition = getOverlayPosition(settings.overlay_position);
    const overlayTone = settings.overlay_tone || "dark";
    const mediaFit = settings.media_fit || "cover";
    const textColor = settings.text_color || "#ffffff";

    if (block.block_type === "slider") {
      const content = (
        <div className="max-w-3xl" style={{ color: textColor }}>
          <p className="mb-4 text-xs font-light uppercase tracking-[0.28em] opacity-80">Rang Raaz</p>
          <h2 className="text-4xl font-semibold leading-none md:text-7xl">{block.title}</h2>
          {block.subtitle && <p className="mt-5 max-w-xl font-light leading-8 opacity-85">{block.subtitle}</p>}
          {settings.button_label && (
            <span className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-xl">
              {settings.button_label}
            </span>
          )}
        </div>
      );

      return (
        <section key={block.id} className="relative overflow-hidden" style={{ minHeight: `${block.height || 520}px` }}>
          {block.image_url && (
            <img src={block.image_url} alt={block.title} className="absolute inset-0 h-full w-full" style={{ objectFit: mediaFit }} />
          )}
          {overlayTone !== "none" && <div className={`absolute inset-0 ${overlayTone === "light" ? "bg-white/35" : "bg-black/50"}`} />}
          <div className="relative z-10 flex min-h-[inherit] px-6 py-14 md:px-14" style={overlayPosition}>
            {block.link ? <a href={block.link}>{content}</a> : content}
          </div>
        </section>
      );
    }

    if (block.block_type === "campaign") {
      return (
        <section key={block.id} className="px-4 py-10 md:px-8">
          <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] bg-black shadow-[var(--shadow-soft)]" style={{ minHeight: `${block.height || 520}px` }}>
            {block.video_url ? (
              <video src={block.video_url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full" style={{ objectFit: mediaFit }} />
            ) : block.image_url ? (
              <img src={block.image_url} alt={block.title} className="absolute inset-0 h-full w-full" style={{ objectFit: mediaFit }} />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-white/60">Campaign media</div>
            )}
            {overlayTone !== "none" && <div className={`absolute inset-0 ${overlayTone === "light" ? "bg-white/45" : "bg-black/50"}`} />}
            <div className="relative z-10 flex min-h-[inherit] p-7 md:p-14" style={overlayPosition}>
              <div className="max-w-3xl" style={{ color: textColor, textAlign: settings.text_align || overlayPosition.textAlign }}>
                <p className="mb-4 text-xs font-light uppercase tracking-[0.26em] opacity-75">Campaign</p>
                <h2 className="text-4xl font-semibold md:text-6xl">{block.title}</h2>
                {block.subtitle && <p className="mt-5 font-light leading-8 opacity-85">{block.subtitle}</p>}
                {settings.button_label && (
                  <a href={block.link || "#"} className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-xl">
                    {settings.button_label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    const layout = settings.layout || "editorial";
    const columns = Number(settings.columns || 4);
    const gridStyle = layout === "carousel" ? undefined : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };
    const aspectClass = settings.aspect === "wide" ? "aspect-[4/3]" : settings.aspect === "square" ? "aspect-square" : "aspect-[3/4]";
    const products = block.products || [];

    return (
      <section key={block.id} className="mx-auto max-w-[1440px] px-4 py-12 md:px-8">
        <div className={layout === "spotlight" ? "mb-8 text-left" : "mb-8 text-center"}>
          <p className="mb-3 text-xs font-light uppercase tracking-[0.26em] text-[var(--brand-pink)]">Shop the edit</p>
          <h2 className="text-4xl font-semibold text-[var(--text-main)]">{block.title || "Featured Products"}</h2>
          {block.subtitle && <p className="mx-auto mt-3 max-w-2xl text-[var(--text-muted)]">{block.subtitle}</p>}
        </div>
        <div className={layout === "carousel" ? "flex gap-5 overflow-x-auto pb-3" : "grid gap-x-5 gap-y-12"} style={gridStyle}>
          {products.map((product, index) => (
            <div key={product.id} className={layout === "carousel" ? "w-64 shrink-0" : layout === "spotlight" && index === 0 ? "md:col-span-2 md:row-span-2" : ""}>
              {layout === "grid" || layout === "carousel" || layout === "spotlight" ? (
                <ProductItem
                  {...product}
                  title={product.product_name}
                  originalPrice={product.original_price}
                  sellPrice={product.sell_price}
                  isSaleOn={product.is_sale_on}
                  size_stocks={product.size_stocks}
                />
              ) : (
                <article className="group">
                  <img src={product.image_url || "/img/logo2.png"} alt={product.product_name} className={`${aspectClass} w-full rounded-2xl object-cover transition duration-500 group-hover:scale-[1.02]`} />
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--brand-pink)]">{product.vendor}</p>
                  <h3 className="mt-1 text-base font-semibold text-[var(--text-main)]">{product.product_name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">$ {product.sell_price}</p>
                </article>
              )}
            </div>
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

const getOverlayPosition = (position = "left-bottom") => {
  const [x, y] = position.includes("-") ? position.split("-") : ["center", "center"];
  return {
    justifyContent: y === "top" ? "flex-start" : y === "bottom" ? "flex-end" : "center",
    alignItems: x === "left" ? "flex-start" : x === "right" ? "flex-end" : "center",
    textAlign: x === "left" ? "left" : x === "right" ? "right" : "center",
  };
};

export default DynamicPage;
