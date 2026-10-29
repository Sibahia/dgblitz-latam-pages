"""Export the three Paladin weapon icons used by the Session 3 vertical slice.

Run from the repository root:
    python scripts/armory-spike/export_armory_slice.py

The external dump is only read; the generated PNGs are later converted to WebP
by `pnpm assets:optimize`.
"""

from pathlib import Path
import json
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import export_armory_spike as spike  # noqa: E402

ROOT = spike.ROOT
DATA = ROOT / "src" / "features" / "armory" / "data" / "paladin.json"

SLICE = [
    {"itemId": 1, "name": "AxeStarter1"},
    {"itemId": 2, "name": "GoblinChopperM", "layers": [20, 391]},
    {"itemId": 3, "name": "IllyricAxeM", "layers": [20, 335]},
]

BOUNDS = {
    20: [-1617, 210, -1029, 595],
    371: [-1799, -875, 854, 714],
    391: [-1841, -1134, 889, 777],
    335: [-1897, -1008, 1442, 763],
}

AXE_LAYERS = [20, 371]


def swaps_from_icon_key(icon_key):
    tail = icon_key.split("#", 1)[1] if "#" in icon_key else ""
    mapping = {}
    for part in tail.split("|"):
        if "=" not in part:
            continue
        source, target = part.split("=", 1)
        mapping[source] = target
    return mapping


def variant_for(item, rarity="M"):
    return next(variant for variant in item["variants"] if variant["rarity"] == rarity)


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    items = {item["id"]: item for item in data["items"]}

    spike.BOUNDS.update(BOUNDS)
    for sample in SLICE:
        layers = sample.get("layers", AXE_LAYERS)
        spike.SAMPLES.append(
            {
                "name": sample["name"],
                "layers": layers,
                "swaps": {},
                "plate": "bronze",
                "rarity": "M",
                "slot": "weapon",
            }
        )

    spike.export_raw(force=True)

    icons_dir = spike.ASSETS / "icons"
    for sample in SLICE:
        item = items[sample["itemId"]]
        variant = variant_for(item)
        swaps = swaps_from_icon_key(variant["iconKey"])
        layers = sample.get("layers", AXE_LAYERS)
        print(f"{sample['name']} ({item['name']}, {variant['rarity']})")
        composed = spike.compose(layers, swaps)
        spike.save_icon(composed, sample["name"], icons_dir)


if __name__ == "__main__":
    main()
