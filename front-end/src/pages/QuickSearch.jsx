import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import URLS from '../urls';
import { Search, Trash2, Loader2, CheckCircle } from 'lucide-react';

const POS = () => {
  const [skuInput, setSkuInput] = useState("");
  const [scannedItems, setScannedItems] = useState(() => {
    const saved = localStorage.getItem("pos_scannedItems");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleWindowFocus = () => inputRef.current?.focus();
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("pos_scannedItems", JSON.stringify(scannedItems));
  }, [scannedItems]);

  const handleScan = async (e) => {
    if (e.key === 'Enter' && skuInput.trim() !== "") {
      setLoading(true);
      try {
        const response = await axios.get(URLS.getProductBySku(skuInput));
        if (response.data.success) {
          const product = response.data.product;
          const existingItem = scannedItems.find(item => item.sku === product.sku);

          if (existingItem) {
            setScannedItems(scannedItems.map(item =>
              item.sku === product.sku
                ? {
                    ...item,
                    scan_qty: item.scan_qty + 1 <= item.quantity
                      ? item.scan_qty + 1
                      : item.scan_qty
                  }
                : item
            ));
          } else {
            setScannedItems([...scannedItems, { ...product, scan_qty: 1 }]);
          }
          setSkuInput("");
          inputRef.current?.focus();
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        alert("Product not found with this SKU!");
        setSkuInput("");
        inputRef.current?.focus();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmAllSales = async () => {
    setConfirming(true);
    try {
      for (const item of scannedItems) {
        await axios.put(URLS.updateStock(item.id), {
          quantity: item.quantity - item.scan_qty
        });
      }
      setSuccess(true);
      setTimeout(() => {
        setScannedItems([]);
        setSuccess(false);
        inputRef.current?.focus();
      }, 1500);
    } catch (err) {
      console.error("Sale confirm error:", err);
      alert("⚠️ Sale confirm error!");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      className="p-6 bg-gray-50 min-h-screen"
      onClick={() => inputRef.current?.focus()}
    >

      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">STOCK MASTER</h1>
          <p className="text-gray-500 text-sm">Manage inventory via quick SKU scanning</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-8 max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          autoFocus
          type="text"
          className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-lg"
          placeholder="Type SKU manually..."
          value={skuInput}
          onChange={(e) => setSkuInput(e.target.value)}
          onKeyDown={handleScan}
          onBlur={() => setTimeout(() => inputRef.current?.focus(), 10)}
          disabled={loading}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Qty</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Scan Qty</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {scannedItems.length > 0 ? (
                scannedItems.map((item, index) => (
                  <tr key={index} className="hover:bg-purple-50/30 transition-colors" tabIndex="-1">
                    <td className="px-6 py-4 text-sm text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                          <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                        </div>
                        <span className="font-semibold text-gray-700">{item.product_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="border border-purple-200 rounded-lg px-3 py-1.5 text-xs font-medium text-purple-800 bg-purple-50 uppercase">
                        {item.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${item.quantity <= item.scan_qty ? 'text-red-500' : 'text-gray-700'}`}>
                          {item.quantity} PCS
                        </span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: item.quantity > 5 ? '100%' : '30%' }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-blue-600">{item.scan_qty}x</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-purple-600">${item.sell_price}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setScannedItems(scannedItems.filter((_, i) => i !== index));
                          inputRef.current?.focus();
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        disabled={confirming}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center text-gray-400">
                    <p>No products scanned yet. Please use the search bar above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Confirm Sale Button */}
      {scannedItems.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmAllSales();
            }}
            disabled={confirming || success}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow hover:shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {confirming ? "Processing..." : success ? "Done ✓" : "Confirm Sale"}
          </button>
        </div>
      )}

    </div>
  );
};

export default POS;