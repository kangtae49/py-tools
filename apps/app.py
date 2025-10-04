import os
import sys
import argparse
import webview
from webview import Window
import json
import string

from webview.dom import DOMEventHandler
from apps import js_api
from apps.models import DropFile
from apps.app_menu import app_menu

api = js_api.JsApi()

g_window: Window | None  = None

def on_before_show(window):
    print('on_before_show', window.native)

def on_initialized(renderer):
    # return False to cancel initialization
    print(f'GUI is initialized with renderer: {renderer}')

def on_shown():
    print('on_shown')

def on_loaded(window):
    print('on_loaded')
    # print(f'window: {window}')
    if window is not None:
        bind(window)
        print(f'url: {window.get_current_url()}')




def on_dragenter(e):
    print(f'Event: {e["type"]}.')
    pass
def on_dragstart(e):
    print(f'Event: {e["type"]}.')
    pass

def on_dragover(e):
    print(f'Event: {e["type"]}.')
    pass
def on_drop(e):
    global g_window
    files = e['dataTransfer']['files']
    if len(files) == 0:
        return
    # print(f'Event: {e["type"]}. Dropped files:')
    drop_files = [
        DropFile(name=f.get('name'),
                 size=f.get('size'),
                 type=f.get('type'),
                 lastModified=f.get('lastModified'),
                 lastModifiedDate=f.get('lastModifiedDate'),
                 webkitRelativePath=f.get('webkitRelativePath'),
                 pywebviewFullPath=f.get('pywebviewFullPath'),
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



def bind(window):
    # print('binding drag events.')
    window.dom.document.events.dragenter += DOMEventHandler(on_dragenter, False, False)
    window.dom.document.events.dragstart += DOMEventHandler(on_dragstart, False, False)
    window.dom.document.events.dragover += DOMEventHandler(on_dragover, False, False, debounce=500)
    window.dom.document.events.drop += DOMEventHandler(on_drop, False, False)



def run():
    global g_window
    # webview.settings = {
    #     'ALLOW_DOWNLOADS': False,
    #     'ALLOW_FILE_URLS': True,
    #     'DRAG_REGION_SELECTOR': 'pywebview-drag-region',
    #     'OPEN_EXTERNAL_LINKS_IN_BROWSER': True,
    #     'OPEN_DEVTOOLS_IN_DEBUG': True,
    #     'IGNORE_SSL_ERRORS': False,
    #     'REMOTE_DEBUGGING_PORT': None,
    #     'SHOW_DEFAULT_MENUS': True
    # }
    print(webview.settings)

    parser = argparse.ArgumentParser()
    parser.add_argument("--verbose", action="store_true", help="verbose")
    args = parser.parse_args()
    debug = args.verbose
    print(f'verbose: {args.verbose}')

    if hasattr(sys, "_MEIPASS"):
        # py-tools.exe
        base_path = sys._MEIPASS
        index_path = os.path.join(base_path, "gui/index.html")
        server_url = f"file://{index_path}"
    else:
        # pnpm dev
        # uv run main.py
        server_url = "http://localhost:5173"
        # base_path = os.path.dirname(os.path.abspath(__file__))
        # index_path = os.path.join(base_path, "../dist/index.html")
        # server_url = f"file://{index_path}"

    window = webview.create_window(
        title='PyTools',
        url=server_url,
        js_api=api,
        text_select=True,
        draggable=True,
        zoomable=True,
    )

    # events
    window.events.before_show += on_before_show
    window.events.initialized += on_initialized
    window.events.shown += on_shown
    window.events.loaded += on_loaded

    g_window = window

    # webview.start(debug=debug)
    webview.start(debug=debug, menu=app_menu)
