'use client';

import { useState } from 'react';
import {
    AgeRange,
    BrandTrait,
    ContentLength,
    EnthusiasmLevel,
    FormalityLevel,
    HumorStyle,
    UserStyleProfile,
    userStyleSystem
} from '../lib/userStyle';

interface StyleBuilderProps {
  userId: string;
  onComplete: (profile: UserStyleProfile) => void;
}

export default function StyleBuilder({ userId, onComplete }: StyleBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserStyleProfile>>({
    userId,
    brandPersonality: {
      primary: BrandTrait.PROFESSIONAL,
      secondary: [],
      brandValues: [],
      brandMission: '',
      uniqueSellingPoints: []
    },
    audienceDemographics: {
      ageRange: AgeRange.ADULTS,
      genderDistribution: 'balanced' as any,
      location: [],
      interests: [],
      painPoints: [],
      aspirations: [],
      contentConsumption: ['video'] as any
    },
    contentPreferences: {
      preferredLength: ContentLength.MEDIUM,
      formatPreferences: ['entertainment'] as any,
      visualStyle: 'modern' as any,
      callToActionStyle: 'direct' as any,
      storytellingApproach: 'problem_solution' as any
    },
    toneAndVoice: {
      formality: FormalityLevel.SEMI_FORMAL,
      enthusiasm: EnthusiasmLevel.MODERATE,
      humor: HumorStyle.NONE,
      empathy: 'moderate' as any,
      authority: 'moderate' as any,
      friendliness: 'friendly' as any
    }
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const completedProfile = await userStyleSystem.initializeProfile(userId);
      const updatedProfile = await userStyleSystem.updateProfile(profile);
      onComplete(updatedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BrandPersonalityStep profile={profile} setProfile={setProfile} />;
      case 2:
        return <AudienceStep profile={profile} setProfile={setProfile} />;
      case 3:
        return <ContentPreferencesStep profile={profile} setProfile={setProfile} />;
      case 4:
        return <ToneVoiceStep profile={profile} setProfile={setProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Build Your Content Style</h1>
        <p className="text-gray-600">
          Help us understand your brand personality and content preferences to create personalized AI-generated content.
        </p>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        
        <div className="flex gap-3">
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function BrandPersonalityStep({ profile, setProfile }: any) {
  const brandTraits = Object.values(BrandTrait);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Brand Personality</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What's your primary brand trait?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {brandTraits.map((trait) => (
            <button
              key={trait}
              onClick={() => setProfile({
                ...profile,
                brandPersonality: {
                  ...profile.brandPersonality,
                  primary: trait
                }
              })}
              className={`p-3 text-sm rounded-lg border transition-colors ${
                profile.brandPersonality?.primary === trait
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {trait.charAt(0).toUpperCase() + trait.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand Mission
        </label>
        <textarea
          value={profile.brandPersonality?.brandMission || ''}
          onChange={(e) => setProfile({
            ...profile,
            brandPersonality: {
              ...profile.brandPersonality,
              brandMission: e.target.value
            }
          })}
          placeholder="Describe your brand's mission and purpose..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand Values (comma-separated)
        </label>
        <input
          type="text"
          value={profile.brandPersonality?.brandValues?.join(', ') || ''}
          onChange={(e) => setProfile({
            ...profile,
            brandPersonality: {
              ...profile.brandPersonality,
              brandValues: e.target.value.split(',').map((v: string) => v.trim()).filter((v: string) => v)
            }
          })}
          placeholder="e.g., Innovation, Quality, Sustainability"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function AudienceStep({ profile, setProfile }: any) {
  const ageRanges = Object.values(AgeRange);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Your Audience</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What's your primary audience age range?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ageRanges.map((range) => (
            <button
              key={range}
              onClick={() => setProfile({
                ...profile,
                audienceDemographics: {
                  ...profile.audienceDemographics,
                  ageRange: range
                }
              })}
              className={`p-3 text-sm rounded-lg border transition-colors ${
                profile.audienceDemographics?.ageRange === range
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Audience Interests (comma-separated)
        </label>
        <input
          type="text"
          value={profile.audienceDemographics?.interests?.join(', ') || ''}
          onChange={(e) => setProfile({
            ...profile,
            audienceDemographics: {
              ...profile.audienceDemographics,
              interests: e.target.value.split(',').map((v: string) => v.trim()).filter((v: string) => v)
            }
          })}
          placeholder="e.g., Technology, Fitness, Travel"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Audience Pain Points (comma-separated)
        </label>
        <input
          type="text"
          value={profile.audienceDemographics?.painPoints?.join(', ') || ''}
          onChange={(e) => setProfile({
            ...profile,
            audienceDemographics: {
              ...profile.audienceDemographics,
              painPoints: e.target.value.split(',').map((v: string) => v.trim()).filter((v: string) => v)
            }
          })}
          placeholder="e.g., Time management, Cost, Complexity"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function ContentPreferencesStep({ profile, setProfile }: any) {
  const contentLengths = Object.values(ContentLength);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Content Preferences</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred content length
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {contentLengths.map((length) => (
            <button
              key={length}
              onClick={() => setProfile({
                ...profile,
                contentPreferences: {
                  ...profile.contentPreferences,
                  preferredLength: length
                }
              })}
              className={`p-3 text-sm rounded-lg border transition-colors ${
                profile.contentPreferences?.preferredLength === length
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {length.charAt(0).toUpperCase() + length.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Format Preferences
        </label>
        <div className="space-y-2">
          {['story', 'tutorial', 'entertainment', 'educational', 'promotional'].map((format) => (
            <label key={format} className="flex items-center">
              <input
                type="checkbox"
                checked={profile.contentPreferences?.formatPreferences?.includes(format)}
                onChange={(e) => {
                  const current = profile.contentPreferences?.formatPreferences || [];
                  const updated = e.target.checked
                    ? [...current, format]
                    : current.filter((f: string) => f !== format);
                  setProfile({
                    ...profile,
                    contentPreferences: {
                      ...profile.contentPreferences,
                      formatPreferences: updated
                    }
                  });
                }}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              {format.charAt(0).toUpperCase() + format.slice(1)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToneVoiceStep({ profile, setProfile }: any) {
  const formalityLevels = Object.values(FormalityLevel);
  const enthusiasmLevels = Object.values(EnthusiasmLevel);
  const humorStyles = Object.values(HumorStyle);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Tone & Voice</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Communication formality
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {formalityLevels.map((level) => (
            <button
              key={level}
              onClick={() => setProfile({
                ...profile,
                toneAndVoice: {
                  ...profile.toneAndVoice,
                  formality: level
                }
              })}
              className={`p-3 text-sm rounded-lg border transition-colors ${
                profile.toneAndVoice?.formality === level
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {level.replace('_', ' ').charAt(0).toUpperCase() + level.replace('_', ' ').slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Enthusiasm level
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {enthusiasmLevels.map((level) => (
            <button
              key={level}
              onClick={() => setProfile({
                ...profile,
                toneAndVoice: {
                  ...profile.toneAndVoice,
                  enthusiasm: level
                }
              })}
              className={`p-3 text-sm rounded-lg border transition-colors ${
                profile.toneAndVoice?.enthusiasm === level
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Humor style
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {humorStyles.map((style) => (
            <button
              key={style}
              onClick={() => setProfile({
                ...profile,
                toneAndVoice: {
                  ...profile.toneAndVoice,
                  humor: style
                }
              })}
              className={`p-3 text-sm rounded-lg border transition-colors ${
                profile.toneAndVoice?.humor === style
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
