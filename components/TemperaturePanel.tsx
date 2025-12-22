'use client';

import { getStatusColor } from '@/lib/thresholds';
import { formatNumber } from '@/lib/utils';

interface TemperaturePanelProps {
  motorSurfaceTemp: number;
  bearingTemp: number;
}

export function TemperaturePanel({ motorSurfaceTemp, bearingTemp }: TemperaturePanelProps) {
  const motorStatus = getStatusColor(motorSurfaceTemp, 'motorSurfaceTemp');
  const bearingStatus = getStatusColor(bearingTemp, 'bearingTemp');
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Temperature Monitoring
      </h3>
      
      {/* Motor Surface Temperature */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Motor Surface (IR)</span>
          <span className={`text-lg font-bold ${motorStatus.color}`}>
            {formatNumber(motorSurfaceTemp, 1)}°C
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full ${motorStatus.bgColor} transition-all duration-500`}
            style={{ width: `${Math.min((motorSurfaceTemp / 100) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0°C</span>
          <span className="text-status-warning">70°C</span>
          <span className="text-status-critical">85°C</span>
        </div>
      </div>
      
      {/* Bearing Temperature */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Bearing (DS18B20)</span>
          <span className={`text-lg font-bold ${bearingStatus.color}`}>
            {formatNumber(bearingTemp, 1)}°C
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full ${bearingStatus.bgColor} transition-all duration-500`}
            style={{ width: `${Math.min((bearingTemp / 100) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0°C</span>
          <span className="text-status-warning">70°C</span>
          <span className="text-status-critical">85°C</span>
        </div>
      </div>
    </div>
  );
}

