"""Draw original hoodie and tee prints and render the storefront mockups."""
from argparse import ArgumentParser
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from random import Random
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFont

BASE = Path(__file__).resolve().parent
spec = spec_from_file_location("garment_mockups", BASE / "make-garments.py")
mockups = module_from_spec(spec)
spec.loader.exec_module(mockups)

BLUE = "#3979ff"
ICE = "#b9deff"
INK = "#1b2442"
VOLT = "#244dc6"
AMBER = "#ffac57"
PALE = "#f3e6cd"


def type_line(draw, x, y, text, width, size, color, face="bahnschrift.ttf", anchor="la"):
    font = ImageFont.truetype(str(mockups.FONTS / face), size)
    while font.getlength(text) > width:
        size -= 2
        font = ImageFont.truetype(str(mockups.FONTS / face), size)
    draw.text((x, y), text, fill=color, font=font, anchor=anchor)


def corners(draw, rect, color, length=22):
    left, top, right, bottom = rect
    for x, y, dx, dy in ((left, top, 1, 1), (right, top, -1, 1),
                         (left, bottom, 1, -1), (right, bottom, -1, -1)):
        draw.line([(x + dx*length, y), (x, y), (x, y + dy*length)], fill=color, width=5)


def orbital_path(draw, center, axes, tilt, color, width=5, start=0, stop=math.tau):
    cx, cy = center
    rx, ry = axes
    ct, st = math.cos(tilt), math.sin(tilt)
    dots = []
    for index in range(161):
        theta = start + (stop - start) * index / 160
        x, y = rx * math.cos(theta), ry * math.sin(theta)
        dots.append((cx + x*ct - y*st, cy + x*st + y*ct))
    draw.line(dots, fill=color, width=width, joint="curve")


def night_shift(draw, front):
    if front:
        draw.ellipse((195, 133, 505, 442), outline=BLUE, width=20)
        orbital_path(draw, (351, 288), (223, 80), -.43, ICE, width=18)
        draw.ellipse((461, 236, 491, 266), fill=ICE)
        type_line(draw, 350, 478, "NIGHT SHIFT", 472, 66, ICE, anchor="ma")
        type_line(draw, 350, 556, "THE STAN CO.", 412, 35, BLUE, "consolab.ttf", "ma")
        return

    corners(draw, (67, 66, 633, 634), BLUE, 36)
    type_line(draw, 84, 78, "NIGHT SHIFT", 528, 88, ICE)
    type_line(draw, 86, 168, "AFTER HOURS / FIELD 01", 512, 26, BLUE, "consolab.ttf")
    rng = Random(1906)
    for _ in range(59):
        x, y = rng.randint(88, 611), rng.randint(224, 528)
        if (x-351)**2 + (y-374)**2 > 135**2:
            radius = rng.choice([1, 2, 3, 4])
            draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=ICE if radius == 4 else BLUE)
    center = (352, 377)
    draw.ellipse((232, 257, 472, 497), fill=BLUE)
    draw.ellipse((216, 246, 460, 490), fill="#192341")
    draw.arc((228, 249, 465, 488), 20, 140, fill=ICE, width=8)
    orbital_path(draw, center, (235, 88), -.35, BLUE, 6)
    orbital_path(draw, center, (245, 108), -.35, ICE, 3, start=.02, stop=5.88)
    orbital_path(draw, center, (254, 120), -.35, BLUE, 4, start=2.89, stop=5.95)
    for x, y in [(153, 434), (564, 355), (406, 489)]:
        draw.ellipse((x-7, y-7, x+7, y+7), fill=ICE)
    draw.line((86, 562, 614, 562), fill=BLUE, width=4)
    type_line(draw, 86, 584, "THE STAN CO.", 230, 30, ICE, "consolab.ttf")
    type_line(draw, 615, 584, "ORBITAL SERIES", 269, 24, BLUE, "consolab.ttf", "ra")


def interference(draw, extent, density, color, alt):
    left, top, right, bottom = extent
    span = right - left
    height = bottom - top
    for row in range(density):
        y = top + row * height / (density - 1)
        frequency = 4 + row / (density * 2)
        points = []
        for x in range(left, right + 1, 4):
            t = (x - left) / span
            wave = math.sin(t*math.tau*frequency + row*.39) * math.sin(math.pi*t)**2
            points.append((x, y + wave * (height / density * 2.6)))
        draw.line(points, fill=color if row % 4 else alt, width=5 if row % 4 else 7, joint="curve")


def static_zip(draw, front):
    if front:
        corners(draw, (115, 126, 585, 457), INK, 68)
        interference(draw, (135, 190, 565, 394), 8, VOLT, INK)
        type_line(draw, 350, 484, "STATIC", 450, 95, INK, anchor="ma")
        type_line(draw, 350, 564, "THE STAN CO.", 402, 36, VOLT, "consolab.ttf", "ma")
        return

    type_line(draw, 72, 61, "OFF GRID / SIGNAL STUDY", 542, 32, VOLT, "consolab.ttf")
    draw.line((72, 111, 628, 111), fill=INK, width=6)
    type_line(draw, 68, 113, "STATIC", 550, 152, INK)
    corners(draw, (70, 274, 630, 542), VOLT, 24)
    for x in range(89, 622, 19):
        for y in range(300, 517, 19):
            draw.ellipse((x-2, y-2, x+2, y+2), fill=INK)
    interference(draw, (90, 313, 610, 502), 12, VOLT, INK)
    draw.line((72, 573, 628, 573), fill=INK, width=5)
    type_line(draw, 72, 593, "THE STAN CO.", 244, 30, INK, "consolab.ttf")
    type_line(draw, 628, 593, "FREQUENCY 002", 241, 28, VOLT, "consolab.ttf", "ra")


def crosshair(draw, x, y, radius, color, width):
    draw.line((x - radius, y, x + radius, y), fill=color, width=width)
    draw.line((x, y - radius, x, y + radius), fill=color, width=width)


def frame_district(draw, front):
    if front:
        corners(draw, (142, 152, 558, 450), AMBER, 80)
        draw.rectangle((226, 198, 471, 403), outline=BLUE, width=18)
        crosshair(draw, 350, 300, 70, AMBER, 18)
        type_line(draw, 350, 500, "FRAME DISTRICT", 517, 61, PALE, anchor="ma")
        return

    corners(draw, (65, 67, 635, 631), AMBER, 27)
    type_line(draw, 81, 78, "FRAME DISTRICT", 536, 94, PALE)
    type_line(draw, 84, 173, "EXPOSURE STUDY / 03", 528, 28, AMBER, "consolab.ttf")
    draw.rectangle((84, 236, 616, 535), outline=AMBER, width=7)
    for i in range(1, 8):
        x = 84 + i * 532/8
        draw.line((x, 236, x, 535), fill=BLUE, width=4)
    for i in range(1, 5):
        y = 236 + i * 299/5
        draw.line((84, y, 616, y), fill=BLUE, width=4)
    for i in range(7):
        x = 110 + i*71
        y = 467 - i*28
        draw.rectangle((x, y, x+48, y+33), outline=AMBER if i % 2 else PALE, width=4)
    draw.ellipse((289, 322, 411, 444), outline=AMBER, width=6)
    crosshair(draw, 350, 383, 31, PALE, 5)
    for x in (114, 589):
        for y in (268, 507):
            crosshair(draw, x, y, 13, AMBER, 5)
    draw.line((84, 565, 616, 565), fill=AMBER, width=4)
    type_line(draw, 84, 584, "THE STAN CO.", 249, 28, PALE, "consolab.ttf")
    type_line(draw, 616, 584, "ISO / 800", 241, 28, AMBER, "consolab.ttf", "ra")


def normalize_half(sheet, front):
    width, height = sheet.size
    if front:
        side = sheet.crop((0, 0, width // 2, height))
    else:
        side = sheet.crop((width // 2, 0, width, height))
    bounds = side.getchannel("A").point(lambda value: 255 if value > 65 else 0).getbbox()
    if bounds is None:
        raise ValueError("Transparent hoodie sheet is missing a garment")
    side = side.crop(bounds)
    side.thumbnail((751, 850), Image.Resampling.LANCZOS)
    tile = Image.new("RGBA", (780, 900))
    tile.alpha_composite(side, ((780 - side.width) // 2, (900 - side.height) // 2))
    return tile


def render_hoodie(slug, art, sheet, placements):
    for front, placement in zip((True, False), placements):
        garment = normalize_half(sheet, front)
        print_image = mockups.export_art(slug, art, front)
        size, x, y = placement
        ink = np.asarray(print_image.resize((size, size), Image.Resampling.LANCZOS)).copy()
        cloth = np.asarray(garment)[y:y+size, x:x+size].astype(np.float32)
        brightness = cloth[:, :, :3].mean(axis=2)
        shade = np.clip((brightness + 26) / (np.median(brightness) + 26), .74, 1.15) ** .37
        ink[:, :, :3] = np.clip(ink[:, :, :3] * shade[:, :, None], 0, 255)
        ink[:, :, 3] = np.minimum(ink[:, :, 3], cloth[:, :, 3])
        garment.alpha_composite(Image.fromarray(ink), (x, y))
        suffix = "front" if front else "back"
        garment.save(mockups.OUT / f"{slug}-{suffix}.webp", quality=88, method=6)


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--tee-only", action="store_true")
    args = parser.parse_args()
    mockups.OUT.mkdir(parents=True, exist_ok=True)
    tee = Image.open(BASE / "make-garments.webp").convert("RGBA")
    for front in (True, False):
        mockups.make_mockup(tee, "frame-district-tee", (47, 46, 50), frame_district, front)
    if args.tee_only:
        return
    pullover = Image.open(BASE / "night-shift-hoodie-blank.webp").convert("RGBA")
    zipper = Image.open(BASE / "static-zip-hoodie-blank.webp").convert("RGBA")
    render_hoodie("night-shift-hoodie", night_shift, pullover, ((135, 446, 270), (368, 206, 350)))
    render_hoodie("static-zip-hoodie", static_zip, zipper, ((133, 446, 272), (368, 206, 346)))


if __name__ == "__main__":
    main()

