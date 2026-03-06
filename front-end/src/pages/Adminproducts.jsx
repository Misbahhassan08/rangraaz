import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X, Save, Tag, Image as ImageIcon, Maximize } from "lucide-react";
import URLS from "../urls";

const ProductTable = () => {
  const [productsData, setProductsData] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [fetchedSubcategories, setFetchedSubcategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const initialState = {
    product_name: "", brand: "RANGRAAZ", product_type: "", purchase_price: 0,
    image_file: null, quantity: 0, size: "", sku: "", vendor: "",
    category_id: "", subcategory_id: "", original_price: "",
    discount_percentage: 0, is_sale_on: false,
  };

  const [newProduct, setNewProduct] = useState(initialState);

  const fetchProducts = async () => {
    try {
      const response = await fetch(URLS.fetchProducts);
      const result = await response.json();
      setProductsData(result.data || []);
    } catch (error) { console.error("Failed to fetch products:", error); setProductsData([]); }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(URLS.fetchCategories);
      const data = await response.json();
      setFetchedCategories(data.data || data);
    } catch (error) { console.error("failed to show categories:", error); }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) { setFetchedSubcategories([]); return; }
    try {
      const response = await fetch(URLS.fetchSubcategories(categoryId));
      const data = await response.json();
      setFetchedSubcategories(data.data || data);
    } catch (error) { console.error("Failed to fetch subcategories:", error); }
  };

  const uniqueCategories = ["ALL", ...new Set(productsData.map((p) => p.category_name || p.category).filter(Boolean))];

  const filteredProducts = activeFilter === "ALL"
    ? productsData
    : productsData.filter((p) => (p.category_name || p.category) === activeFilter);

  const handleEditClick = (product) => { setEditProduct({ ...product, image_file: null }); setIsCreating(false); fetchSubcategories(product.category_id); };
  const handleCreateClick = () => { setIsCreating(true); setEditProduct(null); setNewProduct(initialState); };

  const handleChange = (e, isEdit = false) => {
    const { name, value, type, checked, files } = e.target;
    let val = type === "file" ? files[0] : type === "checkbox" ? checked : value;
    if (isEdit) setEditProduct((prev) => ({ ...prev, [name]: val }));
    else setNewProduct((prev) => ({ ...prev, [name]: val }));
    if (name === "category_id") {
      fetchSubcategories(value);
      if (isEdit) setEditProduct(prev => ({ ...prev, subcategory_id: "" }));
      else setNewProduct(prev => ({ ...prev, subcategory_id: "" }));
    }
  };

  const handleSubmit = async (e, isEdit) => {
    e.preventDefault();
    const currentData = isEdit ? editProduct : newProduct;
    if (!currentData.product_name || !currentData.category_id || !currentData.subcategory_id || !currentData.sku) {
      alert("Please fill all required fields!"); return;
    }
    const formData = new FormData();
    formData.append("product_name", currentData.product_name);
    formData.append("brand", currentData.brand || "RANGRAAZ");
    formData.append("product_type", currentData.product_type);
    formData.append("original_price", currentData.original_price);
    formData.append("discount_percentage", currentData.discount_percentage || 0);
    formData.append("is_sale_on", currentData.is_sale_on);
    formData.append("quantity", currentData.quantity);
    formData.append("sku", currentData.sku);
    formData.append("vendor", currentData.vendor);
    formData.append("size", currentData.size || "");
    formData.append("category_id", currentData.category_id);
    formData.append("subcategory_id", currentData.subcategory_id);
    if (currentData.image_file) formData.append("image", currentData.image_file);
    const url = isEdit ? URLS.updateProduct(currentData.id) : URLS.createProduct;
    try {
      const response = await fetch(url, { method: isEdit ? "PUT" : "POST", body: formData });
      const result = await response.json();
      if (response.ok) {
        alert(isEdit ? "Updated Successfully!" : "Product Added Successfully!");
        setEditProduct(null); setIsCreating(false); fetchProducts();
      } else { alert("Error: " + JSON.stringify(result)); }
    } catch (error) { alert("API Error occurred: " + error); }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Delete ${product.product_name}?`)) {
      try {
        const response = await fetch(URLS.deleteProduct(product.id), { method: 'DELETE' });
        if (response.ok) fetchProducts();
      } catch (error) { console.error(error); }
    }
  };

  const inputCls = "w-full border-2 border-gray-100 p-2.5 rounded-xl focus:border-purple-500 outline-none transition-all text-sm";

  const ProductForm = ({ data, isEdit }) => {
    const calculatedSalePrice = data.is_sale_on
      ? (parseFloat(data.original_price || 0) - (parseFloat(data.original_price || 0) * parseInt(data.discount_percentage || 0) / 100)).toFixed(2)
      : parseFloat(data.original_price || 0).toFixed(2);

    return (
      <form onSubmit={(e) => handleSubmit(e, isEdit)} className="bg-white p-6 rounded-2xl border-2 border-purple-50 mb-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
            {isEdit ? <Pencil size={18} /> : <Plus size={18} />}
            {isEdit ? "Edit Product" : "Register New Product"}
          </h2>
          <button type="button" onClick={() => { setIsCreating(false); setEditProduct(null); }} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Product Name", name: "product_name", type: "text" },
            { label: "Product Type", name: "product_type", type: "text" },
            { label: "Vendor", name: "vendor", type: "text" },
          ].map(({ label, name, type }) => (
            <div key={name} className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">{label}</label>
              <input type={type} name={name} value={data[name]} onChange={(e) => handleChange(e, isEdit)} className={inputCls} required />
            </div>
          ))}

          {/* Image Upload */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><ImageIcon size={12} /> Product Image</label>
            <div className="relative border-2 border-dashed border-purple-200 rounded-xl p-2 hover:bg-purple-50 transition-all flex items-center justify-center cursor-pointer h-[46px]">
              <input type="file" name="image_file" onChange={(e) => handleChange(e, isEdit)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              <div className="flex items-center gap-2 text-purple-500">
                <Plus size={16} />
                <span className="text-xs font-bold">{data.image_file ? data.image_file.name.substring(0, 15) + "..." : "UPLOAD PHOTO"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><Maximize size={12} /> Size</label>
            <input type="text" name="size" value={data.size} onChange={(e) => handleChange(e, isEdit)} placeholder="e.g. XL, Large, 42" className={inputCls} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">SKU Code</label>
            <input type="text" name="sku" value={data.sku} onChange={(e) => handleChange(e, isEdit)} className={inputCls} />
          </div>

          {/* Pricing Section */}
          <div className="bg-purple-50/60 p-4 rounded-2xl col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 border border-purple-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-purple-600 uppercase">Original Price ($)</label>              <input type="number" name="original_price" value={data.original_price} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-white p-2.5 rounded-xl outline-none focus:border-purple-400 text-sm" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-purple-600 uppercase">Discount (%)</label>
              <input type="number" name="discount_percentage" value={data.discount_percentage} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-white p-2.5 rounded-xl outline-none focus:border-purple-400 text-sm" />
            </div>
            <div className="flex flex-col justify-center items-start pt-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="is_sale_on" checked={data.is_sale_on} onChange={(e) => handleChange(e, isEdit)} className="w-5 h-5 rounded-lg accent-red-500" />
                <span className="text-sm font-bold text-red-600 group-hover:text-red-700">ACTIVATE SALE</span>
              </label>
            </div>
            <div className="bg-white p-3 rounded-xl border-2 border-dashed border-purple-200 flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-gray-400">PREVIEW SELL PRICE</span>
              <span className="text-xl font-black text-green-600">$ {calculatedSalePrice}</span>            </div>
          </div>

          {/* Category / Subcategory / Qty */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
            <select name="category_id" value={data.category_id} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-purple-500 bg-white text-sm" required>
              <option value="">Select Category</option>
              {fetchedCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Subcategory</label>
            <select name="subcategory_id" value={data.subcategory_id || ""} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-purple-500 bg-white text-sm" disabled={!data.category_id}>
              <option value="">Select Subcategory</option>
              {fetchedSubcategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Stock Quantity</label>
            <input type="number" name="quantity" value={data.quantity} onChange={(e) => handleChange(e, isEdit)} className={inputCls} required />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button type="submit" className="flex items-center justify-center gap-2 bg-purple-600 text-white px-7 py-2.5 rounded-xl hover:bg-purple-700 font-bold transition-all shadow-lg shadow-purple-200 text-sm">
            <Save size={16} /> {isEdit ? "Update Product" : "Save Product"}
          </button>
          <button type="button" onClick={() => { setIsCreating(false); setEditProduct(null); }} className="bg-gray-100 text-gray-600 px-7 py-2.5 rounded-xl hover:bg-gray-200 font-bold transition-all text-sm">
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="text-purple-600" size={22} /> STOCK MASTER
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage your inventory and seasonal sales</p>
        </div>
        {!isCreating && !editProduct && (
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all font-bold text-sm"
          >
            <Plus size={16} strokeWidth={3} /> ADD NEW PRODUCT
          </button>
        )}
      </div>

      {isCreating && <ProductForm data={newProduct} isEdit={false} />}
      {editProduct && <ProductForm data={editProduct} isEdit={true} />}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {uniqueCategories.map((cat) => {
          const isActive = activeFilter === cat;
          const count = cat === "ALL" ? productsData.length : productsData.filter((p) => (p.category_name || p.category) === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${isActive
                  ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100"
                  : "bg-white text-slate-500 border-slate-100 hover:border-purple-300 hover:text-purple-600"
                }`}
            >
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
                {/* Product Info */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img src={product.image_url || "https://via.placeholder.com/100"} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm" />
                      {product.is_sale_on && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow">SALE</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{product.product_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-md uppercase">{product.vendor}</span>
                        <span className="text-[10px] text-slate-400">Size: {product.size || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-5 py-4">
                  {product.is_sale_on ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 line-through">$ {product.original_price}</span>
                      <span className="text-base font-black text-emerald-600">$ {product.sell_price}</span>
                      <span className="text-[9px] font-bold text-red-500 mt-0.5">{product.discount_percentage}% OFF ACTIVE</span>
                    </div>
                  ) : (
                    <span className="text-base font-black text-slate-700">$ {product.original_price}</span>
                  )}
                </td>

                {/* Inventory */}
                <td className="px-5 py-4">
                  <div className={`text-base font-black ${product.quantity < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                    {product.quantity} <span className="text-[10px] text-slate-400 font-normal">PCS</span>
                  </div>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${product.quantity < 5 ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(product.quantity * 10, 100)}%` }} />
                  </div>
                </td>

                {/* Classification */}
                <td className="px-5 py-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                    {product.category_name || product.category}
                  </span>
                </td>

                {/* Controls */}
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="p-2.5 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl transition-all border border-purple-100 shadow-sm"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100 shadow-sm"
                    >
                      <Trash2 size={15} />
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
