/**
 * Type definitions for VA AI Assistant Web Audits & Analytics
 */

export type AudienceType = 'Veterans' | 'VA Staff' | 'Both';
export type ToolType = 'AI Assistant' | 'Dashboard' | 'Analysis Tool' | 'Platform' | 'AI Agent' | 'Portal Hub';
export type ComplianceStatus = 'Compliant' | 'Partially Compliant' | 'Needs Remediation';

export interface AccessibilityMetric {
  name: string;
  category: 'Contrast' | 'Structure' | 'Keyboard' | 'Screen Reader' | 'Mobile' | 'Forms';
  score: number; // 0 - 100
  status: 'Pass' | 'Warning' | 'Notice';
  details: string;
  wcagCriterion: string; // e.g., '1.4.3 Contrast (Minimum)', '2.1.1 Keyboard'
}

export interface AccessibilityReport {
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B';
  wcagLevel: 'WCAG 2.1 AA' | 'WCAG 2.1 AAA Ready';
  section508Compliant: boolean;
  metrics: AccessibilityMetric[];
  strengths: string[];
  remediationItems: string[];
  contrastRatio: {
    textOnBg: string;
    ratio: string;
    level: 'Pass AA' | 'Pass AAA';
  };
  keyboardNavigable: boolean;
  screenReaderReady: boolean;
  responsiveViewport: boolean;
}

export interface TrafficSourceBreakdown {
  name: string;
  percentage: number;
  estimatedVisits: number;
  color: string;
  description: string;
}

export interface MonthlyTrendData {
  month: string;
  visitors: number;
  sessions: number;
}

export interface AnalyticsReport {
  measurementId: string | null;
  trackingStatus: 'Active GA4 Stream' | 'Shared Ecosystem Stream' | 'Pending Dedicated Stream';
  estimatedMonthlyUsers: number;
  estimatedMonthlySessions: number;
  avgEngagementTime: string;
  bounceRate: string;
  topSources: TrafficSourceBreakdown[];
  standardChannels: {
    direct: number;
    organicSearch: number;
    referral: number;
    social: number;
    emailInternal: number;
  };
  monthlyTrends: MonthlyTrendData[];
  deviceBreakdown: {
    desktop: number; // %
    mobile: number;  // %
    tablet: number;  // %
  };
  primaryAudienceRegion: string;
}

export interface WebsiteAuditData {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  domain: string;
  audience: AudienceType;
  type: ToolType;
  status: 'Production' | 'Pilot' | 'Hub';
  tags: string[];
  description: string;
  architectureDetails: {
    framework: string;
    runtime: string;
    aiEngine: string;
    specializedLibs: string[];
  };
  coreFeatures: {
    title: string;
    description: string;
    iconName: string;
  }[];
  accessibility: AccessibilityReport;
  analytics: AnalyticsReport;
  recommendations: string[];
  lastAudited: string;
}

export interface FleetSummary {
  totalSites: number;
  avgAccessibilityScore: number;
  totalMonthlyUsers: number;
  totalMonthlySessions: number;
  compliancePercentage: number;
  gaTrackedSitesCount: number;
  trafficDistribution: {
    source: string;
    percentage: number;
  }[];
}

export interface GcpServiceCost {
  serviceName: string;
  category: 'Compute' | 'AI / Tokens' | 'Storage' | 'Operations' | 'Networking';
  monthlyCost: number;
  percentage: number;
  unitDetails: string;
  color: string;
}

export interface SiteBillingData {
  siteId: string;
  siteTitle: string;
  domain: string;
  monthlyHostingCost: number;
  monthlyApiCost: number;
  storageLoggingCost: number;
  totalMonthlyCost: number;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    model: string;
    costPerMillionInput: number;
    costPerMillionOutput: number;
  };
  cloudRunMetrics: {
    cpuHours: number;
    memoryGbHours: number;
    totalRequests: number;
    region: string;
    concurrencyAvg: number;
  };
  dailyCostTrends: Array<{
    date: string;
    cloudRunCost: number;
    geminiApiCost: number;
    storageLoggingCost: number;
    totalDailyCost: number;
  }>;
  serviceBreakdown: GcpServiceCost[];
  fy2026BudgetCap: number;
  burnRatePercentage: number;
  costOptimizationNotes: string[];
}

export interface FleetBillingSummary {
  totalMonthlyCost: number;
  cloudRunCost: number;
  geminiApiCost: number;
  storageOpsCost: number;
  totalTokensProcessed: number;
  billingAccount: string;
  billingProject: string;
  region: string;
  currency: string;
  lastSyncTimestamp: string;
  monthlyHistory: Array<{
    month: string;
    cloudRun: number;
    geminiApi: number;
    storageOps: number;
    total: number;
  }>;
  siteCosts: SiteBillingData[];
}
