import locale
import os
import glob
import fnmatch
import ctypes
from pathlib import Path
from typing import List
from typing import Optional
import webview
import pysubs2
from charset_normalizer import from_path
from apps.models import DialogType, DialogOptions, Sub

MUSIC_PLAYER_SETTING = 'music-player.setting.json'
MOVIE_PLAYER_SETTING = 'movie-player.setting.json'
MOSAIC_LAYOUT_SETTING = 'mosaic-layout.setting.json'

class ApiException(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(f"{message}")

class ApiError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(f"{message}")

class JsApi:
    def __init__(self):
        self.setting = {
            MUSIC_PLAYER_SETTING: "{}",
            MOVIE_PLAYER_SETTING: "{}",
            MOSAIC_LAYOUT_SETTING: "{}",
        }

    def dialog_open(self, options: Optional[dict] = None) -> List[str] | None:
        try:
            # window.pywebview.api.dialog_open().then()
            print(f"options!: {options}")
            if options is None:
                options = DialogOptions()
            else:
                options = DialogOptions(**options)
            if options.dialog_type == DialogType.OPEN:
                dialog_type = webview.FileDialog.OPEN
            elif options.dialog_type == DialogType.FOLDER:
                dialog_type = webview.FileDialog.FOLDER
            else:
                dialog_type = webview.FileDialog.SAVE

            window = webview.active_window()
            print(f"window: {window}")
            print(f"dialog_type: {dialog_type}")
            print(f"options: {options}")
            result = window.create_file_dialog(
                dialog_type=dialog_type,
                directory=options.directory,
                allow_multiple=options.allow_multiple,
                save_filename=options.save_filename,
                file_types=options.file_types,
            )
            return result
        except Exception as e:
            raise ApiException(f"{e}")

    def read_file(self, fullpath: str):
        try:
            if not os.path.exists(fullpath):
                raise ApiError(f"file not found: {fullpath}")
            with open(fullpath, "r", encoding="utf-8") as f:
                content = f.read()
                return content
        except ApiError as e:
            raise e
        except Exception as e:
            raise ApiException(f"{e}")

    def write_file(self, fullpath: str, content: str):
        try:
            directory = os.path.dirname(fullpath)
            if directory:
                os.makedirs(directory, exist_ok=True)

            with open(fullpath, "w", encoding="utf-8") as f:
                f.write(content)
                f.flush()
        except ApiError as e:
            raise e
        except Exception as e:
            raise ApiException(f"{e}")


    def app_read_file(self, subpath: str):
        try:
            appdata_local = os.getenv("LOCALAPPDATA")
            fullpath = os.path.join(appdata_local, "py-tools", subpath)
            content = self.read_file(fullpath)
            print(f"app_read_file !{subpath}!{content}!")
            return content
        except ApiError as e:
            raise e
        except Exception as e:
            raise ApiException(f"{e}")

    def app_write_file(self, subpath: str, default: str):
        try:
            appdata_local = os.getenv("LOCALAPPDATA")
            fullpath = os.path.join(appdata_local, "py-tools", subpath)
            # self.setting.update({subpath: content})
            content = self.setting.get(subpath, default)
            print(f"setting.update {subpath}: {content}")
            self.write_file(fullpath, content)
        except ApiError as e:
            raise e
        except Exception as e:
            raise ApiException(f"{e}")

    def app_read(self, subpath: str):
        if subpath not in self.setting :
            raise ApiException(f"not fount {subpath}")
        return self.setting.get(subpath)

    def app_write(self, subpath: str, content: str):
        print(f"setting.update! {subpath}: {content}")
        self.setting.update({subpath: content})

    def unload(self):
        for k, v in self.setting.items():
            self.app_write_file(k, v)
            print(f'save {k}: {v}')

    def toggle_fullscreen(self):
        window = webview.active_window()
        window.toggle_fullscreen()

    def get_subs(self, fullpath: str) -> List[Sub]:
        lang_id = ctypes.windll.kernel32.GetUserDefaultUILanguage()
        locale_str = locale.windows_locale.get(lang_id, 'ko_KR')
        os_lang = locale_str.split("_")[0]
        print(f"os_lang: {os_lang}")

        sub_exts = ["srt", "vtt", "smi"]

        p = Path(fullpath)
        base_dir = p.parent
        stem = p.stem
        subs = []
        for f in base_dir.glob(f"{glob.escape(stem)}.*"):
            for ext in sub_exts:
                ret = fnmatch.fnmatchcase(f.name, f"*.{ext}")
                if ret:
                    fullpath = str(f.absolute())
                    sp_sub = fullpath.rsplit('.', 2)[1:]
                    subtype = '.'.join(sp_sub)
                    if len(sp_sub) == 1:
                        lang = ''
                        priority = 0
                    elif len(sp_sub) == 2 and sp_sub[0].lower() == os_lang.lower():
                        lang = sp_sub[0]
                        priority = 1
                    else:
                        lang = sp_sub[1]
                        priority = 2

                    sub = Sub(fullpath = str(f.absolute()), subtype=subtype, lang=lang, priority=priority)
                    subs.append(sub)
                    break
        sorted_subs = sorted(subs, key=lambda x: x.priority)
        print(f"sorted_subs: {sorted_subs}")
        return sorted_subs

    def read_sub(self, fullpath: str):
        p = Path(fullpath)
        encoding = "utf-8"
        try:
            subs = pysubs2.load(str(p), encoding=encoding)
        except UnicodeDecodeError as e:
            print(f"UnicodeDecodeError: {e}")
            results = from_path(str(p))
            best_guess = results.best()
            encoding = best_guess.encoding if best_guess else "utf-8"
            subs = pysubs2.load(str(p), encoding=encoding)
        return subs.to_string(encoding='utf-8', format_="vtt")

