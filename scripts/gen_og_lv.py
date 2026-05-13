#!/usr/bin/env python3
"""Generate the LV variant of the OG preview image.

Mirrors the EN composition but swaps the eyebrow line to Latvian and the
names to "Eva un Hyrum" (matching og:title on lv.html).
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path

ROOT = Path("/Users/jana/Code/prototypes/wedding-invite-eva-hyrum")
HERO = ROOT / "images" / "hero.jpg"
OUT = ROOT / "images" / "og-image-lv.jpg"

W, H = 1200, 630

SERIF_REG = "/tmp/cg-var.ttf"
SERIF_LIGHT = "/tmp/cg-var.ttf"
SANS = "/tmp/inter-med.ttf"

IVORY = (247, 243, 234)
CHAMPAGNE = (232, 220, 196)
NAVY = (26, 35, 50)


def fit_cover(im, w, h):
    iw, ih = im.size
    src_ratio = iw / ih
    dst_ratio = w / h
    if src_ratio > dst_ratio:
        new_h = h
        new_w = int(h * src_ratio)
    else:
        new_w = w
        new_h = int(w / src_ratio)
    im = im.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - w) // 2
    top = int((new_h - h) * 0.25)
    return im.crop((left, top, left + w, top + h))


def main():
    base = Image.open(HERO).convert("RGB")
    base = fit_cover(base, W, H)
    base = base.filter(ImageFilter.GaussianBlur(radius=0.6))

    overlay = Image.new("RGB", (W, H), NAVY)
    base = Image.blend(base, overlay, 0.55)

    grad = Image.new("L", (1, H), 0)
    for y in range(H):
        t = y / H
        v = int(60 + 90 * (abs(t - 0.5) * 2))
        grad.putpixel((0, y), v)
    grad = grad.resize((W, H))
    dark = Image.new("RGB", (W, H), NAVY)
    base = Image.composite(dark, base, grad)

    draw = ImageDraw.Draw(base)

    eyebrow_font = ImageFont.truetype(SANS, 26)
    name_font = ImageFont.truetype(SERIF_REG, 116)
    try:
        name_font.set_variation_by_axes([400])
    except Exception:
        pass
    date_font = ImageFont.truetype(SERIF_LIGHT, 50)
    try:
        date_font.set_variation_by_axes([300])
    except Exception:
        pass
    venue_font = ImageFont.truetype(SANS, 22)

    def center_text(y, text, font, color, spacing=0, italic_offset=False):
        if spacing > 0:
            text = (" " * spacing).join(text)
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2 - bbox[0]
        draw.text((x, y), text, font=font, fill=color)
        return bbox[3] - bbox[1]

    eyebrow = "KOPĀ AR SAVIEM TUVINIEKIEM"
    eyebrow = " ".join(eyebrow)
    bbox = draw.textbbox((0, 0), eyebrow, font=eyebrow_font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2 - bbox[0], 150), eyebrow, font=eyebrow_font, fill=IVORY)

    name = "Eva  un  Hyrum"
    bbox = draw.textbbox((0, 0), name, font=name_font)
    tw = bbox[2] - bbox[0]
    name_x = (W - tw) // 2 - bbox[0]
    draw.text((name_x, 215), name, font=name_font, fill=IVORY)

    line_y = 393
    line_w = 110
    draw.line(((W - line_w) // 2, line_y, (W + line_w) // 2, line_y),
              fill=IVORY, width=1)

    date = "14 · 07 · 2026"
    bbox = draw.textbbox((0, 0), date, font=date_font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2 - bbox[0], 410), date, font=date_font, fill=IVORY)

    line_y2 = 487
    draw.line(((W - line_w) // 2, line_y2, (W + line_w) // 2, line_y2),
              fill=IVORY, width=1)

    venue = "NORDEĶU MUIŽA · RĪGA"
    venue = " ".join(venue)
    bbox = draw.textbbox((0, 0), venue, font=venue_font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2 - bbox[0], 510), venue, font=venue_font, fill=IVORY)

    base.save(OUT, "JPEG", quality=88, optimize=True)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
