import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X, Save, Tag, Image as ImageIcon ,Wand2} from "lucide-react";
import URLS from "../urls";
import LoadingButton from "../components/LoadingButton";

const ProductForm = ({
  data, isEdit,
  handleChange, handleSubmit,
  setIsCreating, setEditProduct,
  fetchedCategories, fetchedSubcategories,
  editProduct, newProduct,
  categoryDraft, setCategoryDraft, createCategory,
  subcategoryDraft, setSubcategoryDraft, createSubcategory, actionLoading,
  fetchedSubSubCategories,      // ← ADD
  subSubCategoryDraft,          // ← ADD
  setSubSubCategoryDraft,       // ← ADD
  createSubSubCategory,
    generateSku, 

  setEdit,
  setNew,
}) => {
  const calculatedSalePrice = data.is_sale_on
    ? (parseFloat(data.original_price || 0) - (parseFloat(data.original_price || 0) * parseInt(data.discount_percentage || 0) / 100)).toFixed(2)
    : parseFloat(data.original_price || 0).toFixed(2);

  const inputCls = "w-full border-2 border-gray-100 p-2.5 rounded-xl focus:border-purple-500 outline-none transition-all text-sm";


  return (
    <form onSubmit={(e) => handleSubmit(e, isEdit)} className="bg-white p-6 rounded-2xl border-2 border-purple-50 mb-6 shadow-xl">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
          {isEdit ? <Pencil size={18} /> : <Plus size={18} />}
          {isEdit ? "Edit Product" : "Register New Product"}
        </h2>
        <button type="button" onClick={() => { setIsCreating(false); setEditProduct(null); }}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Basic Fields */}
        {[
          { label: "Product Name", name: "product_name", type: "text" },
          { label: "Product Type", name: "product_type", type: "text" },
          { label: "Vendor", name: "vendor", type: "text" },
        ].map(({ label, name, type }) => (
          <div key={name} className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">{label}</label>
            <input
              type={type}
              name={name}
              value={data[name] || ""}
              onChange={(e) => handleChange(e, isEdit)}
              className={inputCls}
              required
            />
          </div>
        ))}

        {/* Multiple Image Upload */}
        <div className="space-y-1 col-span-1 md:col-span-3">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1">
            <ImageIcon size={12} /> Product Images
          </label>
          <div className="border-2 border-dashed border-purple-200 rounded-xl p-3 hover:bg-purple-50 transition-all">
            {(isEdit ? editProduct : newProduct).image_files?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {(isEdit ? editProduct : newProduct).image_files.map((file, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded-lg border border-purple-200" />
                    <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                      {i === 0 ? "MAIN" : `#${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : data.images?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {data.images.map((img, i) => (
                  <div key={img.id || i} className="relative">
                    <img src={img.image_url || img} className="w-20 h-20 object-cover rounded-lg border border-purple-200" />
                    <span className="absolute -bottom-1 -right-1 bg-gray-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                      {i === 0 ? "MAIN" : `#${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            <label className="flex items-center justify-center gap-2 text-purple-500 cursor-pointer py-2 border-2 border-dashed border-purple-200 rounded-xl hover:bg-purple-100 transition-all">
              <Plus size={16} />
              <span className="text-xs font-bold">
                {(isEdit ? editProduct : newProduct).image_files?.length > 0
                  ? `${(isEdit ? editProduct : newProduct).image_files.length} image(s) — + add more`
                  : "UPLOAD PHOTOS (select multiple)"}
              </span>
              <input type="file" name="image_files" multiple accept="image/*" onChange={(e) => handleChange(e, isEdit)} className="hidden" />
            </label>
          </div>
        </div>

   
        {/* Pricing */}
        <div className="bg-purple-50/60 p-4 rounded-2xl col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 border border-purple-100">
          <div className="space-y-1">
            <label className="text-xs font-bold text-purple-600 uppercase">Original Price ($)</label>
            <input type="number" name="original_price" value={data.original_price || ""} onChange={(e) => handleChange(e, isEdit)}
              className="w-full border-2 border-white p-2.5 rounded-xl outline-none focus:border-purple-400 text-sm" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-purple-600 uppercase">Discount (%)</label>
            <input type="number" name="discount_percentage" value={data.discount_percentage || 0} onChange={(e) => handleChange(e, isEdit)}
              className="w-full border-2 border-white p-2.5 rounded-xl outline-none focus:border-purple-400 text-sm" />
          </div>
          <div className="flex flex-col justify-center items-start pt-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" name="is_sale_on" checked={data.is_sale_on || false} onChange={(e) => handleChange(e, isEdit)}
                className="w-5 h-5 rounded-lg accent-red-500" />
              <span className="text-sm font-bold text-red-600 group-hover:text-red-700">ACTIVATE SALE</span>
            </label>
          </div>
          <div className="bg-white p-3 rounded-xl border-2 border-dashed border-purple-200 flex flex-col justify-center items-center">
            <span className="text-[10px] font-bold text-gray-400">PREVIEW SELL PRICE</span>
            <span className="text-xl font-black text-green-600">$ {calculatedSalePrice}</span>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
            <span className="text-[10px] font-bold uppercase tracking-wide text-purple-500">
              {fetchedCategories.length} saved
            </span>
          </div>
          <select name="category_id" value={data.category_id || ""} onChange={(e) => handleChange(e, isEdit)}
            className="w-full border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-purple-500 bg-white text-sm" required>
            <option value="">{fetchedCategories.length ? "Select Category" : "No category yet"}</option>
            {fetchedCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={categoryDraft}
                onChange={(e) => setCategoryDraft(e.target.value)}
                placeholder="Create new category"
                className="min-w-0 flex-1 rounded-lg border border-white bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-purple-400"
              />
              <button
                type="button"
                onClick={() => createCategory(isEdit)}
                disabled={actionLoading === "category"}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-purple-700"
              >
                {actionLoading === "category" ? <span className="api-loader" /> : <Plus size={13} />} Add
              </button>
            </div>
          </div>
        </div>

        {/* Subcategory */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Subcategory</label>
          <select name="subcategory_id" value={data.subcategory_id || ""} onChange={(e) => handleChange(e, isEdit)}
            className="w-full border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-purple-500 bg-white text-sm" disabled={!data.category_id}>
            <option value="">Select Subcategory</option>
            {fetchedSubcategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
          </select>
          <div className="rounded-xl border border-dashed border-fuchsia-200 bg-fuchsia-50/50 p-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={subcategoryDraft}
                onChange={(e) => setSubcategoryDraft(e.target.value)}
                placeholder="Create subcategory for selected category"
                className="min-w-0 flex-1 rounded-lg border border-white bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-fuchsia-400"
              />
              <button
                type="button"
                onClick={() => createSubcategory(isEdit)}
                disabled={!data.category_id || actionLoading === "subcategory"}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-fuchsia-700 disabled:opacity-60"
              >
                {actionLoading === "subcategory" ? <span className="api-loader" /> : <Plus size={13} />} Add
              </button>
            </div>
          </div>
        </div>
        {/* Sub-Subcategory */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Sub-Subcategory (2Pc, 3Pc...)
          </label>
          <select
            name="sub_subcategory_id"
            value={data.sub_subcategory_id || ""}
            onChange={(e) => handleChange(e, isEdit)}
            className="w-full border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-purple-500 bg-white text-sm"
            disabled={!data.subcategory_id}
          >
            <option value="">Select Sub-Subcategory</option>
            {fetchedSubSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
          <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={subSubCategoryDraft}
                onChange={(e) => setSubSubCategoryDraft(e.target.value)}
                placeholder="Create new sub-subcategory"
                className="min-w-0 flex-1 rounded-lg border border-white bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={() => createSubSubCategory(isEdit)}
                disabled={!data.subcategory_id || actionLoading === "sub-subcategory"}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-black uppercase text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {actionLoading === "sub-subcategory" ? <span className="api-loader" /> : <Plus size={13} />} Add
              </button>
            </div>
          </div>
        </div>

        {/* Size & Stock */}
        <div className="space-y-3 col-span-1 md:col-span-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Size & Stock</label>
            {(data.size_stocks || []).length > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-purple-500">
                {data.size_stocks.length} size{data.size_stocks.length > 1 ? "s" : ""} added
              </span>
            )}
          </div>

          {(data.size_stocks || []).length === 0 && (
            <p className="text-xs text-gray-400 italic ml-1">No sizes added yet. Click below to add.</p>
          )}

          <div className="flex flex-col gap-3">
            {(data.size_stocks || []).map((item, i) => (
              <div
                key={i}
                className="relative rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 pt-5"
              >
                {/* Row index badge */}
                <span className="absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-purple-600 text-white text-[10px] font-black shadow-sm">
                  {i + 1}
                </span>

                {/* Remove row button */}
                <button
                  type="button"
                  onClick={() => {
                    const updated = (data.size_stocks || []).filter((_, idx) => idx !== i);
                    if (isEdit) setEdit(prev => ({ ...prev, size_stocks: updated }));
                    else setNew(prev => ({ ...prev, size_stocks: updated }));
                  }}
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-white text-red-400 border border-red-100 shadow-sm hover:bg-red-500 hover:text-white transition-all"
                >
                  <X size={12} />
                </button>

                <div className="grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
                  <div className="col-span-1 md:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Size</label>
                    <input
                      type="text"
                      placeholder="e.g. Small, XL"
                      value={item.size}
                      onChange={(e) => {
                        const updated = [...(data.size_stocks || [])];
                        updated[i] = { ...updated[i], size: e.target.value };
                        if (isEdit) setEdit(prev => ({ ...prev, size_stocks: updated }));
                        else setNew(prev => ({ ...prev, size_stocks: updated }));
                      }}
                      className="w-full bg-white border-2 border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Qty</label>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      min={0}
                      onChange={(e) => {
                        const updated = [...(data.size_stocks || [])];
                        updated[i] = { ...updated[i], quantity: e.target.value };
                        if (isEdit) setEdit(prev => ({ ...prev, size_stocks: updated }));
                        else setNew(prev => ({ ...prev, size_stocks: updated }));
                      }}
                      className="w-full bg-white border-2 border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">SKU</label>
                    <input
                      type="text"
                      placeholder="SKU"
                      value={item.sku || ""}
                      onChange={(e) => {
                        const updated = [...(data.size_stocks || [])];
                        updated[i] = { ...updated[i], sku: e.target.value };
                        if (isEdit) setEdit(prev => ({ ...prev, size_stocks: updated }));
                        else setNew(prev => ({ ...prev, size_stocks: updated }));
                      }}
                      className="w-full bg-white border-2 border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-2">
                    <button
                      type="button"
                      onClick={() => generateSku(isEdit, i)}
                      className="w-full flex items-center justify-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-2.5 rounded-xl text-xs font-black uppercase hover:bg-purple-200 transition-all whitespace-nowrap"
                    >
                      <Wand2 size={14} /> Auto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button"
            onClick={() => {
              const newEntry = { size: "", quantity: 0, sku: "" };
              if (isEdit) setEdit(prev => ({ ...prev, size_stocks: [...(prev.size_stocks || []), newEntry] }));
              else setNew(prev => ({ ...prev, size_stocks: [...(prev.size_stocks || []), newEntry] }));
            }}
            className="flex items-center gap-2 text-purple-600 border-2 border-dashed border-purple-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-50 transition-all">
            <Plus size={14} /> ADD SIZE
          </button>
        </div>

      </div>

      <div className="mt-5 flex gap-3">
        <LoadingButton type="submit" loading={actionLoading === "product-save"} loadingText={isEdit ? "Updating..." : "Saving..."} className="flex items-center justify-center gap-2 bg-purple-600 text-white px-7 py-2.5 rounded-xl hover:bg-purple-700 font-bold transition-all shadow-lg shadow-purple-200 text-sm cursor-pointer">
          <Save size={16} /> {isEdit ? "Update Product" : "Save Product"}
        </LoadingButton>
        <button type="button" onClick={() => { setIsCreating(false); setEditProduct(null); }}
          className="bg-gray-100 text-gray-600 px-7 py-2.5 rounded-xl hover:bg-gray-200 font-bold transition-all text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
};

const ProductTable = () => {
  const [productsData, setProductsData] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [fetchedSubcategories, setFetchedSubcategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [categoryDraft, setCategoryDraft] = useState("");
  const [subcategoryDraft, setSubcategoryDraft] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [fetchedSubSubCategories, setFetchedSubSubCategories] = useState([]);
  const [subSubCategoryDraft, setSubSubCategoryDraft] = useState("");
  const initialState = {
    product_name: "", brand: "RANGRAAZ", product_type: "",
    image_files: [], size_stocks: [], vendor: "",
    category_id: "", subcategory_id: "", sub_subcategory_id: "", original_price: "",
    discount_percentage: 0, is_sale_on: false,
  };
  const [newProduct, setNewProduct] = useState(initialState);

  const fetchProducts = async () => {
    try {
      const response = await fetch(URLS.fetchProducts);
      const result = await response.json();
      setProductsData(result.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProductsData([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(URLS.fetchCategories);
      const data = await response.json();
      setFetchedCategories(data.data || data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const refreshProductAdmin = async (categoryId = null) => {
    await Promise.all([fetchProducts(), fetchCategories()]);
    if (categoryId) await fetchSubcategories(categoryId);
  };

  const createCategory = async (isEdit = false) => {
    const name = categoryDraft.trim();
    if (!name) {
      alert("Please enter a category name.");
      return;
    }

    try {
      setActionLoading("category");
      const response = await fetch(URLS.createCategory, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Could not create category.");
        return;
      }

      setFetchedCategories((prev) => {
        const exists = prev.some((cat) => String(cat.id) === String(result.id));
        return exists ? prev : [...prev, result].sort((a, b) => a.name.localeCompare(b.name));
      });

      if (isEdit) {
        setEditProduct((prev) => ({ ...prev, category_id: String(result.id), subcategory_id: "" }));
      } else {
        setNewProduct((prev) => ({ ...prev, category_id: String(result.id), subcategory_id: "" }));
      }
      setFetchedSubcategories([]);
      setCategoryDraft("");
    } catch (error) {
      console.error("Error creating category:", error);
      alert("API Error: " + error);
    } finally {
      setActionLoading("");
    }
  };

  const createSubcategory = async (isEdit = false) => {
    const name = subcategoryDraft.trim();
    const categoryId = isEdit ? editProduct?.category_id : newProduct.category_id;
    if (!categoryId) {
      alert("Please select or create a category first.");
      return;
    }
    if (!name) {
      alert("Please enter a subcategory name.");
      return;
    }

    try {
      setActionLoading("subcategory");
      const subRes = await fetch(URLS.createSubcategory, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const sub = await subRes.json();
      if (!subRes.ok) {
        alert(sub.error || "Could not create subcategory.");
        return;
      }

      const linkRes = await fetch(URLS.linkCategorySubcategory, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: categoryId, subcategory_id: sub.id }),
      });
      const link = await linkRes.json();
      if (!linkRes.ok) {
        alert(link.error || "Could not link subcategory.");
        return;
      }

      await fetchSubcategories(categoryId);
      if (isEdit) {
        setEditProduct((prev) => ({ ...prev, subcategory_id: String(sub.id) }));
      } else {
        setNewProduct((prev) => ({ ...prev, subcategory_id: String(sub.id) }));
      }
      setSubcategoryDraft("");
    } catch (error) {
      console.error("Error creating subcategory:", error);
      alert("API Error: " + error);
    } finally {
      setActionLoading("");
    }
  };
  const createSubSubCategory = async (isEdit = false) => {
    const name = subSubCategoryDraft.trim();
    const subcategoryId = isEdit ? editProduct?.subcategory_id : newProduct.subcategory_id;

    if (!subcategoryId) { alert("Please select subcategroy first."); return; }
    if (!name) { alert("Please enter a sub-subcategory name.."); return; }

    try {
      setActionLoading("sub-subcategory");

      const createRes = await fetch(URLS.createSubSubCategory, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const created = await createRes.json();
      if (!createRes.ok) { alert(created.error || "Error"); return; }

      const linkRes = await fetch(URLS.linkSubCategorySubSubCategory, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcategory_id: subcategoryId, sub_subcategory_id: created.id }),
      });
      if (!linkRes.ok) { alert("Linking failed"); return; }

      await fetchSubSubCategories(subcategoryId);
      if (isEdit) setEditProduct(prev => ({ ...prev, sub_subcategory_id: String(created.id) }));
      else setNewProduct(prev => ({ ...prev, sub_subcategory_id: String(created.id) }));
      setSubSubCategoryDraft("");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading("");
    }
  };
  const generateSku = (isEdit = false, rowIndex) => {
    const data = isEdit ? editProduct : newProduct;

    if (!data.vendor || !data.category_id) {
      alert("Please fill in Vendor and Category before generating an SKU.");
      return;
    }
    const row = (data.size_stocks || [])[rowIndex];
    if (!row || !row.size || !row.size.trim()) {
      alert("Please enter a size for this row before generating an SKU.");
      return;
    }

    const vendorCode = data.vendor.trim().substring(0, 3).toUpperCase();
    const countInCategory = productsData.filter(
      (p) => String(p.category_id) === String(data.category_id)
    ).length + 1;
    const countCode = String(countInCategory).padStart(3, "0");
    const sizeCode = row.size.trim().toUpperCase().replace(/\s+/g, "");

    const sku = [vendorCode, countCode, sizeCode].join("-");

    const updated = [...data.size_stocks];
    updated[rowIndex] = { ...updated[rowIndex], sku };

    if (isEdit) setEditProduct((prev) => ({ ...prev, size_stocks: updated }));
    else setNewProduct((prev) => ({ ...prev, size_stocks: updated }));
  };








  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) { setFetchedSubcategories([]); return; }
    try {
      const response = await fetch(URLS.fetchSubcategories(categoryId));
      const data = await response.json();
      setFetchedSubcategories(data.data || data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchSubSubCategories = async (subcategoryId) => {
    if (!subcategoryId) { setFetchedSubSubCategories([]); return; }
    try {
      const res = await fetch(URLS.fetchSubSubCategories(subcategoryId));
      const data = await res.json();
      setFetchedSubSubCategories(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const uniqueCategories = ["ALL", ...new Set(productsData.map((p) => p.category_name || p.category).filter(Boolean))];
  const filteredProducts = activeFilter === "ALL"
    ? productsData
    : productsData.filter((p) => (p.category_name || p.category) === activeFilter);

  const handleEditClick = (product) => {
    setEditProduct({ ...product, image_files: [], size_stocks: product.size_stocks || [] });
    setIsCreating(false);
    fetchSubcategories(product.category_id);
    fetchSubSubCategories(product.subcategory_id);
  };

  const handleCreateClick = () => { setIsCreating(true); setEditProduct(null); setNewProduct(initialState); };

  const handleChange = (e, isEdit = false) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "image_files") {
      const newFiles = Array.from(files);
      if (isEdit) setEditProduct(prev => ({ ...prev, image_files: [...(prev.image_files || []), ...newFiles] }));
      else setNewProduct(prev => ({ ...prev, image_files: [...(prev.image_files || []), ...newFiles] }));
      return;
    }
    const val = type === "checkbox" ? checked : value;
    if (isEdit) setEditProduct(prev => ({ ...prev, [name]: val }));
    else setNewProduct(prev => ({ ...prev, [name]: val }));
    if (name === "category_id") {
      fetchSubcategories(value);
      if (isEdit) setEditProduct(prev => ({
        ...prev, subcategory_id: "", sub_subcategory_id: ""
      }));
      else setNewProduct(prev => ({
        ...prev, subcategory_id: "", sub_subcategory_id: ""
      }));
    }

    if (name === "subcategory_id") {
      fetchSubSubCategories(value);
      if (isEdit) setEditProduct(prev => ({ ...prev, sub_subcategory_id: "" }));
      else setNewProduct(prev => ({ ...prev, sub_subcategory_id: "" }));
    }
  };

  const handleSubmit = async (e, isEdit) => {
    e.preventDefault();
    const currentData = isEdit ? editProduct : newProduct;
    const formData = new FormData();
    formData.append("product_name", currentData.product_name);
    formData.append("brand", currentData.brand || "RANGRAAZ");
    formData.append("product_type", currentData.product_type);
    formData.append("original_price", currentData.original_price);
    formData.append("discount_percentage", currentData.discount_percentage || 0);
    formData.append("is_sale_on", currentData.is_sale_on);
    formData.append("vendor", currentData.vendor);
    formData.append("category_id", currentData.category_id);
    formData.append("subcategory_id", currentData.subcategory_id);
    formData.append("sub_subcategory_id", currentData.sub_subcategory_id || "");

    formData.append("size_stocks", JSON.stringify(currentData.size_stocks || []));
    if (currentData.image_files?.length > 0) {
      currentData.image_files.forEach(file => formData.append("images", file));
    }
    const url = isEdit ? URLS.updateProduct(currentData.id) : URLS.createProduct;
    try {
      setActionLoading("product-save");
      const response = await fetch(url, { method: "POST", body: formData });
      const result = await response.json();
      if (response.ok) {
        alert(isEdit ? "Updated Successfully!" : "Product Added Successfully!");
        setEditProduct(null);
        setIsCreating(false);
        setNewProduct(initialState);
        await refreshProductAdmin(currentData.category_id);
      } else { alert("Error: " + JSON.stringify(result)); }
    } catch (error) {
      alert("API Error: " + error);
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Delete ${product.product_name}?`)) {
      try {
        setActionLoading(`delete-product-${product.id}`);
        const response = await fetch(URLS.deleteProduct(product.id), { method: 'DELETE' });
        if (response.ok) await refreshProductAdmin(product.category_id);
      } catch (error) {
        console.error("Error deleting product:", error);
      } finally {
        setActionLoading("");
      }
    }
  };

  const deleteCategory = async (category) => {
    const productsInCategory = productsData.filter((product) => String(product.category_id) === String(category.id));
    let replacement = null;

    if (productsInCategory.length > 0) {
      const choices = fetchedCategories
        .filter((cat) => String(cat.id) !== String(category.id))
        .map((cat) => `${cat.id}: ${cat.name}`)
        .join("\n");
      if (!choices) {
        alert("Create another category first. Products must be moved before deleting this category.");
        return;
      }
      replacement = window.prompt(
        `${productsInCategory.length} product(s) use "${category.name}". Enter replacement category ID:\n${choices}`
      );
      if (!replacement) return;
    }

    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    try {
      setActionLoading(`delete-category-${category.id}`);
      const response = await fetch(URLS.deleteCategory(category.id), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replacement_category_id: replacement }),
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Could not delete category.");
        return;
      }
      await refreshProductAdmin();
    } catch (error) {
      alert("API Error: " + error);
    } finally {
      setActionLoading("");
    }
  };

  const deleteSubcategory = async (subcategory) => {
    const productsInSubcategory = productsData.filter((product) => String(product.subcategory_id) === String(subcategory.id));
    let replacement = null;

    if (productsInSubcategory.length > 0) {
      const choices = fetchedSubcategories
        .filter((sub) => String(sub.id) !== String(subcategory.id))
        .map((sub) => `${sub.id}: ${sub.name}`)
        .join("\n");
      if (!choices) {
        alert("Create another subcategory first. Products must be moved before deleting this subcategory.");
        return;
      }
      replacement = window.prompt(
        `${productsInSubcategory.length} product(s) use "${subcategory.name}". Enter replacement subcategory ID:\n${choices}`
      );
      if (!replacement) return;
    }

    if (!window.confirm(`Delete subcategory "${subcategory.name}"?`)) return;

    try {
      setActionLoading(`delete-subcategory-${subcategory.id}`);
      const categoryId = isCreating ? newProduct.category_id : editProduct?.category_id;
      const response = await fetch(URLS.deleteSubcategory(subcategory.id), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replacement_subcategory_id: replacement }),
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Could not delete subcategory.");
        return;
      }
      await refreshProductAdmin(categoryId);
    } catch (error) {
      alert("API Error: " + error);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {actionLoading && <div className="api-progress" />}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="text-purple-600" size={22} /> STOCK MASTER
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage your inventory and seasonal sales</p>
        </div>
        {!isCreating && !editProduct && (
          <button onClick={handleCreateClick}
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all font-bold text-sm">
            <Plus size={16} strokeWidth={3} /> ADD NEW PRODUCT
          </button>
        )}
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">Categories</h2>
            <span className="rounded-full bg-purple-50 px-2 py-1 text-[10px] font-black text-purple-600">{fetchedCategories.length}</span>
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {fetchedCategories.length === 0 ? (
              <p className="rounded-xl border border-dashed border-purple-200 bg-purple-50 p-3 text-xs text-slate-500">
                No categories yet. Use the product form to create the first one.
              </p>
            ) : fetchedCategories.map((cat) => {
              const count = productsData.filter((product) => String(product.category_id) === String(cat.id)).length;
              return (
                <div key={cat.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{cat.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{count} products</p>
                  </div>
                  <LoadingButton
                    loading={actionLoading === `delete-category-${cat.id}`}
                    loadingText="Deleting"
                    onClick={() => deleteCategory(cat)}
                    className="rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Delete
                  </LoadingButton>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-fuchsia-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">Selected Category Subcategories</h2>
            <span className="rounded-full bg-fuchsia-50 px-2 py-1 text-[10px] font-black text-fuchsia-600">{fetchedSubcategories.length}</span>
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {fetchedSubcategories.length === 0 ? (
              <p className="rounded-xl border border-dashed border-fuchsia-200 bg-fuchsia-50 p-3 text-xs text-slate-500">
                Select a category in the product form, then add subcategories for it.
              </p>
            ) : fetchedSubcategories.map((sub) => {
              const count = productsData.filter((product) => String(product.subcategory_id) === String(sub.id)).length;
              return (
                <div key={sub.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{sub.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{count} products</p>
                  </div>
                  <LoadingButton
                    loading={actionLoading === `delete-subcategory-${sub.id}`}
                    loadingText="Deleting"
                    onClick={() => deleteSubcategory(sub)}
                    className="rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Delete
                  </LoadingButton>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isCreating && (
        <ProductForm
          key="create"
          data={newProduct}
          isEdit={false}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setIsCreating={setIsCreating}
          setEditProduct={setEditProduct}
          fetchedCategories={fetchedCategories}
          fetchedSubcategories={fetchedSubcategories}
          categoryDraft={categoryDraft}
          setCategoryDraft={setCategoryDraft}
          createCategory={createCategory}
          subcategoryDraft={subcategoryDraft}
          setSubcategoryDraft={setSubcategoryDraft}
          createSubcategory={createSubcategory}
          fetchedSubSubCategories={fetchedSubSubCategories}
          subSubCategoryDraft={subSubCategoryDraft}
          setSubSubCategoryDraft={setSubSubCategoryDraft}
          createSubSubCategory={createSubSubCategory}
            generateSku={generateSku}
          actionLoading={actionLoading}
          editProduct={editProduct}
          newProduct={newProduct}
          setEdit={setEditProduct}
          setNew={setNewProduct}
        />
      )}
      {editProduct && (
        <ProductForm
          key={`edit-${editProduct.id}`}
          data={editProduct}
          isEdit={true}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setIsCreating={setIsCreating}
          setEditProduct={setEditProduct}
          fetchedCategories={fetchedCategories}
          fetchedSubcategories={fetchedSubcategories}
          categoryDraft={categoryDraft}
          setCategoryDraft={setCategoryDraft}
          createCategory={createCategory}
          subcategoryDraft={subcategoryDraft}
          setSubcategoryDraft={setSubcategoryDraft}
          createSubcategory={createSubcategory}
           generateSku={generateSku}
          actionLoading={actionLoading}
          editProduct={editProduct}
          newProduct={newProduct}
          setEdit={setEditProduct}
          setNew={setNewProduct}
           fetchedSubSubCategories={fetchedSubSubCategories}      
    subSubCategoryDraft={subSubCategoryDraft}            
    setSubSubCategoryDraft={setSubSubCategoryDraft}       
    createSubSubCategory={createSubSubCategory}  
        />
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {uniqueCategories.map((cat) => {
          const isActive = activeFilter === cat;
          const count = cat === "ALL" ? productsData.length : productsData.filter((p) => (p.category_name || p.category) === cat).length;
          return (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${isActive
                ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100"
                : "bg-white text-slate-500 border-slate-100 hover:border-purple-300 hover:text-purple-600"}`}>
              {cat}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {["Product Info", "Price Status", "Inventory", "Classification", "Control"].map((h) => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-purple-50/30 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img src={product.image_url || "https://via.placeholder.com/100"} alt=""
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm" />
                      {product.is_sale_on && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow">SALE</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{product.product_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-md uppercase">{product.vendor}</span>
                        <span className="text-[10px] text-slate-400">
                          {product.size_stocks?.length > 0
                            ? product.size_stocks.map(ss => `${ss.size}(${ss.quantity})`).join(", ")
                            : 'No Sizes'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {product.is_sale_on ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 line-through">$ {product.original_price}</span>
                      <span className="text-base font-black text-emerald-600">$ {product.sell_price}</span>
                      <span className="text-[9px] font-bold text-red-500 mt-0.5">{product.discount_percentage}% OFF</span>
                    </div>
                  ) : (
                    <span className="text-base font-black text-slate-700">$ {product.original_price}</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className={`text-base font-black ${product.quantity < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                    {product.quantity} <span className="text-[10px] text-slate-400 font-normal">PCS</span>
                  </div>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${product.quantity < 5 ? 'bg-red-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(product.quantity * 10, 100)}%` }} />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                    {product.category_name || product.category}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(product)}
                      className="p-2.5 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl transition-all border border-purple-100 shadow-sm">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(product)} disabled={actionLoading === `delete-product-${product.id}`}
                      className="p-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100 shadow-sm">
                      {actionLoading === `delete-product-${product.id}` ? <span className="api-loader" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300">
            <Tag size={48} strokeWidth={1} className="mb-3 opacity-20" />
            <p className="font-bold">{activeFilter === "ALL" ? "No products yet." : `No products for "${activeFilter}".`}</p>
            <p className="text-sm">{activeFilter === "ALL" ? "Start by adding your first product." : "Try a different filter."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTable;
