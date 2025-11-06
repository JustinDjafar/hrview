import React, { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [spotlightJobs, setSpotlightJobs] = useState([]);
  const [loadingSpotlight, setLoadingSpotlight] = useState(true);
  const [errorSpotlight, setErrorSpotlight] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchSpotlightJobs = async () => {
      try {
        const response = await api.get('/jobs/');
        // Filter jobs that have an image_url to be part of the spotlight
        const jobsWithImages = response.data.filter(job => job.image_url);
        setSpotlightJobs(jobsWithImages);
        console.log('Spotlight Jobs Data:', jobsWithImages);
      } catch (err) {
        setErrorSpotlight('Failed to fetch job spotlights.');
        console.error(err);
      } finally {
        setLoadingSpotlight(false);
      }
    };

    fetchSpotlightJobs();
  }, []);

  const nextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += 320; // Adjust this value to match the width of your card + margin
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= 320; // Adjust this value to match the width of your card + margin
    }
  };

  return (
    <div className="h-full w-full bg-white text-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-8xl font-bold mb-8">
          <span className="text-red-600">SPIL</span> Careers
        </h1>
        <p className="text-2xl text-gray-700 mb-12">Find your next job at SPIL</p>

        {/* Spotlight Section */}
        <div className="relative mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Job Spotlights</h2>
          {loadingSpotlight ? (
            <div>Loading spotlights...</div>
          ) : errorSpotlight ? (
            <div>{errorSpotlight}</div>
          ) : spotlightJobs.length === 0 ? (
            <div>No job spotlights available.</div>
          ) : (
            <div className="relative">
              <div className="flex overflow-x-auto space-x-8 scrollbar-hide pb-4" style={{ scrollBehavior: 'smooth' }} ref={sliderRef}>
                {spotlightJobs.map((job, index) => (
                  <div key={index} className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md overflow-hidden">
                    <img src={`http://localhost:8000${job.image_url}`} alt={job.title} className="w-full h-48 object-cover" />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      <p className="text-gray-600 text-sm">{job.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={prevSlide} className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={nextSlide} className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
          <div className="prose lg:prose-xl">
            <h2 className="text-2xl uppercase text-red-600">About Us</h2>
            <h3 className="text-6xl text-green-800 font-bold mb-10">SPIL Connecting Islands</h3>
            <p className="text-justify">
              Salam Pacific Indonesia Lines (SPIL) bergerak di bidang Container Shipping, dengan jaringan logistik lebih dari 38 pelabuhan yang tersebar di seluruh Indonesia. Didukung oleh puluhan kapal container, ratusan alat berat, dan ribuan container. Dengan fasilitas operasional yang mendukung dan personnel yang handal, kami terus berkembang dan berekspansi untuk meningkatkan servis dan kepuasan pelanggan.
            </p>
          </div>
          <div>
            <img src="/image.png" alt="SPIL" className="rounded-lg shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
