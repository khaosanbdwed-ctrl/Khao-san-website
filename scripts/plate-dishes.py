"""Bake the cut-out dish PNGs back into photographs.

The client rejected the floating-dish treatment. Every file under
`Menu/KS Menu Webp/` is an RGBA cut-out on a transparent ground, so "use normal
pictures" cannot be done by CSS alone - a cut-out dropped on a coloured box is
still a cut-out. This composites each dish onto a warm ground with a soft
contact shadow and writes an opaque WebP, so the source asset itself is a
photograph and the floating treatment is gone at the asset level.

Two things it also fixes, which matter more than they sound:

1. **Framing.** The cut-outs are 1512x1512 with the dish floating at wildly
   different scales - a small bowl fills ~40% of the box, a long platter ~90%.
   Dropped into a uniform row that reads as random zoom. Each dish is measured
   by its alpha bounding box and rescaled to occupy a consistent share of the
   frame, so every row carries the same visual weight.

2. **Shadow colour.** Terracotta, never black - the project banned black
   shadows sitewide in Round 1.
"""
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path(r'C:\Users\HP\Downloads\Khao san\khao-san-client\public\assets\Menu\KS Menu Webp')
OUT = Path(r'C:\Users\HP\Downloads\Khao san\khao-san-client\public\assets\menu-plated')

SIZE = 900          # output square
FILL = 0.80         # share of the frame the dish should occupy
GROUND_TOP = (245, 232, 214)
GROUND_BOT = (231, 211, 186)
SHADOW_RGB = (146, 86, 48)   # terracotta, not black


def ground(size):
    g = Image.new('RGB', (1, size), GROUND_TOP)
    for y in range(size):
        t = y / max(1, size - 1)
        g.putpixel((0, y), tuple(
            int(GROUND_TOP[i] + (GROUND_BOT[i] - GROUND_TOP[i]) * t) for i in range(3)))
    return g.resize((size, size))


BASE = ground(SIZE)
count = 0

for src in sorted(SRC.rglob('*.webp')):
    im = Image.open(src).convert('RGBA')
    bbox = im.getchannel('A').getbbox()
    if not bbox:
        print('  skip (fully transparent):', src.name)
        continue
    dish = im.crop(bbox)

    # Scale so the longest edge of the actual dish hits FILL of the frame.
    scale = (SIZE * FILL) / max(dish.size)
    dish = dish.resize((max(1, int(dish.width * scale)),
                        max(1, int(dish.height * scale))), Image.LANCZOS)

    x = (SIZE - dish.width) // 2
    y = (SIZE - dish.height) // 2

    canvas = BASE.copy()

    # Contact shadow: the dish silhouette, offset down, blurred.
    mask = Image.new('L', (SIZE, SIZE), 0)
    mask.paste(dish.getchannel('A'), (x, y + int(SIZE * 0.022)))
    mask = mask.filter(ImageFilter.GaussianBlur(SIZE // 40))
    mask = mask.point(lambda v: int(v * 0.5))
    canvas = Image.composite(Image.new('RGB', (SIZE, SIZE), SHADOW_RGB), canvas, mask)

    canvas.paste(dish, (x, y), dish)

    dest = OUT / src.parent.name / src.name
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, 'WEBP', quality=80, method=6)
    count += 1

print(f'plated {count} dishes -> {OUT}')
