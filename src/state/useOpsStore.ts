import { create } from "zustand";
import type { MapLayerSettings, OpsMode } from "../types/ops";

interface OpsStore {
  mode: OpsMode;
  selectedEventId: string | null;

  leftPanelOpen: boolean;
  rightPanelOpen: boolean;

  layerSettings: MapLayerSettings;

  setMode: (mode: OpsMode) => void;
  selectEvent: (eventId: string) => void;
  clearSelection: () => void;

  openRemoteAssist: () => void;
  openSituational: () => void;

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleLayer: (layer: keyof MapLayerSettings) => void;
}

const defaultLayers: MapLayerSettings = {
  vehicles: true,
  routes: true,
  incidents: true,
  depots: true,
  cityOverlay: false,
};

export const useOpsStore = create<OpsStore>((set, get) => ({
  mode: "situational",
  selectedEventId: null,

  leftPanelOpen: true,
  rightPanelOpen: true,

  layerSettings: defaultLayers,

  setMode: (mode) => set({ mode }),
  selectEvent: (eventId) => set({ selectedEventId: eventId }),
  clearSelection: () => set({ selectedEventId: null }),

  openRemoteAssist: () => {
    if (!get().selectedEventId) return;
    set({ mode: "remote_assist" });
  },
  openSituational: () => set({ mode: "situational" }),

  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),

  toggleLayer: (layer) =>
    set((s) => ({
      layerSettings: { ...s.layerSettings, [layer]: !s.layerSettings[layer] },
    })),
}));

