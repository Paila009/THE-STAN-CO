from pathlib import Path
import argparse
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import math
import random

OUT = Path(__file__).resolve().parent.parent / 'public' / 'images'
FONTS = Path('C:/Windows/Fonts')
SIZE = 700
CREAM = '#f5e7c8'
ORANGE = '#ff683a'
BLUE = '#284bc5'
LIME = '#e0ed99'

def type_at(draw, x, y, text, size, fill, family='impact.ttf'):
    font = ImageFont.truetype(str(FONTS / family), size)
    draw.text((x, y), text, font=font, fill=fill, anchor='mm')

def ribbon(draw, points, color, width):
    draw.line(points, fill=color, width=width, joint='curve')

def arc_points(cx, cy, rx, ry, start, end, count=90):
    return [(cx + math.cos(math.radians(start+(end-start)*n/count))*rx,
             cy + math.sin(math.radians(start+(end-start)*n/count))*ry) for n in range(count+1)]

def first_show(draw, front):
    if front:
        draw.rounded_rectangle((84, 185, 616, 519), radius=36, fill=ORANGE)
        for x in (84, 616):
            draw.ellipse((x-40, 307, x+40, 387), fill=(0,0,0,0))
        draw.line((490, 204, 490, 498), fill='#211c19', width=8)
        type_at(draw, 285, 344, 'FIRST SHOW', 68, '#211c19')
        type_at(draw, 550, 342, '01', 38, '#211c19', 'consolab.ttf')
        return
    draw.rounded_rectangle((56, 46, 644, 654), radius=35, outline=CREAM, width=9)
    for x in range(92, 633, 45):
        draw.rectangle((x, 68, x+20, 82), fill=CREAM)
        draw.rectangle((x, 617, x+20, 631), fill=CREAM)
    draw.polygon([(125, 536), (572, 145), (570, 500)], fill=ORANGE)
    for i in range(7):
        ribbon(draw, [(126,536), (577, 151 + i * 55)], CREAM, 3)
    rng = random.Random(8)
    for i in range(72):
        x = rng.randint(98, 599)
        y = rng.randint(114, 590)
        if 240 < y < 446:
            continue
        w, h = rng.randint(4, 11), rng.randint(5, 14)
        draw.polygon([(x,y),(x+w,y-2),(x+w+4,y+h),(x+3,y+h+2)], fill=CREAM if i%3 else ORANGE)
    draw.rectangle((106, 245, 594, 451), fill='#231d1a')
    type_at(draw, 350, 342, 'FIRST SHOW', 95, CREAM)
    type_at(draw, 350, 425, 'THE STAN CO.   /   DROP 01', 26, ORANGE, 'consolab.ttf')

def fire_flood(draw, front):
    if front:
        draw.ellipse((152,152,548,548), outline=BLUE, width=25)
        draw.arc((205,205,495,495), 165, 340, fill=ORANGE, width=60)
        draw.arc((205,205,495,495), 345, 160, fill=BLUE, width=60)
        draw.ellipse((316,316,384,384), fill=ORANGE)
        return
    for i in range(9):
        dx=i*23
        points = [(x+dx,y+int(i*4)) for x,y in [(66,437),(87,363),(140,323),(171,268),(156,199),(221,239),(234,294),(278,254),(291,178),(275,116),(346,186),(374,248),(363,315),(316,397),(287,464)]]
        ribbon(draw, points, ORANGE, 8)
    for i in range(9):
        pts=[(x, 469+i*12 + 37*math.sin((x-75+i*11)/64) + 13*math.cos(x/35+i/3)) for x in range(84,620,5)]
        ribbon(draw, pts, BLUE, 7)
    type_at(draw, 350, 88, 'FIRE & FLOOD', 75, BLUE)
    type_at(draw, 350, 636, 'THE STAN CO.   /   DROP 01', 25, BLUE, 'consolab.ttf')

def small_fury(draw, front):
    if front:
        draw.ellipse((294,230,406,484), fill=LIME)
        draw.ellipse((320,185,380,257), fill=LIME)
        for side in (-1,1):
            cx=350+side*101
            draw.ellipse((cx-76,223,cx+76,397), outline=LIME, width=15)
            for step in range(3):
                ribbon(draw, [(350,300+step*45),(350+side*130,240+step*88)], LIME, 12)
        return
    type_at(draw, 350, 86, 'SMALL FURY', 81, LIME)
    for r in (219, 231, 244):
        draw.ellipse((350-r,350-r,350+r,350+r), outline=LIME, width=4)
    rng=random.Random(28)
    for side in (-1,1):
        wing=[(350+side*x,y) for x,y in [(0,314),(82,241),(157,215),(208,229),(200,294),(147,365),(72,388),(10,360)]]
        draw.polygon(wing, fill='#67734b', outline=LIME, width=4)
        for step in range(7):
            ex,ey=wing[(step+1)%len(wing)]
            ribbon(draw, [(350,338),(350+side*(30+step*5),325+step*5),(ex,ey)], LIME, 3)
        for x in range(22,168,10):
            for y in range(235,369,10):
                if ((x-102)/83)**2+((y-302)/66)**2 < .88:
                    rad=rng.randrange(1,4)
                    draw.ellipse((350+side*x-rad,y-rad,350+side*x+rad,y+rad), fill=LIME)
        for s in range(3):
            ribbon(draw, [(350,308+s*41),(350+side*(45+s*17),306+s*54),(350+side*(60+s*22),384+s*37)], LIME, 5)
    draw.ellipse((324,281,376,421), fill=LIME)
    draw.ellipse((329,269,371,309), fill=LIME)
    type_at(draw, 350, 635, 'THE STAN CO.   /   DROP 01', 25, LIME, 'consolab.ttf')

def home_turf(draw, front):
    if front:
        draw.rectangle((125,210,575,490), outline=CREAM, width=23)
        draw.line((350,210,350,490), fill=CREAM, width=18)
        for x in (220,480):
            draw.line((x,210,x,490), fill=CREAM, width=11)
        draw.ellipse((319,319,381,381), fill=ORANGE)
        return
    type_at(draw, 350, 94, 'HOME TURF', 96, CREAM)
    draw.rectangle((94,175,606,565), outline=CREAM, width=8)
    draw.rectangle((112,194,588,547), outline=ORANGE, width=4)
    draw.rectangle((127,225,573,516), outline=CREAM, width=5)
    for x in (175, 222, 350, 478, 525):
        draw.line((x,225,x,516), fill=CREAM, width=4 if x!=350 else 9)
    for y in range(252,500,23):
        draw.line((128,y,570,y), fill='#7290e5', width=1)
    for x,y in [(193,269),(245,330),(192,397),(243,463),(453,270),(502,329),(452,396),(503,466)]:
        draw.ellipse((x-9,y-9,x+9,y+9), fill=CREAM)
    draw.ellipse((325,343,375,393), fill=ORANGE)
    for a in (0,90,180,270):
        ribbon(draw,arc_points(350,368,72,72,a+8,a+68),ORANGE,5)
    type_at(draw, 350, 628, 'THE STAN CO.   /   DROP 01', 25, CREAM, 'consolab.ttf')

GARMENTS = [
    ('first-show', (44,42,45), first_show),
    ('fire-flood', (226,214,188), fire_flood),
    ('small-fury', (61,68,42), small_fury),
    ('home-turf', (38,68,158), home_turf),
]

def recolor(sheet, front, base):
    ox = 0 if front else 768
    cropped = sheet.crop((ox,63,ox+768,963))
    tile = Image.new('RGBA',(780,900))
    tile.paste(cropped,(6,0))
    pixels = np.asarray(tile).astype(np.float32)
    luminance = pixels[:,:,0]*.3+pixels[:,:,1]*.55+pixels[:,:,2]*.15
    ratio = np.clip((luminance+38)/83,.32,1.56)**.92
    colored = np.zeros_like(pixels, dtype=np.uint8)
    for channel,value in enumerate(base):
        colored[:,:,channel]=np.clip(value*ratio,0,255)
    colored[:,:,3]=np.clip((pixels[:,:,3]-20)*1.16,0,255)
    return Image.fromarray(colored), ratio

def export_art(slug, draw_art, front):
    art=Image.new('RGBA',(SIZE,SIZE))
    draw_art(ImageDraw.Draw(art),front)
    suffix='-front-art.png' if front else '-art.png'
    art.save(OUT / f'{slug}{suffix}', optimize=True)
    return art

def make_mockup(sheet, slug, base, draw_art, front):
    shirt, ratio = recolor(sheet,front,base)
    art=export_art(slug,draw_art,front)
    size,x,y = (137,433,177) if front else (360,210,144)
    ink=art.resize((size,size),Image.Resampling.LANCZOS)
    ink_pixels=np.asarray(ink).copy()
    fabric_shade=np.clip(ratio[y:y+size,x:x+size]*.32+.70,.75,1.05)
    ink_pixels[:,:,:3] = np.clip(ink_pixels[:,:,:3]*fabric_shade[:,:,None],0,255)
    shirt.alpha_composite(Image.fromarray(ink_pixels),(x,y))
    suffix='front' if front else 'back'
    shirt.save(OUT / f'{slug}-{suffix}.webp', quality=88, method=6)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Render The Stan Co. garment mockups and print textures.')
    parser.add_argument('blank', nargs='?', type=Path, default=Path(__file__).with_suffix('.webp'))
    sheet = Image.open(parser.parse_args().blank).convert('RGBA')
    OUT.mkdir(parents=True,exist_ok=True)
    for slug,base,draw_art in GARMENTS:
        for front in (True,False):
            make_mockup(sheet,slug,base,draw_art,front)
        print(slug, flush=True)

