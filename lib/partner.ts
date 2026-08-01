import { partnerProgramConfig } from '@/config/partner-program'

export type CommissionLevel = 1 | 2 | 3

export const commissionByLevel: Record<CommissionLevel, number> = {
  1: partnerProgramConfig.commissions.level1,
  2: partnerProgramConfig.commissions.level2,
  3: partnerProgramConfig.commissions.level3,
}

export function calculatePartnerExample() {
  const config = partnerProgramConfig.example
  const levels = [
    {
      level: 1 as const,
      customers: config.level1Customers,
      commission: commissionByLevel[1],
      earnings: config.level1Customers * commissionByLevel[1],
    },
    {
      level: 2 as const,
      customers: config.level2Customers,
      commission: commissionByLevel[2],
      earnings: config.level2Customers * commissionByLevel[2],
    },
    {
      level: 3 as const,
      customers: config.level3Customers,
      commission: commissionByLevel[3],
      earnings: config.level3Customers * commissionByLevel[3],
    },
  ]

  return {
    levels,
    totalCustomers: levels.reduce((sum, level) => sum + level.customers, 0),
    totalMonthlyEarnings: levels.reduce((sum, level) => sum + level.earnings, 0),
  }
}

export function commissionForLevel(level: number) {
  return level >= 1 && level <= partnerProgramConfig.maximumPaidLevels
    ? commissionByLevel[level as CommissionLevel]
    : 0
}
