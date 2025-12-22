/**
 * POST /api/ingest
 * 
 * Endpoint for ESP32 to send sensor data
 * Validates payload, saves to database, and generates alerts if needed
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { shouldAlert, getAlertSeverity, PARAMETER_CONFIG } from '@/lib/thresholds';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      motorId,
      gridVoltage,
      motorCurrent,
      powerConsumption,
      powerFactor,
      dailyEnergyKwh,
      gridFrequency,
      vibrationRms,
      rotorUnbalanceScore,
      bearingHealthScore,
      motorSurfaceTemp,
      bearingTemp,
      dustDensity,
      soilingLossPercent,
    } = body;
    
    if (!motorId) {
      return NextResponse.json(
        { error: 'motorId is required' },
        { status: 400 }
      );
    }
    
    // Check if motor exists
    const motor = await prisma.motor.findUnique({
      where: { id: motorId },
    });
    
    if (!motor) {
      return NextResponse.json(
        { error: 'Motor not found' },
        { status: 404 }
      );
    }
    
    // Create sensor reading
    const reading = await prisma.sensorReading.create({
      data: {
        motorId,
        gridVoltage: parseFloat(gridVoltage),
        motorCurrent: parseFloat(motorCurrent),
        powerConsumption: parseFloat(powerConsumption),
        powerFactor: parseFloat(powerFactor),
        dailyEnergyKwh: parseFloat(dailyEnergyKwh),
        gridFrequency: parseFloat(gridFrequency),
        vibrationRms: parseFloat(vibrationRms),
        faultFrequency: body.faultFrequency ? parseFloat(body.faultFrequency) : null,
        rotorUnbalanceScore: parseFloat(rotorUnbalanceScore),
        bearingHealthScore: parseFloat(bearingHealthScore),
        motorSurfaceTemp: parseFloat(motorSurfaceTemp),
        thermalAnomalyIndex: body.thermalAnomalyIndex ? parseFloat(body.thermalAnomalyIndex) : null,
        panelTemp: body.panelTemp ? parseFloat(body.panelTemp) : null,
        bearingTemp: parseFloat(bearingTemp),
        dustDensity: parseFloat(dustDensity),
        soilingLossPercent: parseFloat(soilingLossPercent),
        rawPayload: JSON.stringify(body),
      },
    });
    
    // Check thresholds and create alerts
    const alerts = [];
    const parameters = [
      { type: 'gridVoltage' as const, value: parseFloat(gridVoltage) },
      { type: 'motorCurrent' as const, value: parseFloat(motorCurrent) },
      { type: 'powerFactor' as const, value: parseFloat(powerFactor) },
      { type: 'gridFrequency' as const, value: parseFloat(gridFrequency) },
      { type: 'motorSurfaceTemp' as const, value: parseFloat(motorSurfaceTemp) },
      { type: 'bearingTemp' as const, value: parseFloat(bearingTemp) },
      { type: 'dustDensity' as const, value: parseFloat(dustDensity) },
      { type: 'vibrationRms' as const, value: parseFloat(vibrationRms) },
    ];
    
    for (const param of parameters) {
      if (shouldAlert(param.value, param.type)) {
        const severity = getAlertSeverity(param.value, param.type);
        if (severity) {
          const alert = await prisma.alert.create({
            data: {
              motorId,
              severity,
              parameter: param.type,
              value: param.value,
              message: `${PARAMETER_CONFIG[param.type].label} ${severity === 'CRITICAL' ? 'melampaui' : 'mendekati'} batas aman: ${param.value} ${PARAMETER_CONFIG[param.type].unit}`,
              status: 'OPEN',
            },
          });
          alerts.push(alert);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      readingId: reading.id,
      alertsGenerated: alerts.length,
      alerts,
    });
    
  } catch (error) {
    console.error('Error ingesting sensor data:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

