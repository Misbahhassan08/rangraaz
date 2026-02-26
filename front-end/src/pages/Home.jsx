import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Mousewheel, Pagination, Autoplay } from "swiper/modules";
import "./Style.css";
import { useNavigate } from "react-router-dom";
import URLS from "../urls";

const Home = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDynamicSlides = async () => {
      try {
        const response = await fetch(URLS.fetchSlider);
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setSlides(data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching slider data:", error);
        setLoading(false);
      }
    };
    fetchDynamicSlides();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Slider Section */}
      <div className="slider-wrapper">
        {loading ? (
          <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 animate-pulse font-medium">Loading exclusive collection...</p>
            </div>
          </div>
        ) : (
          <Swiper
            className="main-swiper"
            modules={[Mousewheel, Pagination, Autoplay]}
            direction={"vertical"}
            speed={800}
            loop={true}
            pagination={{ 
              clickable: true,
              dynamicBullets: true,
            }}
            mousewheel={{
              thresholdDelta: 50,
              sensitivity: 1,
              releaseOnEdges: true,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
          >
            {Object.keys(slides).length > 0 ? (
              Object.keys(slides).sort().map((num) => {
                const currentSlide = slides[num];
                return (
                  <SwiperSlide 
                    key={num} 
                    onClick={() => {
                      if (currentSlide?.link && currentSlide.link !== "") {
                        navigate(currentSlide.link);
                      }
                    }}
                  >
                    {({ isActive }) => (
                      <div className="slide-container">
                        <div className="item">
                          <div className={`circle ${isActive ? "animated-circle" : ""}`}></div>
                          <img 
                            src={currentSlide?.image} 
                            alt={`Slide ${num}`} 
                            className={`slide-image ${currentSlide?.link ? "cursor-pointer" : "cursor-default"}`}
                            loading="lazy"
                          />
                          
                          {/* Optional overlay text - can be enabled if needed */}
                          {isActive && (
                            <div className="slide-overlay">
                              <div className="overlay-content">
                                <h3 className="overlay-title">Discover New Collection</h3>
                                <button className="overlay-button">Shop Now</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </SwiperSlide>
                );
              })
            ) : (
              <SwiperSlide>
                <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="text-center px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Welcome to Rangraaz</h2>
                    <p className="text-gray-600">Discover our latest collection of Pakistani designer dresses</p>
                  </div>
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        )}
      </div>

      {/* Content Section */}
      <div className="content-wrapper">
        <div className="content-container">
          <h2 className="content-title">
            Pakistani Designer Dresses Online at Rangraaz
          </h2>
          
          <div className="content-text">
            <p className="content-paragraph">
              Deciding what to wear is one of the most difficult tasks for every woman, 
              no matter how many clothes does she have in her closet. That's because she 
              runs out of ideas to be stylish every time there is a party or an event she 
              has to attend. Well, try Rangraaz - a newly launched Pakistani designer 
              capturing the market and solving the ever complex problem of a woman's life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;