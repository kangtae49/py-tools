import json
import string

from webview import Window
from webview.dom import DOMEventHandler
from apps.models import DropFile

class DropFilesListener:
    def __init__(self, window: Window):
        self.window = window
        # window.dom.document.events.dragenter += DOMEventHandler(self.on_dragenter, False, False)
        # window.dom.document.events.dragstart += DOMEventHandler(self.on_dragstart, False, False)
        # window.dom.document.events.dragover += DOMEventHandler(self.on_dragover, False, False, debounce=500)
        window.dom.document.events.drop += DOMEventHandler(self.on_drop, False, False)

    def on_dragenter(self, e):
        print(f'Event: {e["type"]}.')
        pass
    def on_dragstart(self, e):
        print(f'Event: {e["type"]}.')
        pass

    def on_dragover(self, e):
        print(f'Event: {e["type"]}.')
        pass
    def on_drop(self, e):
        files = e['dataTransfer']['files']
        if len(files) == 0:
            return
        # print(f'Event: {e["type"]}. Dropped files:')
        print(files)
        drop_files = [
            DropFile(name=f.get('name'),
                     size=f.get('size'),
                     type=f.get('type'),
                     last_modified=f.get('lastModified'),
                     last_modified_date=f.get('lastModifiedDate'),
                     webkit_relative_path=f.get('webkitRelativePath'),
                     pywebview_full_path=f.get('pywebviewFullPath'),
                     ) for f in files]
        jstr = [x.model_dump() for x in drop_files]

        tmpl = string.Template("""
            window.dispatchEvent(new CustomEvent("drop-files", 
                {
                    detail: $drop_files
                }
            ))
        """)
        print(tmpl.substitute(drop_files=json.dumps(jstr)))
        self.window.evaluate_js(tmpl.substitute(drop_files=json.dumps(jstr)))

