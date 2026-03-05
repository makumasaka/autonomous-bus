import { Radio, Wifi } from 'lucide-react';
import { useOperatorStore } from '../store/useOperatorStore';

export function Header() {
  const heroBus = useOperatorStore((state) => state.heroBus);

  const getConnectionStatus = () => {
    // Mock: In real app, this would check actual connection status
    return heroBus.autonomyState !== 'stuck' ? 'Connected' : 'Limited';
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div>
            <div className="text-xs text-gray-400 tracking-wider uppercase mb-1">
              Remote Operator Interface
            </div>
            <h1 className="text-white text-xl font-semibold">Autonomous Bus Guidance</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-green-500" />
              <div>
                <div className="text-xs text-gray-400">Connection</div>
                <div className="text-sm text-white font-medium">{getConnectionStatus()}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Wifi size={18} className="text-blue-500" />
              <div>
                <div className="text-xs text-gray-400">Signal</div>
                <div className="text-sm text-white font-medium">Strong</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-400">System Status</div>
            <div className="text-sm text-green-500 font-medium">Operational</div>
          </div>
        </div>
      </div>
    </header>
  );
}
