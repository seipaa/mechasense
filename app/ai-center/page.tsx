'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';

const DEFAULT_MOTOR_ID = 'default-motor-1';

interface MLPredictionResult {
  healthScore: number;
  healthCategory: string;
  topFeatures: string[];
  timestamp: string;
}

interface ExpertDiagnosisResult {
  diagnosis: string;
  recommendation: string;
  rulesMatched: Array<{
    id: string;
    condition: string;
    diagnosis: string;
    recommendation: string;
  }>;
  timestamp: string;
}

export default function AICenterPage() {
  const [mlResult, setMlResult] = useState<MLPredictionResult | null>(null);
  const [expertResult, setExpertResult] = useState<ExpertDiagnosisResult | null>(null);
  const [isLoadingML, setIsLoadingML] = useState(false);
  const [isLoadingExpert, setIsLoadingExpert] = useState(false);
  
  const runMLPrediction = async () => {
    setIsLoadingML(true);
    try {
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motorId: DEFAULT_MOTOR_ID }),
      });
      const result = await response.json();
      setMlResult(result);
    } catch (error) {
      console.error('Error running ML prediction:', error);
    } finally {
      setIsLoadingML(false);
    }
  };
  
  const runExpertDiagnosis = async () => {
    setIsLoadingExpert(true);
    try {
      const response = await fetch('/api/expert/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motorId: DEFAULT_MOTOR_ID }),
      });
      const result = await response.json();
      setExpertResult(result);
    } catch (error) {
      console.error('Error running expert diagnosis:', error);
    } finally {
      setIsLoadingExpert(false);
    }
  };
  
  const getCategoryColor = (category: string) => {
    if (category === 'Healthy') return 'text-status-normal';
    if (category === 'At Risk') return 'text-status-warning';
    return 'text-status-critical';
  };
  
  const getCategoryBgColor = (category: string) => {
    if (category === 'Healthy') return 'bg-status-normal';
    if (category === 'At Risk') return 'bg-status-warning';
    return 'bg-status-critical';
  };
  
  return (
    <div className="min-h-screen bg-lightgray">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">AI Center</h1>
          <p className="text-gray-600 mt-1">Machine Learning Prediction & Expert System Diagnosis</p>
        </div>
        
        {/* ML Health Score Section */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Predictive ML Health Score
              </h2>
              <p className="text-sm text-gray-600 mt-1">Prediksi kondisi motor menggunakan Machine Learning</p>
            </div>
            <button
              onClick={runMLPrediction}
              disabled={isLoadingML}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingML ? 'Running...' : 'Run Prediction'}
            </button>
          </div>
          
          {mlResult ? (
            <div className="mt-6">
              <div className="flex items-center gap-8 mb-6">
                {/* Health Score Gauge */}
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={
                        mlResult.healthScore >= 80 ? '#10b981' :
                        mlResult.healthScore >= 60 ? '#f59e0b' : '#ef4444'
                      }
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${mlResult.healthScore * 4.4} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getCategoryColor(mlResult.healthCategory)}`}>
                      {mlResult.healthScore}
                    </span>
                    <span className="text-sm text-gray-600">Health Score</span>
                  </div>
                </div>
                
                {/* Category Badge */}
                <div className="flex-1">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getCategoryBgColor(mlResult.healthCategory)} text-white text-lg font-semibold mb-4`}>
                    {mlResult.healthCategory}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Analyzed at: {formatDate(mlResult.timestamp)}</p>
                  
                  {/* Top Features */}
                  {mlResult.topFeatures && mlResult.topFeatures.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Key factors affecting health:</p>
                      <div className="flex flex-wrap gap-2">
                        {mlResult.topFeatures.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Note:</strong> This is a placeholder ML prediction. In production, this would integrate with a trained TensorFlow/PyTorch model via REST API or Python service.</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p>Click "Run Prediction" to analyze motor health</p>
            </div>
          )}
        </div>
        
        {/* Expert System Section */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Expert System Diagnosis
              </h2>
              <p className="text-sm text-gray-600 mt-1">Analisis berbasis rule engine untuk diagnosa masalah</p>
            </div>
            <button
              onClick={runExpertDiagnosis}
              disabled={isLoadingExpert}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingExpert ? 'Analyzing...' : 'Run Diagnosis'}
            </button>
          </div>
          
          {expertResult ? (
            <div className="mt-6">
              {/* Diagnosis */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Diagnosis
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800">{expertResult.diagnosis}</p>
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Recommendations
                </h3>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {expertResult.recommendation}
                  </pre>
                </div>
              </div>
              
              {/* Rules Matched */}
              {expertResult.rulesMatched && expertResult.rulesMatched.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Rules Matched ({expertResult.rulesMatched.length})
                  </h3>
                  <div className="space-y-3">
                    {expertResult.rulesMatched.map((rule) => (
                      <div key={rule.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary text-white text-xs font-mono rounded">
                            {rule.id}
                          </span>
                          <span className="text-xs text-gray-600">{rule.condition}</span>
                        </div>
                        <p className="text-sm text-gray-800 font-medium mb-1">{rule.diagnosis}</p>
                        <p className="text-sm text-gray-600">{rule.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Note:</strong> This is a placeholder expert system with hardcoded rules. In production, integrate with a proper rule engine (e.g., Drools, Nools) for dynamic rule management.</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Click "Run Diagnosis" to analyze motor issues</p>
            </div>
          )}
        </div>
        
        {/* Future Features */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Coming Soon
          </h2>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Model Management</h3>
              <p className="text-sm text-gray-600">
                Upload dan update ML models melalui UI. Versioning dan A/B testing untuk models.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Rule Editor</h3>
              <p className="text-sm text-gray-600">
                Visual rule editor untuk menambah, mengedit, dan menghapus aturan expert system tanpa coding.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-1">Training Dashboard</h3>
              <p className="text-sm text-gray-600">
                Monitor training progress, metrics, dan performance comparison antar model versions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

