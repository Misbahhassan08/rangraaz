import React, { useState, useRef } from 'react';
import Barcode from 'react-barcode';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Printer, Search, Package, AlertCircle, LayoutGrid } from 'lucide-react';
import URLS from '../urls';

const Barcodemanager = () => {
  const [skuSearch, setSkuSearch] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Product_Barcodes',
  });

  const handleSearch = async () => {
    if (!skuSearch) return setError('Please enter an SKU');
    try {
     const response = await axios.get(URLS.fetchProducts);
      const foundProduct = response.data.data.find(p => p.sku === skuSearch.trim());

      if (foundProduct) {
        setProduct(foundProduct);
        setError('');
      } else {
        setProduct(null);
        setError('Product not found');
      }
    } catch (err) {
      setError('Connection failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans">
      {/* Header - Compact Size */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-1.5 rounded-md text-white">
            <LayoutGrid size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Barcode Manager</h1>
            <p className="text-slate-500 text-[11px]">Generate and print labels</p>
          </div>
        </div>

        {product && (
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95"
          >
            <Printer size={16} />
            Print Labels
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Search - Smaller Text */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Search size={14} className="text-emerald-600" />
              Find Product
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SKU Number</label>
                <input
                  type="text"
                  value={skuSearch}
                  onChange={(e) => setSkuSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="e.g. bhgy7"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                  min="1"
                />
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Search Inventory
              </button>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-[11px] font-medium bg-red-50 p-2 rounded-md border border-red-100">
                  <AlertCircle size={12} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-3 uppercase tracking-wider">
            <Package size={14} className="text-emerald-600" />
            Product Preview
          </h3>
          {product ? (
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <img src={product.image_url} alt="product" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">{product.product_name}</h4>
                <div className="flex gap-2">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md font-bold text-xs border border-emerald-100">
                    ${product.sell_price}
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md font-semibold text-[10px] border border-slate-200 uppercase">
                    SKU: {product.sku}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 space-y-1">
              <Package size={24} strokeWidth={1} />
              <p className="text-xs font-medium">No product selected</p>
            </div>
          )}
        </div>
      </div>

      {/* Barcode Grid Area */}
      <div className="mt-6 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">
          Grid Preview ({product ? quantity : 0})
        </h3>

        <div ref={componentRef} className="bg-white">
          <style type="text/css" dangerouslySetInnerHTML={{
            __html: `
            @media print {
              @page { size: auto; margin: 10mm; }
              .print-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; }
              .no-print { display: none !important; }
            }
          `}} />

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-4 print-grid">
            {product && [...Array(parseInt(quantity) || 0)].map((_, index) => (
              <div key={index} className="flex flex-col items-center p-3 border border-slate-100 rounded-lg bg-slate-50/30 hover:shadow-sm transition-all break-inside-avoid">
                <p className="text-[9px] font-bold text-slate-800 uppercase mb-1 truncate w-full text-center">
                  {product.product_name}
                </p>
                <div className="bg-white p-1 rounded border border-slate-100">
                  <Barcode value={product.sku} width={0.8} height={35} fontSize={8} />
                </div>
                <p className="text-[9px] font-black text-emerald-700 mt-1">
                  PRICE: ${product.sell_price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Barcodemanager;