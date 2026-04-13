import React from 'react';
import { Sparkles, Shield, Award, Sun } from 'lucide-react';
import { Treatment, Material, Shade } from './types';

export const TREATMENTS: Treatment[] = [
  { 
    id: 'veneers', 
    title: 'Porcelain Veneers', 
    desc: 'Hollywood smile transformation',
    promptContext: "Replace visible teeth with high-end porcelain veneers. Perfect symmetry, closed gaps, Golden Ratio proportions. Glass-like polish.",
    structuralChange: true, 
    icon: <Sparkles className="w-6 h-6" />
  },
  { 
    id: 'implants', 
    title: 'Dental Implants', 
    desc: 'Permanent tooth replacement',
    promptContext: "Fill gaps/missing teeth with dental implants. Restore full arch. Natural emergence profile from gums.",
    structuralChange: true,
    icon: <Shield className="w-6 h-6" />
  },
  { 
    id: 'all-on-x', 
    title: 'All-on-4® / All-on-6', 
    desc: 'Full jaw restoration',
    promptContext: "Reconstruct entire dental arch. Uniform, youthful, straight teeth. Parallel to interpupillary line.",
    structuralChange: true,
    icon: <Award className="w-6 h-6" />
  },
  { 
    id: 'whitening', 
    title: 'Laser Whitening', 
    desc: 'Brighten natural teeth',
    promptContext: "Professional teeth whitening. Remove yellow stains. Preserve original tooth morphology, chips, gaps exactly. DO NOT straighten.",
    structuralChange: false,
    icon: <Sun className="w-6 h-6" />
  },
  { 
    id: 'crowns', 
    title: 'Zirconia Crowns', 
    desc: 'Strength and aesthetics',
    promptContext: "Zirconia crowns on visible teeth. Restore volume/structure. High-strength ceramic, slightly less translucent.",
    structuralChange: true,
    icon: <div className="w-6 h-6 font-bold text-center border rounded-full text-xs flex items-center justify-center border-current">Zr</div>
  }
];

export const MATERIALS: Record<string, Material[]> = {
  veneers: [
    { id: 'emax', title: 'E.max® Laminates', desc: 'High translucency, glass-ceramic look', promptMod: "Lithium Disilicate (E.max). High translucency at incisal edges. Blue-ish tint at tips, warm at neck." },
    { id: 'zirconia', title: 'Ultra-Thin Zirconia', desc: 'High strength, pure white potential', promptMod: "Zirconia. High opacity, high brightness, solid white. Reflective surface." },
    { id: 'lumineers', title: 'Lumineers®', desc: 'Ultra-thin, non-prep look', promptMod: "Cerinate Porcelain. Slightly rounded contours, very smooth, conservative bulk." }
  ],
  implants: [
    { id: 'straumann', title: 'Straumann® (Swiss)', desc: 'Premium Swiss porcelain finish', promptMod: "High-end Swiss aesthetic. Natural gum integration, fine surface texture." },
    { id: 'nobel', title: 'Nobel Biocare®', desc: 'Natural contouring', promptMod: "Biomimetic. Mimics natural tooth layers and gradual shading." },
    { id: 'megagen', title: 'MegaGen', desc: 'Standard high-quality', promptMod: "Clean cosmetic look. Bright, standard Hollywood white finish." }
  ],
  'all-on-x': [
    { id: 'straumann-pro', title: 'Straumann Pro Arch', desc: 'Full arch ceramic', promptMod: "Monolithic Zirconia Bridge. Continuous aesthetic, perfect symmetry, high gloss glaze." },
    { id: 'nobel-all-on-4', title: 'Nobel All-on-4®', desc: 'Acrylic/Hybrid finish', promptMod: "Hybrid Denture. Pink gum simulation where necessary, uniform white teeth." }
  ],
  whitening: [
    { id: 'zoom', title: 'Philips Zoom!', desc: 'High gloss bright white', promptMod: "High intensity. Glossy enamel. Remove deep stains." },
    { id: 'laser', title: 'Biolase Laser', desc: 'Natural soft white', promptMod: "Medium-High intensity. Satin/Pearl finish. Even out tone." }
  ],
  crowns: [
    { id: 'zirconia-monolithic', title: 'Monolithic Zirconia', desc: 'Opaque, extreme durability', promptMod: "Full contour Zirconia. 100% opacity. Solid, bright, uniform." },
    { id: 'pfm', title: 'Porcelain Fused Metal', desc: 'Classic layered look', promptMod: "Feldspathic Porcelain over Metal. 80% opacity. Depth of color, warmer near gingiva." }
  ]
};

export const SHADES: Shade[] = [
  { id: 'bl1', title: 'BL1', desc: 'Hollywood Bleach (Extra White)', promptMod: "Bleached white, paper white, highest value. No yellow." },
  { id: 'bl3', title: 'BL3', desc: 'Bright White (Soft Bleach)', promptMod: "Soft bleach, bright white but natural looking. Minimal saturation." },
  { id: 'b1', title: 'B1', desc: 'Natural White (Lightest Natural)', promptMod: "Lightest natural ivory. Hint of cream." },
  { id: 'a1', title: 'A1', desc: 'Light Natural', promptMod: "Natural white, healthy enamel tone. Very slight reddish-brown hue." },
  { id: 'a2', title: 'A2', desc: 'Warm Natural', promptMod: "Average natural tooth, warm ivory, realistic saturation." }
];