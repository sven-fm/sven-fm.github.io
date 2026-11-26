#!/usr/bin/env python3
"""Stylized hero portrait for sven.fm (C3 Signal).

High-contrast mono, background crushed into the panel colour (#0F0F0E),
lower body burned to black so the name can sit on top, light grain.
Re-run on a higher-resolution original (>= 1800 px tall) before launch.

usage: python3 stylize-portrait.py SOURCE.jpg OUT_DIR
needs: pip install pillow numpy   (Pillow >= 11 with AVIF support)
"""
import sys, os
import numpy as np
from PIL import Image

PANEL = np.array([15, 15, 14], np.float32)    # --panel  #0F0F0E
LIGHT = np.array([243, 241, 236], np.float32)  # --panel-ink #F3F1EC


def stylize(src):
    a = np.asarray(Image.open(src).convert("L")).astype(np.float32) / 255
    a = np.clip((a - 0.16) / (0.92 - 0.16), 0, 1) ** 1.15   # crush background, open face
    a = 0.5 - 0.5 * np.cos(np.pi * a)                          # S-curve
    y = np.linspace(0, 1, a.shape[0])[:, None]
    a *= 0.10 + 0.90 * np.clip(1 - (y - 0.58) / 0.30, 0, 1) ** 1.6  # burn lower body
    a *= 0.80                                                  # low-key ceiling: light type stays readable
    a = np.clip(a + np.random.default_rng(7).normal(0, 0.022, a.shape), 0, 1)  # grain
    return Image.fromarray((PANEL + (LIGHT - PANEL) * a[..., None]).astype(np.uint8), "RGB")


def main():
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    img = stylize(src)
    for w in (img.width, img.width // 2):
        im = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS) if w != img.width else img
        im.save(os.path.join(out, f"sven-portrait-{w}.avif"), quality=58, speed=4)
        im.save(os.path.join(out, f"sven-portrait-{w}.webp"), quality=80, method=6)
    for f in sorted(os.listdir(out)):
        if f.startswith("sven-portrait"):
            print(f, os.path.getsize(os.path.join(out, f)), "bytes")


if __name__ == "__main__":
    main()
