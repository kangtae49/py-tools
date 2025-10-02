from typing import List
from typing import Optional
import webview
from apps.models import DialogType, DialogOptions


class JsApi:

    def dialog_open(self, options: Optional[dict] = None) -> List[str] | None:
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





