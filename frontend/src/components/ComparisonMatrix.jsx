import React from 'react';

export default function ComparisonMatrix({ comparison, recommendedAction }) {
  if (!comparison || comparison.length === 0) return null;

  const formatCurrencyINR = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '₹0';
    const num = Number(val);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: num % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'MOVE':
        return 'badge-move';
      case 'BUY':
        return 'badge-buy';
      case 'WAIT':
        return 'badge-wait';
      case 'HOLD':
      default:
        return 'badge-hold';
    }
  };

  const getRiskBadgeClass = (risk) => {
    const r = (risk || 'MEDIUM').toUpperCase();
    if (r === 'LOW') return 'badge-low';
    if (r === 'HIGH') return 'badge-high';
    return 'badge-medium';
  };

  return (
    <div className="panel" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
          Action Comparison Matrix
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Quantitative evaluation of cost, lead time, and stockout risk mitigation across all four inventory decisions.
        </p>
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          className="data-table"
          style={{
            width: '100%',
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}
        >
          <colgroup>
            <col style={{ width: '100px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '140px' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>ACTION</th>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>DESCRIPTION</th>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>QUANTITY</th>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>COST</th>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>LEAD TIME</th>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>RISK</th>
              <th style={{ textAlign: 'left', padding: '10px 12px' }}>EVALUATION</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((item, idx) => {
              const isRecommended = item.action === recommendedAction;

              return (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: isRecommended ? 'var(--accent-green-bg)' : 'transparent',
                    borderLeft: isRecommended ? '3px solid var(--accent-green)' : '3px solid transparent',
                    borderBottom: '1px solid var(--border-subtle)',
                    verticalAlign: 'middle'
                  }}
                >
                  {/* Action Badge */}
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${getActionBadgeClass(item.action)}`}>
                      {item.action}
                    </span>
                  </td>

                  {/* Title & Details */}
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.3' }}>
                      {item.title}
                    </div>
                    {item.details && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.3' }}>
                        {item.details}
                      </div>
                    )}
                  </td>

                  {/* Quantity */}
                  <td style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
                    {item.quantity > 0 ? `${item.quantity} units` : '-'}
                  </td>

                  {/* Cost */}
                  <td style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrencyINR(item.cost)}
                  </td>

                  {/* Lead Time */}
                  <td style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                    {item.lead_time_days} {item.lead_time_days === 1 ? 'day' : 'days'}
                  </td>

                  {/* Risk Level */}
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${getRiskBadgeClass(item.risk_level)}`}>
                      {item.risk_level}
                    </span>
                  </td>

                  {/* Dedicated Status Column */}
                  <td style={{ padding: '12px' }}>
                    {isRecommended ? (
                      <span
                        className="badge badge-move"
                      >
                        BEST CHOICE
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Alternative
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
