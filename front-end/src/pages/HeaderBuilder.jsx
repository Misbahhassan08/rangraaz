import React, { useEffect, useState } from "react";
import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import LoadingButton from "../components/LoadingButton";
import URLS from "../urls";

const emptyGroup = {
  title: "",
  slug: "",
  direct_url: "",
  hover_title: "",
  hover_subtitle: "",
  button_style: "standard",
  sort_order: 0,
  is_active: true,
  show_dropdown: true,
};

const slugify = (value) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const HeaderBuilder = () => {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState(emptyGroup);
  const [editingId, setEditingId] = useState(null);
  const [hoverImage, setHoverImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchGroups = async () => {
    const res = await fetch(URLS.headerGroups);
    const data = await res.json();
    setGroups(data.data || []);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyGroup);
    setHoverImage(null);
  };

  const editGroup = (group) => {
    setEditingId(group.id);
    setForm({
      title: group.title,
      slug: group.slug,
      direct_url: group.direct_url || "",
      hover_title: group.hover_title || group.title,
      hover_subtitle: group.hover_subtitle || "",
      button_style: group.button_style || "standard",
      sort_order: group.sort_order || 0,
      is_active: group.is_active,
      show_dropdown: group.show_dropdown,
    });
    setHoverImage(null);
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !editingId ? { slug: slugify(value), hover_title: value } : {}),
    }));
  };

  const saveGroup = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      alert("Title and slug are required.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("is_active", String(form.is_active));
      formData.append("show_dropdown", String(form.show_dropdown));
      if (hoverImage) formData.append("hover_image", hoverImage);

      const url = editingId ? URLS.headerGroupDetail(editingId) : URLS.headerGroups;
      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Unable to save header category");
      await fetchGroups();
      resetForm();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteGroup = async (group) => {
    if (!window.confirm(`Delete header category "${group.title}"? Pages stay saved but detach from this menu.`)) return;
    setSaving(true);
    try {
      await fetch(URLS.headerGroupDetail(group.id), { method: "DELETE" });
      await fetchGroups();
      if (editingId === group.id) resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-soft)] p-4 sm:p-5">
      {saving && <div className="api-progress" />}
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--brand-pink)]">Navigation CMS</p>
          <h1 className="text-3xl font-semibold text-[var(--text-main)]">Header Builder</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Create Ally's, Rangraaz, Sale, and future header tabs with hover media and custom button style.
          </p>
        </div>
        <button onClick={resetForm} className="flex items-center gap-2 rounded-2xl bg-[var(--text-main)] px-5 py-3 text-sm font-semibold text-[var(--surface-main)]">
          <Plus size={16} /> New Header Category
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="brand-glass rounded-3xl p-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--text-main)]">Header Categories</h2>
          <div className="space-y-2">
            {groups.map((group) => (
              <div key={group.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-3">
                {group.hover_image_url && <img src={group.hover_image_url} alt="" className="mb-3 h-28 w-full rounded-xl object-cover" />}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--text-main)]">{group.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{group.button_style} / {group.pages?.length || 0} pages</p>
                  </div>
                  <button onClick={() => deleteGroup(group)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                </div>
                <button onClick={() => editGroup(group)} className="mt-3 rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--text-main)]">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </aside>

        <main className="brand-glass rounded-3xl p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Header title" value={form.title} onChange={(value) => updateForm("title", value)} />
            <Input label="Slug" value={form.slug} onChange={(value) => updateForm("slug", slugify(value))} />
            <Input label="Direct URL" value={form.direct_url} onChange={(value) => updateForm("direct_url", value)} placeholder="/allproducts?category=Rangraaz" />
            <Input label="Hover title" value={form.hover_title} onChange={(value) => updateForm("hover_title", value)} />
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Hover subtitle</span>
              <textarea value={form.hover_subtitle} onChange={(e) => updateForm("hover_subtitle", e.target.value)} className="min-h-24 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3 outline-none" />
            </label>
            <Select label="Button style" value={form.button_style} onChange={(value) => updateForm("button_style", value)} options={[["standard", "Standard"], ["featured", "Featured"], ["sale", "Sale"]]} />
            <Input label="Sort order" type="number" value={form.sort_order} onChange={(value) => updateForm("sort_order", value)} />
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3">
              <input type="checkbox" checked={form.is_active} onChange={(e) => updateForm("is_active", e.target.checked)} />
              <span className="text-sm font-medium text-[var(--text-main)]">Active in public header</span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3">
              <input type="checkbox" checked={form.show_dropdown} onChange={(e) => updateForm("show_dropdown", e.target.checked)} />
              <span className="text-sm font-medium text-[var(--text-main)]">Show hover dropdown</span>
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]"><ImagePlus size={14} /> Hover image / GIF</span>
              <input type="file" accept="image/*,.gif" onChange={(e) => setHoverImage(e.target.files[0])} className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3" />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <LoadingButton onClick={saveGroup} loading={saving} loadingText="Saving..." className="btn-brand flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold">
              <Save size={17} /> Save Header Category
            </LoadingButton>
          </div>
        </main>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <label className="space-y-1">
    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
    <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3 outline-none" />
  </label>
);

const Select = ({ label, value, onChange, options }) => (
  <label className="space-y-1">
    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-main)] px-4 py-3 outline-none">
      {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
    </select>
  </label>
);

export default HeaderBuilder;
