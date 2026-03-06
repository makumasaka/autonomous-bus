import React, { useState } from 'react';
import { AlertCircle, Battery, Gauge, Settings, Send, Trash2, Undo, Pen, Play, Ruler, MapPin, TriangleAlert } from 'lucide-react';
import { useOperatorStore } from '../store/useOperatorStore';
import { plannerService } from '../services/plannerService';
import { telemetryService } from '../services/telemetryService';
import { useOpsStore } from '@/state/useOpsStore';
import { mockRoutes, mockStuckEvents, mockVehicles } from '@/data/mockOps';
import { formatDurationShort, titleCaseReason } from '@/lib/format';

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
  const selectedEventId = useOpsStore((s) => s.selectedEventId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const getAutonomyStateColor = () => {
    switch (heroBus.autonomyState) {
      case 'stuck':
        return 'text-orange-200 bg-orange-500/10 ring-1 ring-orange-500/20';
      case 'awaiting_guidance':
        return 'text-orange-200 bg-orange-500/10 ring-1 ring-orange-500/20';
      case 'manual':
        return 'text-sky-200 bg-sky-500/10 ring-1 ring-sky-500/20';
      case 'autonomous':
      default:
        return 'text-emerald-200 bg-emerald-500/10 ring-1 ring-emerald-500/20';
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
    <div className="w-80 bg-robobus-surface/85 border-l border-white/10 p-4 space-y-6 overflow-y-auto backdrop-blur-md">
      {/* Active incident context (bound from situational map selection) */}
      {selectedEventId ? (() => {
        const evt = mockStuckEvents.find((e) => e.id === selectedEventId);
        if (!evt) return null;
        const veh = mockVehicles.find((v) => v.id === evt.vehicleId);
        const route = mockRoutes.find((r) => r.id === evt.routeId);
        return (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                  <TriangleAlert className="size-3.5 text-orange-300" />
                  Active incident
                </div>
                <div className="mt-2 truncate text-sm font-semibold text-slate-50">
                  {veh?.fleetId ?? evt.vehicleId}
                  <span className="text-slate-400"> • </span>
                  {route?.name ?? evt.routeId}
                </div>
                <div className="mt-1 text-sm text-slate-200">
                  {titleCaseReason(evt.reason)}
                  <span className="text-slate-400"> • </span>
                  {formatDurationShort(evt.durationSec)}
                </div>
              </div>
              <div className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-200 ring-1 ring-orange-500/20">
                {evt.severity}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              <span className="flex items-center gap-2 text-slate-300">
                <MapPin className="size-3.5 text-slate-400" />
                {evt.location.lat.toFixed(4)}, {evt.location.lng.toFixed(4)}
              </span>
              <span className="text-slate-400">SF</span>
            </div>

            <div className="mt-3 text-sm text-slate-200">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Recommended action
              </div>
              <div className="mt-1 text-sm text-slate-200">
                {evt.recommendedAction}
              </div>
            </div>
          </div>
        );
      })() : null}

      {/* Hero Bus Status */}
      <div>
        <div className="text-xs text-slate-400 tracking-wider uppercase mb-3">
          Hero Bus Status
      </div>
      
        <div className="bg-black/20 rounded-xl border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Autonomy State</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAutonomyStateColor()}`}>
              {heroBus.autonomyState.toUpperCase()}
            </span>
          </div>

          {heroBus.stuckReason && (
            <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <AlertCircle size={16} className="text-orange-300 mt-0.5" />
            <div>
                <div className="text-sm text-orange-200 font-medium">Stuck Reason</div>
                <div className="text-xs text-orange-100/80 mt-1">
                  {heroBus.stuckReason.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          )}
            
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Velocity</span>
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-slate-400" />
              <span className="text-sm text-slate-50">{heroBus.velocity.toFixed(1)} m/s</span>
              </div>
            </div>
            
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Gear</span>
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-slate-400" />
              <span className="text-sm text-slate-50 font-mono">{heroBus.gear}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Battery</span>
            <div className="flex items-center gap-2">
              <Battery size={14} className="text-slate-400" />
              <span className="text-sm text-slate-50">{Math.round(heroBus.batteryLevel)}%</span>
            </div>
            </div>
            
          <div className="pt-3 border-t border-white/10">
            <div className="text-xs text-slate-400 mb-2">Position</div>
            <div className="font-mono text-xs text-slate-300 space-y-1">
              <div>X: {heroBus.position.x.toFixed(2)}</div>
              <div>Y: {heroBus.position.y.toFixed(2)}</div>
              <div>Z: {heroBus.position.z.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
        
      {/* Path Suggestion Controls */}
      <div className="pt-6 border-t border-white/10">
        <div className="text-xs text-slate-400 tracking-wider uppercase mb-4">
          Path Suggestion
        </div>

        <div className="space-y-6">
          {currentPath && (
            <div className="bg-black/20 rounded-xl border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentPath.status === 'draft'
                    ? 'bg-sky-500/10 text-sky-200 ring-1 ring-sky-500/20'
                    : currentPath.status === 'submitted'
                    ? 'bg-orange-500/10 text-orange-200 ring-1 ring-orange-500/20'
                    : currentPath.status === 'accepted'
                    ? 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/20'
                    : 'bg-red-500/10 text-red-200 ring-1 ring-red-500/20'
                }`}>
                  {currentPath.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Waypoints</span>
                <span className="text-sm text-slate-50">{currentPath.points.length}</span>
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
                ? 'bg-robobus-teal hover:bg-robobus-teal2 text-slate-950'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 ring-1 ring-white/10'
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
                ? 'bg-orange-500 hover:bg-orange-400 text-slate-950'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 ring-1 ring-white/10'
            }`}
          >
            <Ruler size={16} />
            <span className="text-sm font-medium">
              {isMeasuringDistance ? 'Measuring Distance...' : 'Measure Distance'}
            </span>
          </button>

          {isMeasuringDistance && (
            <div className="bg-black/20 rounded-xl border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Points</span>
                <span className="text-sm text-slate-50">
                  {distanceMeasurement?.points.length ?? 0} / 2
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Distance</span>
                <span className="text-sm text-slate-50">
                  {distanceMeasurement?.distance !== null && distanceMeasurement?.distance !== undefined
                    ? `${distanceMeasurement.distance.toFixed(2)} m`
                    : '--'}
                </span>
              </div>
              <button
                onClick={clearDistanceMeasurement}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 ring-1 ring-white/10 transition-all"
              >
                <Trash2 size={14} />
                <span className="text-sm">Clear Measurement</span>
              </button>
              <div className="text-xs text-slate-400 text-center">
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
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 ring-1 ring-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-3"
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
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 ring-1 ring-white/10 transition-all mt-3"
                >
                  <Trash2 size={14} />
                  <span className="text-sm">Clear</span>
                </button>
              </div>

              <button
                onClick={handleSubmitPath}
                disabled={!currentPath || currentPath.points.length < 2 || isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-robobus-teal hover:bg-robobus-teal2 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-robobus-teal hover:bg-robobus-teal2 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 ring-1 ring-white/10 transition-all"
              >
                <Trash2 size={16} />
                <span className="text-sm font-medium">Clear Path</span>
              </button>
            </div>
          )}
            
          {isExecuting && (
            <div className="p-4 bg-robobus-teal/10 border border-robobus-teal/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-robobus-teal rounded-full animate-pulse" />
            <div>
                  <div className="text-sm text-slate-100 font-medium">Executing Path</div>
                  <div className="text-xs text-slate-300 mt-1">Vehicle is following the guidance path</div>
                </div>
              </div>
            </div>
          )}

          {!currentPath && !isDrawingPath && (
            <div className="text-xs text-slate-400 text-center py-4">
              Click "Draw Path" to create a guidance suggestion
            </div>
          )}
          </div>
      </div>
    </div>
  );
}
