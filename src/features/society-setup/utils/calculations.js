/**
 * Pure calculation functions for the Society Setup Wizard.
 * Strict rule: No business logic inside JSX/components; all calculations are purely functional.
 */

/**
 * Format a number using Indian numbering system (e.g. 1350000 -> 13,50,000)
 */
export function formatIndianNumber(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return '0';
  const n = Math.round(Number(num));
  return n.toLocaleString('en-IN');
}

/**
 * Formats a date string to 'DD Mon YYYY' format (e.g., '2025-04-01' -> '01 Apr 2025')
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';
  if (/^\d{2}\s[A-Za-z]{3}\s\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Calculate totals for Residential Inventory rows
 */
export function calculateResidentialTotals(residentialList = []) {
  const uniqueWings = new Set();
  let totalUnits = 0;
  let totalParking4W = 0;
  let totalCarpetArea = 0;
  let totalBuiltUpArea = 0;

  const configCounts = {};

  residentialList.forEach((row) => {
    if (row.wing) uniqueWings.add(row.wing);
    const count = Number(row.unitCount) || 0;
    const parking = Number(row.parking4W) || 0;
    const carpet = Number(row.carpetArea) || 0;
    const builtUp = Number(row.builtUpArea) || 0;

    totalUnits += count;
    totalParking4W += parking;
    totalCarpetArea += count * carpet;
    totalBuiltUpArea += count * builtUp;

    const cfg = row.configuration || 'Other';
    configCounts[cfg] = (configCounts[cfg] || 0) + count;
  });

  const oneBhkUnits = configCounts['1 BHK'] || 0;
  const otherUnits = totalUnits - oneBhkUnits;

  return {
    totalWings: uniqueWings.size,
    totalUnits,
    totalParking4W,
    totalCarpetArea,
    totalBuiltUpArea,
    oneBhkUnits,
    otherUnits,
    configCounts,
  };
}

/**
 * Calculate totals for Commercial Inventory rows
 */
export function calculateCommercialTotals(commercialList = []) {
  let totalCommercialUnits = 0;
  let totalCommercialArea = 0;
  let totalCommercialParking = 0;

  commercialList.forEach((row) => {
    const count = Number(row.unitCount) || 0;
    const size = Number(row.unitSize) || 0;
    const parking = Number(row.parking) || 0;

    totalCommercialUnits += count;
    totalCommercialArea += count * size;
    totalCommercialParking += parking;
  });

  return {
    totalCommercialUnits,
    totalCommercialArea,
    totalCommercialParking,
  };
}

/**
 * Calculate totals for Parking Configuration
 */
export function calculateParkingTotals(parkingConfig = {}) {
  const fourWheeler = Number(parkingConfig.fourWheeler) || 0;
  const twoWheeler = Number(parkingConfig.twoWheeler) || 0;
  const visitor = Number(parkingConfig.visitor) || 0;
  const evCharging = Number(parkingConfig.evCharging) || 0;
  const totalCapacity = fourWheeler + twoWheeler + visitor + evCharging;

  return {
    fourWheeler,
    twoWheeler,
    visitor,
    evCharging,
    totalCapacity,
    allocationMethod: parkingConfig.allocationMethod || 'By Society',
  };
}

/**
 * Overall Inventory summary derived from property info and subsections
 */
export function calculateOverallInventory(propertyInfo = {}, residentialTotals, commercialTotals, parkingTotals) {
  const totalResidentialUnits = residentialTotals.totalUnits;
  const totalCommercialUnits = commercialTotals.totalCommercialUnits;
  const totalUnits = totalResidentialUnits + totalCommercialUnits;
  const totalParkingSpaces = parkingTotals.totalCapacity;

  return {
    totalResidentialUnits,
    totalCommercialUnits,
    totalUnits,
    totalParkingSpaces,
    totalResidentialArea: residentialTotals.totalCarpetArea,
    totalCommercialArea: commercialTotals.totalCommercialArea,
    totalDevelopedArea: Number(propertyInfo.totalDevelopedArea) || 0,
    totalProjectArea: Number(propertyInfo.totalProjectArea) || 0,
    numberOfBuildings: Number(propertyInfo.numberOfBuildings) || residentialTotals.totalWings || 0,
  };
}

/**
 * Amenity statistics and category counts
 */
export function calculateAmenityStats(amenitiesList = []) {
  const total = amenitiesList.length;
  let active = 0;
  let bookable = 0;
  let chargeable = 0;
  let underMaintenance = 0;
  const categoryCounts = {
    Recreation: 0,
    Sports: 0,
    Community: 0,
    'Fitness & Wellness': 0,
    Convenience: 0,
  };

  amenitiesList.forEach((a) => {
    if (a.status === 'Active') active += 1;
    if (a.status === 'Under Maintenance') underMaintenance += 1;
    if (a.bookable) bookable += 1;
    if (a.chargesApplicable) chargeable += 1;

    if (a.category && categoryCounts[a.category] !== undefined) {
      categoryCounts[a.category] += 1;
    } else if (a.category) {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    }
  });

  return {
    total,
    active,
    bookable,
    chargeable,
    underMaintenance,
    categoryCounts,
  };
}

/**
 * Contact statistics by category
 */
export function calculateContactStats(contactsList = []) {
  const total = contactsList.length;
  let essential = 0;
  let emergency = 0;
  let serviceProviders = 0;

  contactsList.forEach((c) => {
    const cat = (c.category || '').toLowerCase();
    if (cat.includes('essential')) essential += 1;
    else if (cat.includes('emergency')) emergency += 1;
    else if (cat.includes('service')) serviceProviders += 1;
    else essential += 1;
  });

  return {
    total,
    essential,
    emergency,
    serviceProviders,
  };
}

/**
 * Document statistics, compliance rates, and mandatory progress
 */
export function calculateDocumentStats(documentsList = []) {
  const total = documentsList.length;
  let verified = 0;
  let expiringSoon = 0;
  let expired = 0;
  let mandatoryTotal = 0;
  let mandatoryUploaded = 0;

  documentsList.forEach((doc) => {
    const status = (doc.status || '').toLowerCase();
    if (status.includes('verified')) verified += 1;
    else if (status.includes('expiring')) expiringSoon += 1;
    else if (status.includes('expired')) expired += 1;

    if (doc.isMandatory) {
      mandatoryTotal += 1;
      if (doc.uploadedBy) mandatoryUploaded += 1;
    }
  });

  const compliantPct = total > 0 ? Math.round((verified / total) * 100) : 0;
  const expiredPct = total > 0 ? Math.round((expired / total) * 100) : 0;
  const pendingPct = Math.max(0, 100 - compliantPct - expiredPct);

  return {
    total,
    verified,
    expiringSoon,
    expired,
    mandatoryTotal,
    mandatoryUploaded,
    compliance: {
      compliantPct,
      pendingPct,
      nonCompliantPct: expiredPct,
      compliantCount: verified,
      pendingCount: total - verified - expired,
      nonCompliantCount: expired,
    },
  };
}
