import React, { useState, useEffect } from 'react';
import URLS from '../urls';

const ManageSlider = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); 
    const [slideIndex, setSlideIndex] = useState(1);
    const [redirectLink, setRedirectLink] = useState("/allproducts");
    const [announcement, setAnnouncement] = useState("");
    const [isScrolling, setIsScrolling] = useState(false);

    // Initial Data Fetch
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
                body: JSON.stringify({ 
                    announcement_text: announcement,
                    is_scrolling: isScrolling 
                }),
            });
            if (response.ok) {
                alert("Header settings updated successfully!");
            } else {
                alert("Failed to update header.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Connection error!");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) return alert("Please select image!");
        const formData = new FormData();
        formData.append("sliderImage", selectedImage);
        formData.append("slideIndex", slideIndex); 
        formData.append("link", redirectLink); 

        try {
         const response = await fetch(URLS.updateSlider, {
                method: "POST",
                body: formData,
            });
            if (response.ok) {
                alert(`Slide ${slideIndex} successfully updated!`);
                setSelectedImage(null);
                setPreviewUrl(null);
            }
        } catch (error) {
            alert("Slider update failed!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 ">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center ">
                    Manage Slider Images
                </h1>
                
                {/* Main Content - Centered on all screens */}
                <div className="flex flex-col items-center justify-center space-y-8">
                    
                    {/* Slider Section */}
                    <div className="w-full max-w-3xl bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-10 text-center shadow-sm">
                        <div className="mb-8">
                            <p className="mb-2 text-gray-600 font-medium">Step 1: Select Slide Number</p>
                            <select 
                                className="border border-gray-300 rounded-md p-2 w-40 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer mx-auto"
                                value={slideIndex}
                                onChange={(e) => setSlideIndex(e.target.value)}
                            >
                                <option value="1">Slide 1</option>
                                <option value="2">Slide 2</option>
                                <option value="3">Slide 3</option>
                                <option value="4">Slide 4</option>
                            </select>
                        </div>

                        <div className="mb-8">
                            <p className="mb-2 text-gray-600 font-medium">Step 2: Enter Redirect Link (URL)</p>
                            <input 
                                type="text"
                                className="border border-gray-300 rounded-lg p-3 w-full max-w-md mx-auto text-center outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={redirectLink}
                                onChange={(e) => setRedirectLink(e.target.value)}
                                placeholder="e.g., /allproducts or https://example.com"
                            />
                        </div>

                        <div className="mb-4">
                            <p className="mb-4 text-gray-600 font-medium">Step 3: Upload Photo</p>
                            <div className="flex flex-col items-center justify-center">
                                <label className="cursor-pointer group">
                                    <div className="w-40 h-40 md:w-44 md:h-44 border-4 border-dashed border-gray-200 group-hover:border-blue-400 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 bg-gray-50 shadow-inner">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center p-4">
                                                <span className="text-4xl md:text-6xl text-gray-300 group-hover:text-blue-500">+</span>
                                                <span className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest text-center">
                                                    Select Image
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        onChange={handleImageChange} 
                                        className="hidden" 
                                        accept="image/*" 
                                    />
                                </label>
                                <p className="text-xs text-gray-400 mt-2">
                                    Recommended: 1920x1080px or 16:9 ratio
                                </p>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            onClick={handleUpload}
                            className="mt-8 bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white shadow-lg shadow-purple-500/20 font-bold px-8 md:px-14 py-3 md:py-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
                        >
                            Update Slide {slideIndex} Now
                        </button>
                    </div>

                    {/* Announcement Section */}
                    <div className="w-full max-w-3xl p-6 md:p-8 bg-white rounded-lg shadow-md border border-purple-200">
                        <h3 className="font-bold text-lg md:text-xl mb-6 text-purple-800 text-center md:text-left">
                            Update Header Announcement
                        </h3>
                        
                        <div className="flex flex-col gap-6">
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 p-3 md:p-4 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-sm md:text-base" 
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                placeholder="E.g. Get 50% SALE FROM ALL ITEMS"
                            />
                            
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <input 
                                    type="checkbox" 
                                    id="scroll-toggle"
                                    className="w-5 h-5 accent-purple-600 cursor-pointer"
                                    checked={isScrolling} 
                                    onChange={(e) => setIsScrolling(e.target.checked)} 
                                />
                                <label htmlFor="scroll-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Enable Scrolling (Marquee Effect)
                                </label>
                            </div>

                            <button 
                                type="button" 
                                onClick={handleUpdateAnnouncement} 
                                className="bg-gradient-to-r from-[#8D33F6] to-[#E034F5] text-white shadow-lg shadow-purple-500/20 font-bold px-6 py-3 md:py-4 rounded-md transition-all active:scale-95 hover:shadow-lg w-full md:w-auto md:px-8"
                            >
                                Update Header Text
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSlider;