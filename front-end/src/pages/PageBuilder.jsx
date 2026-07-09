import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  FilePlus2,
  ImagePlus,
  Layers3,
  MonitorSmartphone,
  Plus,
  Save,
  Search,
  Trash2,
  Video,
} from "lucide-react";
import LoadingButton from "../components/LoadingButton";
import URLS from "../urls";

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

const emptyPage = {
  title: "",
  slug: "",
  status: "draft",
  meta_description: "",
  show_in_header: true,
  nav_label: "",
  nav_parent: "",
  header_group: "",
  sort_order: 0,
};

const defaultSettings = {
  slider: {
    overlay_position: "left-bottom",
    overlay_tone: "dark",
    text_color: "#ffffff",
    button_label: "Shop now",
    media_fit: "cover",
  },
  campaign: {
    overlay_position: "center",
    overlay_tone: "dark",
    text_color: "#ffffff",
    text_align: "center",
    button_label: "Explore campaign",
    media_fit: "cover",
  },
  products: {
    layout: "grid",
    columns: 4,
    aspect: "portrait",
    show_price: true,
    show_vendor: true,
  },
};

const makeBlock = (block_type) => ({
  uid: uid(),
  block_type,
  title: block_type === "products" ? "Shop the edit" : "",
  subtitle: "",
  height: block_type === "campaign" ? 520 : 680,
  link: "",
  product_ids: [],
  settings: { ...defaultSettings[block_type] },
});

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const PageBuilder = () => {
  const [pages, setPages] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyPage);
  const [blocks, setBlocks] = useState([makeBlock("slider"), makeBlock("products")]);
  const [files, setFiles] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingPages, setLoadingPages] = useState(true);
  const [pageError, setPageError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [activeBlock, setActiveBlock] = useState(null);
  const [headerGroups, setHeaderGroups] = useState([]);

  const pageOptions = useMemo(
    () => pages.filter((page) => page.id !== editingId),
    [pages, editingId]
  );

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.product_name, product.sku, product.vendor, product.category, product.sub_category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [products, productSearch]);

  const fetchPages = async () => {
    setLoadingPages(true);
    setPageError("");
    try {
      const res = await fetch(URLS.pages);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load pages");
      setPages(data.data || []);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoadingPages(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(URLS.fetchProducts);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchHeaderGroups = async () => {
    try {
      const res = await fetch(URLS.headerGroups);
      const data = await res.json();
      setHeaderGroups(data.data || []);
    } catch (err) {
      console.error("Error fetching header groups:", err);
    }
  };

  useEffect(() => {
    fetchPages();
    fetchProducts();
    fetchHeaderGroups();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyPage);
    setBlocks([makeBlock("slider"), makeBlock("products")]);
    setFiles({});
    setActiveBlock(null);
  };

  const editPage = async (page) => {
    setSaving(true);
    try {
      const res = await fetch(URLS.pageDetail(page.id));
      const data = await res.json();
      if (!res.ok || !data.page) throw new Error(data.error || "Unable to load page");
      const detail = data.page;
      setEditingId(detail.id);
      setForm({
        title: detail.title,
        slug: detail.slug,
        status: detail.status,
        meta_description: detail.meta_description || "",
        show_in_header: detail.show_in_header,
        nav_label: detail.nav_label || "",
        nav_parent: detail.nav_parent || "",
        header_group: detail.header_group || "",
        sort_order: detail.sort_order || 0,
      });
      setBlocks(
        (detail.blocks || []).map((block) => ({
          ...block,
          uid: uid(),
          settings: { ...defaultSettings[block.block_type], ...(block.settings || {}) },
        }))
      );
      setFiles({});
      setActiveBlock(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingId ? { slug: slugify(value), nav_label: value } : {}),
    }));
  };

  const updateBlock = (blockUid, key, value) => {
    setBlocks((prev) => prev.map((block) => (block.uid === blockUid ? { ...block, [key]: value } : block)));
  };

  const updateSetting = (blockUid, key, value) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.uid === blockUid
          ? { ...block, settings: { ...(block.settings || {}), [key]: value } }
          : block
      )
    );
  };

  const moveBlock = (index, direction) => {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const toggleProduct = (blockUid, productId) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.uid !== blockUid) return block;
        const existing = block.product_ids || [];
        return {
          ...block,
          product_ids: existing.includes(productId)
            ? existing.filter((id) => id !== productId)
            : [...existing, productId],
        };
      })
    );
  };

  const savePage = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      alert("Page title and slug are required.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("show_in_header", String(form.show_in_header));
      formData.append("blocks", JSON.stringify(blocks));

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const url = editingId ? URLS.pageDetail(editingId) : URLS.pages;
      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Unable to save page");
      await fetchPages();
      setEditingId(data.page.id);
      alert("Page saved successfully.");
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (page) => {
    if (!window.confirm(`Delete ${page.title}?`)) return;
    setSaving(true);
    try {
      await fetch(URLS.pageDetail(page.id), { method: "DELETE" });
      await fetchPages();
      if (editingId === page.id) resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-soft)] p-3 sm:p-5">
      {saving && <div className="api-progress" />}

      <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-pink)]">
            Rang Raaz CMS
          </p>
          <h1 className="text-3xl font-semibold text-[var(--text-main)] sm:text-4xl">Page Studio</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Build shoppable pages with hero sliders, campaign media, and product layouts.
          </p>
        </div>
        <LoadingButton
          onClick={resetForm}
          className="flex items-center gap-2 rounded-2xl bg-[var(--text-main)] px-5 py-3 text-sm font-semibold text-[var(--surface-main)]"
        >
          <FilePlus2 size={16} /> New Page
        </LoadingButton>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="brand-glass rounded-3xl p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text-main)]">Saved Pages</h2>
              <span className="rounded-full bg-[var(--surface-main)] px-3 py-1 text-xs text-[var(--text-muted)]">
                {pages.length}
              </span>
            </div>

            {loadingPages && <p className="rounded-2xl bg-[var(--surface-main)] p-4 text-sm text-[var(--text-muted)]">Loading pages...</p>}
            {pageError && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">{pageError}</p>}
            {!loadingPages && !pageError && pages.length === 0 && (
              <p className="rounded-2xl border border-dashed border-[var(--border-soft)] p-4 text-sm text-[var(--text-muted)]">
                No pages found in the current database.
              </p>
            )}

            <div className="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`rounded-2xl border p-3 transition ${
                    editingId === page.id
                      ? "border-[var(--brand-pink)] bg-[var(--surface-main)]"
                      : "border-[var(--border-soft)] bg-[var(--surface-card)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--text-main)]">{page.title}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">/page/{page.slug}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-pink)]">
                        {page.status} {page.show_in_header ? " / header" : ""}
                      </p>
                    </div>
                    <button onClick={() => deletePage(page)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => editPage(page)} className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--text-main)]">
                      Edit
                    </button>
                    {page.status === "published" && (
                      <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer" className="rounded-xl bg-[var(--brand-purple)] px-3 py-2 text-xs font-semibold text-white">
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <main className="min-w-0 space-y-5">
          <section className="brand-glass rounded-3xl p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <MonitorSmartphone size={18} className="text-[var(--brand-pink)]" />
              <h2 className="text-lg font-semibold text-[var(--text-main)]">Page Settings</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input label="Page title" value={form.title} onChange={(value) => updateForm("title", value)} />
              <Input label="Slug" value={form.slug} onChange={(value) => updateForm("slug", slugify(value))} prefix="/page/" />
              <Input label="Navigation label" value={form.nav_label} onChange={(value) => updateForm("nav_label", value)} />
              <Select label="Status" value={form.status} onChange={(value) => updateForm("status", value)} options={[
                ["draft", "Draft"],
                ["published", "Published"],
              ]} />
              <Select
                label="Header parent"
                value={form.nav_parent || ""}
                onChange={(value) => updateForm("nav_parent", value)}
                options={[["", "Main header tab"], ...pageOptions.map((page) => [page.id, page.nav_label || page.title])]}
              />
              <Select
                label="Header category"
                value={form.header_group || ""}
                onChange={(value) => updateForm("header_group", value)}
                options={[["", "No header category"], ...headerGroups.map((group) => [group.id, group.title])]}
              />
              <Input label="Sort order" type="number" value={form.sort_order} onChange={(value) => updateForm("sort_order", value)} />
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3">
                <input type="checkbox" checked={form.show_in_header} onChange={(e) => updateForm("show_in_header", e.target.checked)} />
                <span className="text-sm font-medium text-[var(--text-main)]">Show in header navigation</span>
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Header menu image</span>
                <input type="file" accept="image/*,.gif" onChange={(e) => setFiles((prev) => ({ ...prev, nav_image: e.target.files[0] }))} className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3" />
              </label>
              <label className="space-y-1 md:col-span-2 xl:col-span-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Meta description</span>
                <textarea value={form.meta_description} onChange={(e) => updateForm("meta_description", e.target.value)} className="min-h-20 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3 outline-none" />
              </label>
            </div>
          </section>

          <section className="brand-glass rounded-3xl p-4 sm:p-5">
            <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand-pink)]">Blocks</p>
                <h2 className="text-2xl font-semibold text-[var(--text-main)]">Layout Builder</h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <AddBlock onClick={() => setBlocks((prev) => [...prev, makeBlock("slider")])} icon={<ImagePlus size={16} />} label="Slider" />
                <AddBlock onClick={() => setBlocks((prev) => [...prev, makeBlock("campaign")])} icon={<Video size={16} />} label="Campaign" />
                <AddBlock onClick={() => setBlocks((prev) => [...prev, makeBlock("products")])} icon={<Layers3 size={16} />} label="Products" />
              </div>
            </div>

            <div className="space-y-4">
              {blocks.map((block, index) => (
                <BlockEditor
                  key={block.uid}
                  block={block}
                  index={index}
                  total={blocks.length}
                  products={filteredProducts}
                  allProducts={products}
                  productSearch={productSearch}
                  setProductSearch={setProductSearch}
                  isOpen={activeBlock === block.uid || activeBlock === null}
                  setActiveBlock={setActiveBlock}
                  updateBlock={updateBlock}
                  updateSetting={updateSetting}
                  toggleProduct={toggleProduct}
                  moveBlock={moveBlock}
                  removeBlock={() => setBlocks((prev) => prev.filter((item) => item.uid !== block.uid))}
                  setFile={(key, file) => setFiles((prev) => ({ ...prev, [`block_${block.uid}_${key}`]: file }))}
                />
              ))}
            </div>
          </section>

          <div className="sticky bottom-4 z-20 flex justify-end">
            <LoadingButton
              onClick={savePage}
              loading={saving}
              loadingText="Saving page..."
              className="btn-brand flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold"
            >
              <Save size={17} /> Save Page
            </LoadingButton>
          </div>
        </main>
      </div>
    </div>
  );
};

const BlockEditor = ({
  block,
  index,
  total,
  products,
  allProducts,
  productSearch,
  setProductSearch,
  isOpen,
  setActiveBlock,
  updateBlock,
  updateSetting,
  toggleProduct,
  moveBlock,
  removeBlock,
  setFile,
}) => {
  const selectedProducts = allProducts.filter((product) => (block.product_ids || []).includes(product.id));

  return (
    <article className="overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-card)]">
      <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-soft)] p-4 lg:flex-row lg:items-center">
        <button onClick={() => setActiveBlock(isOpen ? "closed" : block.uid)} className="flex min-w-0 items-center gap-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--brand-pink)]">
            {block.block_type === "slider" ? <ImagePlus size={18} /> : block.block_type === "campaign" ? <Video size={18} /> : <Layers3 size={18} />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand-pink)]">{block.block_type}</span>
            <span className="block truncate text-lg font-semibold text-[var(--text-main)]">{block.title || "Untitled block"}</span>
          </span>
        </button>
        <div className="flex flex-wrap gap-2">
          <IconButton label="Move up" disabled={index === 0} onClick={() => moveBlock(index, -1)} icon={<ArrowUp size={15} />} />
          <IconButton label="Move down" disabled={index === total - 1} onClick={() => moveBlock(index, 1)} icon={<ArrowDown size={15} />} />
          <IconButton label="Delete" onClick={removeBlock} icon={<Trash2 size={15} />} tone="danger" />
        </div>
      </div>

      {isOpen && (
        <div className="grid gap-5 p-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Block title" value={block.title || ""} onChange={(value) => updateBlock(block.uid, "title", value)} />
              <Input label="Height in px" type="number" value={block.height || 520} onChange={(value) => updateBlock(block.uid, "height", value)} />
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Wrapped text / subtitle</span>
                <textarea value={block.subtitle || ""} onChange={(e) => updateBlock(block.uid, "subtitle", e.target.value)} className="min-h-24 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3 outline-none" />
              </label>
              <Input label="Button or click link" value={block.link || ""} onChange={(value) => updateBlock(block.uid, "link", value)} />
            </div>

            {block.block_type === "slider" && (
              <div className="grid gap-4 md:grid-cols-2">
                <MediaInput label="Slider image or GIF" accept="image/*,.gif" current={block.image_url} onChange={(file) => setFile("image", file)} />
                <Select label="Image fit" value={block.settings?.media_fit || "cover"} onChange={(value) => updateSetting(block.uid, "media_fit", value)} options={[["cover", "Cover"], ["contain", "Contain"]]} />
                <Select label="Text position" value={block.settings?.overlay_position || "left-bottom"} onChange={(value) => updateSetting(block.uid, "overlay_position", value)} options={positionOptions} />
                <Input label="Button label" value={block.settings?.button_label || ""} onChange={(value) => updateSetting(block.uid, "button_label", value)} />
              </div>
            )}

            {block.block_type === "campaign" && (
              <div className="grid gap-4 md:grid-cols-2">
                <MediaInput label="Campaign video" accept="video/*" current={block.video_url} onChange={(file) => setFile("video", file)} />
                <MediaInput label="Campaign image or GIF" accept="image/*,.gif" current={block.image_url} onChange={(file) => setFile("image", file)} />
                <Select label="Overlay position" value={block.settings?.overlay_position || "center"} onChange={(value) => updateSetting(block.uid, "overlay_position", value)} options={positionOptions} />
                <Select label="Text align" value={block.settings?.text_align || "center"} onChange={(value) => updateSetting(block.uid, "text_align", value)} options={[["left", "Left"], ["center", "Center"], ["right", "Right"]]} />
                <Select label="Overlay tone" value={block.settings?.overlay_tone || "dark"} onChange={(value) => updateSetting(block.uid, "overlay_tone", value)} options={[["dark", "Dark"], ["light", "Light"], ["none", "None"]]} />
                <Input label="Button label" value={block.settings?.button_label || ""} onChange={(value) => updateSetting(block.uid, "button_label", value)} />
              </div>
            )}

            {block.block_type === "products" && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Select label="Product layout" value={block.settings?.layout || "grid"} onChange={(value) => updateSetting(block.uid, "layout", value)} options={[
                    ["grid", "Clean grid"],
                    ["editorial", "Editorial"],
                    ["spotlight", "Spotlight"],
                    ["carousel", "Horizontal scroll"],
                  ]} />
                  <Select label="Columns" value={block.settings?.columns || 4} onChange={(value) => updateSetting(block.uid, "columns", Number(value))} options={[[2, "2"], [3, "3"], [4, "4"], [5, "5"]]} />
                  <Select label="Image aspect" value={block.settings?.aspect || "portrait"} onChange={(value) => updateSetting(block.uid, "aspect", value)} options={[["portrait", "Portrait"], ["square", "Square"], ["wide", "Wide"]]} />
                </div>

                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] p-3">
                  <div className="mb-3 flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)] px-3 py-2">
                    <Search size={16} className="text-[var(--text-soft)]" />
                    <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products, SKU, category..." className="w-full bg-transparent text-sm outline-none" />
                  </div>
                  <div className="grid max-h-96 gap-2 overflow-y-auto md:grid-cols-2">
                    {products.map((product) => (
                      <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-[var(--surface-soft)]">
                        <input type="checkbox" checked={(block.product_ids || []).includes(product.id)} onChange={() => toggleProduct(block.uid, product.id)} />
                        <img src={product.image_url || "/img/logo2.png"} alt="" className="h-14 w-11 rounded-lg object-cover" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[var(--text-main)]">{product.product_name}</span>
                          <span className="block truncate text-xs text-[var(--text-soft)]">{product.sku} / {product.category}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-3xl bg-[var(--surface-soft)] p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <Eye size={14} /> Preview
            </p>
            <BlockPreview block={block} products={selectedProducts} />
          </aside>
        </div>
      )}
    </article>
  );
};

const positionOptions = [
  ["left-top", "Left top"],
  ["left-center", "Left center"],
  ["left-bottom", "Left bottom"],
  ["center", "Center"],
  ["right-top", "Right top"],
  ["right-center", "Right center"],
  ["right-bottom", "Right bottom"],
];

const Input = ({ label, value, onChange, type = "text", prefix = "" }) => (
  <label className="space-y-1">
    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
    <div className="flex overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)]">
      {prefix && <span className="grid place-items-center px-3 text-sm text-[var(--text-soft)]">{prefix}</span>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent px-4 py-3 outline-none" />
    </div>
  </label>
);

const Select = ({ label, value, onChange, options }) => (
  <label className="space-y-1">
    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3 outline-none">
      {options.map(([optionValue, labelText]) => (
        <option key={optionValue} value={optionValue}>{labelText}</option>
      ))}
    </select>
  </label>
);

const MediaInput = ({ label, accept, onChange, current }) => (
  <label className="space-y-1">
    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
    {current && <p className="truncate text-xs text-[var(--text-soft)]">Current media saved</p>}
    <input type="file" accept={accept} onChange={(e) => onChange(e.target.files[0])} className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3" />
  </label>
);

const AddBlock = ({ onClick, icon, label }) => (
  <button onClick={onClick} className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3 text-sm font-semibold text-[var(--text-main)] transition hover:border-[var(--brand-pink)] hover:text-[var(--brand-pink)]">
    {icon} {label}
  </button>
);

const IconButton = ({ label, icon, onClick, disabled, tone = "default" }) => (
  <button
    type="button"
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={`rounded-xl border px-3 py-2 text-sm transition disabled:opacity-40 ${
      tone === "danger"
        ? "border-red-100 text-red-500 hover:bg-red-500 hover:text-white"
        : "border-[var(--border-soft)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
    }`}
  >
    {icon}
  </button>
);

const positionStyle = (position = "left-bottom") => {
  const [x, y] = position.includes("-") ? position.split("-") : ["center", "center"];
  return {
    justifyContent: y === "top" ? "flex-start" : y === "bottom" ? "flex-end" : "center",
    alignItems: x === "left" ? "flex-start" : x === "right" ? "flex-end" : "center",
    textAlign: x === "left" ? "left" : x === "right" ? "right" : "center",
  };
};

const BlockPreview = ({ block, products }) => {
  if (block.block_type === "products") {
    const layout = block.settings?.layout || "grid";
    const aspect = block.settings?.aspect === "wide" ? "aspect-[4/3]" : block.settings?.aspect === "square" ? "aspect-square" : "aspect-[3/4]";
    const gridClass = layout === "carousel" ? "flex overflow-x-auto" : "grid grid-cols-2 gap-3";
    return (
      <div>
        <h3 className="text-2xl font-semibold text-[var(--text-main)]">{block.title || "Products"}</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{block.subtitle}</p>
        <div className={`mt-4 ${gridClass}`}>
          {products.slice(0, 6).map((product) => (
            <div key={product.id} className={layout === "carousel" ? "mr-3 w-32 shrink-0" : ""}>
              <img src={product.image_url || "/img/logo2.png"} alt="" className={`${aspect} w-full rounded-xl object-cover`} />
              <p className="mt-2 truncate text-xs font-semibold text-[var(--text-main)]">{product.product_name}</p>
            </div>
          ))}
          {products.length === 0 && <p className="rounded-xl border border-dashed border-[var(--border-soft)] p-4 text-sm text-[var(--text-muted)]">Select products to preview this layout.</p>}
        </div>
      </div>
    );
  }

  const overlayTone = block.settings?.overlay_tone || "dark";
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black" style={{ minHeight: Math.min(Number(block.height || 520), 460) }}>
      {block.video_url ? (
        <video src={block.video_url} className="absolute inset-0 h-full w-full object-cover" muted loop />
      ) : block.image_url ? (
        <img src={block.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-slate-900 text-white/50">Media preview</div>
      )}
      {overlayTone !== "none" && (
        <div className={`absolute inset-0 ${overlayTone === "light" ? "bg-white/40" : "bg-black/45"}`} />
      )}
      <div className="relative z-10 flex min-h-[inherit] p-6" style={positionStyle(block.settings?.overlay_position)}>
        <div style={{ color: block.settings?.text_color || "#fff" }}>
          <p className="text-xs uppercase tracking-[0.24em] opacity-75">{block.block_type}</p>
          <h3 className="mt-2 text-3xl font-semibold">{block.title || "Campaign title"}</h3>
          <p className="mt-2 max-w-sm text-sm opacity-80">{block.subtitle || "Wrapped text appears over the media."}</p>
          {block.settings?.button_label && <span className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-xs font-bold text-black">{block.settings.button_label}</span>}
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;