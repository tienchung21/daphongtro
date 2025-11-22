import React from 'react';
import './TableOperator.css';

/**
 * Table component với glass morphism design
 * - Hỗ trợ API vi-VN và tương thích ngược
 * @param {Object} props
 * @param {Array} props.columns - [{key, label, width, render(row), actions}]
 * @param {Array} props.data - Dữ liệu
 * @param {boolean} props.striped - Striped rows
 * @param {boolean} props.hoverable - Hover effect
 * @param {Function} props.onRowClick - Click handler
 * @param {boolean} props.loading - Trạng thái loading (cũ)
 * @param {boolean} props.isLoading - Trạng thái loading (mới)
 * @param {string} props.emptyMessage - Thông điệp khi rỗng
 * @param {Object} props.pagination - { currentPage, totalPages, total, limit, onPageChange }
 */
function TableOperator({ 
  columns = [], 
  data = [], 
  striped = false, 
  hoverable = false,
  onRowClick,
  loading = false,
  isLoading = false,
  emptyMessage = 'Không có dữ liệu',
  pagination
}) {
  const isTableLoading = isLoading || loading;

  // Chuẩn hóa dữ liệu đầu vào thành mảng an toàn
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
        ? data.items
        : [];

  const renderCellContent = (col, row) => {
    if (typeof col.render === 'function') {
      // Ưu tiên API mới: render(row)
      if (col.render.length <= 1) {
        return col.render(row);
      }
      // Tương thích ngược: render(value, row)
      return col.render(row[col.key], row);
    }
    return row[col.key];
  };

  return (
    <div className={`operator-table ${striped ? 'operator-table--striped' : ''} ${hoverable ? 'operator-table--hoverable' : ''}`}>
      <div className="operator-table__header">
        <div className="operator-table__header-row">
          {columns.map((col) => {
            const widthStyle = typeof col.width === 'string'
              ? { width: col.width, minWidth: col.width, maxWidth: col.width, flex: '0 0 auto' }
              : { flex: col.width || 1 };
            return (
            <div 
              key={col.key} 
              className="operator-table__header-cell"
              style={widthStyle}
            >
              {col.label}
            </div>
            );
          })}
        </div>
      </div>

      <div className="operator-table__body">
        {isTableLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="operator-table__row">
              {columns.map((col) => {
                const widthStyle = typeof col.width === 'string'
                  ? { width: col.width, minWidth: col.width, maxWidth: col.width, flex: '0 0 auto' }
                  : { flex: col.width || 1 };
                return (
                <div 
                  key={col.key} 
                  className="operator-table__cell"
                  style={widthStyle}
                >
                  <div className="operator-skeleton operator-skeleton--text" />
                </div>
                );
              })}
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="operator-table__empty">
            <div className="operator-table__empty-icon">📭</div>
            <div className="operator-table__empty-text">{emptyMessage}</div>
          </div>
        ) : (
          rows.map((row, index) => (
            <div 
              key={index} 
              className="operator-table__row"
              onClick={() => onRowClick && onRowClick(row)}
              style={{cursor: onRowClick ? 'pointer' : 'default'}}
            >
              {columns.map((col) => {
                const widthStyle = typeof col.width === 'string'
                  ? { width: col.width, minWidth: col.width, maxWidth: col.width, flex: '0 0 auto' }
                  : { flex: col.width || 1 };
                return (
                <div 
                  key={col.key} 
                  className={`operator-table__cell ${col.actions ? 'operator-table__cell--actions' : ''}`}
                  style={widthStyle}
                >
                  {renderCellContent(col, row)}
                </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="operator-table__footer">
          <div className="operator-table__pagination">
            <button
              className="operator-btn operator-btn--ghost operator-btn--sm"
              onClick={() => pagination.onPageChange(Math.max(1, (pagination.currentPage || 1) - 1))}
              disabled={(pagination.currentPage || 1) <= 1}
            >
              ← Trước
            </button>
            <div className="operator-table__pagination-info">
              <span>Trang {pagination.currentPage || 1} / {pagination.totalPages}</span>
              {typeof pagination.total === 'number' && (
                <span className="operator-table__pagination-total">| Tổng: {pagination.total}</span>
              )}
            </div>
            <button
              className="operator-btn operator-btn--ghost operator-btn--sm"
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, (pagination.currentPage || 1) + 1))}
              disabled={(pagination.currentPage || 1) >= pagination.totalPages}
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableOperator;






