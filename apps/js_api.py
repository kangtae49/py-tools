import os
from typing import List
from typing import Optional
import webview
from apps.models import DialogType, DialogOptions

MUSIC_PLAYER_LATEST_PLAYLIST = 'music-player.playlist.latest.json'
MUSIC_PLAYER_SETTING = 'music-player.setting.json'

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
        self.setting = {}

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

    def read_to_string(self, fullpath: str):
        try:
            # if not os.path.exists(fullpath):
            #     raise ApiError(f"file not found: {fullpath}")
            with open(fullpath, "r", encoding="utf-8") as f:
                content = f.read()
                return content
        except Exception as e:
            raise ApiException(f"{e}")

    def write_to_string(self, fullpath: str, content: str):
        try:
            directory = os.path.dirname(fullpath)
            if directory:
                os.makedirs(directory, exist_ok=True)

            with open(fullpath, "w", encoding="utf-8") as f:
                f.write(content)
        except Exception as e:
            raise ApiException(f"{e}")


    def app_read_to_string(self, subpath: str):
        try:
            appdata_local = os.getenv("LOCALAPPDATA")
            fullpath = os.path.join(appdata_local, "py-tools", subpath)
            return self.read_to_string(fullpath)
        except Exception as e:
            raise ApiException(f"{e}")

    def app_write_to_string(self, subpath: str, content: str):
        try:
            appdata_local = os.getenv("LOCALAPPDATA")
            fullpath = os.path.join(appdata_local, "py-tools", subpath)
            self.write_to_string(fullpath, content)
            self.setting.update({subpath: content})

        except Exception as e:
            raise ApiException(f"{e}")

    def app_read(self, subpath: str):
        if subpath not in self.setting :
            raise ApiException(f"not fount {subpath}")
        return self.setting.get(subpath)

    def app_write(self, subpath: str, content: str):
        self.setting.update({subpath: content})

    # def app_read(self):
    #     pass
    # def app_save(self):
    #     if self.app_path is None or self.app_content is None:
    #         return
    #     self.app_write_to_string(self.app_path, self.app_content)

