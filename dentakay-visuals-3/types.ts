import { ReactNode } from 'react';

export interface Treatment {
  id: string;
  title: string;
  desc: string;
  promptContext: string;
  structuralChange: boolean;
  icon: ReactNode;
}

export interface Material {
  id: string;
  title: string;
  desc: string;
  promptMod: string;
}

export interface Shade {
  id: string;
  title: string;
  desc: string;
  promptMod: string;
}

export interface SelectionState {
  treatment: Treatment | null;
  material: Material | null;
  shade: Shade | null;
}

export interface WebhookPayload {
  image: string;
  prompt: string;
  metadata: {
    treatment?: string;
    material?: string;
    shade?: string;
  };
}