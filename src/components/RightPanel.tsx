import { useState } from 'react';
import { AlertCircle, Battery, Gauge, Settings, Send, Trash2, Undo, Pen, Play, Ruler } from 'lucide-react';
import { useOperatorStore } from '../store/useOperatorStore';
import { plannerService } from '../services/plannerService';
import { telemetryService } from '../services/telemetryService';

export function RightPanel() {
  const heroBus = useOperatorStore((state) => state.heroBus);
  const currentPath = useOperatorStore((state) => state.currentPath);
  const isDrawingPath = useOperatorStore((state) => state.isDrawingPath);
  const setIsDrawingPath = useOperatorStore((state) => state.setIsDrawingPath);
  const isMeasuringDistance = useOperatorStore((state) => state.isMeasuringDistance);
  const setIsMeasuringDistance = useOperatorStore((state) => state.setIsMeasuringDistance);
  const distanceMeasurement = useOperatorStore((state) => state.distanceMeasurement);
  const submitPath = useOperatorStore((state) => state.submitPath);
  const clearPath = useOperatorStore((state) => state.clearPath);
  const removeLastPathPoint = useOperatorStore((state) => state.removeLastPathPoint);
  const setPathStatus = useOperatorStore((state) => state.setPathStatus);
  const setHeroBus = useOperatorStore((state) => state.setHeroBus);
  const clearDistanceMeasurement = useOperatorStore((state) => state.clearDistanceMeasurement);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const getAutonomyStateColor = () => {
    switch (heroBus.autonomyState) {
      case 'stuck':
        return 'text-red-500 bg-red-500/10';
      case 'awaiting_guidance':
        return 'text-orange-500 bg-orange-500/10';
      case 'manual':
        return 'text-blue-500 bg-blue-500/10';
      case 'autonomous':
      default:
        return 'text-green-500 bg-green-500/10';
    }
  };

  const handleSubmitPath = async () => {
    if (!currentPath || currentPath.points.length < 2) return;

    setIsSubmitting(true);
    setResponseMessage(null);

    try {
      submitPath();
      const response = await plannerService.submitPath(currentPath);

      if (response.status === 'accepted') {
        setPathStatus('accepted');
        setResponseMessage(`Path accepted! ETA: ${response.estimatedTime}s`);
        setIsDrawingPath(false);
        
        // Automatically start vehicle movement after acceptance
        setTimeout(() => {
          handleExecutePath();
        }, 500);
      } else {
        setPathStatus('rejected');
        setResponseMessage(response.message);
      }
    } catch (error) {
      setResponseMessage('Error submitting path');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecutePath = () => {
    if (!currentPath || currentPath.points.length < 2) return;

    setIsExecuting(true);
    setResponseMessage('Executing path...');

    // Update bus state to show it's moving
    setHeroBus({
      autonomyState: 'autonomous',
      stuckReason: null,
      velocity: 2.5,
    });

    // Convert path points to position array
    const pathPositions = currentPath.points.map(p => ({
      x: p.position.x,
      y: p.position.y,
      z: p.position.z,
    }));

    // Calculate duration based on path length (2 seconds per point)
    const duration = currentPath.points.length * 2000;

    // Start simulated movement
    telemetryService.simulateMovement(pathPositions, duration);

    // After movement completes
    setTimeout(() => {
      setIsExecuting(false);
      setResponseMessage('Path execution complete!');
      setHeroBus({
        velocity: 0,
        autonomyState: 'autonomous',
      });
    }, duration);
  };

  return (
    <div className="w-80 bg-[#0f0f0f] border-l border-gray-800 p-4 space-y-6 overflow-y-auto">
      {/* Hero Bus Status */}
      <div>
        <div className="text-xs text-gray-500 tracking-wider uppercase mb-3">
          Hero Bus Status
      </div>
      
        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Autonomy State</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAutonomyStateColor()}`}>
              {heroBus.autonomyState.toUpperCase()}
            </span>
          </div>

          {heroBus.stuckReason && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle size={16} className="text-red-500 mt-0.5" />
            <div>
                <div className="text-sm text-red-400 font-medium">Stuck Reason</div>
                <div className="text-xs text-red-300 mt-1">
                  {heroBus.stuckReason.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          )}
            
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Velocity</span>
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-gray-500" />
              <span className="text-sm text-white">{heroBus.velocity.toFixed(1)} m/s</span>
              </div>
            </div>
            
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Gear</span>
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-gray-500" />
              <span className="text-sm text-white font-mono">{heroBus.gear}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Battery</span>
            <div className="flex items-center gap-2">
              <Battery size={14} className="text-gray-500" />
              <span className="text-sm text-white">{Math.round(heroBus.batteryLevel)}%</span>
            </div>
            </div>
            
          <div className="pt-3 border-t border-gray-800">
            <div className="text-xs text-gray-500 mb-2">Position</div>
            <div className="font-mono text-xs text-gray-400 space-y-1">
              <div>X: {heroBus.position.x.toFixed(2)}</div>
              <div>Y: {heroBus.position.y.toFixed(2)}</div>
              <div>Z: {heroBus.position.z.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
        
      {/* Path Suggestion Controls */}
      <div className="pt-6 border-t border-gray-800">
        <div className="text-xs text-gray-500 tracking-wider uppercase mb-4">
          Path Suggestion
        </div>

        <div className="space-y-6">
          {currentPath && (
            <div className="bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentPath.status === 'draft'
                    ? 'bg-blue-500/10 text-blue-400'
                    : currentPath.status === 'submitted'
                    ? 'bg-orange-500/10 text-orange-400'
                    : currentPath.status === 'accepted'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {currentPath.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Waypoints</span>
                <span className="text-sm text-white">{currentPath.points.length}</span>
              </div>
            </div>
          )}

          {responseMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              currentPath?.status === 'accepted'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {responseMessage}
          </div>
        )}
        
          <button
            onClick={() => {
              if (isDrawingPath) {
                setIsDrawingPath(false);
              } else {
                setIsDrawingPath(true);
                setIsMeasuringDistance(false);
                setResponseMessage(null);
              }
            }}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-all ${
              isDrawingPath
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <Pen size={16} />
            <span className="text-sm font-medium">
              {isDrawingPath ? 'Drawing Path...' : 'Draw Path'}
            </span>
          </button>

          <button
            onClick={() => {
              if (isMeasuringDistance) {
                setIsMeasuringDistance(false);
              } else {
                setIsMeasuringDistance(true);
                setIsDrawingPath(false);
                setResponseMessage(null);
              }
            }}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-all ${
              isMeasuringDistance
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <Ruler size={16} />
            <span className="text-sm font-medium">
              {isMeasuringDistance ? 'Measuring Distance...' : 'Measure Distance'}
            </span>
          </button>

          {isMeasuringDistance && (
            <div className="bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Points</span>
                <span className="text-sm text-white">
                  {distanceMeasurement?.points.length ?? 0} / 2
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Distance</span>
                <span className="text-sm text-white">
                  {distanceMeasurement?.distance !== null && distanceMeasurement?.distance !== undefined
                    ? `${distanceMeasurement.distance.toFixed(2)} m`
                    : '--'}
                </span>
              </div>
              <button
                onClick={clearDistanceMeasurement}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
              >
                <Trash2 size={14} />
                <span className="text-sm">Clear Measurement</span>
              </button>
              <div className="text-xs text-gray-500 text-center">
                Click two points in the scene to measure
              </div>
            </div>
          )}

          {currentPath && currentPath.status === 'draft' && (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <button
                  onClick={removeLastPathPoint}
                  disabled={!currentPath || currentPath.points.length === 0}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-3"
                >
                  <Undo size={14} />
                  <span className="text-sm">Undo</span>
                </button>

                <button
                  onClick={() => {
                    clearPath();
                    setIsDrawingPath(false);
                    setResponseMessage(null);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all mt-3"
                >
                  <Trash2 size={14} />
                  <span className="text-sm">Clear</span>
                </button>
              </div>

              <button
                onClick={handleSubmitPath}
                disabled={!currentPath || currentPath.points.length < 2 || isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={16} />
                <span className="text-sm font-medium">
                  {isSubmitting ? 'Submitting...' : 'Submit Path'}
                </span>
              </button>
            </>
          )}

          {currentPath && currentPath.status === 'accepted' && !isExecuting && (
            <div className="space-y-4">
              <button
                onClick={handleExecutePath}
                disabled={isExecuting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Play size={16} />
                <span className="text-sm font-medium">Execute Path Manually</span>
              </button>
              
              <button
                onClick={() => {
                  clearPath();
                  setResponseMessage(null);
                  telemetryService.stopMovement();
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
              >
                <Trash2 size={16} />
                <span className="text-sm font-medium">Clear Path</span>
              </button>
            </div>
          )}
            
          {isExecuting && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
                  <div className="text-sm text-green-400 font-medium">Executing Path</div>
                  <div className="text-xs text-green-300 mt-1">Vehicle is following the guidance path</div>
                </div>
              </div>
            </div>
          )}

          {!currentPath && !isDrawingPath && (
            <div className="text-xs text-gray-500 text-center py-4">
              Click "Draw Path" to create a guidance suggestion
            </div>
          )}
          </div>
      </div>
    </div>
  );
}
