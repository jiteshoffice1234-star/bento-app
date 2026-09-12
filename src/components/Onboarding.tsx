import React, { useState } from 'react';
import { useBentoStore } from '../store';
import { Sun, Moon, ArrowRight, Check, Zap, Target, Activity, CheckSquare } from 'lucide-react';
import './Onboarding.css';

export const Onboarding: React.FC = () => {
  const { settings, updateSettings } = useBentoStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(settings.userName || '');

  if (settings.onboardingCompleted) return null;

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleFinish = () => {
    updateSettings({ onboardingCompleted: true, userName: name });
  };

  const handleThemeSelect = (theme: 'light' | 'dark') => {
    updateSettings({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        
        {step === 1 && (
          <div className="onboarding-step onboarding-hero text-center fade-in">
            <div className="onboarding-brand">
              <div className="onboarding-logo">
                <span className="onboarding-logo-mark">B</span>
              </div>
            </div>
            <h1>Welcome to Bento 2</h1>
            <p>Your premium personal planner for a focused, productive, and balanced life.</p>
            <div className="onboarding-actions">
              <button className="btn btn-primary btn-large" onClick={handleNext}>
                Get Started <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary btn-large btn-quiet" onClick={handleFinish}>
                Skip onboarding
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step fade-in">
            <h2>What should we call you?</h2>
            <p className="text-secondary mb-4">Let's personalize your experience.</p>
            <input 
              type="text" 
              className="huge-input mb-4"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleNext()}
            />
            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" onClick={handleNext}>Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step fade-in">
            <h2>Choose your theme</h2>
            <p className="text-secondary mb-4">You can always change this later in settings.</p>
            
            <div className="theme-cards">
              <div 
                className={`theme-card ${settings.theme === 'light' ? 'selected' : ''}`}
                onClick={() => handleThemeSelect('light')}
              >
                <div className="theme-preview light-preview">
                  <Sun size={32} />
                </div>
                <h3>Light</h3>
                {settings.theme === 'light' && <div className="selected-badge"><Check size={16} /></div>}
              </div>

              <div 
                className={`theme-card ${settings.theme === 'dark' ? 'selected' : ''}`}
                onClick={() => handleThemeSelect('dark')}
              >
                <div className="theme-preview dark-preview">
                  <Moon size={32} />
                </div>
                <h3>Dark</h3>
                {settings.theme === 'dark' && <div className="selected-badge"><Check size={16} /></div>}
              </div>
            </div>

            <div className="step-actions mt-4">
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn-primary" onClick={handleNext}>Continue</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step fade-in">
            <h2>How Bento works</h2>
            <p className="text-secondary mb-4">Everything you need in one place.</p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon bg-primary"><CheckSquare size={20} /></div>
                <h4>Tasks</h4>
                <p>Organize your day with flexible task management.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon bg-success"><Target size={20} /></div>
                <h4>Goals & Projects</h4>
                <p>Break down big ambitions into actionable steps.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon bg-warning"><Activity size={20} /></div>
                <h4>Habits</h4>
                <p>Build consistency with daily habit tracking.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon bg-info"><Zap size={20} /></div>
                <h4>AI Planning</h4>
                <p>Connect an AI provider to get smart suggestions.</p>
              </div>
            </div>

            <div className="step-actions mt-4">
              <button className="btn-secondary" onClick={() => setStep(3)}>Back</button>
              <button className="btn-primary" onClick={handleNext}>Almost there</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="onboarding-step text-center fade-in">
            <div className="success-icon mb-4">✨</div>
            <h2>You're all set, {name || 'friend'}!</h2>
            <p className="text-secondary mb-4">Your personalized Bento workspace is ready.</p>
            
            <button className="btn-primary btn-large w-full" onClick={handleFinish}>
              Enter Workspace <ArrowRight size={18} />
            </button>
          </div>
        )}

        <div className="onboarding-progress">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`} />
          ))}
        </div>

      </div>
    </div>
  );
};
