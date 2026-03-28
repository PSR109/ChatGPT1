import React from 'react';

export default function SectionHeader({
  title,
  subtitle,
  rightSlot = null,
  compact = false,
}) {
  return (
    <div
      className={`psr-section-header ${compact ? 'psr-section-header--compact' : ''}`}
      style={{
        display: 'flex',
        alignItems: compact ? 'center' : 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: compact ? 12 : 18,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h2
          style={{
            margin: 0,
            fontSize: compact ? 20 : 24,
            lineHeight: 1.2,
            textAlign: 'center',
          }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            style={{
              margin: '6px 0 0',
              opacity: 0.8,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  );
}
