import React, { useEffect, useMemo, useState } from "react";
import { Eye, FilePlus2, GripVertical, ImagePlus, Plus, Save, Trash2, Video } from "lucide-react";
import URLS from "../urls";

const emptyPage = {
  title: "",
  slug: "",
  status: "draft",
  meta_description: "",
  show_in_header: true,
  nav_label: "",
  nav_parent: "",
  sort_order: 0,
};

const makeBlock = (block_type) => ({
  uid: crypto.randomUUID(),
  block_type,
  title: block_type === "products" ? "Shop the edit" : "",
  subtitle: "",
  height: block_type === "campaign" ? 460 : 620,
  link: "",
  product_ids: [],
  settings: {},
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

  const publishedPages = useMemo(() => pages.filter((page) => page.status === "published"), [pages]);

  const fetchPages = () => {
    fetch(URLS.pages)
      .then((res) => res.json())
      .then((data) => setPages(data.data || []))
      .catch((err) => console.error("Error fetching pages:", err));
  };

  useEffect(() => {
    fetchPages();
    fetch(URLS.fetchProducts)
      .then((res) => res.json())
      .then((data) => setProducts(data.data || []))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyPage);
    setBlocks([makeBlock("slider"), makeBlock("products")]);
    setFiles({});
  };

  const editPage = async (page) => {
    const res = await fetch(URLS.pageDetail(page.id));
    const data = await res.json();
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
      sort_order: detail.sort_order || 0,
    });
    setBlocks((detail.blocks || []).map((block) => ({ ...block, uid: crypto.randomUUID() })));
    setFiles({});
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingId ? { slug: slugify(value), nav_label: value } : {}),
    }));
  };

  const updateBlock = (uid, key, value) => {
    setBlocks((prev) => prev.map((block) => (block.uid === uid ? { ...block, [key]: value } : block)));
  };

  const toggleProduct = (uid, productId) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.uid !== uid) return block;
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
      alert("Page saved successfully.");
      resetForm();
      fetchPages();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (page) => {
    if (!window.confirm(`Delete ${page.title}?`)) return;
    await fetch(URLS.pageDetail(page.id), { method: "DELETE" });
    fetchPages();
    if (editingId === page.id) resetForm();
  };

  return (
    <div className="min-h-screen bg-[var(--surface-soft)] p-5">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-light uppercase tracking-[0.26em] text-[var(--brand-pink)]">CMS Builder</p>
          <h1 className="font-display text-4xl font-medium text-[var(--text-main)]">Pages</h1>
        </div>
        <button onClick={resetForm} className="flex items-center gap-2 rounded-2xl bg-[var(--text-main)] px-5 py-3 text-sm text-[var(--surface-main)]">
          <FilePlus2 size={16} /> New Page
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <aside className="brand-glass rounded-3xl p-4">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-main)]">Saved Pages</h2>
          <div className="space-y-2">
            {pages.map((page) => (
              <div key={page.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--text-main)]">{page.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">/{page.slug} · {page.status}</p>
                  </div>
                  <button onClick={() => deletePage(page)} className="text-red-500"><Trash2 size={15} /></button>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => editPage(page)} className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-main)]">Edit</button>
                  {page.status === "published" && (
                    <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer" className="rounded-xl bg-[var(--brand-purple)] px-3 py-2 text-xs text-white">
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="space-y-5">
          <section className="brand-glass rounded-3xl p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Page title" value={form.title} onChange={(value) => updateForm("title", value)} />
              <Input label="Slug" value={form.slug} onChange={(value) => updateForm("slug", slugify(value))} prefix="/page/" />
              <Input label="Navigation label" value={form.nav_label} onChange={(value) => updateForm("nav_label", value)} />
              <label className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Status</span>
                <select value={form.status} onChange={(e) => updateForm("status", e.target.value)} className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Header parent</span>
                <select value={form.nav_parent || ""} onChange={(e) => updateForm("nav_parent", e.target.value)} className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3">
                  <option value="">Main header tab</option>
                  {publishedPages.filter((page) => page.id !== editingId).map((page) => (
                    <option key={page.id} value={page.id}>{page.nav_label || page.title}</option>
                  ))}
                </select>
              </label>
              <Input label="Sort order" type="number" value={form.sort_order} onChange={(value) => updateForm("sort_order", value)} />
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3">
                <input type="checkbox" checked={form.show_in_header} onChange={(e) => updateForm("show_in_header", e.target.checked)} />
                <span className="text-sm text-[var(--text-main)]">Show in header navigation</span>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Header image</span>
                <input type="file" accept="image/*" onChange={(e) => setFiles((prev) => ({ ...prev, nav_image: e.target.files[0] }))} className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3" />
              </label>
            </div>
          </section>

          <section className="brand-glass rounded-3xl p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl text-[var(--text-main)]">Layout Blocks</h2>
              <div className="flex flex-wrap gap-2">
                <AddBlock onClick={() => setBlocks((prev) => [...prev, makeBlock("slider")])} icon={<ImagePlus size={15} />} label="Slider" />
                <AddBlock onClick={() => setBlocks((prev) => [...prev, makeBlock("campaign")])} icon={<Video size={15} />} label="Campaign" />
                <AddBlock onClick={() => setBlocks((prev) => [...prev, makeBlock("products")])} icon={<Plus size={15} />} label="Products" />
              </div>
            </div>

            <div className="space-y-4">
              {blocks.map((block, index) => (
                <div key={block.uid} className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-[var(--text-soft)]" />
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand-pink)]">{block.block_type}</p>
                    </div>
                    <button onClick={() => setBlocks((prev) => prev.filter((item) => item.uid !== block.uid))} className="text-red-500"><Trash2 size={16} /></button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Title" value={block.title || ""} onChange={(value) => updateBlock(block.uid, "title", value)} />
                    <Input label="Height px" type="number" value={block.height || 520} onChange={(value) => updateBlock(block.uid, "height", value)} />
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Subtitle</span>
                      <textarea value={block.subtitle || ""} onChange={(e) => updateBlock(block.uid, "subtitle", e.target.value)} className="min-h-20 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3" />
                    </label>
                    {block.block_type === "slider" && (
                      <>
                        <Input label="Click link" value={block.link || ""} onChange={(value) => updateBlock(block.uid, "link", value)} />
                        <MediaInput label="Slider image" accept="image/*" onChange={(file) => setFiles((prev) => ({ ...prev, [`block_${block.uid}_image`]: file }))} current={block.image_url} />
                      </>
                    )}
                    {block.block_type === "campaign" && (
                      <>
                        <MediaInput label="Campaign video" accept="video/*" onChange={(file) => setFiles((prev) => ({ ...prev, [`block_${block.uid}_video`]: file }))} current={block.video_url} />
                        <MediaInput label="Fallback image" accept="image/*" onChange={(file) => setFiles((prev) => ({ ...prev, [`block_${block.uid}_image`]: file }))} current={block.image_url} />
                      </>
                    )}
                    {block.block_type === "products" && (
                      <div className="md:col-span-2">
                        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Attach products</p>
                        <div className="grid max-h-80 gap-2 overflow-y-auto rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] p-3 md:grid-cols-2">
                          {products.map((product) => (
                            <label key={product.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-[var(--surface-soft)]">
                              <input
                                type="checkbox"
                                checked={(block.product_ids || []).includes(product.id)}
                                onChange={() => toggleProduct(block.uid, product.id)}
                              />
                              <img src={product.image_url || "/img/logo2.png"} alt="" className="h-12 w-10 rounded-lg object-cover" />
                              <span className="text-sm text-[var(--text-main)]">{product.product_name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl bg-[var(--surface-soft)] p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]"><Eye size={14} /> Preview</p>
                    <Preview block={block} index={index} products={products} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="sticky bottom-5 flex justify-end">
            <button onClick={savePage} disabled={saving} className="btn-brand flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold disabled:opacity-60">
              <Save size={17} /> {saving ? "Saving..." : "Save Page"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", prefix = "" }) => (
  <label className="space-y-1">
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
    <div className="flex overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)]">
      {prefix && <span className="grid place-items-center px-3 text-sm text-[var(--text-soft)]">{prefix}</span>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent px-4 py-3 outline-none" />
    </div>
  </label>
);

const MediaInput = ({ label, accept, onChange, current }) => (
  <label className="space-y-1">
    <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
    {current && <p className="truncate text-xs text-[var(--text-soft)]">Current media saved</p>}
    <input type="file" accept={accept} onChange={(e) => onChange(e.target.files[0])} className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3" />
  </label>
);

const AddBlock = ({ onClick, icon, label }) => (
  <button onClick={onClick} className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-2 text-sm text-[var(--text-main)]">
    {icon} {label}
  </button>
);

const Preview = ({ block, products }) => {
  if (block.block_type === "products") {
    const selected = products.filter((product) => (block.product_ids || []).includes(product.id)).slice(0, 4);
    return (
      <div>
        <h3 className="font-display text-2xl text-[var(--text-main)]">{block.title || "Products"}</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {selected.map((product) => (
            <div key={product.id} className="rounded-xl bg-[var(--surface-main)] p-2 text-xs">
              <img src={product.image_url || "/img/logo2.png"} alt="" className="mb-2 h-28 w-full rounded-lg object-cover" />
              <p className="truncate">{product.product_name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/80" style={{ minHeight: Math.min(Number(block.height || 420), 420) }}>
      {block.image_url && <img src={block.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
      <div className="relative z-10 flex min-h-[inherit] flex-col justify-end p-6 text-white">
        <p className="text-xs uppercase tracking-[0.24em] text-white/70">{block.block_type}</p>
        <h3 className="mt-2 font-display text-3xl">{block.title || "Block title"}</h3>
        <p className="mt-2 max-w-xl text-sm text-white/70">{block.subtitle || "Block subtitle preview"}</p>
      </div>
    </div>
  );
};

export default PageBuilder;
