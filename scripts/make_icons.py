"""Tạo biểu tượng ứng dụng (chạy lại khi muốn đổi thiết kế): python scripts/make_icons.py"""
from PIL import Image, ImageDraw, ImageFont

RED, CREAM, GOLD = (179, 38, 30), (255, 253, 248), (169, 120, 28)
FONT = "C:/Windows/Fonts/georgiab.ttf"


def icon(size, card_ratio):
    """card_ratio: phần tờ lịch so với cạnh ảnh; nhỏ hơn cho bản maskable để không bị cắt."""
    s = size * 4  # vẽ lớn rồi thu nhỏ cho mịn
    img = Image.new("RGB", (s, s), RED)
    d = ImageDraw.Draw(img)
    w = int(s * card_ratio)
    x0 = (s - w) // 2
    y0 = (s - w) // 2
    r = w // 9
    d.rounded_rectangle([x0, y0, x0 + w, y0 + w], radius=r, fill=CREAM)
    head = w // 4
    d.rounded_rectangle([x0, y0, x0 + w, y0 + head + r], radius=r, fill=GOLD)
    d.rectangle([x0, y0 + head, x0 + w, y0 + head + r], fill=CREAM)
    for cx in (x0 + w * 0.3, x0 + w * 0.7):  # hai lỗ xé lịch
        rr = w * 0.045
        d.ellipse([cx - rr, y0 + head / 2 - rr, cx + rr, y0 + head / 2 + rr], fill=CREAM)
    font = ImageFont.truetype(FONT, int(w * 0.56))
    d.text((s / 2, y0 + head + (w - head) / 2), "15", font=font, fill=RED, anchor="mm")
    return img.resize((size, size), Image.LANCZOS)


icon(192, 0.72).save("public/icon-192.png")
icon(512, 0.72).save("public/icon-512.png")
icon(512, 0.56).save("public/icon-maskable-512.png")
icon(180, 0.72).save("public/apple-touch-icon.png")
icon(32, 0.84).save("public/favicon.png")
print("ok")
