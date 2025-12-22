/**
 * POST /api/ml/predict
 * 
 * Placeholder endpoint for ML model prediction
 * In production, this would call a Python/TensorFlow model service
 * For now, returns dummy prediction based on latest sensor data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { motorId } = body;
    
    if (!motorId) {
      return NextResponse.json(
        { error: 'motorId is required' },
        { status: 400 }
      );
    }
    
    // Get latest sensor reading
    const latestReading = await prisma.sensorReading.findFirst({
      where: { motorId },
      orderBy: { timestamp: 'desc' },
    });
    
    if (!latestReading) {
      return NextResponse.json(
        { error: 'No sensor data available for this motor' },
        { status: 404 }
      );
    }
    
    // DUMMY ML PREDICTION LOGIC
    // In production: send features to ML model API and get prediction
    // For now: calculate simple score based on sensor values
    
    let healthScore = 100;
    
    // Deduct points based on parameter status
    if (latestReading.vibrationRms > 4.5) healthScore -= 20;
    else if (latestReading.vibrationRms > 2.8) healthScore -= 10;
    
    if (latestReading.motorSurfaceTemp > 85) healthScore -= 20;
    else if (latestReading.motorSurfaceTemp > 70) healthScore -= 10;
    
    if (latestReading.bearingTemp > 85) healthScore -= 20;
    else if (latestReading.bearingTemp > 70) healthScore -= 10;
    
    if (latestReading.motorCurrent > 5.5) healthScore -= 15;
    else if (latestReading.motorCurrent > 4) healthScore -= 7;
    
    if (latestReading.powerFactor < 0.7) healthScore -= 15;
    else if (latestReading.powerFactor < 0.85) healthScore -= 7;
    
    if (latestReading.dustDensity > 100) healthScore -= 10;
    else if (latestReading.dustDensity > 50) healthScore -= 5;
    
    healthScore = Math.max(0, healthScore);
    
    // Determine category
    let healthCategory = 'Healthy';
    if (healthScore < 60) healthCategory = 'Critical';
    else if (healthScore < 80) healthCategory = 'At Risk';
    
    // Top features affecting health (dummy)
    const topFeatures = [];
    if (latestReading.vibrationRms > 2.8) topFeatures.push('vibrationRms');
    if (latestReading.motorSurfaceTemp > 70) topFeatures.push('motorSurfaceTemp');
    if (latestReading.bearingTemp > 70) topFeatures.push('bearingTemp');
    if (latestReading.powerFactor < 0.85) topFeatures.push('powerFactor');
    if (latestReading.motorCurrent > 4) topFeatures.push('motorCurrent');
    
    // Save to database
    const healthAnalysis = await prisma.healthAnalysis.create({
      data: {
        motorId,
        healthScoreMl: healthScore,
        healthCategory,
        expertDiagnosis: null, // Will be filled by expert system
        expertRecommendation: null,
        rawRulesMatched: null,
      },
    });
    
    return NextResponse.json({
      success: true,
      healthAnalysisId: healthAnalysis.id,
      healthScore,
      healthCategory,
      topFeatures,
      timestamp: new Date().toISOString(),
      note: 'This is a placeholder ML prediction. In production, integrate with TensorFlow/PyTorch model.',
    });
    
  } catch (error) {
    console.error('Error running ML prediction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

