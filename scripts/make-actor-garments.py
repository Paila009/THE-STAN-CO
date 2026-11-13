"""Render original front and back graphics for The Stan Co. actor collections."""
from dataclasses import dataclass
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import math
import random
import argparse

from PIL import Image, ImageDraw, ImageFont

BASE = Path(__file__).resolve().parent
spec = spec_from_file_location("garment_mockups", BASE / "make-garments.py")
mockup = module_from_spec(spec)
spec.loader.exec_module(mockup)

CREAM = "#f3ead8"
ORANGE = "#ff6532"
LIME = "#d9f840"
INK = "#17191d"
MUTED_RED = "#c53534"

@dataclass(frozen=True)
class Tee:
    slug: str
    title: tuple
    collection: str
    body: tuple
    primary: str
    accent: str
    motif: str

TEES = (
    Tee("rebelwood", ("REBEL", "WOOD"), "REBELWOOD", (40, 39, 40), CREAM, ORANGE, "timber"),
    Tee("midnight-rebel", ("MIDNIGHT", "REBEL"), "REBELWOOD", (221, 209, 184), INK, MUTED_RED, "star"),
    Tee("red-sandal", ("GRAIN", "STUDY"), "GRAIN & GRIT", (55, 66, 43), "#d7f0d0", "#ffe0ad", "grain"),
    Tee("style-code", ("TRACK", "TYPE"), "GRAIN & GRIT", (47, 48, 50), LIME, "#bc92fd", "speed"),
    Tee("one-take", ("FRAME", "SHIFT"), "MOTION ARCHIVE", (32, 59, 153), "#d8f8ed", "#ff9c81", "viewfinder"),
    Tee("silver-screen", ("SILVER", "APERTURE"), "MOTION ARCHIVE", (222, 212, 188), "#18264c", "#5f82b9", "aperture"),
    Tee("fireline", ("THERMAL", "FIELD"), "HEATWAVE PRESS", (45, 42, 43), "#ff6a64", "#ffc570", "thermal"),
    Tee("rhythm-club", ("STEP", "DIAGRAM"), "HEATWAVE PRESS", (156, 69, 51), "#fbebd1", "#afecfa", "dance"),
    Tee("tiger-stride", ("TIGER", "HALFTONE"), "TIGER PRINT CLUB", (47, 46, 49), "#ff93ad", "#ffae62", "tiger"),
    Tee("storm-step", ("STORM", "GRID"), "TIGER PRINT CLUB", (193, 172, 131), "#252056", "#4e3eb1", "lightning"),
    Tee("power-signal", ("SIGNAL", "STACK"), "SIGNAL WORKS", (39, 39, 39), "#c3a2ff", "#deff67", "signal"),
    Tee("city-frequency", ("CITY", "WAVE"), "SIGNAL WORKS", (228, 219, 200), "#2446ad", "#a44429", "city"),
    Tee("small-wonders", ("MICRO", "PRINT"), "PITCH & PRINT", (56, 67, 45), "#b9efd5", "#dbbafd", "insect"),
    Tee("last-over", ("SCORECARD",), "PITCH & PRINT", (35, 64, 159), "#d5f0ff", "#ff9d5d", "cricket"),
)

def line(draw, points, color, width=6):
    draw.line(points, fill=color, width=width, joint="curve")

def type_at(draw, x, y, value, size, ink, family="impact.ttf"):
    mockup.type_at(draw, x, y, value, size, ink, family)

def oval(draw, x, y, rx, ry, ink, width=0):
    bounds = (x - rx, y - ry, x + rx, y + ry)
    if width:
        draw.ellipse(bounds, outline=ink, width=width)
    else:
        draw.ellipse(bounds, fill=ink)

def arc(draw, cx, cy, rx, ry, start, stop, ink, width=5):
    line(draw, mockup.arc_points(cx, cy, rx, ry, start, stop), ink, width)

def polar(cx, cy, radius, angle):
    return (cx + radius * math.cos(angle), cy + radius * math.sin(angle))

def corner_marks(draw, box, color, size=22, width=4):
    left, top, right, bottom = box
    for x, y, sx, sy in ((left, top, 1, 1), (right, top, -1, 1),
                         (left, bottom, 1, -1), (right, bottom, -1, -1)):
        line(draw, [(x, y + sy * size), (x, y), (x + sx * size, y)], color, width)

def spark(draw, cx, cy, size, color):
    points = [(cx, cy-size), (cx+size*.24, cy-size*.23),
              (cx+size, cy), (cx+size*.24, cy+size*.23),
              (cx, cy+size), (cx-size*.24, cy+size*.23),
              (cx-size, cy), (cx-size*.24, cy-size*.23)]
    draw.polygon(points, fill=color)

def footsteps(draw, x, y, angle, color):
    for offset_x, offset_y, rx, ry in ((0, -20, 12, 23), (-2, 10, 8, 9)):
        cx = x + offset_x * math.cos(angle) - offset_y * math.sin(angle)
        cy = y + offset_x * math.sin(angle) + offset_y * math.cos(angle)
        points = [
            (cx + rx * math.cos(step) * math.cos(angle) - ry * math.sin(step) * math.sin(angle),
             cy + rx * math.cos(step) * math.sin(angle) + ry * math.sin(step) * math.cos(angle))
            for step in (i * math.tau / 28 for i in range(28))
        ]
        draw.polygon(points, fill=color)

def center_mark(draw, tee):
    primary, accent = tee.primary, tee.accent
    kind = tee.motif
    if kind == "timber":
        oval(draw, 350, 336, 133, 132, accent)
        for i in range(7):
            rx, ry = 74 + 26*i, 51 + 23*i
            points = [
                (350 + math.cos(a)*rx + 10*math.sin(a*3+i),
                 345 + math.sin(a)*ry + 10*math.cos(a*2+i))
                for a in (j*math.tau/135 for j in range(136))
            ]
            line(draw, points, primary, 7)
        draw.polygon([(113, 456), (232, 366), (303, 416), (355, 352), (420, 416),
                      (487, 377), (592, 456), (592, 482), (113, 482)], fill=INK)
        line(draw, [(113,456),(232,366),(303,416),(355,352),(420,416),(487,377),(592,456)], primary, 7)
        line(draw, [(329, 376), (362, 408), (333, 464), (373, 482)], accent, 10)
    elif kind == "star":
        for n, size in enumerate((193, 165, 138, 102)):
            oval(draw, 350, 352, size, size*.79, primary if n%2==0 else accent, 5)
        for n in range(24):
            angle = n * math.tau / 24
            line(draw, [polar(350,352,145,angle), polar(350,352,200,angle)], primary, 3)
        spark(draw, 350, 352, 138, primary)
        spark(draw, 350, 352, 91, accent)
        spark(draw, 500, 238, 21, accent)
        spark(draw, 188, 458, 27, accent)
    elif kind == "grain":
        center = (346, 350)
        for index in range(13):
            rx = 29 + index * 18
            ry = 17 + index * 12
            points = [
                (center[0] + math.cos(angle) * rx + index * 2.2 * math.sin(3 * angle),
                 center[1] + math.sin(angle) * ry + index * 2.5 * math.cos(2 * angle) - index * 1.1)
                for angle in (step * math.tau / 180 for step in range(181))
            ]
            line(draw, points, accent if index % 4 == 0 else primary, 6 if index % 4 == 0 else 4)
        line(draw, [(117,350), (184,350), (255,370), (286,333), (348,350), (410,344), (476,329), (584,329)], accent, 8)
        for x, y in [(147,350), (286,333), (476,329), (554,329)]:
            oval(draw, x, y, 9, 9, primary)
        corner_marks(draw, (109, 185, 590, 514), accent, 27, 5)
    elif kind == "speed":
        for row in range(9):
            for col in range(12):
                if (row + col) % 2 == 0:
                    x = 121 + col * 34 + row * 10
                    y = 250 + row * 29 - col * 7
                    draw.polygon([(x,y), (x+35,y-7), (x+45,y+22), (x+10,y+29)], fill=primary if col < 8 else accent)
        route = [(142,405), (300,341), (269,310), (367,272), (445,284), (405,328), (567,304)]
        line(draw, route, INK, 41)
        line(draw, route, accent, 23)
        line(draw, route, primary, 6)
        for x, y in [route[0], route[-1]]:
            oval(draw, x, y, 18, 18, primary)
            oval(draw, x, y, 8, 8, INK)
    elif kind == "viewfinder":
        for offset, ink in [(0, primary), (48, accent), (96, primary)]:
            corner_marks(draw, (111+offset, 205+offset/2, 496+offset, 431+offset/2), ink, 32, 6)
        for x in (187, 281, 375, 469, 563):
            for y in (218, 286, 354, 422, 490):
                line(draw, [(x-4,y), (x+4,y)], primary, 2)
                line(draw, [(x,y-4), (x,y+4)], primary, 2)
        line(draw, [(171,422), (251,379), (363,378), (520,267)], accent, 9)
        oval(draw, 362, 377, 59, 59, primary, 5)
        oval(draw, 362, 377, 10, 10, accent)
    elif kind == "aperture":
        for offset in range(8):
            x = 109 + offset * 69
            line(draw, [(x,204), (x,506)], accent, 2)
            y = 207 + offset * 44
            line(draw, [(109,y), (591,y)], accent, 2)
        oval(draw, 350, 353, 147, 147, primary)
        for i in range(9):
            angle = i * math.tau / 9
            draw.polygon([polar(350,353,146,angle), polar(350,353,146,angle+.54),
                          polar(350,353,68,angle+1.42), polar(350,353,60,angle+2.12)],
                         fill=accent if i % 2 else CREAM)
        oval(draw, 350, 353, 59, 59, primary)
        oval(draw, 350, 353, 160, 160, primary, 5)
        corner_marks(draw, (98, 191, 602, 519), primary, 24, 5)
    elif kind == "thermal":
        for i in range(11):
            radius_x, radius_y = 25 + 19 * i, 20 + 13 * i
            points = [
                (350 + radius_x * (1+.19*math.cos(angle*3)) * math.cos(angle),
                 357 + radius_y * (1+.22*math.sin(angle*2)) * math.sin(angle))
                for angle in (n * math.tau / 124 for n in range(125))
            ]
            line(draw, points, primary if i > 4 else accent, 8 if i % 3 == 0 else 4)
        for x in (114, 585):
            for y in range(205, 513, 27):
                line(draw, [(x-9,y), (x+9,y)], accent, 4)
        oval(draw, 350, 357, 7, 7, accent)
    elif kind == "dance":
        for n in range(5):
            rx = 111 + n*19
            arc(draw,350,351,rx,rx*.82,18+n*11,326-n*3,primary if n%2 else accent,5)
        path = [(196,427), (254,385), (301,405), (347,343), (410,357), (462,298), (519,263)]
        line(draw,path,primary,5)
        for n,(x,y) in enumerate(path):
            footsteps(draw,x,y,math.radians((n%2)*46+18), accent)
            oval(draw,x,y,4,4,INK)
        spark(draw,450,431,34,accent)
        spark(draw,261,276,22,accent)
    elif kind == "tiger":
        mask = Image.new("L", (700, 700))
        shape = ImageDraw.Draw(mask)
        shape.polygon([(154,231),(256,194),(324,228),(376,228),(444,194),(546,231),
                       (523,324),(492,402),(427,468),(350,506),(273,468),(208,402),(177,324)], fill=255)
        for y in range(196, 507, 9):
            for x in range(154, 547, 9):
                if mask.getpixel((x,y)) == 255:
                    stripe = math.sin((abs(x - 350) * .024 + y * .074))
                    radius = 2 + round((1 + stripe) * 1.2)
                    oval(draw, x, y, radius, radius, accent if stripe > 0 else primary)
        for side in (-1, 1):
            eye = [(350+side*x,y) for x,y in [(31,347),(104,322),(91,347),(39,358)]]
            draw.polygon(eye, fill=INK)
            line(draw, [eye[0],eye[1]], primary, 6)
        draw.polygon([(327,416),(373,416),(350,440)], fill=accent)
        spark(draw, 350, 279, 18, primary)
    elif kind == "lightning":
        left, top, right, bottom = 132, 207, 568, 503
        for x in range(left, right+1, 33):
            line(draw, [(x,top),(350+(x-350)*.87,bottom)], accent, 3)
        for i in range(9):
            y = top + (i/8)**1.43 * (bottom-top)
            line(draw, [(left,y),(right,y)], accent, 3)
        for shift in (-47, 0, 47):
            bolt = [(x+shift,y) for x,y in [(392,214),(273,357),(351,352),(311,486),(445,314),(368,320)]]
            if shift:
                draw.polygon(bolt, outline=primary, width=5)
            else:
                draw.polygon(bolt, fill=primary)
        corner_marks(draw,(left-5,top-7,right+6,bottom+6),primary,23,5)
    elif kind == "signal":
        for row in range(6):
            y = 227 + row * 51
            offset = row * 9
            points = [(x, y + (23 - row) * math.sin(x / 22 + row*.72)
                       * math.exp(-((x-350-offset)/115)**2)) for x in range(108, 596, 4)]
            line(draw, points, accent if row in (1,4) else primary, 6 if row in (1,4) else 4)
            oval(draw, 105, y, 6, 6, accent)
        line(draw, [(350,199),(350,501)], primary, 3)
        corner_marks(draw, (87, 193, 608, 516), primary, 20, 4)
    elif kind == "city":
        skyline = [(149,442),(149,337),(203,337),(203,301),(242,301),(242,352),(263,352),(263,269),
                   (313,269),(313,318),(342,318),(342,225),(389,225),(389,301),(423,301),(423,263),
                   (459,263),(459,331),(510,331),(510,282),(550,282),(550,442)]
        draw.polygon(skyline,fill=primary)
        for i in range(7):
            path = [(x,390+i*15+24*math.sin(x/59+i*.4)) for x in range(138,563,5)]
            line(draw,path,accent,6)
        for x,y in [(178,355),(217,325),(278,287),(356,245),(436,284),(522,300)]:
            draw.rectangle((x,y,x+12,y+10),fill=CREAM)
        corner_marks(draw,(128,204,573,493),accent,31,5)
    elif kind == "insect":
        oval(draw,350,343,153,139,accent,7)
        oval(draw,350,343,135,124,primary,3)
        line(draw,[(468,438),(532,496)],accent,22)
        oval(draw,350,355,24,77,primary)
        oval(draw,350,287,18,25,primary)
        rng = random.Random(25)
        for side in (-1, 1):
            wing = [(350+side*x,y) for x,y in [(13,345),(43,279),(100,260),(118,281),(104,335),(73,372),(16,377)]]
            draw.polygon(wing,outline=primary,width=7)
            for x,y in [(42,278),(68,267),(99,261),(116,280),(104,333),(75,371)]:
                line(draw,[(350+side*17,357),(350+side*50,330),(350+side*x,y)],accent,3)
            for x in range(36,103,12):
                for y in range(288,351,12):
                    radius=rng.randint(1,3)
                    oval(draw,350+side*x,y,radius,radius,accent)
        spark(draw,195,252,25,primary)
    elif kind == "cricket":
        oval(draw,350,349,202,151,primary,6)
        oval(draw,350,349,182,133,primary,3)
        draw.rectangle((304,233,396,466),outline=primary,width=5)
        for y in (268,290,403,426):
            line(draw,[(275,y),(425,y)],primary,5)
        for x in (334,350,366):
            line(draw,[(x,258),(x,285)],accent,6)
            line(draw,[(x,413),(x,440)],accent,6)
        for rx,ry,start,end in [(134,101,25,180),(158,121,205,354)]:
            arc(draw,350,349,rx,ry,start,end,accent,7)
        oval(draw,465,305,22,22,accent)
        arc(draw,465,305,14,18,82,272,primary,4)
        for x,y in [(207,298),(237,384),(477,405),(498,360)]:
            oval(draw,x,y,5,5,primary)

def chest_badge(draw, tee):
    primary, accent = tee.primary, tee.accent
    if tee.motif in {"timber","star","grain","aperture","signal","insect","cricket"}:
        oval(draw,350,323,214,184,primary,22)
        oval(draw,350,323,178,148,accent,13)
        for a in (0, math.pi/2, math.pi, 3*math.pi/2):
            line(draw,[polar(350,323,128,a),polar(350,323,152,a)],primary,16)
        if tee.motif in {"timber","grain"}:
            for n in range(4):
                arc(draw,350,323,35+n*21,24+n*15,0,360,accent if n%2 else primary,13)
        elif tee.motif == "cricket":
            draw.rectangle((305,222,395,424),outline=primary,width=15)
            for y in (264,378):
                line(draw,[(286,y),(414,y)],accent,13)
        else:
            spark(draw,350,323,99,accent)
    else:
        corner_marks(draw,(126,175,574,476),primary,76,21)
        draw.polygon([(163,389),(334,227),(321,311),(535,223),(380,405),(397,324)],fill=accent)
        line(draw,[(219,434),(494,434)],primary,17)
    phrase = "REBELWOOD" if tee.collection == "REBELWOOD" else " ".join(tee.title)
    type_at(draw,350,546,phrase,63 if len(phrase)<13 else 49,primary)
    line(draw,[(269,596),(432,596)],accent,9)

def back_print(draw, tee, number):
    primary, accent = tee.primary, tee.accent
    corner_marks(draw,(63,47,637,653),accent,22,5)
    type_at(draw,102,76,"STAN /",22,primary,"consolab.ttf")
    type_at(draw,585,76,f"{number:02d}",22,accent,"consolab.ttf")
    width = max(len(word) for word in tee.title)
    title_size = min(110, int(910 / (width+4)))
    type_at(draw,350,141,tee.title[0],title_size,primary)
    center_mark(draw,tee)
    type_at(draw,350,554,tee.title[1],title_size,primary)
    line(draw,[(109,611),(591,611)],accent,4)
    type_at(draw,350,635,tee.collection,24,primary,"consolab.ttf")

ARCHIVE_FONT = "arialnb.ttf"
MONO_FONT = "consolab.ttf"

def artwork_panel(tee):
    artwork = Image.new("RGBA", (700, 700))
    center_mark(ImageDraw.Draw(artwork), tee)
    return artwork.crop(artwork.getbbox())

def place_art(draw, artwork, box):
    left, top, right, bottom = box
    scaled = artwork.copy()
    scaled.thumbnail((right-left, bottom-top), Image.Resampling.LANCZOS)
    origin = (left + (right-left-scaled.width)//2, top + (bottom-top-scaled.height)//2)
    draw._image.alpha_composite(scaled, origin)

def fit_type(draw, x, y, label, width, max_size, ink, family=ARCHIVE_FONT, anchor="la"):
    font_size = max_size
    font = ImageFont.truetype(str(mockup.FONTS / family), font_size)
    while font.getlength(label) > width:
        font_size -= 2
        font = ImageFont.truetype(str(mockup.FONTS / family), font_size)
    draw.text((x,y), label, fill=ink, font=font, anchor=anchor)

def print_head(draw, tee, number):
    fit_type(draw, 70, 62, tee.collection, 492, 29, tee.primary, MONO_FONT)
    fit_type(draw, 633, 62, f"{number:02d}", 55, 29, tee.accent, MONO_FONT, "ra")
    line(draw, [(69,104), (631,104)], tee.accent, 4)

def print_foot(draw, tee, label):
    line(draw, [(69,600), (631,600)], tee.accent, 4)
    fit_type(draw, 69, 617, "THE STAN CO.", 247, 23, tee.primary, MONO_FONT)
    fit_type(draw, 631, 617, label, 275, 23, tee.primary, MONO_FONT, "ra")

def studio_poster(draw, tee, number, artwork):
    print_head(draw, tee, number)
    fit_type(draw, 71, 114, tee.title[0], 500, 102, tee.primary)
    fit_type(draw, 629, 492, tee.title[-1], 495, 100, tee.primary, anchor="ra")
    line(draw, [(70,219), (70,569), (241,569)], tee.accent, 4)
    line(draw, [(577,215), (631,215), (631,451)], tee.accent, 4)
    place_art(draw, artwork, (78,218,624,515))
    print_foot(draw, tee, "PRINT STUDY")

def film_strip(draw, tee, number, artwork):
    print_head(draw, tee, number)
    box = (68, 126, 633, 491)
    draw.rectangle(box, outline=tee.primary, width=5)
    for x in range(85,622,35):
        for y in (144,463):
            draw.rounded_rectangle((x,y,x+20,y+11),radius=2,fill=tee.accent)
    place_art(draw, artwork, (77,173,621,456))
    fit_type(draw, 70, 490, " ".join(tee.title), 560, 88, tee.primary)
    print_foot(draw, tee, "MOTION STUDY")

def press_sheet(draw, tee, number, artwork):
    print_head(draw, tee, number)
    fit_type(draw, 70, 114, " ".join(tee.title), 560, 86, tee.primary)
    corner_marks(draw, (71,213,630,571), tee.accent, 28, 6)
    place_art(draw, artwork, (93,218,607,562))
    for x in range(103,604,37):
        line(draw, [(x,573), (x,583)], tee.accent, 3)
    print_foot(draw, tee, "PRESS PROOF")

def tiger_sheet(draw, tee, number, artwork):
    print_head(draw, tee, number)
    box = (75, 126, 625, 493)
    corner_marks(draw, box, tee.accent, 51, 5)
    line(draw, [(347,132),(347,185)],tee.accent,4)
    line(draw, [(347,447),(347,488)],tee.accent,4)
    place_art(draw, artwork, (100,151,600,476))
    fit_type(draw, 350, 490, " ".join(tee.title), 550, 88, tee.primary, anchor="ma")
    print_foot(draw, tee, "INK SEPARATION")

def signal_sheet(draw, tee, number, artwork):
    print_head(draw, tee, number)
    fit_type(draw, 70, 113, tee.title[0], 546, 102, tee.primary)
    draw.rectangle((73,224,627,469), outline=tee.accent, width=4)
    for y in range(249,470,32):
        line(draw, [(76,y),(97,y)], tee.accent, 3)
        line(draw, [(604,y),(626,y)], tee.accent, 3)
    place_art(draw, artwork, (103,231,597,461))
    fit_type(draw, 70, 484, tee.title[-1], 546, 101, tee.primary)
    print_foot(draw, tee, "FIELD RECORD")

def field_sheet(draw, tee, number, artwork):
    print_head(draw, tee, number)
    fit_type(draw, 70, 112, " ".join(tee.title), 556, 91, tee.primary)
    left, top, right, bottom = 70, 220, 631, 568
    draw.rounded_rectangle((left,top,right,bottom),radius=29,outline=tee.primary,width=4)
    for x in range(90,615,31):
        line(draw, [(x,top+1),(x,top+14)], tee.accent, 3)
        line(draw, [(x,bottom-14),(x,bottom-1)], tee.accent, 3)
    place_art(draw, artwork, (91,242,612,554))
    print_foot(draw, tee, "OBSERVATION SERIES")

SERIES = {
    "GRAIN & GRIT": studio_poster,
    "MOTION ARCHIVE": film_strip,
    "HEATWAVE PRESS": press_sheet,
    "TIGER PRINT CLUB": tiger_sheet,
    "SIGNAL WORKS": signal_sheet,
    "PITCH & PRINT": field_sheet,
}

def refreshed_chest(draw, tee, artwork):
    place_art(draw, artwork, (141,143,559,481))
    line(draw, [(146,520),(554,520)], tee.accent, 12)
    fit_type(draw, 350, 550, " ".join(tee.title), 501, 81, tee.primary, anchor="ma")

def design(tee, number):
    def render(draw, front):
        if tee.collection == "REBELWOOD":
            if front:
                chest_badge(draw,tee)
            else:
                back_print(draw,tee,number)
            return

        artwork = artwork_panel(tee)
        if front:
            refreshed_chest(draw, tee, artwork)
        else:
            SERIES[tee.collection](draw, tee, number, artwork)

    return render

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh-only", action="store_true", help="Regenerate all collections except Rebelwood")
    args = parser.parse_args()
    sheet = Image.open(BASE / "make-garments.webp").convert("RGBA")
    mockup.OUT.mkdir(parents=True,exist_ok=True)
    for number, tee in enumerate(TEES,1):
        if args.refresh_only and tee.collection == "REBELWOOD":
            continue
        for front in (True, False):
            mockup.make_mockup(sheet,tee.slug,tee.body,design(tee,number),front)
        print(tee.slug,flush=True)

if __name__ == "__main__":
    main()