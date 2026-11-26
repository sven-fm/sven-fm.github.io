#!/usr/bin/env bash
# Subset + instance the two variable fonts for sven.fm (Latin incl. German umlauts).
# Requires: pip install fonttools brotli
set -euo pipefail
SRC=${SRC:-.}
OUT=${OUT:-assets/fonts}
mkdir -p "$OUT" .tmp
U="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+2013,U+2018-201A,U+201C-201E,U+2026,U+20AC,U+2212"
FEAT="kern,liga,calt,ccmp,locl,mark,mkmk,tnum,lnum,pnum,case"
# Funnel Display: headings only use 700 to 800; keep 600..800 so a heavier/lighter tweak needs no re-export.
fonttools varLib.instancer "$SRC/FunnelDisplay[wght].ttf" wght=600:800 -o .tmp/funnel.ttf
pyftsubset .tmp/funnel.ttf --unicodes="$U" --layout-features="$FEAT" --flavor=woff2 \
  --no-hinting --desubroutinize --name-IDs='*' --output-file="$OUT/funnel-display-latin-600-800.woff2"
# Host Grotesk: body 400, UI 500/600, figures 600, panel readout animates 300 to 600.
fonttools varLib.instancer "$SRC/HostGrotesk[wght].ttf" wght=300:700 -o .tmp/host.ttf
pyftsubset .tmp/host.ttf --unicodes="$U" --layout-features="$FEAT" --flavor=woff2 \
  --no-hinting --desubroutinize --name-IDs='*' --output-file="$OUT/host-grotesk-latin-300-700.woff2"
rm -rf .tmp
ls -l "$OUT"/*.woff2
