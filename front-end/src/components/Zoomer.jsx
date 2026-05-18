import { IoIosArrowBack } from "react-icons/io"
import { RxCross2 } from "react-icons/rx"
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/zoom';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// import required modules
import { Zoom, Navigation, Pagination } from 'swiper/modules';





const Zoomer = ({ onClose, imgArr, title }) => {
    const pagination = {
        clickable: true,
        renderBullet: function (index, className) {
            return `<span class="${className}"><img src="${imgArr[index].image_url}" class=" w-16 h-16 object-cover rounded-full" /></span>`;
        },
    };
    return (
        <div className="fixed inset-0 z-9999 bg-white">

            <div className="absolute top-10 left-10 z-9999 flex gap-3 items-center max-w-[60%] sm:max-w-[70%]">
                <button onClick={onClose} >
                    <IoIosArrowBack className="w-5 h-5 text-gray-700 hover:text-gray-500 cursor-pointer" />
                </button>
                <p className="text-sm  md:text-base tracking-tight font-medium bg-white p-1"> {title}</p>
            </div>

            <div className="absolute top-10 right-10 z-9999 ">
                <button
                    onClick={onClose}
                    className=" text-black text-xl font-bold border border-gray-500 hover:border-gray-300 p-3  cursor-pointer"
                >
                    <RxCross2 className="w-5 h-5 text-gray-500 hover:text-gray-300 transform transition-transform duration-300 hover:rotate-180" />
                </button>
            </div>





            <Swiper
                style={{
                    '--swiper-navigation-color': '#fff',
                    '--swiper-pagination-color': '#fff',
                }}
                zoom={{
                    maxRatio: 4,   // stronger zoom like breakout
                    minRatio: 1,
                }}
                navigation={true}
                pagination={pagination}
                modules={[Zoom, Navigation, Pagination]}
            >



                {imgArr.map((img, index) => (
                    <SwiperSlide key={index} >
                        <div className="swiper-zoom-container ">
                            <img
                                src={img.image_url}
                                alt={`Product ${index + 1}`}
                                className="w-3/4 zoom-img p-10 min-w-3/4"

                                onClick={(e) => {
                                    const swiperEl = e.target.closest('.swiper');
                                    const swiper = swiperEl?.swiper;
                                    if (!swiper) return;

                                    const zoom = swiper.zoom;
                                    // Fix: detect actual zoom state reliably
                                    const isZoomed = zoom.scale && zoom.scale !== 1;
                                    if (!isZoomed) {
                                        zoom.in();
                                    } else {
                                        zoom.out();
                                    }
                                }}

                            />
                        </div>
                    </SwiperSlide>
                ))}



            </Swiper>

        </div>
    )
}

export default Zoomer