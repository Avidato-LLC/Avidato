// CEFR word-level decision system
// Estimates CEFR level for a word based on frequency, concreteness, formality, figurativeness, morphology, and domain specificity

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface WordFeatures {
  frequency: 'very-common' | 'moderate' | 'rare';
  concreteness: 'concrete' | 'abstract';
  formality: 'everyday' | 'professional';
  figurative: boolean;
  morphologicalComplexity: 'simple' | 'complex';
  domainSpecificity: 'general' | 'specialized';
}

/**
 * Estimate CEFR level for a word based on its features
 */
export function estimateCEFRLevel(features: WordFeatures): CEFRLevel {
  // Simple rules based on provided criteria
  if (features.frequency === 'very-common' && features.concreteness === 'concrete' && features.formality === 'everyday' && !features.figurative && features.morphologicalComplexity === 'simple' && features.domainSpecificity === 'general') {
    return 'A1';
  }
  if (features.frequency === 'very-common' && features.concreteness === 'concrete') {
    return 'A2';
  }
  if (features.frequency === 'very-common' && features.concreteness === 'abstract') {
    return 'B1';
  }
  if (features.frequency === 'moderate' || features.morphologicalComplexity === 'complex' || features.domainSpecificity === 'specialized') {
    return 'B2';
  }
  return 'C1';
}
