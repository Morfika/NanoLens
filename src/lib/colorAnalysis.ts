import { sizeRanges, calibrationData } from "./calibration";
import { estimateDiameterFromHSV } from "./splineUtils";

export interface RGB { r: number; g: number; b: number }
export interface HSV { h: number; s: number; v: number }

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const t = (n: number) => n.toString(16).padStart(2, "0");
  return `#${t(r)}${t(g)}${t(b)}`.toUpperCase();
}

export interface AnalysisResult {
  rgb: RGB;
  hsv: HSV;
  hex: string;
  estimatedWavelength: number; // nm
  estimatedDiameter: number; // nm
  splineHex: string; // Hex color reconstructed by spline at estimated diameter
  splineDistance: number; // Distance metric of spline fit quality
  sizeRange: { label: string; min: number; max: number; description: string };
  confidence: "alta" | "media" | "baja";
  warnings: string[];
  pixelCount: number;
}

/**
 * Analyze pixels in a region and produce an estimate.
 * Pixels: flat Uint8ClampedArray RGBA (length % 4 == 0).
 */
export function analyzePixels(pixels: Uint8ClampedArray): AnalysisResult {
  const warnings: string[] = [];
  // Filter near-white (background) and near-black (shadows) pixels.
  let r = 0, g = 0, b = 0, n = 0;
  let darkCount = 0, brightCount = 0, total = 0;
  let hueVarianceSamples: number[] = [];

  for (let i = 0; i < pixels.length; i += 4) {
    const pr = pixels[i], pg = pixels[i + 1], pb = pixels[i + 2], pa = pixels[i + 3];
    if (pa < 200) continue;
    total++;
    const max = Math.max(pr, pg, pb), min = Math.min(pr, pg, pb);
    if (max > 245 && min > 230) { brightCount++; continue; } // background
    if (max < 25) { darkCount++; continue; } // shadow
    r += pr; g += pg; b += pb; n++;
    if (n % 50 === 0) {
      const hsv = rgbToHsv({ r: pr, g: pg, b: pb });
      hueVarianceSamples.push(hsv.h);
    }
  }

  if (n < 50) {
    return {
      rgb: { r: 0, g: 0, b: 0 }, hsv: { h: 0, s: 0, v: 0 }, hex: "#000000",
      estimatedWavelength: 0,
      estimatedDiameter: 0,
      splineHex: "#000000",
      splineDistance: 0,
      sizeRange: { label: "No estimable", min: 0, max: 0, description: "No se detectó suficiente color útil." },
      confidence: "baja",
      warnings: ["No se detectaron suficientes píxeles válidos. Asegúrate de seleccionar la zona coloreada de la solución."],
      pixelCount: 0,
    };
  }

  const rgb: RGB = { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
  const hsv = rgbToHsv(rgb);
  const hex = rgbToHex(rgb);

  if (brightCount / total > 0.6) warnings.push("La imagen contiene mucho fondo claro. Acerca el recorte a la solución.");
  if (darkCount / total > 0.4) warnings.push("Hay sombras o áreas muy oscuras. Usa luz natural difusa, sin flash.");
  if (hsv.s < 0.3) warnings.push("Saturación baja: la muestra parece muy diluida o decolorada.");
  if (hsv.v < 0.25) warnings.push("Imagen muy oscura: aumenta la iluminación o sube la exposición.");

  // Hue variance check
  if (hueVarianceSamples.length > 5) {
    const avg = hueVarianceSamples.reduce((a, c) => a + c, 0) / hueVarianceSamples.length;
    const variance = hueVarianceSamples.reduce((a, c) => a + (c - avg) ** 2, 0) / hueVarianceSamples.length;
    if (variance > 1500) warnings.push("Mucha variación de tono en la zona seleccionada. Verifica que el recorte solo cubra la solución.");
  }

  // Map hue (and red wraparound) to a normalized 0-65 scale
  const h = hsv.h > 300 ? hsv.h - 360 : hsv.h; // wrap reds to negative
  let range = sizeRanges[sizeRanges.length - 1];
  for (const r of sizeRanges) {
    if (h >= r.hueRange[0] && h <= r.hueRange[1]) { range = r; break; }
  }
  // Out of expected hue band entirely?
  let outOfRange = false;
  if (h > 65 || h < -15) {
    outOfRange = true;
    warnings.push("El color dominante está fuera del rango calibrado para AgNPs (amarillo → rojo). Resultado no confiable.");
  }

  // Estimate UV-Vis peak by interpolating against calibration via hue → wavelength mapping
  // Simple linear mapping: hue 65° → 392 nm, hue -10° (red) → 470 nm
  const hClamped = Math.max(-10, Math.min(65, h));
  const t = (65 - hClamped) / 75; // 0..1
  const estimatedWavelength = Math.round(392 + t * (470 - 392));

  // Cubic spline inverse estimation
  // hsv.s is 0..1, hsv.v is 0..1. Multiply by 100 to match SPLINE_RAW range (0..100)
  const splineResult = estimateDiameterFromHSV(hsv.h, hsv.s * 100, hsv.v * 100);
  
  if (splineResult.distance > 35) {
    warnings.push("La coloración de la muestra difiere significativamente del perfil de calibración spline. La estimación del diámetro podría tener mayor incertidumbre.");
  }

  let confidence: "alta" | "media" | "baja" = "alta";
  if (outOfRange) confidence = "baja";
  else if (hsv.s < 0.45 || warnings.length >= 2) confidence = "media";
  if (hsv.s < 0.3 || hsv.v < 0.25) confidence = "baja";

  return {
    rgb, hsv, hex,
    estimatedWavelength,
    estimatedDiameter: splineResult.estimatedDiameter,
    splineHex: splineResult.splineHex,
    splineDistance: splineResult.distance,
    sizeRange: { label: range.label, min: range.min, max: range.max, description: range.description },
    confidence,
    warnings,
    pixelCount: n,
  };
}

export const calibrationReferences = calibrationData;
