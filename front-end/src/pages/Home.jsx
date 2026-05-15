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

  const sortedSlides = Object.keys(slides).sort();

  return (
    <div className="home-container">
      {/* Hero Slider Section */}
      <div className="slider-wrapper">
        {loading ? (
          <div className="flex h-full items-center justify-center bg-[var(--surface-soft)]">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-[var(--brand-pink)]"></div>
              <p className="animate-pulse text-sm font-light uppercase tracking-[0.22em] text-[var(--text-muted)]">Loading collection</p>
            </div>
          </div>
        ) : (
          <Swiper
            className="main-swiper"
            style={{ height: "100%" }}
            modules={[Mousewheel, Pagination, Autoplay]}
            direction={"vertical"}
            speed={800}
            loop={false}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            mousewheel={{
              thresholdDelta: 50,
              releaseOnEdges: true,
              sensitivity: 1,
            }}
            autoplay={{
              delay: 5200,
              disableOnInteraction: false,
            }}
          >
            {sortedSlides.length > 0 ? (
              sortedSlides.map((num, index) => {
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
                      <div className="slide-container" style={{ height: "100vh" }}>
                        <div className="item">
                          <div className={`circle ${isActive ? "animated-circle" : ""}`}></div>
                          <img
                            src={currentSlide?.image}
                            alt={`Slide ${num}`}
                            className={`slide-image ${currentSlide?.link ? "cursor-pointer" : "cursor-default"}`}
                            loading="lazy"
                          />
                          {isActive && (
                            <div className="slide-overlay">
                              <div className="overlay-content">
                                <div className="slide-kicker">
                                  <span>{String(index + 1).padStart(2, "0")}</span>
                                  <span className="h-px w-10 bg-white/45" />
                                  <span>{String(sortedSlides.length).padStart(2, "0")}</span>
                                </div>
                                <p className="slide-eyebrow">Embrace colors Made for you!</p>
                                <h3 className="overlay-title font-display">Luxury color, tailored for your moment</h3>
                                <p className="slide-copy">
                                  A softer boutique experience for expressive Pakistani designer wear.
                                </p>
                                <button className="overlay-button">Explore Collection</button>
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
                <div className="fallback-hero">
                  <img src="/img/image4.webp" alt="" className="fallback-hero-image" />
                  <div className="fallback-hero-panel brand-glass">
                    <img src="/img/logo.png" alt="Rang Raaz" className="mx-auto mb-6 h-20 w-auto animate-float-soft" />
                    <h2 className="mb-4 font-display text-3xl font-medium brand-gradient-text md:text-5xl">Embrace colors Made for you!</h2>
                    <p className="mx-auto max-w-xl text-[var(--text-muted)]">Discover curated Pakistani designer dresses with expressive color, refined cuts, and occasion-ready details.</p>
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
          <p className="mb-4 text-center text-xs font-light uppercase tracking-[0.28em] text-[var(--brand-pink)]">Rang Raaz</p>
          <h2 className="content-title">
            Embrace colors Made for you!
          </h2>
          <div className="content-text">
            <p className="content-paragraph">
              Rang Raaz brings expressive Pakistani designer wear into a softer,
              more personal shopping experience. From daily elegance to occasion-ready
              color, every piece is curated to feel graceful, vivid, and made for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
