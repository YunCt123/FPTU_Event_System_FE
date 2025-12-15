import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';

const HomePage: React.FC = () => {
  const [stats, setStats] = useState({
    totalEvents: 40,
    upcomingEvents: 20,
    totalParticipants: 420
  });



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel Section */}
      <section className="relative h-[80vh]">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="h-full"
        >
          <SwiperSlide>
            <div className="relative h-full bg-gradient-to-r from-slate-900 to-slate-700">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920')"
                }}
              />
              <div className="relative h-full flex items-center justify-center text-center px-4">
                <div className="max-w-4xl">
                  <h2 className="text-white text-xl md:text-2xl font-light mb-4 tracking-wider">
                    Điểm Đến Duy Nhất
                  </h2>
                  <h1 className="text-white text-5xl md:text-7xl font-bold mb-6">
                    Quản Lý Sự Kiện
                  </h1>
                  <p className="text-white text-lg md:text-xl mb-8 opacity-90">
                    MỌI SỰ KIỆN ĐỀU PHẢI HOÀN HẢO
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative h-full bg-gradient-to-r from-blue-900 to-indigo-700">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920')"
                }}
              />
              <div className="relative h-full flex items-center justify-center text-center px-4">
                <div className="max-w-4xl">
                  <h2 className="text-white text-xl md:text-2xl font-light mb-4 tracking-wider">
                    Khám Phá Những
                  </h2>
                  <h1 className="text-white text-5xl md:text-7xl font-bold mb-6">
                    Sự Kiện Tuyệt Vời Tại FPT
                  </h1>
                  <p className="text-white text-lg md:text-xl mb-8 opacity-90">
                    THAM GIA CÙNG CHÚNG TÔI VỚI TRẢI NGHIỆM KHÓNG THỂ QUÊN
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="relative h-full bg-gradient-to-r from-purple-900 to-pink-700">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920')"
                }}
              />
              <div className="relative h-full flex items-center justify-center text-center px-4">
                <div className="max-w-4xl">
                  <h2 className="text-white text-xl md:text-2xl font-light mb-4 tracking-wider">
                    Tạo Dựng Kỷ Niệm
                  </h2>
                  <h1 className="text-white text-5xl md:text-7xl font-bold mb-6">
                    Cùng Nhau
                  </h1>
                  <p className="text-white text-lg md:text-xl mb-8 opacity-90">
                    TRỞ THÀNH MỘT PHẦN CỦA ĐIỀU ĐẶC BIỆT
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white">
          <span className="text-sm tracking-wider">CUỘN</span>
          <div className="w-0.5 h-12 bg-white opacity-50"></div>
        </div>
      </section>

      {/* Features Section - No.1 Events Management */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="w-12 h-1 bg-orange-500 mb-6"></div>
              <p className="text-orange-500 text-sm font-semibold tracking-wider uppercase mb-2">
                CHÚNG TÔI LÀ FPT EVENT MANAGEMENT
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                <span className="text-orange-500">Số 1</span> Quản Lý<br />Sự Kiện
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Chúng tôi mang đến giải pháp quản lý sự kiện chuyên nghiệp, giúp bạn tổ chức các sự kiện hoàn hảo. 
                Với đội ngũ nhiệt tình và kinh nghiệm, chúng tôi cam kết mang lại trải nghiệm tuyệt vời nhất cho mọi sự kiện.
              </p>
              <Link
                to="/about"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
              >
                VỀ FPT EVENT
              </Link>
            </div>

            {/* Right Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Đội Ngũ Thân Thiện</h3>
                <p className="text-sm text-gray-600">Hơn 200 thành viên</p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Địa Điểm Hoàn Hảo</h3>
                <p className="text-sm text-gray-600">Các địa điểm hoàn hảo</p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Thời Gian Đáng Nhớ</h3>
                <p className="text-sm text-gray-600">Tạo nên sự kiện hoàn hảo</p>
              </div>

              {/* Feature 4 */}
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Hỗ Trợ 24/7</h3>
                <p className="text-sm text-gray-600">Luôn sẵn sàng hỗ trợ</p>
              </div>

              {/* Feature 5 */}
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Kịch Bản Độc Đáo</h3>
                <p className="text-sm text-gray-600">Tạo nên điều khác biệt</p>
              </div>

              {/* Feature 6 */}
              <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Ý Tưởng Sáng Tạo</h3>
                <p className="text-sm text-gray-600">Ý tưởng độc đáo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-orange-500 mb-2">
                {stats.totalEvents}+
              </div>
              <div className="text-lg text-gray-300">Tổng Số Sự Kiện</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-orange-500 mb-2">
                {stats.upcomingEvents}+
              </div>
              <div className="text-lg text-gray-300">Sự Kiện Sắp Diễn Ra</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-orange-500 mb-2">
                {stats.totalParticipants}+
              </div>
              <div className="text-lg text-gray-300">Người Tham Gia Hài Lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn Sàng Tổ Chức Sự Kiện Của Bạn?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Hệ thống quản lý sự kiện chuyên nghiệp dành cho cộng đồng FPT
          </p>
          <Link
            to="/about"
            className="inline-block bg-white text-orange-500 hover:bg-gray-100 px-10 py-4 rounded-full font-semibold transition-all transform hover:scale-105"
          >
            TÌM HIỂU THÊM
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
