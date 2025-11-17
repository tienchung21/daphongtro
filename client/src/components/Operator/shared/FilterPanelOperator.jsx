import React from 'react';
import './FilterPanelOperator.css';

/**
 * Filter Panel component với glass morphism
 * @param {Object} props
 * @param {Array} props.filters - [{id, label, type, options, value, onChange}]
 * @param {Function} props.onApply - Apply handler
 * @param {Function} props.onReset - Reset handler
 */
function FilterPanelOperator({ filters = [], onApply, onReset }) {
  const renderFilter = (filter) => {
    const commonProps = {
      id: filter.id,
      value: filter.value || '',
      onChange: (e) => filter.onChange?.(e.target.value),
      className: 'operator-form__input'
    };

    switch (filter.type) {
      case 'text':
        return <input type="text" placeholder={filter.placeholder} {...commonProps} />;
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Tất cả</option>
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return <input type="date" {...commonProps} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="operator-filter">
      {filters.map((filter) => (
        <div key={filter.id} className="operator-filter__group">
          <label className="operator-filter__label" htmlFor={filter.id}>
            {filter.label}
          </label>
          <div className="operator-filter__control">
            {renderFilter(filter)}
          </div>
        </div>
      ))}
      
      <div className="operator-filter__actions">
        <button 
          className="operator-btn operator-btn--ghost operator-btn--sm"
          onClick={onReset}
        >
          Đặt lại
        </button>
        <button 
          className="operator-btn operator-btn--primary operator-btn--sm"
          onClick={onApply}
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}

export default FilterPanelOperator;






