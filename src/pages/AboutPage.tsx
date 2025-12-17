import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-gray-700 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm tracking-widest mb-2">ALL YOU NEED TO KNOW</p>
          <h1 className="text-5xl font-bold mb-4">
            ABOUT <span className="text-orange-500">FPT EVENT</span>
          </h1>
          <div className="flex justify-center items-center gap-4 text-sm mt-8">
            <a href="/" className="hover:text-orange-500 transition">
              Home
            </a>
            <span>|</span>
            <span className="text-gray-300">About Us</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Events Management Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="flex flex-col justify-center">
            <p className="text-gray-500 text-sm tracking-wider mb-2">
              WE ARE HARMONI
            </p>
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-5xl">No.1</span> Events Management
            </h2>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full w-fit transition">
              GET STARTED
            </button>
          </div>

          {/* Mission & Vision */}
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                Our Mission
                <span className="h-1 w-8 bg-orange-500 rounded"></span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Lorem ipsum dolor site amet the best consectetur adipiscing sites sed diam nonummy nibh euismod tincidunt ut dolore magna aliqum erat volutpat magna.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lorem ipsum dolor site amet the best consectetur adipiscing sites sed diam nonummy nibh euismod.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                Our Vission
                <span className="h-1 w-8 bg-orange-500 rounded"></span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Lorem ipsum dolor site amet the best consectetur adipiscing sites sed diam nonummy nibh euismod tincidunt ut dolore magna aliqum erat volutpat magna.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lorem ipsum dolor site amet the best consectetur adipiscing sites sed diam nonummy nibh euismod.
              </p>
            </div>
          </div>
        </div>

        {/* Awards Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Working Since Card */}
          <div className="relative">
            <div className="bg-linear-to-br from-blue-900 to-blue-700 rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
                alt="Building"
                className="w-full h-96 object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-12 rounded-lg shadow-2xl text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-wider">
                    HARMONI
                  </h3>
                  <div className="border-t border-gray-300 pt-4 mb-4"></div>
                  <p className="text-gray-600 text-sm mb-2">Working Since</p>
                  <p className="text-6xl font-bold text-gray-800">1980</p>
                </div>
              </div>
            </div>
          </div>

          {/* Awards List */}
          <div>
            <p className="text-gray-500 text-sm tracking-wider mb-2">
              FPT AWARD
            </p>
            <h2 className="text-4xl font-bold mb-8">
              Our Winning <span className="font-bold">Awards</span>
            </h2>

            <div className="space-y-8">
              {/* Award 1 */}
              <div className="relative pl-12 border-l-2 border-gray-300">
                <div className="absolute -left-2.5 top-0 w-5 h-5 bg-gray-300 rounded-full"></div>
                <span className="text-orange-500 text-sm font-semibold">
                  AUG 2015
                </span>
                <h4 className="text-xl font-bold mt-1 mb-2">
                  1st Place For Unique Events 2018
                </h4>
                <p className="text-gray-600 text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit diam
                  sed diam irummy nibh euismod tincidunt.
                </p>
              </div>

              {/* Award 2 */}
              <div className="relative pl-12 border-l-2 border-gray-300">
                <div className="absolute -left-2.5 top-0 w-5 h-5 bg-gray-300 rounded-full"></div>
                <span className="text-orange-500 text-sm font-semibold">
                  MAY 2016
                </span>
                <h4 className="text-xl font-bold mt-1 mb-2">
                  1st Winner Best New Years Events
                </h4>
                <p className="text-gray-600 text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit diam
                  sed diam irummy nibh euismod tincidunt.
                </p>
              </div>

              {/* Award 3 */}
              <div className="relative pl-12">
                <div className="absolute -left-2.5 top-0 w-5 h-5 bg-gray-300 rounded-full"></div>
                <span className="text-orange-500 text-sm font-semibold">
                  DEC 2017
                </span>
                <h4 className="text-xl font-bold mt-1 mb-2">
                  1st Place International Events Awards
                </h4>
                <p className="text-gray-600 text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit diam
                  sed diam irummy nibh euismod tincidunt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
