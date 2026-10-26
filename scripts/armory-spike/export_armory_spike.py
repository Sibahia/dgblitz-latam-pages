"""Build the Armory Session 0 asset spike.

Reads the read-only Dungeon Blitz client dump with FFDec, restores the common
sprite origin from the SWF XML bounds, applies GearTypes ColorSwaps, and writes
the sample 56/112 px icons plus the selected UI pieces.

Run from the repository root:
    python scripts/armory-spike/export_armory_spike.py [--force]

The external dump is only read; no file there is modified.
"""

from pathlib import Path
import math
import shutil
import subprocess
import sys

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
DUMP = Path(
    r"C:\Users\danie\Downloads\Daniel\Dev\Code\dungeon-blitz\src\client\content\localhost\p"
)
FFDEC = Path(
    r"C:\Users\danie\Downloads\Daniel\Dev\Code\dungeon-blitz\tools\ffdec\ffdec-cli.exe"
)
ASSETS = ROOT / "src" / "assets" / "game" / "armory"
SPIKE = ROOT / "scripts" / "armory-spike"
OUT = SPIKE / "out"
RAW = OUT / "raw"
GEAR_SWF = DUMP / "cbp" / "Gfx_Paladin_1.swf"

UI_SWFS = {
    "UI_1": DUMP / "cbp" / "UI_1.swf",
    "UI_4": DUMP / "cbp" / "UI_4.swf",
    "UI_Library": DUMP / "caa" / "UI_Library.swf",
}
UI_PIECES = {
    "UI_1": [2527, 2525, 2530],
    "UI_4": [2120, 2465],
    "UI_Library": [785, 781, 783, 768, 1071, 1070, 1125],
}
PLATES = {"bronze": 785, "silver": 781, "gold": 783}
SLOT = 2120

BOUNDS = {
    20: [-1617, 210, -1029, 595],
    371: [-1799, -875, 854, 714],
    3948: [-672, -714, 791, 749],
    2881: [-287, -343, 280, 336],
    2717: [-378, -350, 350, 329],
    2619: [-336, -308, 336, 301],
    2523: [-420, -406, 343, 364],
}

NAMED_COLORS = {
    "gGold": (0xE6, 0xBB, 0x32),
    "gGoldDk": (0x99, 0x7C, 0x21),
    "gBronze": (0xFF, 0xCC, 0x7F),
    "gBronzeDk": (0xA6, 0x6C, 0x17),
    "gPaleBrown": (0x99, 0x69, 0x4C),
    "gPaleBrownDk": (0x5E, 0x3A, 0x22),
    "gSilver": (0xD5, 0xD7, 0xBF),
    "gSilverDk": (0x8A, 0x8C, 0x7C),
}

AXE_SWAPS = {
    "0xD0F0F0": "0xCCCCCC",
    "0x80C0F0": "0x666666",
    "0x0070E0": "0x333333",
    "0xFF9999": "0x666666",
    "0xB00000": "0x333333",
    "0xF0F0F0": "0xCCC7C2",
    "0xCCCCCC": "0x95908A",
    "0xA5A5A5": "0x625C55",
}
ARMOR_R_SWAPS = {
    "0x80C0F0": "0xCAD1D9",
    "0x0070E0": "0x9FACBB",
    "0xB00000": "0xA30006",
    "0x600000": "0x660F11",
}
ARMOR_M_SWAPS = {
    "0x80C0F0": "0x5B6642",
    "0x0070E0": "0x394029",
    "0xB00000": "gPaleBrown",
    "0x600000": "gPaleBrownDk",
}
GLOVE_L_SWAPS = {
    "0x80C0F0": "0xB2DAA7",
    "0x0070E0": "0x77BA74",
    "0xB00000": "0x2DA537",
    "0x600000": "0x3A783E",
}

SAMPLES = [
    {
        "name": "AxeStarter1",
        "layers": [20, 371],
        "swaps": AXE_SWAPS,
        "plate": "bronze",
        "rarity": "M",
        "slot": "weapon",
    },
    {
        "name": "ArmorStore3R",
        "layers": [3948],
        "swaps": ARMOR_R_SWAPS,
        "plate": "silver",
        "rarity": "R",
        "slot": "armor",
    },
    {
        "name": "BracersStore6L",
        "layers": [2881, 2717, 2619, 2523],
        "swaps": GLOVE_L_SWAPS,
        "plate": "gold",
        "rarity": "L",
        "slot": "gloves",
    },
]

VERIFY_SAMPLE = {
    "name": "ArmorStore3-M",
    "layers": [3948],
    "swaps": ARMOR_M_SWAPS,
    "plate": "bronze",
    "rarity": "M",
    "slot": "armor",
}


def ffdec(*args):
    subprocess.run([str(FFDEC), *map(str, args)], check=True)


def raw_is_empty(path, pattern):
    return not list(path.glob(pattern))


def export_raw(force=False):
    if force and RAW.exists():
        shutil.rmtree(RAW)
    gear_raw = RAW / "gear"
    if raw_is_empty(gear_raw, "**/*.png"):
        gear_raw.mkdir(parents=True, exist_ok=True)
        ids = sorted({cid for sample in SAMPLES for cid in sample["layers"]})
        ffdec(
            "-format",
            "sprite:png",
            "-zoom",
            "8",
            "-ignorebackground",
            "-selectid",
            ",".join(str(cid) for cid in ids),
            "-export",
            "sprite",
            gear_raw,
            GEAR_SWF,
        )
    for swf_name, ids in UI_PIECES.items():
        ui_raw = RAW / "ui" / swf_name
        if raw_is_empty(ui_raw, "**/*.png"):
            ui_raw.mkdir(parents=True, exist_ok=True)
            ffdec(
                "-format",
                "sprite:png",
                "-zoom",
                "4",
                "-ignorebackground",
                "-selectid",
                ",".join(str(cid) for cid in ids),
                "-export",
                "sprite",
                ui_raw,
                UI_SWFS[swf_name],
            )


def find_sprite(base, cid):
    matches = list(base.rglob(f"DefineSprite_{cid}_*/1.png"))
    if not matches:
        raise FileNotFoundError(f"sprite {cid} not found under {base}")
    return matches[0]


def sprite_class(path):
    return path.parent.name.split("_", 2)[2]


def resolve_color(token):
    if token.startswith("0x"):
        value = int(token, 16)
        return ((value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF)
    return NAMED_COLORS[token]


def parse_swaps(mapping):
    return {resolve_color(source): resolve_color(target) for source, target in mapping.items()}


def recolor(image, mapping):
    pixels = list(image.getdata())
    out = []
    changed = 0
    for r, g, b, a in pixels:
        if a and (r, g, b) in mapping:
            r, g, b = mapping[(r, g, b)]
            changed += 1
        out.append((r, g, b, a))
    image.putdata(out)
    return changed


def compose(ids, swaps):
    raw = RAW / "gear"
    layers = [Image.open(find_sprite(raw, cid)).convert("RGBA") for cid in ids]
    left = min(BOUNDS[cid][0] for cid in ids)
    top = min(BOUNDS[cid][1] for cid in ids)
    right = max(BOUNDS[cid][2] for cid in ids)
    bottom = max(BOUNDS[cid][3] for cid in ids)
    zoom = 8
    width = math.ceil((right - left) * zoom / 20)
    height = math.ceil((bottom - top) * zoom / 20)
    placed = []
    for cid, image in zip(ids, layers):
        x = round((BOUNDS[cid][0] - left) * zoom / 20)
        y = round((BOUNDS[cid][1] - top) * zoom / 20)
        placed.append((image, x, y))
        width = max(width, x + image.width)
        height = max(height, y + image.height)
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for image, x, y in placed:
        canvas.alpha_composite(image, (x, y))
    changed = recolor(canvas, parse_swaps(swaps))
    print(f"  composed {ids} -> {canvas.width}x{canvas.height}, {changed} px recolored")
    return canvas


def trim(image):
    box = image.getbbox()
    return image.crop(box) if box else image


def fit(image, size):
    image = trim(image)
    scale = min(size / image.width, size / image.height)
    return image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.Resampling.LANCZOS,
    )


def render_icon(image, size, margin):
    art = fit(image, size - 2 * margin)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(art, ((size - art.width) // 2, (size - art.height) // 2))
    return canvas


def save_icon(image, name, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    for size, margin in ((56, 2), (112, 4)):
        render_icon(image, size, margin).save(out_dir / f"{name}-{size}.png")


def make_plate(image, name, plate):
    ui_raw = RAW / "ui" / "UI_Library"
    source = find_sprite(ui_raw, PLATES[plate])
    canvas = Image.open(source).convert("RGBA").resize((80, 80), Image.Resampling.LANCZOS)
    art = fit(image, 52)
    canvas.alpha_composite(art, ((80 - art.width) // 2, (80 - art.height) // 2))
    path = OUT / "plates"
    path.mkdir(parents=True, exist_ok=True)
    canvas.save(path / f"{name}-80.png")


def make_slot(image, name):
    ui_raw = RAW / "ui" / "UI_4"
    source = find_sprite(ui_raw, SLOT)
    canvas = Image.open(source).convert("RGBA").resize((64, 64), Image.Resampling.LANCZOS)
    art = fit(image, 48)
    canvas.alpha_composite(art, ((64 - art.width) // 2, (64 - art.height) // 2))
    path = OUT / "slots"
    path.mkdir(parents=True, exist_ok=True)
    canvas.save(path / f"{name}-64.png")


def copy_ui():
    ui_dir = ASSETS / "ui"
    ui_dir.mkdir(parents=True, exist_ok=True)
    for swf_name, ids in UI_PIECES.items():
        ui_raw = RAW / "ui" / swf_name
        for cid in ids:
            source = find_sprite(ui_raw, cid)
            target = ui_dir / f"{sprite_class(source)}.png"
            shutil.copyfile(source, target)
            print(f"  UI {target.name}")


def main():
    export_raw(force="--force" in sys.argv)
    icons_dir = ASSETS / "icons"
    for sample in SAMPLES:
        print(f"sample {sample['name']}")
        composed = compose(sample["layers"], sample["swaps"])
        save_icon(composed, sample["name"], icons_dir)
        make_plate(composed, sample["name"], sample["plate"])
        make_slot(composed, sample["name"])
    print(f"verify {VERIFY_SAMPLE['name']} (named ColorSwap)")
    verify = compose(VERIFY_SAMPLE["layers"], VERIFY_SAMPLE["swaps"])
    save_icon(verify, VERIFY_SAMPLE["name"], OUT / "verify")
    make_plate(verify, VERIFY_SAMPLE["name"], VERIFY_SAMPLE["plate"])
    copy_ui()
    print("done")


if __name__ == "__main__":
    main()
