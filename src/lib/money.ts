/**
 * Hisabo Financial & Integer Minor-Unit Money Engine
 * Non-negotiable: All monetary arithmetic operates on integer minor units (halalas/cents).
 * No floating-point numbers are used for financial balance calculation.
 */

export function toMinorUnits(amount: number, decimals = 2): bigint {
  const factor = Math.pow(10, decimals);
  return BigInt(Math.round(amount * factor));
}

export function fromMinorUnits(minor: bigint | number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Number(minor) / factor;
}

export function formatCurrency(
  minor: bigint | number,
  currency = "SAR",
  decimals = 2
): string {
  const major = fromMinorUnits(minor, decimals);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(major);
}

export interface SplitResult {
  userId: string;
  shareMinor: bigint;
}

/**
 * Calculates equal splits among participants with deterministic remainder distribution.
 * If remainder exists, extra halalas are allocated deterministically to participants in order.
 * Invariant guaranteed: Sum of shares === totalMinor.
 */
export function calculateEqualSplits(
  totalMinor: bigint | number,
  participantUserIds: string[],
  payerId?: string
): SplitResult[] {
  const total = BigInt(totalMinor);
  const count = BigInt(participantUserIds.length);

  if (count <= BigInt(0)) {
    throw new Error("Cannot split expense with zero participants");
  }

  const quotient = total / count;
  const remainder = total % count;

  // Sort participant IDs so allocation order is completely deterministic
  const sortedIds = [...participantUserIds].sort((a, b) => {
    if (payerId && a === payerId) return -1;
    if (payerId && b === payerId) return 1;
    return a.localeCompare(b);
  });

  const splits: SplitResult[] = [];
  let allocatedRemainder = BigInt(0);

  for (let i = 0; i < sortedIds.length; i++) {
    const extra = allocatedRemainder < remainder ? BigInt(1) : BigInt(0);
    if (extra > BigInt(0)) allocatedRemainder += BigInt(1);

    splits.push({
      userId: sortedIds[i],
      shareMinor: quotient + extra,
    });
  }

  // Sanity check conservation invariant
  const sum = splits.reduce((acc, curr) => acc + curr.shareMinor, BigInt(0));
  if (sum !== total) {
    throw new Error(
      `Financial invariant violated: Sum of splits (${sum}) does not equal total (${total})`
    );
  }

  return splits;
}

/**
 * Validates that custom shares satisfy the conservation equation:
 * Sum of shares === totalMinor
 */
export function validateCustomSplits(
  totalMinor: bigint | number,
  splits: SplitResult[]
): boolean {
  const total = BigInt(totalMinor);
  const sum = splits.reduce((acc, curr) => acc + BigInt(curr.shareMinor), BigInt(0));
  return sum === total;
}
