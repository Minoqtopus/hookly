'use client';

import { COPY } from '@/app/lib/copy';
import { ActionButton, FeatureName, PlanName, PlatformName } from './CopyText';

export default function CopyUsageExample() {
  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Copy System Usage Examples</h3>
        <p className="text-sm text-gray-600 mb-4">
          This component demonstrates how to use the centralized copy management system consistently.
        </p>
      </div>

      {/* Plan Names */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Plan Names</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Using PlanName component:</p>
            <p className="font-medium">
              <PlanName plan="STARTER" /> - <PlanName plan="PRO" /> - <PlanName plan="AGENCY" />
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Direct from COPY:</p>
            <p className="font-medium">
              {COPY.PLANS.STARTER.DISPLAY_NAME} - {COPY.PLANS.PRO.DISPLAY_NAME} - {COPY.PLANS.AGENCY.DISPLAY_NAME}
            </p>
          </div>
        </div>
      </div>

      {/* Platform Names */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Platform Names</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Using PlatformName component:</p>
            <p className="font-medium">
              <PlatformName platform="TIKTOK" />, <PlatformName platform="X" />, <PlatformName platform="INSTAGRAM" />
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Direct from COPY:</p>
            <p className="font-medium">
              {COPY.PLATFORMS.TIKTOK}, {COPY.PLATFORMS.X}, {COPY.PLATFORMS.INSTAGRAM}
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Features</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Using FeatureName component:</p>
            <p className="font-medium">
              <FeatureName feature="AI_GENERATION" />, <FeatureName feature="TEAM_COLLABORATION" />
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Direct from COPY:</p>
            <p className="font-medium">
              {COPY.FEATURES.AI_GENERATION}, {COPY.FEATURES.TEAM_COLLABORATION}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Actions</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Using ActionButton component:</p>
            <p className="font-medium">
              <ActionButton action="CREATE" />, <ActionButton action="SAVE" />, <ActionButton action="SHARE" />
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600">Direct from COPY:</p>
            <p className="font-medium">
              {COPY.ACTIONS.CREATE}, {COPY.ACTIONS.SAVE}, {COPY.ACTIONS.SHARE}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Plan Details</h4>
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(COPY.PLANS).map(([key, plan]) => (
            <div key={key} className="bg-white p-4 rounded border">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{plan.DISPLAY_NAME}</h5>
                <span className="text-sm text-gray-500">{plan.PRICE}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{plan.DESCRIPTION}</p>
              <p className="text-sm text-gray-700 font-medium">{plan.GENERATIONS}</p>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Features:</p>
                <ul className="text-xs text-gray-600 list-disc list-inside">
                  {plan.FEATURES.slice(0, 3).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Copy Validation */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Copy Validation</h4>
        <div className="bg-white p-4 rounded border">
          <p className="text-sm text-gray-600 mb-2">
            The copy system automatically validates consistency and reports any issues.
          </p>
          <div className="text-xs text-gray-500">
            <p>• All plan names are consistent</p>
            <p>• Platform names are standardized</p>
            <p>• Feature descriptions match implementation</p>
            <p>• No "unlimited" claims remain</p>
          </div>
        </div>
      </div>
    </div>
  );
}
