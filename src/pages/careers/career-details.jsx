import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, Loader2, ArrowLeft } from "lucide-react";
import { getAllJobs } from "../../service/careers";
import { message } from "../../comman/toster-message/ToastContainer";

const CareerDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
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
      
      // Find the job with matching ID
      const foundJob = jobsArray.find((job) => job.id === jobId || job._id === jobId);
      
      if (foundJob) {
        setJob(foundJob);
      } else {
        message.error("Job not found");
        navigate("/career");
      }
    } catch (error) {
      console.error("Failed to fetch job details:", error);
      message.error("Failed to load job details. Please try again later.");
      navigate("/career");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = () => {
    navigate(`/career/applyNow/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-[#FAF6F2] font-sweet-sans flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#FAF6F2] font-sweet-sans">
      {/* Main Content */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/career")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 mb-8 font-light"
          >
            <ArrowLeft size={20} />
            <span className="text-sm uppercase tracking-[0.15em]">Back to Jobs</span>
          </button>

          {/* Job Details */}
          <div className="bg-white border border-gray-200/50 p-6 md:p-8 lg:p-10">
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 uppercase tracking-wide mb-2 font-sweet-sans">
                  {job.jobTitle}
                </h2>
                {job.jobId && (
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-light">
                    {job.jobId}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {job.department && (
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-light">
                    {job.department}
                  </span>
                )}
                {job.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="font-light">
                      {job.location.remote 
                        ? "Remote" 
                        : `${job.location.city || ''}${job.location.state ? `, ${job.location.state}` : ''}${job.location.country ? `, ${job.location.country}` : ''}`}
                    </span>
                  </div>
                )}
                {job.jobType && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span className="font-light">{job.jobType}</span>
                  </div>
                )}
              </div>
              {(job.salaryRange || job.experienceRequired) && (
                <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                  {job.salaryRange && (
                    <div>
                      <span className="text-gray-500 font-light">Salary: </span>
                      <span className="text-gray-900 font-medium">
                        {job.salaryRange.currency} {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {job.experienceRequired && (
                    <div>
                      <span className="text-gray-500 font-light">Experience: </span>
                      <span className="text-gray-900 font-medium">
                        {job.experienceRequired.min} - {job.experienceRequired.max} {job.experienceRequired.unit}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="w-20 h-px bg-gray-300 mb-8" />
            </div>

            <div className="prose prose-sm max-w-none mb-8">
              <div className="text-gray-700 font-light leading-relaxed space-y-6">
                {job.jobDescription && (
                  <div>
                    <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3 font-sweet-sans">Job Description</h3>
                    <p className="text-base leading-relaxed whitespace-pre-line">
                      {job.jobDescription}
                    </p>
                  </div>
                )}

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div>
                    <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3 font-sweet-sans">Responsibilities</h3>
                    <ul className="list-none space-y-2">
                      {job.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-900 mt-1.5">•</span>
                          <span className="text-base leading-relaxed">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.skillsRequired && job.skillsRequired.length > 0 && (
                  <div>
                    <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3 font-sweet-sans">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm border border-gray-200 text-gray-700 font-light uppercase tracking-wide"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.qualification && (
                  <div>
                    <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3 font-sweet-sans">Qualification</h3>
                    <p className="text-base leading-relaxed">
                      {job.qualification}
                    </p>
                  </div>
                )}

                {job.experienceRequired && (
                  <div>
                    <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3 font-sweet-sans">Experience Required</h3>
                    <p className="text-base leading-relaxed">
                      {job.experienceRequired.min} - {job.experienceRequired.max} {job.experienceRequired.unit}
                    </p>
                  </div>
                )}

                {job.applicationDeadline && (
                  <div>
                    <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3 font-sweet-sans">Application Deadline</h3>
                    <p className="text-base leading-relaxed">
                      {new Date(job.applicationDeadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleApplyClick}
              className="px-8 py-3 bg-gray-900 text-white text-xs uppercase tracking-[0.2em] font-light hover:bg-gray-800 transition-all duration-500"
            >
              Apply Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareerDetails;

