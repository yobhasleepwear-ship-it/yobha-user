import React, { useState, useEffect } from "react";
import { MapPin, Clock, Briefcase, X, Upload, Loader2 } from "lucide-react";
import { getAllJobs, applyForJob } from "../../service/careers";
import { message } from "../../comman/toster-message/ToastContainer";

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    currentCity: "",
    positionAppliedFor: "",
    relevantExperienceYears: "",
    currentCTC: "",
    expectedCTC: "",
    noticePeriodInDays: "",
    resume: null,
    portfolioUrl: "",
    whyYobha: "",
    howDidYouHear: "",
  });

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
        // Direct array response (API returns array directly)
        jobsArray = response;
      } else if (response && Array.isArray(response.data)) {
        // Response wrapped in data property
        jobsArray = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
        // Response with success flag and data property
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

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowApplicationForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
    setFormData({
      fullName: "",
      email: "",
      mobileNumber: "",
      currentCity: "",
      positionAppliedFor: job.jobTitle || "",
      relevantExperienceYears: "",
      currentCTC: "",
      expectedCTC: "",
      noticePeriodInDays: "",
      resume: null,
      portfolioUrl: "",
      whyYobha: "",
      howDidYouHear: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error("File size must be less than 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        resume: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.mobileNumber || !formData.resume) {
      message.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const applicationPayload = new FormData();
      applicationPayload.append("fullName", formData.fullName);
      applicationPayload.append("email", formData.email);
      applicationPayload.append("mobileNumber", formData.mobileNumber);
      applicationPayload.append("currentCity", formData.currentCity || "");
      applicationPayload.append("positionAppliedFor", formData.positionAppliedFor || selectedJob.jobTitle);
      applicationPayload.append("relevantExperienceYears", formData.relevantExperienceYears || "0");
      applicationPayload.append("currentCTC", formData.currentCTC || "0");
      applicationPayload.append("expectedCTC", formData.expectedCTC || "0");
      applicationPayload.append("noticePeriodInDays", formData.noticePeriodInDays || "0");
      applicationPayload.append("resume", formData.resume);
      if (formData.portfolioUrl) {
        applicationPayload.append("portfolioUrl", formData.portfolioUrl);
      }
      if (formData.whyYobha) {
        applicationPayload.append("whyYobha", formData.whyYobha);
      }
      if (formData.howDidYouHear) {
        applicationPayload.append("howDidYouHear", formData.howDidYouHear);
      }

      const response = await applyForJob(selectedJob.id, applicationPayload);
      if (response && response.success) {
        message.success("Application submitted successfully!");
        setShowApplicationForm(false);
        setSelectedJob(null);
        setFormData({
          fullName: "",
          email: "",
          mobileNumber: "",
          currentCity: "",
          positionAppliedFor: "",
          relevantExperienceYears: "",
          currentCTC: "",
          expectedCTC: "",
          noticePeriodInDays: "",
          resume: null,
          portfolioUrl: "",
          whyYobha: "",
          howDidYouHear: "",
        });
        // Reset file input
        const fileInput = document.getElementById("resume-upload");
        if (fileInput) fileInput.value = "";
      } else {
        message.error("Failed to submit application. Please try again.");
      }
    } catch (error) {
      console.error("Application error:", error);
      message.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF6F2] font-sweet-sans">
      {/* Hero Section */}
      <section className="relative w-full bg-white border-b border-gray-100/50 pt-8 md:pt-12 lg:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-12 md:pb-16 lg:pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-6 md:mb-8">
              Join Our Team
            </h1>
            <div className="w-16 md:w-20 h-px bg-gray-300 mx-auto mb-6 md:mb-8" />
            <p className="text-gray-600 text-base md:text-lg lg:text-xl font-light tracking-wide leading-relaxed">
              Discover opportunities to grow your career with us. We're looking for passionate individuals who share our vision of premium quality and innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No job openings at the moment.</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for new opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Jobs List */}
              <div className={selectedJob ? "lg:col-span-1 order-2 lg:order-1" : "lg:col-span-3"}>
                <div className={`grid grid-cols-1 ${selectedJob ? "md:grid-cols-1 lg:grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"} gap-6`}>
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className={`group cursor-pointer bg-white border border-gray-200/50 hover:border-gray-300 transition-all duration-500 flex flex-col h-full ${
                        selectedJob?.id === job.id ? "ring-2 ring-gray-900 border-gray-900" : ""
                      }`}
                      onClick={() => handleJobClick(job)}
                    >
                      <div className="p-6 md:p-8 flex flex-col h-full">
                        <div className="mb-4">
                          <h3 className="text-xl md:text-2xl font-light text-gray-900 uppercase tracking-wide mb-3 group-hover:text-gray-700 transition-colors duration-300">
                            {job.jobTitle}
                          </h3>
                          {job.department && (
                            <span className="inline-block text-xs uppercase tracking-[0.2em] text-gray-500 font-light mb-3">
                              {job.department}
                            </span>
                          )}
                          {job.jobId && (
                            <span className="inline-block ml-2 text-xs uppercase tracking-[0.2em] text-gray-400 font-light">
                              {job.jobId}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 mb-6">
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

                        <div className="flex-grow min-h-0">
                          {job.jobDescription && (
                            <p className="text-sm text-gray-600 font-light leading-relaxed line-clamp-3 mb-4">
                              {job.jobDescription.substring(0, 150) + "..."}
                            </p>
                          )}
                        </div>

                        {job.salaryRange && (
                          <div className="text-sm text-gray-600 font-light mb-4">
                            <span className="font-medium text-gray-900">
                              {job.salaryRange.currency} {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyClick(job);
                          }}
                          className="w-full mt-auto px-6 py-3 border border-gray-900/30 text-gray-900 text-xs uppercase tracking-[0.2em] font-light hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-500"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Details & Application Form */}
              {selectedJob && (
                <div className="lg:col-span-2 order-1 lg:order-2">
                  {showApplicationForm ? (
                    /* Application Form */
                    <div className="bg-white border border-gray-200/50 p-6 md:p-8 lg:p-10">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-light text-gray-900 uppercase tracking-wide">
                          Apply for {selectedJob.jobTitle}
                        </h2>
                        <button
                          onClick={() => setShowApplicationForm(false)}
                          className="text-gray-400 hover:text-gray-900 transition-colors duration-300"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light"
                              placeholder="Enter your full name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light"
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2">
                              Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              name="mobileNumber"
                              value={formData.mobileNumber}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light"
                              placeholder="+919876543210"
                            />
                          </div>

                          <div>
                            <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2">
                              Current City
                            </label>
                            <input
                              type="text"
                              name="currentCity"
                              value={formData.currentCity}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light"
                              placeholder="Bangalore"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2 whitespace-nowrap">
                              Relevant Experience (Years)
                            </label>
                            <input
                              type="number"
                              name="relevantExperienceYears"
                              value={formData.relevantExperienceYears}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light"
                              placeholder="3"
                            />
                          </div>

                          <div>
                            <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2 whitespace-nowrap">
                              Current CTC (INR)
                            </label>
                            <input
                              type="number"
                              name="currentCTC"
                              value={formData.currentCTC}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light"
                              placeholder="600000"
                            />
                          </div>

                          <div>
                            <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2 whitespace-nowrap">
                              Expected CTC (INR)
                            </label>
                            <input
                              type="number"
                              name="expectedCTC"
                              value={formData.expectedCTC}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light"
                              placeholder="900000"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2">
                            Notice Period (Days)
                          </label>
                          <input
                            type="number"
                            name="noticePeriodInDays"
                            value={formData.noticePeriodInDays}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light"
                            placeholder="30"
                          />
                        </div>

                        <div>
                          <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2">
                            Resume/CV <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              required
                              className="hidden"
                              id="resume-upload"
                            />
                            <label
                              htmlFor="resume-upload"
                              className="flex items-center gap-3 px-4 py-3 border border-gray-200 hover:border-gray-900 cursor-pointer transition-colors duration-300 bg-white"
                            >
                              <Upload size={20} className="text-gray-600" />
                              <span className="text-sm text-gray-600 font-light">
                                {formData.resume ? formData.resume.name : "Choose file (PDF, DOC, DOCX)"}
                              </span>
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 font-light">Maximum file size: 5MB</p>
                        </div>

                        <div>
                          <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2">
                            Portfolio URL
                          </label>
                          <input
                            type="url"
                            name="portfolioUrl"
                            value={formData.portfolioUrl}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light"
                            placeholder="https://yourportfolio.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2">
                            Why YOBHA?
                          </label>
                          <textarea
                            name="whyYobha"
                            value={formData.whyYobha}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light resize-none"
                            placeholder="I love creating interactive UI..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm uppercase tracking-[0.15em] text-gray-900 font-light mb-2">
                            How Did You Hear About Us?
                          </label>
                          <input
                            type="text"
                            name="howDidYouHear"
                            value={formData.howDidYouHear}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-gray-900 font-light"
                            placeholder="LinkedIn, Website, Referral, etc."
                          />
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-gray-900 text-white text-xs uppercase tracking-[0.2em] font-light hover:bg-gray-800 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                              </span>
                            ) : (
                              "Submit Application"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowApplicationForm(false)}
                            className="px-8 py-3 border border-gray-900/30 text-gray-900 text-xs uppercase tracking-[0.2em] font-light hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* Job Details */
                    <div className="bg-white border border-gray-200/50 p-6 md:p-8 lg:p-10">
                      <div className="mb-8">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-3xl md:text-4xl font-light text-gray-900 uppercase tracking-wide mb-2">
                              {selectedJob.jobTitle}
                            </h2>
                            {selectedJob.jobId && (
                              <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-light">
                                {selectedJob.jobId}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                          {selectedJob.department && (
                            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-light">
                              {selectedJob.department}
                            </span>
                          )}
                          {selectedJob.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin size={16} className="text-gray-400" />
                              <span className="font-light">
                                {selectedJob.location.remote 
                                  ? "Remote" 
                                  : `${selectedJob.location.city || ''}${selectedJob.location.state ? `, ${selectedJob.location.state}` : ''}${selectedJob.location.country ? `, ${selectedJob.location.country}` : ''}`}
                              </span>
                            </div>
                          )}
                          {selectedJob.jobType && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock size={16} className="text-gray-400" />
                              <span className="font-light">{selectedJob.jobType}</span>
                            </div>
                          )}
                        </div>
                        {(selectedJob.salaryRange || selectedJob.experienceRequired) && (
                          <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                            {selectedJob.salaryRange && (
                              <div>
                                <span className="text-gray-500 font-light">Salary: </span>
                                <span className="text-gray-900 font-medium">
                                  {selectedJob.salaryRange.currency} {selectedJob.salaryRange.min?.toLocaleString()} - {selectedJob.salaryRange.max?.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {selectedJob.experienceRequired && (
                              <div>
                                <span className="text-gray-500 font-light">Experience: </span>
                                <span className="text-gray-900 font-medium">
                                  {selectedJob.experienceRequired.min} - {selectedJob.experienceRequired.max} {selectedJob.experienceRequired.unit}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="w-20 h-px bg-gray-300 mb-8" />
                      </div>

                      <div className="prose prose-sm max-w-none mb-8">
                        <div className="text-gray-700 font-light leading-relaxed space-y-6">
                          {selectedJob.jobDescription && (
                            <div>
                              <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3">Job Description</h3>
                              <p className="text-base leading-relaxed whitespace-pre-line">
                                {selectedJob.jobDescription}
                              </p>
                            </div>
                          )}

                          {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                            <div>
                              <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3">Responsibilities</h3>
                              <ul className="list-none space-y-2">
                                {selectedJob.responsibilities.map((resp, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-gray-900 mt-1.5">•</span>
                                    <span className="text-base leading-relaxed">{resp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedJob.skillsRequired && selectedJob.skillsRequired.length > 0 && (
                            <div>
                              <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3">Required Skills</h3>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.skillsRequired.map((skill, index) => (
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

                          {selectedJob.qualification && (
                            <div>
                              <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3">Qualification</h3>
                              <p className="text-base leading-relaxed">
                                {selectedJob.qualification}
                              </p>
                            </div>
                          )}

                          {selectedJob.experienceRequired && (
                            <div>
                              <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3">Experience Required</h3>
                              <p className="text-base leading-relaxed">
                                {selectedJob.experienceRequired.min} - {selectedJob.experienceRequired.max} {selectedJob.experienceRequired.unit}
                              </p>
                            </div>
                          )}

                          {selectedJob.applicationDeadline && (
                            <div>
                              <h3 className="text-lg uppercase tracking-wide text-gray-900 font-light mb-3">Application Deadline</h3>
                              <p className="text-base leading-relaxed">
                                {new Date(selectedJob.applicationDeadline).toLocaleDateString('en-US', {
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
                        onClick={() => handleApplyClick(selectedJob)}
                        className="px-8 py-3 bg-gray-900 text-white text-xs uppercase tracking-[0.2em] font-light hover:bg-gray-800 transition-all duration-500"
                      >
                        Apply for this Position
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Careers; 