import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Loader2, ArrowLeft, X } from "lucide-react";
import { getAllJobs, applyForJob } from "../../service/careers";
import { message } from "../../comman/toster-message/ToastContainer";

const CareerApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
        setFormData((prev) => ({
          ...prev,
          positionAppliedFor: foundJob.jobTitle || "",
        }));
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
    if (!job) return;

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
      applicationPayload.append("positionAppliedFor", formData.positionAppliedFor || job.jobTitle);
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

      const response = await applyForJob(jobId, applicationPayload);
      if (response && response.success) {
        message.success("Application submitted successfully!");
        navigate("/career");
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
            onClick={() => navigate(`/career/${jobId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 mb-8 font-light"
          >
            <ArrowLeft size={20} />
            <span className="text-sm uppercase tracking-[0.15em]">Back to Job Details</span>
          </button>

          {/* Application Form */}
          <div className="bg-white border border-gray-200/50 p-6 md:p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 uppercase tracking-wide font-sweet-sans">
                Apply for {job.jobTitle}
              </h2>
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
                  onClick={() => navigate(`/career/${jobId}`)}
                  className="px-8 py-3 border border-gray-900/30 text-gray-900 text-xs uppercase tracking-[0.2em] font-light hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareerApply;

