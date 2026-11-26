# Lịch Vạn Sự

Lịch âm dương Việt Nam chạy trên điện thoại và máy tính (PWA, dùng được khi không có mạng).

- Đổi ngày âm - dương (1900-2100, múi giờ Việt Nam), can chi, tiết khí, giờ hoàng đạo
- Vạn sự: ngày hoàng đạo/hắc đạo, 12 trực, nhị thập bát tú, ngày kỵ, tuổi xung, hướng xuất hành
- Tìm ngày tốt theo việc và theo tuổi
- Sự kiện cá nhân theo âm lịch (giỗ, sinh nhật), nhắc mùng 1 và rằm, xuất .ics, sao lưu

## Chạy trên máy

```
npm install
npm run dev      # chạy thử
npm test         # kiểm thử phần tính toán
npm run build    # tạo bản phát hành trong dist/
```

Mỗi lần đẩy mã lên nhánh `main`, GitHub Actions tự kiểm thử, build và phát hành lên GitHub Pages.

Thuật toán âm lịch dựa trên công trình của Hồ Ngọc Đức. Thông tin vạn sự chỉ để tham khảo.
