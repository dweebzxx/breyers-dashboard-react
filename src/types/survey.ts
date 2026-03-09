/**
 * Survey data types for the Breyers Survey Dashboard.
 * Mirrors the CSV structure from breyers-survey-data-cleaned.csv
 * with derived variables added by the pre-computation script.
 */

export interface Respondent {
  // Identifiers
  RandomID: string
  'Respondent ID': string

  // Screening / consent
  Q1_Consent: number
  Q2_PurchaseRecent: number
  Q3_DecisionRole: number

  // Purchase behavior
  Q4_PurchaseFreq: number
  Q5_UsualChannel: number
  Q6_BrandsBought: string
  Q7_BrandMostOften: string

  // Attribute importance (1–5 scale, 7 items)
  Q8_AttrImportance_1: number
  Q8_AttrImportance_2: number
  Q8_AttrImportance_3: number
  Q8_AttrImportance_4: number
  Q8_AttrImportance_5: number
  Q8_AttrImportance_6: number
  Q8_AttrImportance_7: number
  Q8h_QualityCheck_Trap1: number

  // Preferences
  Q9_Tradeoff: number
  Q10_ActiveSeeking: number

  // Concept evaluation
  Q11_Appeal: number
  Q12_PurchaseIntent: number
  Q13_Replacement: number
  Q13A_WhatReplaced: number | null
  Q14_InterestComparison: number
  Q15_AttentionCheck_1: number
  Q16_PurchaseLocation: number

  // Price sensitivity ($3.99–$7.99)
  Q17a_Price399: number
  Q17b_Price499: number
  Q17c_Price599: number
  Q17d_Price699: number
  Q17e_Price799: number
  Q18_PriceTooExpensive: number | null

  // Channel
  Q19_ClubStore4Pack: number
  Q20_OnlineDelivery: number

  // Demographics
  Q21_DietFocus: number
  Q22_HouseholdType: number
  Q23_Age: number
  Q24_Income: number

  // Experiment cell
  ClaimCell: number
  ConceptLabel: string

  // Derived variables (added by precompute script)
  Top2Box_PI: number

  // Parsed brand flags
  Brand_Breyers: boolean
  Brand_BenJerrys: boolean
  Brand_HaloTop: boolean
  Brand_Enlightened: boolean
  Brand_Nicks: boolean
  Brand_StorePrivate: boolean
  Brand_LocalRegional: boolean
}

// ──────────────────────────────────────────────
// Label mapping types
// ──────────────────────────────────────────────

export type LabelMap = Record<number, string>

export interface Labels {
  CONCEPT_LABEL: LabelMap
  PURCHASE_FREQ: LabelMap
  APPEAL: LabelMap
  PURCHASE_INTENT: LabelMap
  TOP2BOX: LabelMap
  REPLACEMENT: LabelMap
  WHAT_REPLACED: LabelMap
  INTEREST_COMPARISON: LabelMap
  PURCHASE_LOCATION: LabelMap
  PRICE_LIKELIHOOD: LabelMap
  CLUB_STORE: LabelMap
  ONLINE_DELIVERY: LabelMap
  DIET_FOCUS: LabelMap
  HOUSEHOLD_TYPE: LabelMap
  AGE: LabelMap
  INCOME: LabelMap
  ATTR_IMPORTANCE: LabelMap
  IMPORTANCE_SCALE: LabelMap
  BRANDS_BOUGHT: LabelMap
  TRADEOFF: LabelMap
  ACTIVE_SEEKING: LabelMap
  PRICE_POINTS: Record<string, string>
}

// ──────────────────────────────────────────────
// Question text mapping
// ──────────────────────────────────────────────

export type QuestionText = Record<string, string>
