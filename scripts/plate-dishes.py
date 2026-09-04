"""Bake the cut-out dish PNGs back into photographs.

The client rejected the floating-dish treatment. Every file under
`Menu/KS Menu Webp/` is an RGBA cut-out on a transparent ground, so "use normal
pictures" cannot be done by CSS alone - a cut-out dropped on a coloured box is
still a cut-out. This composites each dish onto a warm ground with a soft
contact shadow and writes an opaque WebP, so the source asset itself is a
photograph and the floating treatment is gone at the asset level.

Three things it also fixes, which matter more than they sound:

1. **Framing.** The cut-outs are 1512x1512 with the dish floating at wildly
   different scales - a small bowl fills ~40% of the box, a long platter ~90%.
   Dropped into a uniform row that reads as random zoom. Each dish is measured
   by its alpha bounding box and rescaled to occupy a consistent share of the
   frame, so every row carries the same visual weight.

2. **Aspect.** The output matches `.menu-row-photo` exactly, so `cover` never
   crops. This has been wrong twice: a 900x900 square rendered into a 4:3 box
   lost 25% of every dish's height, and a 4:3 render into the square box the
   client's reference uses would lose the same off its width. If the frame's
   ratio changes, change W/H here in the same commit.

3. **Shadow colour.** Terracotta, never black - the project banned black
   shadows sitewide in Round 1.

⚠ The ground is COUPLED to the page surface. It must stay distinguishable from
the field the plates sit on, or the dishes dissolve into the page and the
floating look this script exists to remove comes straight back (the Round 7
lesson, PRD §15.1) - but it must ALSO not read as a flat box, which is the
opposite failure and the one that actually shipped. See the note on
GROUND_CENTRE.
"""
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path(r'C:\Users\HP\Downloads\Khao san\khao-san-client\public\assets\Menu\KS Menu Webp')
OUT = Path(r'C:\Users\HP\Downloads\Khao san\khao-san-client\public\assets\menu-plated')

W, H = 1000, 1000            # square, matching .menu-row-photo
FILL_W, FILL_H = 0.82, 0.82  # share of the frame the dish may occupy

# ⚠ A FLAT ground was the mistake. Three rounds ran a flat fill (warm sand,
# then warm putty, then cool stone) and every one of them read as a grey BOX
# behind the food - on a white page, seventy-five flat rectangles look like
# unloaded image placeholders, which is worse than the floating cut-out the
# plating exists to fix. Confirmed by finally looking at a screenshot of the
# grid rather than measuring it.
#
# A photograph's background is never one flat value. This is a soft radial
# falloff - brighter under the dish, deepening toward the corners - which is
# what a lit surface actually looks like and what makes the frame read as a
# photograph instead of a swatch. Warm-neutral, so it sits under the food
# without introducing the orange the client removed from the page.
# Deepened after looking at the grid on a white page: at (244,241,236) the
# ground was only 4% off the page and read as a washed-out placeholder rather
# than as a surface. A clear mid-tone warm taupe reads as a deliberate studio
# backdrop - the same register as the client's own reference photography,
# which sets its dishes on cream and on dark wood, never on near-white.
GROUND_CENTRE = (232, 226, 216)
GROUND_EDGE = (203, 194, 180)
SHADOW_RGB = (74, 66, 58)     # warm charcoal, never pure black


def ground(w, h):
    """Radial falloff, brightest slightly above centre - a soft key light."""
    img = Image.new('RGB', (w, h))
    px = img.load()
    cx, cy = w / 2, h * 0.46
    maxd = ((w / 2) ** 2 + (h / 2) ** 2) ** 0.5
    for y in range(h):
        for x in range(w):
            d = (((x - cx) ** 2 + (y - cy) ** 2) ** 0.5) / maxd
            # eased so the centre stays open and the falloff gathers at the rim
            t = min(1.0, d ** 1.35)
            px[x, y] = tuple(
                int(GROUND_CENTRE[i] + (GROUND_EDGE[i] - GROUND_CENTRE[i]) * t)
                for i in range(3))
    return img


BASE = ground(W, H)
count = 0

for src in sorted(SRC.rglob('*.webp')):
    im = Image.open(src).convert('RGBA')
    bbox = im.getchannel('A').getbbox()
    if not bbox:
        print('  skip (fully transparent):', src.name)
        continue
    dish = im.crop(bbox)

    # Fit inside the frame's safe area, preserving aspect. Scaling by the
    # tighter of the two axes is what keeps a long platter and a small bowl
    # reading at the same visual weight instead of one blowing past the edge.
    scale = min((W * FILL_W) / dish.width, (H * FILL_H) / dish.height)
    dish = dish.resize((max(1, int(dish.width * scale)),
                        max(1, int(dish.height * scale))), Image.LANCZOS)

    x = (W - dish.width) // 2
    y = (H - dish.height) // 2

    canvas = BASE.copy()

    # Contact shadow: the dish silhouette, offset down, blurred.
    mask = Image.new('L', (W, H), 0)
    mask.paste(dish.getchannel('A'), (x, y + int(H * 0.022)))
    mask = mask.filter(ImageFilter.GaussianBlur(H // 40))
    mask = mask.point(lambda v: int(v * 0.5))
    canvas = Image.composite(Image.new('RGB', (W, H), SHADOW_RGB), canvas, mask)

    canvas.paste(dish, (x, y), dish)

    dest = OUT / src.parent.name / src.name
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, 'WEBP', quality=80, method=6)
    count += 1

print(f'plated {count} dishes -> {OUT}')
