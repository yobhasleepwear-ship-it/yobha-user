import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Clock, Briefcase, Search, Loader2, X } from "lucide-react";
import { getAllJobs } from "../../service/careers";
import { message } from "../../comman/toster-message/ToastContainer";
import { useNavigate } from "react-router-dom";

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await getAllJobs();
      
      let jobsArray = [];
      
      // Handle different response structures
      if (Array.isArray(response)) {
        jobsArray = response;
      } else if (response && Array.isArray(response.data)) {
        jobsArray = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
        jobsArray = response.data;
      } else {
        console.warn("Unexpected response structure:", response);
        jobsArray = [];
      }
      
      // Filter only active jobs if status field exists
      if (jobsArray.length > 0 && jobsArray[0] && jobsArray[0].hasOwnProperty('status')) {
        jobsArray = jobsArray.filter(job => job.status === 'Active');
      }
      
      setJobs(Array.isArray(jobsArray) ? jobsArray : []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      message.error("Failed to load job listings. Please try again later.");
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search function that searches across all job fields
  const performSearch = useCallback((query) => {
    const searchTerm = query.toLowerCase().trim();
    
    let filtered = [...jobs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((job) => {
        const searchableFields = [
          job.jobTitle || "",
          job.jobId || "",
          job.department || "",
          job.jobDescription || "",
          job.jobType || "",
          job.location?.city || "",
          job.location?.state || "",
          job.location?.country || "",
          ...(job.skillsRequired || []),
          job.qualification || "",
        ].join(" ").toLowerCase();

        return searchableFields.includes(searchTerm);
      });
    }

    // Apply country filter
    if (selectedCountry) {
      filtered = filtered.filter((job) => {
        if (job.location?.remote) return false;
        const country = job.location?.country?.toLowerCase() || "";
        return country === selectedCountry.toLowerCase();
      });
    }

    // Apply job type filter
    if (selectedJobType) {
      filtered = filtered.filter((job) => {
        const jobType = job.jobType?.toLowerCase() || "";
        return jobType === selectedJobType.toLowerCase();
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, selectedCountry, selectedJobType]);

  // Debounce search with useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const handleJobTypeChange = (e) => {
    setSelectedJobType(e.target.value);
  };

  const handleJobClick = (jobId) => {
    navigate(`/career/${jobId}`);
  };

  // Get unique countries and job types for filters
  const getUniqueCountries = () => {
    const countries = new Set();
    jobs.forEach((job) => {
      if (job.location && !job.location.remote && job.location.country) {
        countries.add(job.location.country);
      }
    });
    return Array.from(countries).sort();
  };

  const getUniqueJobTypes = () => {
    const jobTypes = new Set();
    jobs.forEach((job) => {
      if (job.jobType) {
        jobTypes.add(job.jobType);
      }
    });
    return Array.from(jobTypes).sort();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCountry("");
    setSelectedJobType("");
  };

  const hasActiveFilters = searchQuery || selectedCountry || selectedJobType;

  return (
    <div className="relative min-h-screen bg-white font-futura-pt-light">
      {/* Compact Header Section with Integrated Search/Filters */}
      <section className="relative w-full bg-white border-b border-gray-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 md:py-8">
          {/* Compact Heading */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light">
              Join Our Team
            </h1>
            <p className="text-gray-600 text-xs md:text-sm font-light leading-relaxed font-futura-pt-light">
              Discover opportunities to grow your career with us
            </p>
          </div>

          {/* Search and Filters Section - Integrated */}
          <div className="space-y-4">
            {/* Search Box - Compact */}
            <div className="relative">
              <div className="relative bg-white border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center">
                  <div className="pl-4 pr-2">
                    <Search className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search jobs by title, description, skills, location..."
                    className="w-full pl-2 pr-10 py-3 md:py-3.5 focus:outline-none bg-transparent text-gray-900 font-light placeholder:text-gray-400 text-sm md:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors duration-200 p-1 hover:bg-gray-100 rounded"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filters - Compact Horizontal Layout */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 rounded-md transition-all duration-300 bg-white text-gray-900 font-light text-sm md:text-base shadow-sm hover:shadow-md cursor-pointer"
                >
                  <option value="">All Countries</option>
                  {getUniqueCountries().map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedJobType}
                  onChange={handleJobTypeChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 rounded-md transition-all duration-300 bg-white text-gray-900 font-light text-sm md:text-base shadow-sm hover:shadow-md cursor-pointer"
                >
                  <option value="">All Job Types</option>
                  {getUniqueJobTypes().map((jobType) => (
                    <option key={jobType} value={jobType}>
                      {jobType}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-5 py-3 border border-gray-900/40 text-gray-900 text-xs uppercase tracking-[0.2em] font-light hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap rounded-md"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results count - Compact */}
            {!isLoading && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-200/30">
                <div className="text-xs md:text-sm text-gray-600 font-light">
                  <span className="text-gray-900 font-light">{filteredJobs.length}</span> of <span className="text-gray-900 font-light">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''} {hasActiveFilters && 'found'}
                </div>
                {hasActiveFilters && searchQuery && (
                  <span className="px-2 py-1 text-xs uppercase tracking-wide text-gray-600 bg-gray-100/50 font-light">
                    "{searchQuery}"
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Jobs List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-4" />
              <p className="text-gray-500 text-sm font-light uppercase tracking-wide">Loading opportunities...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100/50 mb-6">
                <Briefcase className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light">
                {hasActiveFilters ? "No Results Found" : "No Open Positions"}
              </h3>
              <p className="text-gray-600 text-xs md:text-sm font-light leading-relaxed font-futura-pt-light mb-2 max-w-md mx-auto">
                {hasActiveFilters ? "No jobs match your search criteria." : "No job openings at the moment."}
              </p>
              <p className="text-gray-500 text-sm font-light">
                {hasActiveFilters ? "Try adjusting your filters or search terms." : "Check back soon for new opportunities."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-3 border border-gray-900/30 text-gray-900 text-xs uppercase tracking-[0.2em] font-light hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredJobs.map((job, index) => (
            <div
              key={job.id}
              className="group cursor-pointer bg-white border border-gray-200 shadow-sm hover:border-gray-900/40 hover:shadow-xl transition-all duration-500 flex flex-col h-full transform hover:-translate-y-1"
                  onClick={() => handleJobClick(job.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-6 md:p-8 flex flex-col h-full relative overflow-hidden">
                    {/* Subtle hover effect background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 to-gray-50/0 group-hover:from-gray-50/50 group-hover:to-transparent transition-all duration-500"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Header Section */}
                      <div className="mb-5 min-h-[120px] flex flex-col justify-between">
                          {job.department && (
                          <div className="mb-3">
                            <span className="inline-block px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-500 bg-gray-100/50 font-light border border-gray-200/50">
                              {job.department}
                            </span>
                          {job.jobId && (
                              <span className="inline-block ml-2 px-2 py-1 text-xs uppercase tracking-[0.2em] text-gray-400 font-light">
                              {job.jobId}
                            </span>
                          )}
                          </div>
                        )}
                        <h3
                          className="text-xl sm:text-xl md:text-2xl lg:text-2xl font-light text-black uppercase mb-4 font-futura-pt-light group-hover:text-gray-700 transition-colors duration-300"
                          style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "72px" }}
                        >
                          {job.jobTitle}
                        </h3>
                        </div>

                      {/* Info Section */}
                      <div className="space-y-2.5 mb-6 min-h-[80px] flex flex-col justify-between">
                          {job.location && (
                          <div className="flex items-center gap-2.5 text-sm text-gray-600">
                            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="font-light">
                                {job.location.remote 
                                ? <span className="text-gray-500 ">Remote</span>
                                  : `${job.location.city || ''}${job.location.state ? `, ${job.location.state}` : ''}${job.location.country ? `, ${job.location.country}` : ''}`}
                              </span>
                            </div>
                          )}
                          {job.jobType && (
                          <div className="flex items-center gap-2.5 text-sm text-gray-600">
                            <Clock size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="font-light">{job.jobType}</span>
                            </div>
                          )}
                        </div>

                      {/* Description Section */}
                      <div className="flex-grow mb-6">
                        <p
                          className="text-sm text-gray-600 font-light leading-relaxed overflow-hidden"
                          style={{ display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", minHeight: "96px" }}
                        >
                          {job.jobDescription && job.jobDescription.length > 0
                            ? job.jobDescription
                            : "Detailed role information will be shared during the interview process."}
                        </p>
                      </div>

                      {/* Salary Section */}
                      <div className="mb-6 pb-6 border-b border-gray-100 min-h-[80px] flex items-center">
                        {job.salaryRange ? (
                          <div className="text-sm text-gray-600 font-light">
                            <span className="text-xs uppercase tracking-[0.15em] text-gray-500 block mb-1">Salary Range</span>
                            <span className="text-base font-light text-gray-900">
                              {job.salaryRange.currency} {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Compensation details will be discussed during the hiring process.
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job.id);
                        }}
                        className="w-full mt-auto px-6 py-3.5 border border-gray-900/30 text-gray-900 text-xs uppercase tracking-[0.2em] font-light hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 group-hover:shadow-md"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Careers; 
