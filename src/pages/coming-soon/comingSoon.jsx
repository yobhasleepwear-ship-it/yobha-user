import React, { useState, useEffect } from "react";

const ComingSoon = () => {
  const launchDate = new Date("2026-10-20T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="coming-soon">
      {/* Floating gradient shapes */}
      <div className="floating-shapes">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`shape shape-${i}`} />
        ))}
      </div>

      <div className="content">
        <h1>🚀 Coming Soon</h1>
        <p className="launch-date">Launching on <strong>20th October 2026</strong></p>

        <div className="countdown">
          {["days", "hours", "minutes", "seconds"].map((unit) => (
            <div key={unit} className="time-unit">
              <h2>{timeLeft[unit]}</h2>
              <p>{unit}</p>
            </div>
          ))}
        </div>

        <p className="subtitle">Stay tuned, something amazing is coming! ✨</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        .coming-soon {
          height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #007777, #00cccc);
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Poppins', sans-serif;
          overflow: hidden;
          position: relative;
          color: #fff;
        }

        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          z-index: 0;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.2;
          background: linear-gradient(135deg, #00ffff, #00ffcc);
          animation: float 10s ease-in-out infinite;
        }

        ${Array.from({ length: 10 }).map(
          (_, i) => `
          .shape-${i} {
            width: ${50 + Math.random() * 100}px;
            height: ${50 + Math.random() * 100}px;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation-duration: ${5 + Math.random() * 10}s;
          }
        `
        ).join("")}

        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-50px) translateX(20px); }
          100% { transform: translateY(0px) translateX(0px); }
        }

        .content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 20px;
        }

        h1 {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .launch-date {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }

        .countdown {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
          backdrop-filter: blur(10px);
          background: rgba(255,255,255,0.1);
          padding: 25px 40px;
          border-radius: 20px;
          box-shadow: 0 0 40px rgba(0,0,0,0.4);
          transition: transform 0.3s;
        }

        .countdown:hover {
          transform: scale(1.02);
        }

        .time-unit {
          text-align: center;
          min-width: 70px;
        }

        .time-unit h2 {
          font-size: 2.5rem;
          margin-bottom: 0.3rem;
        }

        .time-unit p {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .subtitle {
          margin-top: 2rem;
          opacity: 0.85;
          font-size: 1rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          h1 { font-size: 3rem; }
          .time-unit h2 { font-size: 2rem; }
          .countdown { padding: 20px 30px; }
        }

        @media (max-width: 480px) {
          h1 { font-size: 2.2rem; }
          .launch-date { font-size: 1rem; }
          .time-unit h2 { font-size: 1.5rem; }
          .countdown { gap: 15px; padding: 15px 20px; }
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
