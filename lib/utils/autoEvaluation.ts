/**
 * FILE: lib/utils/autoEvaluation.ts
 * 
 * PURPOSE:
 * Utility functions for automatically evaluating habit completion status
 * based on time spent or amount completed vs required targets.
 */

export type EvaluationStatus = 'NONE' | 'FAIL' | 'HALF' | 'SUCCESS';

export interface EvaluationResult {
  status: EvaluationStatus;
  percentage: number;
  color: string;
  label: string;
}

/**
 * Calculate status for time-based habits
 * @param timeSpentMinutes - Total minutes spent today
 * @param requiredMinutes - Required minutes per day
 * @returns Evaluation result with status, percentage, color, and label
 */
export function calculateTimeBasedStatus(
  timeSpentMinutes: number,
  requiredMinutes: number
): EvaluationResult {
  if (requiredMinutes === 0) {
    return {
      status: 'NONE',
      percentage: 0,
      color: 'bg-gray-200',
      label: 'Not Set'
    };
  }

  const percentage = (timeSpentMinutes / requiredMinutes) * 100;

  if (percentage === 0) {
    return {
      status: 'NONE',
      percentage: 0,
      color: 'bg-gray-200',
      label: '0%'
    };
  } else if (percentage < 50) {
    return {
      status: 'FAIL',
      percentage,
      color: 'bg-red-500',
      label: '<50%'
    };
  } else if (percentage < 70) {
    return {
      status: 'HALF',
      percentage,
      color: 'bg-yellow-500',
      label: '50-69%'
    };
  } else if (percentage < 100) {
    return {
      status: 'HALF',
      percentage,
      color: 'bg-green-400',
      label: '70-99%'
    };
  } else {
    return {
      status: 'SUCCESS',
      percentage,
      color: 'bg-green-600',
      label: '100%'
    };
  }
}

/**
 * Calculate status for amount-based habits
 * @param completedAmount - Number of subtasks/units completed
 * @param requiredAmount - Required amount per day
 * @returns Evaluation result with status, percentage, color, and label
 */
export function calculateAmountBasedStatus(
  completedAmount: number,
  requiredAmount: number
): EvaluationResult {
  if (requiredAmount === 0) {
    return {
      status: 'NONE',
      percentage: 0,
      color: 'bg-gray-200',
      label: 'Not Set'
    };
  }

  const percentage = (completedAmount / requiredAmount) * 100;

  if (percentage === 0) {
    return {
      status: 'NONE',
      percentage: 0,
      color: 'bg-gray-200',
      label: '0%'
    };
  } else if (percentage < 50) {
    return {
      status: 'FAIL',
      percentage,
      color: 'bg-red-500',
      label: '<50%'
    };
  } else if (percentage < 70) {
    return {
      status: 'HALF',
      percentage,
      color: 'bg-yellow-500',
      label: '50-69%'
    };
  } else if (percentage < 100) {
    return {
      status: 'HALF',
      percentage,
      color: 'bg-green-400',
      label: '70-99%'
    };
  } else {
    return {
      status: 'SUCCESS',
      percentage,
      color: 'bg-green-600',
      label: '100%'
    };
  }
}

/**
 * Calculate status for habits requiring both time and amount
 * @param timeSpentMinutes - Total minutes spent today
 * @param requiredMinutes - Required minutes per day
 * @param completedAmount - Number of subtasks/units completed
 * @param requiredAmount - Required amount per day
 * @returns Evaluation result with status, percentage, color, and label
 */
export function calculateBothStatus(
  timeSpentMinutes: number,
  requiredMinutes: number,
  completedAmount: number,
  requiredAmount: number
): EvaluationResult {
  const timeResult = calculateTimeBasedStatus(timeSpentMinutes, requiredMinutes);
  const amountResult = calculateAmountBasedStatus(completedAmount, requiredAmount);

  // "Best of Two" logic: Take the maximum progress
  const maxPercentage = Math.max(timeResult.percentage, amountResult.percentage);

  if (maxPercentage === 0) {
    return {
      status: 'NONE',
      percentage: 0,
      color: 'bg-gray-200',
      label: '0%'
    };
  } else if (maxPercentage < 50) {
    return {
      status: 'FAIL',
      percentage: maxPercentage,
      color: 'bg-red-500',
      label: '<50%'
    };
  } else if (maxPercentage < 70) {
    return {
      status: 'HALF',
      percentage: maxPercentage,
      color: 'bg-yellow-500',
      label: '50-69%'
    };
  } else if (maxPercentage < 100) {
    return {
      status: 'HALF',
      percentage: maxPercentage,
      color: 'bg-green-400',
      label: '70-99%'
    };
  } else {
    return {
      status: 'SUCCESS',
      percentage: 100,
      color: 'bg-green-600',
      label: '100%'
    };
  }
}

/**
 * Get status color class for display
 */
export function getStatusColor(status: EvaluationStatus): string {
  switch (status) {
    case 'SUCCESS':
      return 'bg-green-600 text-white';
    case 'HALF':
      return 'bg-yellow-500 text-white';
    case 'FAIL':
      return 'bg-red-500 text-white';
    case 'NONE':
    default:
      return 'bg-gray-200 text-gray-600';
  }
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: EvaluationStatus): string {
  switch (status) {
    case 'SUCCESS':
      return 'Success';
    case 'HALF':
      return 'Partial';
    case 'FAIL':
      return 'Fail';
    case 'NONE':
    default:
      return 'Not Started';
  }
}
