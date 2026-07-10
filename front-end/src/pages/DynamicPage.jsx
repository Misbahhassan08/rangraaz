import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ProductItem from "../components/Productitem";
import URLS from "../urls";
import SizeDrawer from "./SizeDrawer";
import { HeartPlus } from "lucide-react";
import productStore from "../store/Productstore";

const DynamicPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeFilter = searchParams.get("filter");

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const favorites = productStore((state) => state.favorites);
  const toggleFavorite = productStore((state) => state.toggleFavorite);

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
    if (activeFilter && block.block_type !== "products") {
      return null;
    }
    const overlayPosition = getOverlayPosition(settings.overlay_position);
    const overlayTone = settings.overlay_tone || "dark";
    const mediaFit = settings.media_fit || "cover";
    const textColor = settings.text_color || "#ffffff";


    // ─── SLIDER ───
    if (block.block_type === "slider") {
      const content = (
        <div className="max-w-3xl" style={{ color: textColor }}>
          <p className="mb-4 text-xs font-light uppercase tracking-[0.28em] opacity-80">Rang Raaz</p>
          <h2 className="text-4xl font-semibold leading-none md:text-7xl">{block.title}</h2>
          {block.subtitle && (
            <p className="mt-5 max-w-xl font-light leading-8 opacity-85">{block.subtitle}</p>
          )}
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
          {overlayTone !== "none" && (
            <div className={`absolute inset-0 ${overlayTone === "light" ? "bg-white/35" : "bg-black/50"}`} />
          )}
          <div className="relative z-10 flex min-h-[inherit] px-6 py-14 md:px-14" style={overlayPosition}>
            {block.link ? <a href={block.link}>{content}</a> : content}
          </div>
        </section>
      );
    }

    // ─── CAMPAIGN ───
    if (block.block_type === "campaign") {
      return (
        <section key={block.id} className="px-4 py-10 md:px-8">
          <div
            className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] bg-black shadow-[var(--shadow-soft)]"
            style={{ minHeight: `${block.height || 520}px` }}
          >
            {block.video_url ? (
              <video src={block.video_url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full" style={{ objectFit: mediaFit }} />
            ) : block.image_url ? (
              <img src={block.image_url} alt={block.title} className="absolute inset-0 h-full w-full" style={{ objectFit: mediaFit }} />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-white/60">Campaign media</div>
            )}
            {overlayTone !== "none" && (
              <div className={`absolute inset-0 ${overlayTone === "light" ? "bg-white/45" : "bg-black/50"}`} />
            )}
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

    // ─── PRODUCTS ───
    if (block.block_type === "products") {
      const layout = settings.layout || "editorial";
      const columns = Number(settings.columns || 4);
      const gridStyle = layout === "carousel" ? undefined : {
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      };
      const aspectClass = settings.aspect === "wide" ? "aspect-[4/3]"
        : settings.aspect === "square" ? "aspect-square" : "aspect-[3/4]";
      const allProducts = block.products || [];

      // Sub-subcategories 
      const subSubOptions = [
        ...new Map(
          allProducts
            .filter((p) => p.sub_subcategory_id && p.sub_subcategory !== "N/A")
            .map((p) => [p.sub_subcategory_id, {
              id: p.sub_subcategory_id,
              name: p.sub_subcategory
            }])
        ).values(),
      ];

      const products = activeFilter
        ? allProducts.filter((p) => String(p.sub_subcategory_id) === String(activeFilter))
        : allProducts;

      return (

        <>


          <section key={block.id} className="mx-auto max-w-[1440px] px-4 py-12 md:px-8">

            {/* Heading */}
            {!activeFilter && (
              <div className={layout === "spotlight" ? "mb-8 text-left" : "mb-8 text-center"}>
                <p className="mb-3 text-xs font-light uppercase tracking-[0.26em] text-[var(--brand-pink)]">
                  Shop the edit
                </p>
                <h2 className="text-4xl font-semibold text-[var(--text-main)]">
                  {block.title || "Featured Products"}
                </h2>
                {block.subtitle && (
                  <p className="mx-auto mt-3 max-w-2xl text-[var(--text-muted)]">{block.subtitle}</p>
                )}
              </div>
            )}

            {subSubOptions.length > 0 && (
              <div className="mb-10 flex flex-wrap justify-center gap-3">

                {/* All button */}
                <button
                  onClick={() => navigate(`/page/${slug}`)}
                  className={`relative rounded-full px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${!activeFilter
                    ? "bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white shadow-lg shadow-purple-300 scale-105"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-purple-400 hover:text-purple-500 hover:shadow-md"
                    }`}
                >
                  All
                </button>

                {/* Sub-subcategory buttons */}
                {subSubOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => navigate(`/page/${slug}?filter=${option.id}`)}
                    className={` cursor-pointer relative rounded-full px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeFilter === String(option.id)
                      ? "bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white shadow-lg shadow-purple-300 scale-105"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-purple-400 hover:text-purple-500 hover:shadow-md"
                      }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            )}

            {/* Products */}
            <div
              className={layout === "carousel" ? "flex gap-5 overflow-x-auto pb-3" : "grid gap-x-5 gap-y-12"}
              style={gridStyle}
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`relative group ${layout === "carousel" ? "w-64 shrink-0"
                      : layout === "spotlight" && index === 0 ? "md:col-span-2 md:row-span-2"
                        : ""
                    }`}
                >
                  <button
                    onClick={() => toggleFavorite(product)}
                    className="absolute right-4 top-4 z-10 rounded-full bg-[var(--surface-card)] p-2 opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100"
                  >
                    <HeartPlus
                      className={`${favorites.some((f) => f.id === product.id) ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                      size={18}
                    />
                  </button>
                  <ProductItem
                    {...product}
                    title={product.product_name}
                    originalPrice={product.original_price}
                    sellPrice={product.sell_price}
                    isSaleOn={product.is_sale_on}
                    size_stocks={product.size_stocks}
                  />
                </div>
              ))}

              {products.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-[var(--text-muted)]">
                  No products found.
                </p>
              )}
            </div>
          </section>



        </>

      );
    }
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