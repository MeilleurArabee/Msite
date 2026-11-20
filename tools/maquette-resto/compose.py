import sys, os
from PIL import Image, ImageDraw, ImageFilter

D = os.path.dirname(os.path.abspath(__file__))

def rounded(im, r):
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], r, fill=255)
    out = im.convert('RGBA'); out.putalpha(m); return out

def shadow(canvas, box, r, blur=28, alpha=110, off=(0, 18)):
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    x0, y0, x1, y1 = box
    ImageDraw.Draw(sh).rounded_rectangle([x0 + off[0], y0 + off[1], x1 + off[0], y1 + off[1]], r, fill=(70, 45, 20, alpha))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))

def compose(i):
    W, H = 1600, 1000
    c = Image.new('RGBA', (W, H), (232, 219, 196, 255))
    # léger dégradé chaud
    g = Image.new('RGBA', (W, H)); gd = ImageDraw.Draw(g)
    for y in range(H):
        t = y / H; gd.line([(0, y), (W, y)], fill=(int(236 - 14 * t), int(224 - 18 * t), int(202 - 22 * t), 255))
    c.alpha_composite(g)
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([200, -300, 1300, 600], fill=(255, 246, 228, 120))
    c.alpha_composite(glow.filter(ImageFilter.GaussianBlur(120)))
    pc = Image.open(f'{D}/s-{i}-pc.png').convert('RGB').resize((1280, 800), Image.LANCZOS)
    tel = Image.open(f'{D}/s-{i}-tel.png').convert('RGB').resize((360, 779), Image.LANCZOS)
    px, py = 60, 100
    shadow(c, (px, py, px + 1280, py + 800), 18)
    c.alpha_composite(rounded(pc, 18), (px, py))
    tx, ty = W - 60 - 360, H - 60 - 779
    shadow(c, (tx, ty, tx + 360, ty + 779), 34, blur=30, alpha=150)
    # fin liseré clair autour de l'écran téléphone
    ring = Image.new('RGBA', (368, 787), (0, 0, 0, 0))
    ImageDraw.Draw(ring).rounded_rectangle([0, 0, 367, 786], 38, fill=(252, 247, 238, 255))
    c.alpha_composite(ring, (tx - 4, ty - 4))
    c.alpha_composite(rounded(tel, 34), (tx, ty))
    c.convert('RGB').resize((1200, 750), Image.LANCZOS).save(f'{D}/mail-{i}.jpg', quality=86, optimize=True)

for i in sys.argv[1:]:
    compose(i); print('ok', i)
