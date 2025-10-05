import json
import string

from webview import Window
from webview.dom import DOMEventHandler
from apps.models import DropFile

# g_window: Window | None  = None

class DropFilesListener:
    def __init__(self, window: Window):
        self.window = window
        window.dom.document.events.dragenter += DOMEventHandler(self.on_dragenter, False, False)
        window.dom.document.events.dragstart += DOMEventHandler(self.on_dragstart, False, False)
        window.dom.document.events.dragover += DOMEventHandler(self.on_dragover, False, False, debounce=500)
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
        global g_window
        files = e['dataTransfer']['files']
        if len(files) == 0:
            return
        # print(f'Event: {e["type"]}. Dropped files:')
        drop_files = [
            DropFile(name=f.get('name'),
                     size=f.get('size'),
                     type=f.get('type'),
                     lastModified=f.get('last_modified'),
                     lastModifiedDate=f.get('last_modified_date'),
                     webkitRelativePath=f.get('webkit_relative_path'),
                     pywebviewFullPath=f.get('pywebview_full_path'),
                     ) for f in files]
        jstr = [x.model_dump() for x in drop_files]
        # js_str = f"""window.reactApi.changeDropFiles({json.dumps(jstr)})"""
        # g_window.evaluate_js(js_str)

        tmpl = string.Template("""
            window.dispatchEvent(new CustomEvent("drop-files", 
                {
                    detail: $drop_files
                }
            ))
        """)
        print(tmpl.substitute(drop_files=json.dumps(jstr)))
        g_window.evaluate_js(tmpl.substitute(drop_files=json.dumps(jstr)))


    # def add_dnd_listener(window):
    #     global g_window
    #     g_window = window
    #
    #     # print('binding drag events.')
    #     window.dom.document.events.dragenter += DOMEventHandler(on_dragenter, False, False)
    #     window.dom.document.events.dragstart += DOMEventHandler(on_dragstart, False, False)
    #     window.dom.document.events.dragover += DOMEventHandler(on_dragover, False, False, debounce=500)
    #     window.dom.document.events.drop += DOMEventHandler(on_drop, False, False)
    #