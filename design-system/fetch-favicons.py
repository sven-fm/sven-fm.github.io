#!/usr/bin/env python3
"""
sven.fm — portfolio favicon fetcher

Pulls each portfolio company's favicon from DuckDuckGo's icon service ONCE
and stores it as a 32px PNG in /assets/portfolio/<domain>.png, so the live
page makes no third-party request per visitor. The page's letter chip stays
the fallback for anything missing here.

  python3 design-system/fetch-favicons.py            # from the repo root

Domains are read from the data-domain attributes in index.html. A 404, a
blank image or DuckDuckGo's generic placeholder is skipped, not saved.
Requires Pillow.
"""
import hashlib, io, os, re, sys, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "portfolio")
os.makedirs(OUT, exist_ok=True)
domains = sorted(set(re.findall(r'data-domain="([^"]+)"', open(os.path.join(ROOT, "index.html")).read())))
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0 Safari/537.36"

payloads = {}
for d in domains:
    try:
        req = urllib.request.Request(f"https://icons.duckduckgo.com/ip3/{d}.ico", headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
    except Exception as e:
        print(f"skip {d}: {e}"); continue
    payloads[d] = hashlib.md5(data).hexdigest()
    try:
        im = Image.open(io.BytesIO(data))
        if im.format == "ICO":
            im.size = sorted(im.info.get("sizes", {im.size}))[-1]; im.load()
        im = im.convert("RGBA")
        if im.width < 8 or im.height < 8: print(f"skip {d}: tiny"); continue
        colours = im.getcolors(maxcolors=64)
        if colours and len(colours) <= 1: print(f"skip {d}: blank"); continue
        im.resize((32, 32), Image.LANCZOS).save(os.path.join(OUT, f"{d}.png"), optimize=True)
        print(f"ok   {d}")
    except Exception as e:
        print(f"skip {d}: {e}")

# The same bytes for several unrelated domains is DuckDuckGo's placeholder.
seen = {}
for d, h in payloads.items(): seen.setdefault(h, []).append(d)
for group in (g for g in seen.values() if len(g) > 1):
    for d in group:
        p = os.path.join(OUT, f"{d}.png")
        if os.path.exists(p): os.remove(p); print(f"drop {d}: placeholder shared with {[x for x in group if x != d]}")
