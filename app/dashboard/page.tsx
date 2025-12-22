'use client';

import { useRealtimeSensorData } from '@/hooks/useRealtimeSensorData';
import { RealtimeStatusBar } from '@/components/RealtimeStatusBar';
import { MotorOverviewCard } from '@/components/MotorOverviewCard';
import { SensorStatusCard } from '@/components/SensorStatusCard';
import { TemperaturePanel } from '@/components/TemperaturePanel';
import { VibrationPanel } from '@/components/VibrationPanel';
import { DustPanel } from '@/components/DustPanel';
import { AlertList } from '@/components/AlertList';
import { type ParameterType } from '@/lib/thresholds';

// TODO: In production, allow user to select motor
const DEFAULT_MOTOR_ID = 'default-motor-1';

export default function DashboardPage() {
  const { data, isLoading, error, isConnected } = useRealtimeSensorData(DEFAULT_MOTOR_ID);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sensor data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Error loading data</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!data || !data.latestReading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No sensor data available. Please ingest data first.</p>
        </div>
      </div>
    );
  }
  
  const { motor, latestReading, recentReadings, activeAlerts, latestHealth } = data;
  
  // Extract history for sparklines
  const getHistory = (param: keyof typeof latestReading) => {
    return recentReadings.map(r => r[param] as number).filter(v => typeof v === 'number');
  };
  
  // Calculate operating hours (dummy - based on data count)
  const operatingHoursToday = recentReadings.length * 0.1; // Rough estimate
  
  // Determine motor status based on health score
  const getMotorStatus = (healthScore: number | undefined): 'Normal' | 'Perlu Inspeksi' | 'Kritikal' => {
    if (!healthScore) return 'Normal';
    if (healthScore >= 80) return 'Normal';
    if (healthScore >= 60) return 'Perlu Inspeksi';
    return 'Kritikal';
  };
  
  return (
    <div className="min-h-screen">
      {/* Status Bar */}
      <RealtimeStatusBar
        isConnected={isConnected}
        lastUpdate={latestReading.timestamp}
        motorName={motor?.name || 'Unknown Motor'}
      />
      
      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Motor Overview */}
        <div className="mb-6">
          <MotorOverviewCard
            motorName={motor?.name || 'Motor AC'}
            healthScore={latestHealth?.healthScoreMl || 85}
            status={getMotorStatus(latestHealth?.healthScoreMl)}
            operatingHoursToday={operatingHoursToday}
            dailyEnergy={latestReading.dailyEnergyKwh}
          />
        </div>
        
        {/* Sensor Status Cards */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Electrical Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SensorStatusCard
              parameter={'gridVoltage' as ParameterType}
              value={latestReading.gridVoltage}
              history={getHistory('gridVoltage')}
            />
            <SensorStatusCard
              parameter={'motorCurrent' as ParameterType}
              value={latestReading.motorCurrent}
              history={getHistory('motorCurrent')}
            />
            <SensorStatusCard
              parameter={'powerFactor' as ParameterType}
              value={latestReading.powerFactor}
              history={getHistory('powerFactor')}
            />
            <SensorStatusCard
              parameter={'gridFrequency' as ParameterType}
              value={latestReading.gridFrequency}
              history={getHistory('gridFrequency')}
            />
          </div>
        </div>
        
        {/* Temperature & Vibration & Dust */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Physical Sensors</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TemperaturePanel
              motorSurfaceTemp={latestReading.motorSurfaceTemp}
              bearingTemp={latestReading.bearingTemp}
            />
            <VibrationPanel
              vibrationRms={latestReading.vibrationRms}
              faultFrequency={latestReading.faultFrequency || undefined}
              rotorUnbalanceScore={latestReading.rotorUnbalanceScore}
              bearingHealthScore={latestReading.bearingHealthScore}
            />
            <DustPanel
              dustDensity={latestReading.dustDensity}
              soilingLossPercent={latestReading.soilingLossPercent}
            />
          </div>
        </div>
        
        {/* Alerts */}
        <div className="mb-6">
          <AlertList alerts={activeAlerts} />
        </div>
      </div>
    </div>
  );
}

