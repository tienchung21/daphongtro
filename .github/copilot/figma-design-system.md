# FIGMA DESIGN SYSTEM - Dashboard Chủ Dự Án

## 1. Design Tokens

### 1.1 Color System (Dark Luxury Theme)

```css
/* File: client/src/styles/ChuDuAnDesignSystem.css */

:root {
  /* === BACKGROUND LAYERS === */
  --cda-bg-base: #0f1117;              /* Deepest background */
  --cda-bg-elevated-1: #1a1d29;        /* Layer 1 - Cards */
  --cda-bg-elevated-2: #252834;        /* Layer 2 - Modals */
  --cda-bg-elevated-3: #2d3142;        /* Layer 3 - Tooltips */
  
  /* Background with depth gradients */
  --cda-bg-gradient-primary: linear-gradient(135deg, #1a1d29 0%, #2d3142 100%);
  --cda-bg-gradient-card: linear-gradient(145deg, #252834 0%, #1e2230 100%);
  
  /* === GLASS MORPHISM === */
  --cda-glass-bg: rgba(37, 40, 52, 0.7);
  --cda-glass-border: rgba(139, 92, 246, 0.2);
  --cda-glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --cda-glass-blur: blur(8px);
  
  /* === BRAND COLORS === */
  --cda-primary: #8b5cf6;              /* Purple - Primary actions */
  --cda-primary-light: #a78bfa;        /* Lighter purple for hover */
  --cda-primary-dark: #7c3aed;         /* Darker purple for active */
  --cda-primary-glow: rgba(139, 92, 246, 0.4);
  
  --cda-secondary: #f59e0b;            /* Gold - Secondary accent */
  --cda-secondary-light: #fbbf24;
  --cda-secondary-glow: rgba(245, 158, 11, 0.4);
  
  /* === SEMANTIC COLORS === */
  --cda-success: #10b981;              /* Green */
  --cda-success-light: #34d399;
  --cda-success-glow: rgba(16, 185, 129, 0.3);
  
  --cda-danger: #ef4444;               /* Red */
  --cda-danger-light: #f87171;
  --cda-danger-glow: rgba(239, 68, 68, 0.3);
  
  --cda-warning: #f59e0b;              /* Orange */
  --cda-warning-light: #fbbf24;
  
  --cda-info: #3b82f6;                 /* Blue */
  --cda-info-light: #60a5fa;
  
  /* === TEXT HIERARCHY === */
  --cda-text-primary: #f9fafb;         /* Bright white - Headers */
  --cda-text-secondary: #d1d5db;       /* Light gray - Body */
  --cda-text-tertiary: #9ca3af;        /* Medium gray - Captions */
  --cda-text-disabled: #6b7280;        /* Dark gray - Disabled */
  
  /* === CHART COLORS === */
  --chart-purple: #8b5cf6;
  --chart-blue: #3b82f6;
  --chart-green: #10b981;
  --chart-yellow: #f59e0b;
  --chart-red: #ef4444;
  --chart-pink: #ec4899;
  --chart-indigo: #6366f1;
  --chart-teal: #14b8a6;
  
  /* Chart gradients for area fills */
  --chart-gradient-purple: linear-gradient(180deg, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.05) 100%);
  --chart-gradient-green: linear-gradient(180deg, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.05) 100%);
  --chart-gradient-blue: linear-gradient(180deg, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.05) 100%);
  
  /* === SHADOWS & DEPTH === */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  
  /* Glow shadows for interactive elements */
  --shadow-glow-primary: 0 0 20px var(--cda-primary-glow);
  --shadow-glow-success: 0 0 20px var(--cda-success-glow);
  --shadow-glow-danger: 0 0 20px var(--cda-danger-glow);
  
  /* === BORDERS === */
  --border-subtle: 1px solid rgba(255, 255, 255, 0.05);
  --border-default: 1px solid rgba(255, 255, 255, 0.1);
  --border-strong: 1px solid rgba(255, 255, 255, 0.2);
  --border-primary: 1px solid var(--cda-primary);
  
  /* === SPACING SCALE === */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  
  /* === BORDER RADIUS === */
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
  
  /* === TRANSITIONS === */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* === Z-INDEX SCALE === */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

### 1.2 Typography System

```css
/* File: client/src/styles/ChuDuAnDesignSystem.css */

/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  /* === FONT FAMILIES === */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  
  /* === FONT SIZES === */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  
  /* === FONT WEIGHTS === */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  
  /* === LINE HEIGHTS === */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}

/* Typography utility classes */
.text-display {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

.text-heading-1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

.text-heading-2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

.text-heading-3 {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}

.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.text-caption {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--cda-text-tertiary);
}

.text-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## 2. Component Architecture

### 2.1 File Structure

```
client/src/
├── components/
│   ├── ChuDuAn/
│   │   ├── Charts/
│   │   │   ├── RevenueChart.jsx
│   │   │   ├── OccupancyChart.jsx
│   │   │   ├── StatusDonutChart.jsx
│   │   │   ├── ConversionFunnel.jsx
│   │   │   └── AppointmentHeatmap.jsx
│   │   ├── MetricCard.jsx
│   │   ├── AnimatedCounter.jsx
│   │   └── GlassCard.jsx
│   └── Layout/
│       ├── DashboardGrid.jsx
│       └── Section.jsx
├── pages/
│   └── ChuDuAn/
│       ├── Dashboard.jsx
│       └── BaoCaoHieuSuat.jsx
└── styles/
    ├── ChuDuAnDesignSystem.css
    └── animations.css
```

### 2.2 Component Pattern Example

```jsx
// client/src/components/ChuDuAn/MetricCard.jsx

import React from 'react';
import { motion } from 'framer-motion';
import './MetricCard.css';

/**
 * MetricCard - Card hiển thị KPI với animation và glow effect
 * 
 * @param {Object} props
 * @param {React.Component} props.icon - Icon component từ react-icons
 * @param {string} props.title - Tiêu đề metric
 * @param {string|number} props.value - Giá trị chính
 * @param {string} props.subtitle - Mô tả phụ
 * @param {string} props.trend - Text hiển thị xu hướng
 * @param {boolean} props.trendUp - True nếu xu hướng tăng
 * @param {string} props.color - primary|success|warning|danger
 */
const MetricCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  trend, 
  trendUp,
  color = 'primary' 
}) => {
  return (
    <motion.div 
      className={`metric-card metric-card--${color}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Animated background gradient */}
      <div className="metric-card__bg-gradient" />
      
      {/* Glow effect on hover */}
      <div className={`metric-card__glow metric-card__glow--${color}`} />
      
      {/* Content */}
      <div className="metric-card__content">
        {/* Icon with pulse animation */}
        <div className={`metric-card__icon metric-card__icon--${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        {/* Title */}
        <h3 className="metric-card__title">{title}</h3>
        
        {/* Value with counter animation */}
        <div className="metric-card__value">
          <AnimatedCounter value={value} />
        </div>
        
        {/* Subtitle */}
        {subtitle && (
          <p className="metric-card__subtitle">{subtitle}</p>
        )}
        
        {/* Trend indicator */}
        {trend && (
          <div className={`metric-card__trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            <span className="trend-icon">
              {trendUp ? '↗' : '↘'}
            </span>
            <span className="trend-text">{trend}</span>
          </div>
        )}
      </div>
      
      {/* Shimmer effect */}
      <div className="metric-card__shimmer" />
    </motion.div>
  );
};

export default MetricCard;
```

---

## 3. Advanced UI Effects

### 3.1 Glass Morphism Cards

```css
/* File: client/src/components/ChuDuAn/MetricCard.css */

.metric-card {
  position: relative;
  padding: var(--space-lg);
  border-radius: var(--radius-xl);
  overflow: hidden;
  
  /* Glass effect */
  background: var(--cda-glass-bg);
  backdrop-filter: var(--cda-glass-blur);
  -webkit-backdrop-filter: var(--cda-glass-blur);
  border: var(--border-subtle);
  
  /* Multi-layer shadow for depth */
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
  
  transition: transform var(--transition-base),
              box-shadow var(--transition-base);
}

/* Animated gradient background */
.metric-card__bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.1) 0%,
    transparent 50%,
    rgba(245, 158, 11, 0.1) 100%
  );
  opacity: 0;
  transition: opacity var(--transition-base);
}

.metric-card:hover .metric-card__bg-gradient {
  opacity: 1;
}

/* Glow effect - different colors */
.metric-card__glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    var(--cda-primary-glow) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity var(--transition-slow);
  pointer-events: none;
}

.metric-card:hover .metric-card__glow {
  opacity: 0.6;
}

.metric-card__glow--success {
  background: radial-gradient(
    circle,
    var(--cda-success-glow) 0%,
    transparent 70%
  );
}

.metric-card__glow--warning {
  background: radial-gradient(
    circle,
    var(--cda-secondary-glow) 0%,
    transparent 70%
  );
}

.metric-card__glow--danger {
  background: radial-gradient(
    circle,
    var(--cda-danger-glow) 0%,
    transparent 70%
  );
}

/* Shimmer loading effect */
.metric-card__shimmer {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  transform: translateX(-100%) translateY(-100%) rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  50% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* Icon with pulse animation */
.metric-card__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-md);
  position: relative;
  
  background: linear-gradient(
    135deg,
    var(--cda-bg-elevated-2),
    var(--cda-bg-elevated-3)
  );
  border: var(--border-subtle);
}

.metric-card__icon--primary {
  color: var(--cda-primary);
  box-shadow: 0 0 0 0 var(--cda-primary-glow);
  animation: pulse-primary 2s infinite;
}

@keyframes pulse-primary {
  0%, 100% {
    box-shadow: 0 0 0 0 var(--cda-primary-glow);
  }
  50% {
    box-shadow: 0 0 0 8px transparent;
  }
}

.metric-card__icon--success {
  color: var(--cda-success);
  animation: pulse-success 2s infinite;
}

@keyframes pulse-success {
  0%, 100% {
    box-shadow: 0 0 0 0 var(--cda-success-glow);
  }
  50% {
    box-shadow: 0 0 0 8px transparent;
  }
}

/* Typography styles */
.metric-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--cda-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-sm);
}

.metric-card__value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--cda-text-primary);
  margin-bottom: var(--space-xs);
  line-height: 1;
  
  /* Gradient text effect */
  background: linear-gradient(
    135deg,
    var(--cda-text-primary) 0%,
    var(--cda-primary-light) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-card__subtitle {
  font-size: var(--text-sm);
  color: var(--cda-text-tertiary);
  margin-bottom: var(--space-sm);
}

/* Trend indicator */
.metric-card__trend {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  width: fit-content;
}

.trend-up {
  color: var(--cda-success);
  background: rgba(16, 185, 129, 0.1);
}

.trend-down {
  color: var(--cda-danger);
  background: rgba(239, 68, 68, 0.1);
}

.trend-icon {
  font-size: var(--text-lg);
}
```

### 3.2 Animated Counter Component

```jsx
// client/src/components/ChuDuAn/AnimatedCounter.jsx

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 1 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { duration: duration * 1000 });
  
  useEffect(() => {
    spring.set(parseFloat(value) || 0);
  }, [value, spring]);
  
  useEffect(() => {
    const unsubscribe = spring.onChange(latest => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [spring]);
  
  // Format number with commas
  const formatted = new Intl.NumberFormat('vi-VN').format(
    Math.round(displayValue)
  );
  
  return <span>{formatted}</span>;
};

export default AnimatedCounter;
```

---

## 4. Chart Styling Guidelines

### 4.1 Recharts Custom Styling

```jsx
// client/src/components/ChuDuAn/Charts/RevenueChart.jsx

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import './RevenueChart.css';

const RevenueChart = ({ data }) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="revenue-chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            ₫{payload[0].value.toLocaleString('vi-VN')} triệu
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="revenue-chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart 
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
            </linearGradient>
            
            {/* Animated gradient for active state */}
            <linearGradient id="colorRevenueGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={1}>
                <animate 
                  attributeName="stopOpacity" 
                  values="1;0.8;1" 
                  dur="2s" 
                  repeatCount="indefinite" 
                />
              </stop>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          {/* Grid with custom styling */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.05)"
            vertical={false}
          />
          
          {/* X Axis */}
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
          />
          
          {/* Y Axis */}
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            tickFormatter={(value) => `₫${value}tr`}
          />
          
          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} />
          
          {/* Area with glow effect */}
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            fill="url(#colorRevenue)"
            activeDot={{ 
              r: 8, 
              fill: '#a78bfa',
              stroke: '#8b5cf6',
              strokeWidth: 2,
              filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.8))'
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
```

```css
/* File: client/src/components/ChuDuAn/Charts/RevenueChart.css */

.revenue-chart-container {
  position: relative;
  padding: var(--space-lg);
  background: var(--cda-bg-elevated-1);
  border-radius: var(--radius-xl);
  border: var(--border-subtle);
  
  /* Subtle inner glow */
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.revenue-chart-tooltip {
  background: var(--cda-bg-elevated-3);
  backdrop-filter: blur(8px);
  border: 1px solid var(--cda-primary);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  box-shadow: 0 0 20px var(--cda-primary-glow);
}

.tooltip-label {
  font-size: var(--text-sm);
  color: var(--cda-text-tertiary);
  margin-bottom: var(--space-xs);
}

.tooltip-value {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--cda-primary-light);
}
```

---

## 5. Animation Library

```css
/* File: client/src/styles/animations.css */

/* === FADE ANIMATIONS === */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === SLIDE ANIMATIONS === */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* === SCALE ANIMATIONS === */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

/* === GLOW ANIMATIONS === */
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 5px var(--cda-primary-glow);
  }
  50% {
    box-shadow: 0 0 20px var(--cda-primary-glow);
  }
}

@keyframes shimmerMove {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* === ROTATION ANIMATIONS === */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* === BOUNCE ANIMATIONS === */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* === UTILITY CLASSES === */
.animate-fade-in {
  animation: fadeIn 0.3s var(--transition-base);
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s var(--transition-base);
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-glow {
  animation: glowPulse 2s infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

## 6. Responsive Grid System

```css
/* File: client/src/styles/ChuDuAnDesignSystem.css */

/* === DASHBOARD GRID === */
.dashboard-grid {
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: 1fr;
  padding: var(--space-lg);
}

/* Mobile (< 640px) */
@media (max-width: 640px) {
  .dashboard-grid {
    gap: var(--space-md);
    padding: var(--space-md);
  }
}

/* Tablet (≥ 768px) */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-span-2 {
    grid-column: span 2;
  }
}

/* Desktop (≥ 1024px) */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-xl);
  }
  
  .grid-span-2 {
    grid-column: span 2;
  }
  
  .grid-span-3 {
    grid-column: span 3;
  }
  
  .grid-span-4 {
    grid-column: span 4;
  }
}

/* Large Desktop (≥ 1280px) */
@media (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: repeat(12, 1fr);
  }
  
  .grid-col-1 { grid-column: span 1; }
  .grid-col-2 { grid-column: span 2; }
  .grid-col-3 { grid-column: span 3; }
  .grid-col-4 { grid-column: span 4; }
  .grid-col-6 { grid-column: span 6; }
  .grid-col-8 { grid-column: span 8; }
  .grid-col-12 { grid-column: span 12; }
}
```

---

## 7. Icon System

```javascript
// File: client/src/utils/iconMap.js

import {
  HiOutlineHome,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineBuildingOffice2,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineHeart,
  HiOutlineEye,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';

export const IconMap = {
  // Metrics
  home: HiOutlineHome,
  revenue: HiOutlineCurrencyDollar,
  chart: HiOutlineChartBar,
  calendar: HiOutlineCalendar,
  document: HiOutlineDocumentText,
  building: HiOutlineBuildingOffice2,
  
  // Trends
  trendUp: HiOutlineArrowTrendingUp,
  trendDown: HiOutlineArrowTrendingDown,
  
  // Interactions
  heart: HiOutlineHeart,
  eye: HiOutlineEye,
  users: HiOutlineUserGroup,
  
  // Status
  success: HiOutlineCheckCircle,
  error: HiOutlineXCircle,
  warning: HiOutlineExclamationCircle,
};

// Usage:
// import { IconMap } from '@/utils/iconMap';
// <IconMap.revenue className="w-6 h-6" />
```

---

## 8. Integration with Figma

### 8.1 Asset Export Settings

**Figma Export Requirements:**
- Icons: SVG, 24x24px
- Images: PNG/WebP, @2x for retina
- Charts: Export as SVG for vector clarity
- Colors: Use HSL format for better manipulation

### 8.2 Handoff Workflow

1. **Design Phase:** Design in Figma với design tokens đã định nghĩa
2. **Export:** Export assets với naming convention: `component-name-variant-state`
3. **Integration:** Import vào `client/public/assets/`
4. **Component:** Tạo React component với CSS tương ứng

### 8.3 Design-to-Code Mapping

```
Figma Layer Name          →  React Component
──────────────────────────────────────────────
MetricCard/Primary        →  <MetricCard color="primary" />
Chart/Revenue/Line        →  <RevenueChart type="line" />
Button/Primary/Hover      →  <Button variant="primary" :hover />
```

---

## 9. Performance Optimization

### 9.1 Code Splitting

```javascript
// Lazy load heavy chart components
const RevenueChart = React.lazy(() => import('./Charts/RevenueChart'));
const AppointmentHeatmap = React.lazy(() => import('./Charts/AppointmentHeatmap'));

// Usage with Suspense
<Suspense fallback={<ChartSkeleton />}>
  <RevenueChart data={revenueData} />
</Suspense>
```

### 9.2 CSS Optimization

```css
/* Use CSS containment for isolated components */
.metric-card {
  contain: layout style paint;
}

/* GPU acceleration for animations */
.animate-slide {
  will-change: transform;
  transform: translateZ(0);
}

/* Reduce repaints */
.chart-container {
  backface-visibility: hidden;
  perspective: 1000px;
}
```

---

## 10. Accessibility Guidelines

```jsx
// Example: Accessible MetricCard
<div 
  className="metric-card"
  role="article"
  aria-labelledby="metric-title"
  aria-describedby="metric-value"
>
  <h3 id="metric-title" className="metric-card__title">
    Tổng Doanh Thu
  </h3>
  <div id="metric-value" className="metric-card__value">
    ₫250.5 triệu
  </div>
  
  {/* Screen reader only text */}
  <span className="sr-only">
    Doanh thu tháng này là 250.5 triệu đồng, tăng 12.3% so với tháng trước
  </span>
</div>
```

```css
/* Screen reader only utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 11. Testing Strategy

### 11.1 Visual Regression Testing

```javascript
// Storybook stories for visual testing
export default {
  title: 'ChuDuAn/MetricCard',
  component: MetricCard,
};

export const Primary = () => (
  <MetricCard
    icon={IconMap.revenue}
    title="Tổng Doanh Thu"
    value="250.5 triệu"
    trend="+12.3% so tháng trước"
    trendUp={true}
    color="primary"
  />
);
```

### 11.2 Accessibility Testing

```javascript
// Jest + Testing Library
describe('MetricCard', () => {
  it('should have proper ARIA labels', () => {
    const { getByRole } = render(<MetricCard {...props} />);
    expect(getByRole('article')).toBeInTheDocument();
  });
  
  it('should be keyboard navigable', () => {
    const { container } = render(<MetricCard {...props} />);
    const card = container.firstChild;
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});
```

---

## 📚 References

- **Recharts Documentation:** https://recharts.org/
- **Framer Motion:** https://www.framer.com/motion/
- **React Icons:** https://react-icons.github.io/react-icons/
- **CSS Tricks - Glass Morphism:** https://css-tricks.com/glassmorphism/
- **Web Animations API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
