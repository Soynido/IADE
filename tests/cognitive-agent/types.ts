/**
 * 🧠 Types pour l'Agent d'Exploration Cognitive
 * 
 * Définit les structures de données pour l'analyse UX/UI automatisée
 */

export interface NavigationStep {
  url: string;
  action: string;
  timestamp: number;
  duration: number;
  screenshot?: string;
  domSnapshot?: string;
}

export interface CTAAnalysis {
  text: string;
  selector: string;
  position: { x: number; y: number };
  visibility: number; // 0-1
  contrast: number; // 0-1
  size: { width: number; height: number };
  clickable: boolean;
  hierarchy: 'primary' | 'secondary' | 'tertiary';
  issues: string[];
}

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  tti: number; // Time to Interactive
  cls: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
  memoryUsage?: number;
  jsHeapSize?: number;
  domNodes: number;
  networkRequests: {
    total: number;
    failed: number;
    totalSize: number;
    timing: {
      dns: number;
      tcp: number;
      request: number;
      response: number;
    };
  };
}

export interface TransitionAnalysis {
  from: string;
  to: string;
  duration: number;
  smooth: boolean;
  loading: boolean;
  feedback: 'immediate' | 'delayed' | 'none';
  issues: string[];
}

export interface UIState {
  url: string;
  title: string;
  viewport: { width: number; height: number };
  scrollPosition: { x: number; y: number };
  visibleElements: number;
  focusedElement: string | null;
  animations: number;
  modals: number;
  errors: string[];
}

export interface FrictionPoint {
  type: 'navigation' | 'interaction' | 'performance' | 'ux' | 'accessibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  impact: string;
  suggestion: string;
  evidence?: {
    screenshot?: string;
    selector?: string;
    metrics?: Record<string, unknown>;
  };
}

export interface UserFlowMap {
  entry: string;
  steps: Array<{
    name: string;
    url: string;
    actions: string[];
    duration: number;
    success: boolean;
  }>;
  exit: string;
  totalDuration: number;
  completionRate: number;
}

export interface CognitiveReport {
  timestamp: string;
  appUrl: string;
  duration: number;
  summary: {
    flowsExplored: number;
    pagesVisited: number;
    interactionsPerformed: number;
    frictionPoints: number;
    overallScore: number; // 0-100
  };
  uxAnalysis: {
    navigation: {
      score: number;
      issues: string[];
      recommendations: string[];
    };
    ctas: {
      score: number;
      analyzed: CTAAnalysis[];
      issues: string[];
      recommendations: string[];
    };
    performance: {
      score: number;
      metrics: PerformanceMetrics;
      issues: string[];
      recommendations: string[];
    };
    transitions: {
      score: number;
      analyzed: TransitionAnalysis[];
      issues: string[];
      recommendations: string[];
    };
    accessibility: {
      score: number;
      issues: string[];
      recommendations: string[];
    };
  };
  userFlows: UserFlowMap[];
  frictionPoints: FrictionPoint[];
  benchmarkComparison?: {
    service: string;
    metrics: Record<string, { yours: number; theirs: number; delta: number }>;
  };
  recommendations: {
    critical: string[];
    high: string[];
    medium: string[];
    low: string[];
  };
  screenshots: string[];
  rawData: {
    traces: unknown[];
    logs: string[];
  };
}

export interface CognitiveAgentConfig {
  baseUrl: string;
  headless: boolean;
  viewport: { width: number; height: number };
  slowMo?: number;
  timeout: number;
  screenshotDir: string;
  traceDir: string;
  benchmarks?: Array<{
    name: string;
    url: string;
  }>;
  flowsToTest: Array<{
    name: string;
    steps: Array<{
      action: 'goto' | 'click' | 'fill' | 'wait' | 'scroll' | 'evaluate';
      selector?: string;
      value?: string;
      timeout?: number;
    }>;
  }>;
}

