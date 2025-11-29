import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Upload, Loader2, ArrowLeft, X } from "lucide-react";
import { getAllJobs, applyForJob } from "../../service/careers";
import { message } from "../../comman/toster-message/ToastContainer";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";


const CareerApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
   const { ids } = location.state || {};
   console.log(ids,"id")
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

  if (!formData.fullName || !formData.email || !formData.mobileNumber || !formData.resume) {
    message.error("Please fill in all required fields");
    return;
  }

  setIsSubmitting(true);

  try {
    const storageRef = ref(storage, `resumes/${Date.now()}_${formData.resume.name}`);
    const uploadTask = uploadBytesResumable(storageRef, formData.resume);

    const downloadURL = await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });

    const applicationPayload = {
      fullName: formData.fullName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      currentCity: formData.currentCity || "",
      positionAppliedFor: formData.positionAppliedFor || job.jobTitle,
      relevantExperienceYears: formData.relevantExperienceYears || "0",
      currentCTC: formData.currentCTC || "0",
      expectedCTC: formData.expectedCTC || "0",
      noticePeriodInDays: formData.noticePeriodInDays || "0",
      resumeUrl: downloadURL,
      portfolioUrl: formData.portfolioUrl || "",
      whyYobha: formData.whyYobha || "",
      howDidYouHear: formData.howDidYouHear || "",
    };

    const response = await applyForJob("J-105", applicationPayload);

    if (response) {
      message.success("Application submitted successfully!");
      navigate("/career");
    } else {
      message.error(message);
    }
  } catch (error) {
    console.error("Application error:", error);
    message.error(error||"Failed to submit application. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-white font-futura-pt-light flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-white font-futura-pt-light">
      {/* Main Content */}
      <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/career/${jobId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 mb-8 font-light"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-light font-futura-pt-light">Back to Job Details</span>
          </button>

          {/* Application Form */}
          <div className="bg-white border border-gray-200/50 p-6 md:p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-xl md:text-3xl font-light text-black font-futura-pt-book">
                Apply for {job.jobTitle}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-black font-light mb-2 font-futura-pt-book">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light font-futura-pt-light"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black font-light mb-2 font-futura-pt-book">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light font-futura-pt-light"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-black font-light mb-2 font-futura-pt-book">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light font-futura-pt-light"
                    placeholder="+919876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black font-light mb-2 font-futura-pt-book">
                    Current City
                  </label>
                  <input
                    type="text"
                    name="currentCity"
                    value={formData.currentCity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light font-futura-pt-light"
                    placeholder="Bangalore"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-black font-light mb-2 whitespace-nowrap font-futura-pt-book">
                    Relevant Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="relevantExperienceYears"
                    value={formData.relevantExperienceYears}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light font-futura-pt-light"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black font-light mb-2 whitespace-nowrap font-futura-pt-book">
                    Current CTC (INR)
                  </label>
                  <input
                    type="number"
                    name="currentCTC"
                    value={formData.currentCTC}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light font-futura-pt-light"
                    placeholder="600000"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black font-light mb-2 whitespace-nowrap font-futura-pt-book">
                    Expected CTC (INR)
                  </label>
                  <input
                    type="number"
                    name="expectedCTC"
                    value={formData.expectedCTC}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light font-futura-pt-light"
                    placeholder="900000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-black font-light mb-2 font-futura-pt-book">
                  Notice Period (Days)
                </label>
                <input
                  type="number"
                  name="noticePeriodInDays"
                  value={formData.noticePeriodInDays}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light font-futura-pt-light"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm text-black font-light mb-2 font-futura-pt-book">
                  Resume/CV <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
                    <span className="text-sm text-black font-light font-futura-pt-light">
                      {formData.resume ? formData.resume.name : "Choose file (PDF, DOC, DOCX)"}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-black mt-2 font-light font-futura-pt-light">Maximum file size: 5MB</p>
              </div>

              <div>
                <label className="block text-sm text-black font-light mb-2 font-futura-pt-book">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light font-futura-pt-light"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div>
                <label className="block text-sm text-black font-light mb-2 font-futura-pt-book">
                  Why YOBHA?
                </label>
                <textarea
                  name="whyYobha"
                  value={formData.whyYobha}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light resize-none font-futura-pt-light"
                  placeholder="I love creating interactive UI..."
                />
              </div>

              <div>
                <label className="block text-sm text-black font-light mb-2 font-futura-pt-book">
                  How Did You Hear About Us?
                </label>
                <input
                  type="text"
                  name="howDidYouHear"
                  value={formData.howDidYouHear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-900 transition-colors duration-300 bg-white text-black font-light font-futura-pt-light"
                  placeholder="LinkedIn, Website, Referral, etc."
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gray-900 text-white text-sm font-light hover:bg-gray-800 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed font-futura-pt-light"
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
                  className="px-8 py-3 border border-gray-900/30 text-black text-sm font-light hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-500 font-futura-pt-light"
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

