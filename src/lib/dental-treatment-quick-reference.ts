/**
 * Quick reference for common dental treatments
 * Simplified version with typical scenarios
 */

export interface TreatmentScenario {
  id: string;
  title: string;
  description: string;
  codesInvolved: string[];
  estimatedCostGeneralSEK: {
    min: number;
    max: number;
  };
  estimatedCostSpecialistSEK: {
    min: number;
    max: number;
  };
  timelineEstimate: string;
  notes: string[];
}

/**
 * Common real-world dental scenarios and their estimated costs
 */
export const treatmentScenarios: TreatmentScenario[] = [
  {
    id: 'routine-checkup',
    title: 'Routine Dental Checkup',
    description: 'Patient comes in for regular checkup and basic cleaning',
    codesInvolved: ['101', '207', '210'],
    estimatedCostGeneralSEK: { min: 1585, max: 2415 },
    estimatedCostSpecialistSEK: { min: 1585, max: 2415 },
    timelineEstimate: '30-45 minutes',
    notes: [
      'Includes basic examination (101), plaque removal (207), and general tooth support (210)',
      'Usually covered by dental insurance',
      'Recommended every 6-12 months',
    ],
  },
  {
    id: 'cavity-filling',
    title: 'Single Surface Cavity Filling',
    description: 'Patient has one cavity on a front tooth that needs filling',
    codesInvolved: ['101', '124', '701'],
    estimatedCostGeneralSEK: { min: 1545, max: 2185 },
    estimatedCostSpecialistSEK: { min: 1545, max: 2185 },
    timelineEstimate: '30-40 minutes',
    notes: [
      'Front teeth fillings (701) cost 450 SEK per surface',
      'Includes exam (101) and potentially X-rays (124)',
      'Usually covered 50-75% by dental insurance',
    ],
  },
  {
    id: 'molar-filling',
    title: 'Multi-Surface Molar Filling',
    description: 'Patient needs filling on multiple surfaces of a back tooth',
    codesInvolved: ['101', '704', '705'],
    estimatedCostGeneralSEK: { min: 1475, max: 1975 },
    estimatedCostSpecialistSEK: { min: 1475, max: 1975 },
    timelineEstimate: '45-60 minutes',
    notes: [
      'One surface on molar (704): 550 SEK',
      'Two surfaces on molar (705): 750 SEK',
      'Higher cost than front teeth due to complexity',
    ],
  },
  {
    id: 'root-canal-simple',
    title: 'Root Canal Treatment - Single Canal',
    description: 'Patient needs root canal on a front tooth with one root',
    codesInvolved: ['107', '126', '501'],
    estimatedCostGeneralSEK: { min: 4650, max: 5185 },
    estimatedCostSpecialistSEK: { min: 5310, max: 5775 },
    timelineEstimate: '60-90 minutes',
    notes: [
      'Single canal root filling (501): 2,105 SEK (general) or 2,605 SEK (specialist)',
      'Usually requires comprehensive exam (107) and X-rays (126)',
      'Often followed by crown placement (800) within 6 months',
      'Specialist treatment recommended for complex cases',
    ],
  },
  {
    id: 'root-canal-complex',
    title: 'Root Canal Treatment - Multiple Canals',
    description: 'Patient needs root canal on a molar with multiple root canals',
    codesInvolved: ['107', '126', '502', '503'],
    estimatedCostGeneralSEK: { min: 7540, max: 8650 },
    estimatedCostSpecialistSEK: { min: 8560, max: 9670 },
    timelineEstimate: '90-120 minutes',
    notes: [
      'Two canals (502): 3,215 SEK (general) or 3,725 SEK (specialist)',
      'Three canals (503): 4,325 SEK (general) or 4,835 SEK (specialist)',
      'More complex, usually requires specialist',
      'Multiple appointments may be needed',
    ],
  },
  {
    id: 'tooth-extraction',
    title: 'Simple Tooth Extraction',
    description: 'Patient needs one tooth removed (straightforward case)',
    codesInvolved: ['107', '121', '403'],
    estimatedCostGeneralSEK: { min: 1535, max: 1970 },
    estimatedCostSpecialistSEK: { min: 2185, max: 2620 },
    timelineEstimate: '20-30 minutes',
    notes: [
      'Simple extraction (403): 490 SEK (general) or 735 SEK (specialist)',
      'Includes examination and X-rays',
      'Usually needs follow-up after 1-2 weeks',
      'May need antibiotics prescription',
    ],
  },
  {
    id: 'tooth-extraction-complex',
    title: 'Complex Surgical Tooth Extraction',
    description: 'Patient needs extraction of impacted or surgical tooth',
    codesInvolved: ['108', '126', '404'],
    estimatedCostGeneralSEK: { min: 2275, max: 2810 },
    estimatedCostSpecialistSEK: { min: 2735, max: 3210 },
    timelineEstimate: '45-60 minutes',
    notes: [
      'Surgical removal of one/multiple teeth (404): 980 SEK (general) or 1,470 SEK (specialist)',
      'Requires comprehensive assessment (108)',
      'Usually performed by specialist oral surgeon',
      'May require bone grafting or sutures',
    ],
  },
  {
    id: 'crown-placement',
    title: 'Single Tooth Crown',
    description: 'Patient needs permanent crown on one tooth (after root canal)',
    codesInvolved: ['107', '123', '800'],
    estimatedCostGeneralSEK: { min: 5775, max: 6560 },
    estimatedCostSpecialistSEK: { min: 6785, max: 7575 },
    timelineEstimate: '2-3 appointments (2-3 weeks)',
    notes: [
      'Permanent tooth crown (800): 4,550 SEK (general) or 5,460 SEK (specialist)',
      'Includes exam and lab work',
      'Typically needed after root canal to protect tooth',
      'Usually 50% covered by insurance',
    ],
  },
  {
    id: 'bridge-three-tooth',
    title: 'Three-Tooth Bridge (Pont)',
    description: 'Patient is missing one tooth and needs bridge on adjacent teeth',
    codesInvolved: ['107', '841', '842'],
    estimatedCostGeneralSEK: { min: 10950, max: 11730 },
    estimatedCostSpecialistSEK: { min: 13140, max: 13990 },
    timelineEstimate: '2-3 appointments (2-3 weeks)',
    notes: [
      'Bridge with two teeth supports: 3,650 (841) + 7,300 (842) = 10,950 SEK (general)',
      'Complex lab work involved',
      'Alternative to implant but less natural',
      'May be covered 25-50% by insurance',
    ],
  },
  {
    id: 'implant-single',
    title: 'Single Tooth Implant',
    description: 'Patient is missing one tooth and gets dental implant with crown',
    codesInvolved: ['107', '126', '911'],
    estimatedCostGeneralSEK: { min: 11460, max: 12260 },
    estimatedCostSpecialistSEK: { min: 13260, max: 14060 },
    timelineEstimate: '6-12 months (multiple appointments)',
    notes: [
      'Implant abutment screw crown (911): 6,500 SEK (general) or 7,800 SEK (specialist)',
      'Does not include implant insertion surgery (not in reference prices)',
      'Requires 3-6 month healing after implant placement',
      'Most expensive but most natural-looking option',
      'Rarely covered by dental insurance',
    ],
  },
  {
    id: 'denture-complete',
    title: 'Complete Denture (One Jaw)',
    description: 'Patient is edentulous (no teeth) in one jaw and needs full denture',
    codesInvolved: ['107', '123', '851'],
    estimatedCostGeneralSEK: { min: 4775, max: 5495 },
    estimatedCostSpecialistSEK: { min: 5575, max: 6280 },
    timelineEstimate: '4-6 weeks (multiple fitting visits)',
    notes: [
      'Complete denture one jaw (851): 3,650 SEK (general) or 4,380 SEK (specialist)',
      'Includes design, fitting, and adjustments',
      'Usually covered 25-50% by insurance',
      'Patient needs training on use and maintenance',
    ],
  },
  {
    id: 'orthodontics-short',
    title: 'Teeth Straightening - Short Course',
    description: 'Patient has mild crowding/spacing and needs < 1 year of braces',
    codesInvolved: ['108', '124', '901'],
    estimatedCostGeneralSEK: { min: 4105, max: 4960 },
    estimatedCostSpecialistSEK: { min: 4105, max: 4960 },
    timelineEstimate: '6-12 months',
    notes: [
      'Treatment up to 1 year (901): 2,920 SEK',
      'Usually requires specialist orthodontist',
      'Multiple adjustment visits (every 4-6 weeks)',
      'May be covered 25-50% by insurance for children',
    ],
  },
  {
    id: 'emergency-toothache',
    title: 'Emergency Dental Visit - Acute Toothache',
    description: 'Patient calls with sudden tooth pain and needs urgent visit',
    codesInvolved: ['103', '121', '301'],
    estimatedCostGeneralSEK: { min: 826, max: 1346 },
    estimatedCostSpecialistSEK: { min: 1006, max: 1526 },
    timelineEstimate: '20-30 minutes',
    notes: [
      'Emergency exam (103): 445 SEK (general) or 585 SEK (specialist)',
      'Basic disease/pain treatment (301): 301 SEK',
      'May include palliative treatment and pain relief',
      'Definitive treatment usually scheduled for later',
      'Often covered 100% as emergency care',
    ],
  },
];

/**
 * Cost comparison helper
 */
export function compareTreatmentCosts(scenarioId: string): TreatmentScenario | undefined {
  return treatmentScenarios.find(s => s.id === scenarioId);
}

/**
 * Find scenarios within budget
 */
export function getTreatmentsByBudget(budgetSEK: number): TreatmentScenario[] {
  return treatmentScenarios.filter(
    scenario => scenario.estimatedCostGeneralSEK.min <= budgetSEK
  );
}

/**
 * Estimate time commitment
 */
export interface TimelineBreakdown {
  scenario: TreatmentScenario;
  estimatedDays: number;
  estimatedAppointments: number;
}

export function estimateTimeline(scenarioId: string): TimelineBreakdown | undefined {
  const scenario = treatmentScenarios.find(s => s.id === scenarioId);
  if (!scenario) return undefined;

  // Parse timeline estimate to get appointment count
  const appointmentMatch = scenario.timelineEstimate.match(/(\d+)/);
  const estimatedAppointments = scenario.timelineEstimate.includes('appointment') ? 1 :
                                scenario.timelineEstimate.includes('week') ? 2 :
                                scenario.timelineEstimate.includes('month') ? 3 : 1;

  const estimatedDays =
    scenario.timelineEstimate.includes('minute') ? 1 :
    scenario.timelineEstimate.includes('45 minute') ? 1 :
    scenario.timelineEstimate.includes('week') ? 14 :
    scenario.timelineEstimate.includes('month') ? 30 : 1;

  return {
    scenario,
    estimatedDays,
    estimatedAppointments,
  };
}
