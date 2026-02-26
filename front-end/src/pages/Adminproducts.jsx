import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X, Save, Tag, Image as ImageIcon, Maximize, Upload } from "lucide-react";
import URLS from "../urls";

const ProductTable = () => {
  const [productsData, setProductsData] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [fetchedSubcategories, setFetchedSubcategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const initialState = {
    product_name: "",
    brand: "RANGRAAZ",
    product_type: "",
    purchase_price: 0,
    image_file: null,
    quantity: 0,
    size: "",
    sku: "",
    vendor: "",
    category_id: "",
    subcategory_id: "",
    original_price: "",
    discount_percentage: 0,
    is_sale_on: false,
  };

  const [newProduct, setNewProduct] = useState(initialState);

  const fetchProducts = async () => {
    try {
      const response = await fetch(URLS.fetchProducts);
      const result = await response.json();
      setProductsData(result.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProductsData([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(URLS.fetchCategories);
      const data = await response.json();
      setFetchedCategories(data.data || data);
    } catch (error) {
      console.error("failed to show categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) { setFetchedSubcategories([]); return; }
    try {
      const response = await fetch(URLS.fetchSubcategories(categoryId));
      const data = await response.json();
      setFetchedSubcategories(data.data || data);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    }
  };

  // ✅ Classification column (RANGRAAZ, ALLY'S etc) se unique tabs banao
  const uniqueCategories = [
    "ALL",
    ...new Set(
      productsData
        .map((p) => p.category_name || p.category)
        .filter(Boolean)
    ),
  ];

  // ✅ Filter products based on active tab
  const filteredProducts =
    activeFilter === "ALL"
      ? productsData
      : productsData.filter(
          (p) => (p.category_name || p.category) === activeFilter
        );

  const handleEditClick = (product) => {
    setEditProduct({ ...product, image_file: null });
    setIsCreating(false);
    fetchSubcategories(product.category_id);
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setEditProduct(null);
    setNewProduct(initialState);
  };

  const handleChange = (e, isEdit = false) => {
    const { name, value, type, checked, files } = e.target;
    let val;
    if (type === "file") { val = files[0]; }
    else { val = type === "checkbox" ? checked : value; }
    if (isEdit) { setEditProduct((prev) => ({ ...prev, [name]: val })); }
    else { setNewProduct((prev) => ({ ...prev, [name]: val })); }
    if (name === "category_id") {
      fetchSubcategories(value);
      if (isEdit) { setEditProduct(prev => ({ ...prev, subcategory_id: "" })); }
      else { setNewProduct(prev => ({ ...prev, subcategory_id: "" })); }
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
    if (currentData.image_file) { formData.append("image", currentData.image_file); }
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

  const ProductForm = ({ data, isEdit }) => {
    const calculatedSalePrice = data.is_sale_on
      ? (parseFloat(data.original_price || 0) - (parseFloat(data.original_price || 0) * parseInt(data.discount_percentage || 0) / 100)).toFixed(2)
      : parseFloat(data.original_price || 0).toFixed(2);

    return (
      <form onSubmit={(e) => handleSubmit(e, isEdit)} className="bg-white p-6 rounded-2xl border-2 border-indigo-50 mb-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            {isEdit ? <Pencil size={20} /> : <Plus size={20} />}
            {isEdit ? "Edit Product Details" : "Register New Product"}
          </h2>
          <button type="button" onClick={() => { setIsCreating(false); setEditProduct(null); }} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Name</label>
            <input type="text" name="product_name" value={data.product_name} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-gray-100 p-2.5 rounded-xl focus:border-indigo-500 outline-none transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Type</label>
            <input type="text" name="product_type" value={data.product_type} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-gray-100 p-2.5 rounded-xl focus:border-indigo-500 outline-none transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vendor</label>
            <input type="text" name="vendor" value={data.vendor} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-gray-100 p-2.5 rounded-xl focus:border-indigo-500 outline-none transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1">
              <ImageIcon size={12} /> Product Image
            </label>
            <div className="relative border-2 border-dashed border-indigo-200 rounded-xl p-2 hover:bg-indigo-50 transition-all flex items-center justify-center cursor-pointer h-[50px]">
              <input type="file" name="image_file" onChange={(e) => handleChange(e, isEdit)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              <div className="flex items-center gap-2 text-indigo-500">
                <Plus size={18} />
                <span className="text-xs font-bold">
                  {data.image_file ? data.image_file.name.substring(0, 15) + "..." : "UPLOAD PHOTO"}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-1"><Maximize size={12} /> Size</label>
            <input type="text" name="size" value={data.size} onChange={(e) => handleChange(e, isEdit)} placeholder="e.g. XL, Large, 42" className="w-full border-2 border-gray-100 p-2.5 rounded-xl focus:border-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">SKU Code</label>
            <input type="text" name="sku" value={data.sku} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-gray-100 p-2.5 rounded-xl focus:border-indigo-500 outline-none transition-all" />
          </div>
          <div className="bg-indigo-50/50 p-5 rounded-2xl col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 border border-indigo-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-indigo-600 uppercase">Original Price (Rs)</label>
              <input type="number" name="original_price" value={data.original_price} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-white p-2.5 rounded-xl outline-none focus:border-indigo-400" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-indigo-600 uppercase">Discount (%)</label>
              <input type="number" name="discount_percentage" value={data.discount_percentage} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-white p-2.5 rounded-xl outline-none focus:border-indigo-400" />
            </div>
            <div className="flex flex-col justify-center items-start pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="is_sale_on" checked={data.is_sale_on} onChange={(e) => handleChange(e, isEdit)} className="w-6 h-6 rounded-lg accent-red-500" />
                <span className="text-sm font-bold text-red-600 group-hover:text-red-700">ACTIVATE SALE</span>
              </label>
            </div>
            <div className="bg-white p-3 rounded-xl border-2 border-dashed border-indigo-200 flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-gray-400">PREVIEW SELL PRICE</span>
              <span className="text-xl font-black text-green-600">Rs. {calculatedSalePrice}</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
            <select name="category_id" value={data.category_id} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 bg-white" required>
              <option value="">Select Category</option>
              {fetchedCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Subcategory</label>
            <select name="subcategory_id" value={data.subcategory_id || ""} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-indigo-500 bg-white" disabled={!data.category_id}>
              <option value="">Select Subcategory</option>
              {fetchedSubcategories.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Stock Quantity</label>
            <input type="number" name="quantity" value={data.quantity} onChange={(e) => handleChange(e, isEdit)} className="w-full border-2 border-gray-100 p-2.5 rounded-xl outline-none focus:border-indigo-500" required />
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <button type="submit" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-200">
            <Save size={20} /> {isEdit ? "Update Product" : "Save Product"}
          </button>
          <button type="button" onClick={() => { setIsCreating(false); setEditProduct(null); }} className="flex-1 md:flex-none bg-gray-100 text-gray-600 px-8 py-3 rounded-xl hover:bg-gray-200 font-bold transition-all">
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-4 md:p-10 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Tag className="text-indigo-600" size={32} /> STOCK MASTER
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage your inventory and seasonal sales</p>
          </div>
          {!isCreating && !editProduct && (
            <button onClick={handleCreateClick} className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1">
              <Plus size={20} strokeWidth={3} /> <span className="font-bold">ADD NEW PRODUCT</span>
            </button>
          )}
        </div>

        {isCreating && <ProductForm data={newProduct} isEdit={false} />}
        {editProduct && <ProductForm data={editProduct} isEdit={true} />}

        {/* ===== FILTER TABS - classification (RANGRAAZ / ALLY'S / HEERA'S) se ===== */}
        <div className="flex flex-wrap gap-2 mb-5">
          {uniqueCategories.map((cat) => {
            const isActive = activeFilter === cat;
            const count =
              cat === "ALL"
                ? productsData.length
                : productsData.filter((p) => (p.category_name || p.category) === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                    : "bg-white text-slate-500 border-slate-100 hover:border-indigo-300 hover:text-indigo-600"
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

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Product Info</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Price Status</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Inventory</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Classification</th>
                  <th className="px-6 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={product.image_url || "https://via.placeholder.com/100"} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                          {product.is_sale_on && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full border-2 border-white shadow-sm">SALE</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-lg">{product.product_name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{product.vendor}</span>
                            <span className="text-[10px] font-bold text-slate-400">Size: {product.size || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        {product.is_sale_on ? (
                          <>
                            <span className="text-xs text-slate-400 line-through">Rs. {product.original_price}</span>
                            <span className="text-lg font-black text-emerald-600">Rs. {product.sell_price}</span>
                            <span className="text-[9px] font-bold text-red-500 mt-1">{product.discount_percentage}% OFF ACTIVE</span>
                          </>
                        ) : (
                          <span className="text-lg font-black text-slate-700">Rs. {product.original_price}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className={`text-lg font-black ${product.quantity < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                          {product.quantity} <span className="text-[10px] text-slate-400 font-normal">PCS</span>
                        </div>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                          <div className={`h-full rounded-full ${product.quantity < 5 ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(product.quantity * 10, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black w-fit uppercase">
                        {product.category_name || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(product)} className="p-3 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-50 shadow-sm"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(product)} className="p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-50 shadow-sm"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-slate-300">
              <Tag size={64} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold text-lg">
                {activeFilter === "ALL" ? "No products in your catalog yet." : `No products found for "${activeFilter}".`}
              </p>
              <p className="text-sm">
                {activeFilter === "ALL" ? "Start by adding your first product above." : "Try a different filter."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
