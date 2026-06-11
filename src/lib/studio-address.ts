const COUNTRY_PATTERN = /^(българия|bulgaria)$/i;
const POSTAL_CODE_PREFIX = /^\d{4}\s+/;

function addressParts(address: string): string[] {
  return address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function isCountryAddressPart(part: string): boolean {
  return COUNTRY_PATTERN.test(part.trim());
}

function normalizeCityPart(city: string): string {
  return city.replace(POSTAL_CODE_PREFIX, '').trim();
}

/** City from a studio address (Google often ends with ", Bulgaria"). */
export function cityFromAddress(address: string): string {
  const parts = addressParts(address);

  if (parts.length === 0) return address.trim();
  if (parts.length === 1) return normalizeCityPart(parts[0]);

  const last = parts[parts.length - 1];
  if (isCountryAddressPart(last) && parts.length >= 2) {
    return normalizeCityPart(parts[parts.length - 2]);
  }

  return normalizeCityPart(last);
}

/** Street line without city or country (for cards and display). */
export function streetFromAddress(address: string): string {
  const parts = addressParts(address);

  if (parts.length <= 1) return '';

  const last = parts[parts.length - 1];
  if (isCountryAddressPart(last)) {
    if (parts.length >= 3) return parts.slice(0, -2).join(', ');
    return parts[0];
  }

  return parts.slice(0, -1).join(', ');
}
