import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Robust date formatter that avoids 'Invalid Date' and handles YYYY-MM-DD
 * timezone-safely without off-by-one day bugs.
 */
export function formatEventDate(dateVal, options = { month: 'short', day: 'numeric' }) {
  if (!dateVal) return 'TBA';
  
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed.toLowerCase() === 'invalid date') {
      return 'TBA';
    }

    // Match YYYY-MM-DD at start
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1; // 0-indexed
      const day = parseInt(ymdMatch[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, options);
      }
    }
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    return 'TBA';
  }
  return d.toLocaleDateString(undefined, options);
}

/**
 * Extracts short, standard department codes (e.g. DCE, DTE, BED)
 * so pills and badges fit comfortably in UI cards.
 */
export function getDepartmentCode(dept) {
  if (!dept) return 'General';
  
  // Specific match for Basic Education
  if (/Basic Education/i.test(dept)) {
    return 'BED';
  }
  
  // Acronym inside parentheses, e.g. "Department of Computing Education (DCE)" -> "DCE"
  const match = dept.match(/\(([A-Za-z0-9\s&]+)\)/);
  if (match) {
    return match[1].trim();
  }

  // Already a short code
  if (dept.length <= 6) {
    return dept.toUpperCase();
  }

  return dept;
}

/**
 * Deterministic badge color styling per department.
 */
export function getDepartmentStyle(dept) {
  const styles = [
    "bg-[#E1F3FE] text-[#1F6C9F] border-[#BAE3FD]", // Blue
    "bg-[#EDF3EC] text-[#346538] border-[#CCE0CA]", // Green
    "bg-[#FDEBEC] text-[#9F2F2D] border-[#F7CDCE]", // Red
    "bg-[#FBF3DB] text-[#956400] border-[#F2DE9C]", // Amber
    "bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]", // Purple
    "bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]", // Orange
    "bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]", // Indigo
    "bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]", // Teal
  ];
  if (!dept) return styles[0];
  let hash = 0;
  for (let i = 0; i < dept.length; i++) {
    hash = (hash << 5) - hash + dept.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % styles.length;
  return styles[index];
}
