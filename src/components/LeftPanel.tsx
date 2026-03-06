import { Eye, Camera, Move, Navigation2, Eye as EyeIcon, Users, Car, Trees, Bug, AlertTriangle } from 'lucide-react';
import { useOperatorStore } from '../store/useOperatorStore';
import type { CameraMode } from '../types';

export function LeftPanel() {
  const cameraMode = useOperatorStore((state) => state.cameraMode);
  const setCameraMode = useOperatorStore((state) => state.setCameraMode);
  const sceneLayerToggles = useOperatorStore((state) => state.sceneLayerToggles);
  const toggleSceneLayer = useOperatorStore((state) => state.toggleSceneLayer);
  const loadStuckScenario = useOperatorStore((state) => state.loadStuckScenario);

  const cameraViews: { mode: CameraMode; icon: any; label: string; description: string }[] = [
    { mode: 'free', icon: Eye, label: 'Free', description: 'Manual camera control' },
    { mode: 'follow', icon: Navigation2, label: 'Follow Bus', description: 'Track hero vehicle' },
    { mode: 'overhead', icon: Camera, label: 'Overhead', description: 'Top-down view' },
    { mode: 'street', icon: Move, label: 'Street', description: 'Ground-level view' },
  ];

  return (
    <div className="w-72 bg-robobus-surface/85 border-r border-white/10 p-4 space-y-6 overflow-y-auto backdrop-blur-md">
      <div>
        <div className="text-xs text-slate-400 tracking-wider uppercase mb-3">
          Camera Modes
        </div>
        
        <div className="space-y-2">
          {cameraViews.map(({ mode, icon: Icon, label, description }) => (
            <button
              key={mode}
              onClick={() => setCameraMode(mode)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                cameraMode === mode
                  ? 'bg-robobus-teal/15 text-slate-50 ring-1 ring-robobus-teal/30'
                  : 'text-slate-300/80 hover:bg-white/5 hover:text-slate-100 ring-1 ring-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs opacity-70">{description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="pt-6 border-t border-white/10">
        <div className="text-xs text-slate-400 tracking-wider uppercase mb-3">
          Scene Layers
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => toggleSceneLayer('pedestrians')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
              sceneLayerToggles.pedestrians
                ? 'bg-white/5 text-slate-100 ring-1 ring-white/10'
                : 'text-slate-400 hover:bg-white/5 ring-1 ring-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={16} />
              <span className="text-sm">Pedestrians</span>
              </div>
            <div className={`w-2 h-2 rounded-full ${sceneLayerToggles.pedestrians ? 'bg-robobus-teal' : 'bg-slate-600'}`} />
          </button>
          
          <button
            onClick={() => toggleSceneLayer('traffic')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
              sceneLayerToggles.traffic
                ? 'bg-white/5 text-slate-100 ring-1 ring-white/10'
                : 'text-slate-400 hover:bg-white/5 ring-1 ring-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Car size={16} />
              <span className="text-sm">Traffic</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${sceneLayerToggles.traffic ? 'bg-robobus-teal' : 'bg-slate-600'}`} />
          </button>
          
          <button
            onClick={() => toggleSceneLayer('foliage')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
              sceneLayerToggles.foliage
                ? 'bg-white/5 text-slate-100 ring-1 ring-white/10'
                : 'text-slate-400 hover:bg-white/5 ring-1 ring-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Trees size={16} />
              <span className="text-sm">Foliage</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${sceneLayerToggles.foliage ? 'bg-robobus-teal' : 'bg-slate-600'}`} />
          </button>
          
          <button
            onClick={() => toggleSceneLayer('obstacles')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
              sceneLayerToggles.obstacles
                ? 'bg-white/5 text-slate-100 ring-1 ring-white/10'
                : 'text-slate-400 hover:bg-white/5 ring-1 ring-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} />
              <span className="text-sm">Obstacles</span>
              </div>
            <div className={`w-2 h-2 rounded-full ${sceneLayerToggles.obstacles ? 'bg-robobus-teal' : 'bg-slate-600'}`} />
          </button>
          
          <button
            onClick={() => toggleSceneLayer('debug')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
              sceneLayerToggles.debug
                ? 'bg-white/5 text-slate-100 ring-1 ring-white/10'
                : 'text-slate-400 hover:bg-white/5 ring-1 ring-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bug size={16} />
              <span className="text-sm">Debug</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${sceneLayerToggles.debug ? 'bg-robobus-teal' : 'bg-slate-600'}`} />
          </button>
        </div>
      </div>
      
      <div className="pt-6 border-t border-white/10">
        <div className="text-xs text-slate-400 tracking-wider uppercase mb-3">
          Demo Scenarios
        </div>
        
          <button
          onClick={loadStuckScenario}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-200 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-all"
          >
          <AlertTriangle size={18} />
          <div className="text-left">
            <div className="text-sm font-medium">Blocked Lane</div>
            <div className="text-xs text-slate-400">Load stuck scenario</div>
          </div>
          </button>
      </div>
    </div>
  );
}
