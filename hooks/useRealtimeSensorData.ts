/**
 * useRealtimeSensorData Hook
 * 
 * Fetches latest sensor data for a motor and polls every 2 seconds for updates
 * Alternative approaches: Server-Sent Events (SSE) or WebSocket for true realtime
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface Motor {
  id: string;
  name: string;
  location: string;
  ratedPower: number;
  ratedCurrent: number;
  ratedVoltage: number;
}

interface SensorReading {
  id: string;
  motorId: string;
  timestamp: Date | string;
  gridVoltage: number;
  motorCurrent: number;
  powerConsumption: number;
  powerFactor: number;
  dailyEnergyKwh: number;
  gridFrequency: number;
  vibrationRms: number;
  faultFrequency?: number | null;
  rotorUnbalanceScore: number;
  bearingHealthScore: number;
  motorSurfaceTemp: number;
  thermalAnomalyIndex?: number | null;
  panelTemp?: number | null;
  bearingTemp: number;
  dustDensity: number;
  soilingLossPercent: number;
}

interface Alert {
  id: string;
  timestamp: Date | string;
  severity: 'WARNING' | 'CRITICAL';
  parameter: string;
  value: number;
  message: string;
  status: 'OPEN' | 'CLOSED' | 'ACKNOWLEDGED';
}

interface HealthAnalysis {
  id: string;
  motorId: string;
  timestamp: Date | string;
  healthScoreMl: number;
  healthCategory: string;
  expertDiagnosis?: string | null;
  expertRecommendation?: string | null;
  rawRulesMatched?: string | null;
}

interface RealtimeData {
  motor: Motor | null;
  latestReading: SensorReading | null;
  recentReadings: SensorReading[];
  activeAlerts: Alert[];
  latestHealth: HealthAnalysis | null;
  timestamp: string;
}

interface UseRealtimeSensorDataReturn {
  data: RealtimeData | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  refresh: () => Promise<void>;
}

export function useRealtimeSensorData(motorId: string): UseRealtimeSensorDataReturn {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/latest?motorId=${motorId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setIsConnected(true);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [motorId]);
  
  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Polling every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [fetchData]);
  
  return {
    data,
    isLoading,
    error,
    isConnected,
    refresh: fetchData,
  };
}

