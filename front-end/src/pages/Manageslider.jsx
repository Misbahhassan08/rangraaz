import React, { useState, useEffect } from 'react';
import URLS from '../urls';
import { Image as ImageIcon, Link, Layers, Megaphone, Upload, CheckCircle } from 'lucide-react';

const ManageSlider = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [slideIndex, setSlideIndex] = useState(1);
    const [redirectLink, setRedirectLink] = useState("/allproducts");
    const [announcement, setAnnouncement] = useState("");
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        fetch(URLS.manageAnnouncement)
            .then(res => res.json())
            .then(data => {
                setAnnouncement(data.text);
                setIsScrolling(data.is_scrolling || false);
            })
            .catch(err => console.error("Error fetching:", err));
    }, []);

    const handleUpdateAnnouncement = async () => {
        try {
            const response = await fetch(URLS.manageAnnouncement, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ announcement_text: announcement, is_scrolling: isScrolling }),
            });
            if (response.ok) alert("Header settings updated successfully!");
            else alert("Failed to update header.");
        } catch (error) {
            console.error("Error:", error);
            alert("Connection error!");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) { setSelectedImage(file); setPreviewUrl(URL.createObjectURL(file)); }
    };

    const handleUpload = async () => {
        if (!selectedImage) return alert("Please select image!");
        const formData = new FormData();
        formData.append("sliderImage", selectedImage);
        formData.append("slideIndex", slideIndex);
        formData.append("link", redirectLink);
        try {
            const response = await fetch(URLS.updateSlider, { method: "POST", body: formData });
            if (response.ok) {
                alert(`Slide ${slideIndex} successfully updated!`);
                setSelectedImage(null);
                setPreviewUrl(null);
            }
        } catch (error) { alert("Slider update failed!"); }
    };

    const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition placeholder-gray-400";

    return (
        <div className="p-5 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <Layers size={20} className="text-purple-600" />
                    Manage Slider
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">Update homepage slider images and announcement banner</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* LEFT — Slider Updater */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                        <ImageIcon size={14} className="text-purple-500" />
                        <h3 className="text-sm font-semibold text-gray-700">Update Slider Image</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Slide Number */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                                <span className="inline-flex items-center gap-1"><Layers size={11} /> Slide Number</span>
                            </label>
                            <select
                                value={slideIndex}
                                onChange={(e) => setSlideIndex(e.target.value)}
                                className={inputCls}
                            >
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>Slide {n}</option>)}
                            </select>
                        </div>

                        {/* Redirect Link */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                                <span className="inline-flex items-center gap-1"><Link size={11} /> Redirect URL</span>
                            </label>
                            <input
                                type="text"
                                className={inputCls}
                                value={redirectLink}
                                onChange={(e) => setRedirectLink(e.target.value)}
                                placeholder="/allproducts or https://..."
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                                <span className="inline-flex items-center gap-1"><Upload size={11} /> Slide Image</span>
                            </label>
                            <label className="cursor-pointer block">
                                <div className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all ${previewUrl ? 'border-purple-300' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/40'}`} style={{ height: '140px' }}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-gray-400">
                                            <ImageIcon size={28} strokeWidth={1} className="text-gray-300" />
                                            <span className="text-xs font-semibold text-gray-400">Click to upload image</span>
                                            <span className="text-[10px] text-gray-300">Recommended: 1920×1080px</span>
                                        </div>
                                    )}
                                    {previewUrl && (
                                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                                            <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-lg">Change Image</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                            </label>
                            {selectedImage && (
                                <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                                    <CheckCircle size={11} /> {selectedImage.name.substring(0, 30)}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleUpload}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-purple-100"
                        >
                            <Upload size={15} />
                            Update Slide {slideIndex}
                        </button>
                    </div>
                </div>

                {/* RIGHT — Announcement */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                        <Megaphone size={14} className="text-purple-500" />
                        <h3 className="text-sm font-semibold text-gray-700">Header Announcement</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Announcement Text</label>
                            <input
                                type="text"
                                className={inputCls}
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                placeholder="e.g. Get 50% OFF on all items!"
                            />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-gray-50 hover:bg-purple-50 transition border border-gray-100 hover:border-purple-200">
                            <div className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${isScrolling ? 'bg-purple-600' : 'bg-gray-200'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isScrolling ? 'left-5' : 'left-0.5'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Marquee Scrolling</p>
                                <p className="text-xs text-gray-400">Enable auto-scrolling text effect</p>
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isScrolling}
                                onChange={(e) => setIsScrolling(e.target.checked)}
                            />
                        </label>

                        {/* Preview */}
                        {announcement && (
                            <div className="rounded-lg bg-purple-600 px-3 py-2 overflow-hidden">
                                <p className="text-[10px] text-purple-200 mb-1 font-semibold uppercase tracking-wide">Preview</p>
                                <p className={`text-white text-xs font-medium truncate ${isScrolling ? 'animate-pulse' : ''}`}>
                                    {announcement}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleUpdateAnnouncement}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-purple-100"
                        >
                            <Megaphone size={15} />
                            Update Announcement
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSlider;
