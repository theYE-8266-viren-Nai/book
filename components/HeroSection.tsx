import React from 'react'
import { Plus } from 'lucide-react'

const HeroSection = () => {
  return (
    <div className="wrapper py-8 md:py-12">
      <div className="library-hero-card">
        <div className="library-hero-content">
          {/* Left Section */}
          <div className="library-hero-text">
            <h1 className="library-hero-title">Your Library</h1>
            <p className="library-hero-description">
              Convert your books into interactive AI conversations. Listen, learn, and discuss your favorite reads.
            </p>
            <button className="library-cta-primary">
              <Plus className="w-5 h-5" />
              Add new book
            </button>
          </div>

          {/* Center Section - Illustration */}
          <div className="library-hero-illustration-desktop">
            <svg
              width="320"
              height="240"
              viewBox="0 0 320 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background circle */}
              <circle cx="160" cy="120" r="100" fill="#E8F0F5" />
              
              {/* Vintage Books Stack */}
              <g transform="translate(80, 100)">
                {/* Bottom book */}
                <rect x="0" y="40" width="100" height="20" rx="2" fill="#8B4513" />
                <rect x="2" y="42" width="96" height="16" rx="1" fill="#A0522D" />
                <rect x="5" y="45" width="90" height="10" rx="1" fill="#CD853F" />
                
                {/* Middle book */}
                <rect x="5" y="20" width="90" height="18" rx="2" fill="#654321" />
                <rect x="7" y="22" width="86" height="14" rx="1" fill="#8B4513" />
                <rect x="10" y="25" width="80" height="8" rx="1" fill="#A0522D" />
                
                {/* Top book */}
                <rect x="10" y="0" width="80" height="18" rx="2" fill="#4A3728" />
                <rect x="12" y="2" width="76" height="14" rx="1" fill="#654321" />
                <rect x="15" y="5" width="70" height="8" rx="1" fill="#8B4513" />
              </g>

              {/* Globe */}
              <g transform="translate(180, 80)">
                <circle cx="30" cy="30" r="25" fill="#4A6580" />
                <ellipse cx="30" cy="30" rx="25" ry="10" fill="none" stroke="#6B8299" strokeWidth="2" />
                <ellipse cx="30" cy="30" rx="10" ry="25" fill="none" stroke="#6B8299" strokeWidth="2" />
                <line x1="30" y1="5" x2="30" y2="55" stroke="#6B8299" strokeWidth="2" />
                <line x1="5" y1="30" x2="55" y2="30" stroke="#6B8299" strokeWidth="2" />
                {/* Stand */}
                <rect x="25" y="55" width="10" height="15" fill="#4A3728" />
                <rect x="15" y="70" width="30" height="3" fill="#4A3728" />
              </g>

              {/* Desk Lamp */}
              <g transform="translate(220, 130)">
                {/* Base */}
                <ellipse cx="20" cy="45" rx="15" ry="5" fill="#4A3728" />
                {/* Stand */}
                <rect x="18" y="20" width="4" height="25" fill="#4A3728" />
                {/* Arm */}
                <rect x="5" y="10" width="30" height="4" rx="2" fill="#4A3728" transform="rotate(-30 20 12)" />
                {/* Lamp shade */}
                <path d="M0 0 L15 15 L30 0 Z" fill="#FFD700" transform="translate(5, -5)" />
                <ellipse cx="15" cy="0" rx="15" ry="5" fill="#FFA500" transform="translate(5, -5)" />
                {/* Light bulb glow */}
                <circle cx="20" cy="5" r="8" fill="#FFFACD" opacity="0.6" />
              </g>
            </svg>
          </div>

          {/* Right Section - Steps Card */}
          <div className="library-steps-card">
            <div className="space-y-4">
              <div className="library-step-item">
                <div className="library-step-number">1</div>
                <div>
                  <div className="library-step-title">Upload PDF</div>
                  <div className="library-step-description">Add your book file</div>
                </div>
              </div>
              <div className="library-step-item">
                <div className="library-step-number">2</div>
                <div>
                  <div className="library-step-title">AI Processing</div>
                  <div className="library-step-description">We analyze the content</div>
                </div>
              </div>
              <div className="library-step-item">
                <div className="library-step-number">3</div>
                <div>
                  <div className="library-step-title">Voice Chat</div>
                  <div className="library-step-description">Discuss with AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
