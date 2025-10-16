# Debug Icons - Hướng dẫn kiểm tra

## Bước 1: Mở DevTools (F12)

## Bước 2: Click vào tab "Console"

## Bước 3: Chạy lệnh này:

```javascript
// Kiểm tra xem icons có render không
document.querySelectorAll('.ctd-btn-icon svg').forEach((svg, index) => {
  console.log(`Icon ${index}:`, {
    exists: svg ? 'YES' : 'NO',
    width: svg.style.width,
    height: svg.style.height,
    color: svg.style.color,
    computedColor: window.getComputedStyle(svg).color,
    visibility: window.getComputedStyle(svg).visibility,
    opacity: window.getComputedStyle(svg).opacity,
    display: window.getComputedStyle(svg).display
  });
});
```

## Bước 4: Screenshot kết quả trong Console và gửi cho tôi

## Hoặc kiểm tra nhanh:

1. Click chuột phải vào vùng button (nơi icon nên xuất hiện)
2. Chọn "Inspect" / "Kiểm tra"
3. Xem trong HTML có thẻ `<svg>` không?
   - Nếu CÓ: Vấn đề là CSS (màu sắc, opacity, visibility)
   - Nếu KHÔNG CÓ: Vấn đề là React Icons không render

## Temporary Fix:

Thêm CSS override này vào cuối file ChiTietTinDang.css:

```css
/* FORCE SHOW ICONS - DEBUG */
.ctd-btn-icon svg {
  width: 24px !important;
  height: 24px !important;
  color: #000000 !important;
  fill: currentColor !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: inline-block !important;
}
```


