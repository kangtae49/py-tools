import pysubs2
from charset_normalizer import from_path
from pathlib import Path

def convert_sub(fullpath: str):
    p = Path(fullpath)
    ext = p.suffix.lower()
    print(f"ext: {ext}")
    p_vtt = p.with_suffix(".vtt")
    print(f"p_vtt: {p_vtt}")
    if p_vtt.is_file():
        return

    if ext == '.smi':
        pass
    else:
        encoding = "utf-8"
        is_err = False
        try:
            subs = pysubs2.load(str(p), encoding=encoding)
        except UnicodeDecodeError as e:
            is_err = True
            print(f"UnicodeDecodeError: {e}")
            results = from_path(str(p))
            best_guess = results.best()
            encoding = best_guess.encoding if best_guess else "utf-8"
            subs = pysubs2.load(str(p), encoding=encoding)

        if ext == ".vtt" and not is_err:
            pass
        else:
            # subs.to_string(encoding=encoding, format_="vtt")
            subs.save(str(p_vtt))

    print(f"save: {p_vtt}")