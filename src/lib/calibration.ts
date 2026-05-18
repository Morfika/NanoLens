export interface CalibrationPoint {
  id: string;
  ntaSize: number; // nm
  uvVisPeak: number; // nm
  hex: string;
  colorName: string;
  method: string;
}

export const calibrationData: CalibrationPoint[] = [
  { id: "M1", ntaSize: 12, uvVisPeak: 392, hex: "#F5E642", colorName: "Amarillo pálido", method: "NTA Zetasizer + UV-Vis" },
  { id: "M2", ntaSize: 25, uvVisPeak: 405, hex: "#EBC832", colorName: "Amarillo dorado", method: "NTA Zetasizer + UV-Vis" },
  { id: "M3", ntaSize: 38, uvVisPeak: 418, hex: "#E8A020", colorName: "Amarillo-naranja", method: "NTA Zetasizer + UV-Vis" },
  { id: "M4", ntaSize: 52, uvVisPeak: 435, hex: "#D4701A", colorName: "Naranja", method: "NTA Zetasizer + UV-Vis" },
  { id: "M5", ntaSize: 68, uvVisPeak: 452, hex: "#C04A12", colorName: "Naranja-rojo", method: "NTA Zetasizer + UV-Vis" },
  { id: "M6", ntaSize: 85, uvVisPeak: 470, hex: "#A03010", colorName: "Rojo-café", method: "NTA Zetasizer + UV-Vis" },
];

export interface SizeRange {
  label: string;
  min: number;
  max: number;
  hueRange: [number, number];
  description: string;
  warning?: string;
}

export const sizeRanges: SizeRange[] = [
  { label: "10–30 nm", min: 10, max: 30, hueRange: [45, 65], description: "Amarillo — partículas pequeñas, monodispersas." },
  { label: "30–50 nm", min: 30, max: 50, hueRange: [30, 45], description: "Amarillo-naranja — tamaño intermedio." },
  { label: "50–70 nm", min: 50, max: 70, hueRange: [15, 30], description: "Naranja — partículas medianas/grandes." },
  { label: ">70 nm o agregadas", min: 70, max: 120, hueRange: [0, 15], description: "Rojo-café — partículas grandes o posible agregación.", warning: "Posible agregación o crecimiento excesivo." },
];
