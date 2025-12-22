'use client';

import { timeAgo } from '@/lib/utils';

interface RealtimeStatusBarProps {
  isConnected: boolean;
  lastUpdate: Date | string | null;
  motorName: string;
}

export function RealtimeStatusBar({ isConnected, lastUpdate, motorName }: RealtimeStatusBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* ESP Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`status-dot ${isConnected ? 'bg-status-normal animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                ESP: {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {/* Last Update */}
            {lastUpdate && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">
                  Terakhir update: {timeAgo(lastUpdate)}
                </span>
              </div>
            )}
            
            {/* Motor Being Monitored */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm text-gray-600">
                Motor: <span className="font-medium text-gray-800">{motorName}</span>
              </span>
            </div>
          </div>
          
          {/* Data Refresh Indicator */}
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
            <span className="text-xs text-gray-500">Auto-refresh setiap 2 detik</span>
          </div>
        </div>
      </div>
    </div>
  );
}

