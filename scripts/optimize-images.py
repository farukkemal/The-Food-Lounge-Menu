import json
import os
import urllib.request
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
MENU_JSON = ROOT / "menu_data.json"
CAT_OUT_DIR = ROOT / "public" / "images" / "categories"
LOGO_SRC = ROOT / "src" / "assets" / "logo.png"
LOGO_WEBP = ROOT / "src" / "assets" / "logo.webp"
PUBLIC_LOGO_WEBP = ROOT / "public" / "logo.webp"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def fetch_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def optimize_to_webp(raw_bytes: bytes, dest_path: Path, size=(480, 360), quality=78):
    with Image.open(BytesIO(raw_bytes)) as img:
        img = ImageOps.exif_transpose(img)
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            rgba = img.convert("RGBA")
            bg.paste(rgba, mask=rgba.split()[3])
            img = bg
        else:
            img = img.convert("RGB")

        fitted = ImageOps.fit(img, size, method=Image.Resampling.LANCZOS)
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        fitted.save(dest_path, format="WEBP", quality=quality, method=6)
        return dest_path.stat().st_size


def main():
    CAT_OUT_DIR.mkdir(parents=True, exist_ok=True)
    data = json.loads(MENU_JSON.read_text(encoding="utf-8"))

    total_before = 0
    total_after = 0
    converted = 0

    for cat in data.get("categories", []):
        src_url = cat.get("imageSourceUrl") or cat.get("image")
        if not src_url or not str(src_url).startswith("http"):
            continue

        try:
            raw = fetch_bytes(src_url)
            orig_size = len(raw)
            dest = CAT_OUT_DIR / f"{cat['id']}.webp"
            new_size = optimize_to_webp(raw, dest, size=(480, 360), quality=78)

            total_before += orig_size
            total_after += new_size
            converted += 1

            cat["imageSourceUrl"] = src_url
            cat["image"] = f"/images/categories/{cat['id']}.webp"
            print(
                f"  OK {cat['id']:7s} ({cat['name'][:22]:22s}): "
                f"{orig_size/1024:6.1f} KB -> {new_size/1024:5.1f} KB"
            )
        except Exception as e:
            print(f"  WARN {cat['id']}: {e}")

    # Optimize brand logo to crisp 256x256 WebP
    if LOGO_SRC.exists():
        raw_logo = LOGO_SRC.read_bytes()
        logo_new = optimize_to_webp(raw_logo, LOGO_WEBP, size=(256, 256), quality=84)
        PUBLIC_LOGO_WEBP.write_bytes(LOGO_WEBP.read_bytes())
        print(
            f"\n  LOGO: {len(raw_logo)/1024:.1f} KB (PNG) -> {logo_new/1024:.1f} KB (WebP)"
        )

    MENU_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    saved_pct = (1 - (total_after / total_before)) * 100 if total_before else 0
    print("\n============================================================")
    print(f"Converted category covers : {converted}")
    print(f"Original total size       : {total_before / 1024 / 1024:.2f} MB")
    print(f"Optimized WebP total size : {total_after / 1024 / 1024:.2f} MB")
    print(f"Bandwidth saved           : {saved_pct:.1f}%")
    print("============================================================")


if __name__ == "__main__":
    main()
