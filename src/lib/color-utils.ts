/**
 * Color utilities for consistent theming across the application
 * מערכת צבעים אחידה לכל האפליקציה
 */

export const colorScheme = {
  // Brand colors
  brand: {
    primary: 'hsl(var(--brand-primary))',
    primaryLight: 'hsl(var(--brand-primary-light))',
    secondary: 'hsl(var(--brand-secondary))',
    secondaryLight: 'hsl(var(--brand-secondary-light))',
  },
  
  // Semantic colors
  semantic: {
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    destructive: 'hsl(var(--destructive))',
    info: 'hsl(var(--info))',
  },
  
  // Status colors
  status: {
    available: 'hsl(var(--status-available))',
    sold: 'hsl(var(--status-sold))',
    reserved: 'hsl(var(--status-reserved))',
    pending: 'hsl(var(--status-pending))',
  },
  
  // Chart colors
  chart: {
    primary: 'hsl(var(--chart-primary))',
    secondary: 'hsl(var(--chart-secondary))',
    tertiary: 'hsl(var(--chart-tertiary))',
    quaternary: 'hsl(var(--chart-quaternary))',
    quinary: 'hsl(var(--chart-quinary))',
  },
  
  // Gradients
  gradients: {
    primary: 'var(--gradient-primary)',
    subtle: 'var(--gradient-subtle)',
  }
};

/**
 * Get status color based on status string
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'available':
    case 'זמין':
      return colorScheme.status.available;
    case 'sold':
    case 'נמכר':
      return colorScheme.status.sold;
    case 'reserved':
    case 'שמור':
      return colorScheme.status.reserved;
    case 'pending':
    case 'בהמתנה':
      return colorScheme.status.pending;
    default:
      return 'hsl(var(--muted))';
  }
}

/**
 * Get chart color by index
 */
export function getChartColor(index: number): string {
  const colors = [
    colorScheme.chart.primary,
    colorScheme.chart.secondary,
    colorScheme.chart.tertiary,
    colorScheme.chart.quaternary,
    colorScheme.chart.quinary,
  ];
  
  return colors[index % colors.length];
}

/**
 * CSS class names for consistent styling
 */
export const colorClasses = {
  // Text colors
  text: {
    primary: 'text-brand-primary',
    secondary: 'text-brand-secondary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    info: 'text-info',
  },
  
  // Background colors
  bg: {
    primary: 'bg-brand-primary',
    secondary: 'bg-brand-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    info: 'bg-info',
  },
  
  // Border colors
  border: {
    primary: 'border-brand-primary',
    secondary: 'border-brand-secondary',
    success: 'border-success',
    warning: 'border-warning',
    destructive: 'border-destructive',
    info: 'border-info',
  },
  
  // Gradients
  gradient: {
    primary: 'bg-gradient-primary',
    subtle: 'bg-gradient-subtle',
    brand: 'bg-brand-gradient',
    brandReverse: 'bg-brand-gradient-reverse',
  }
};