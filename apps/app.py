import os
import sys
import argparse
import webview

from apps import js_api
from apps.listeners.window_event_listener import WindowEventListener



api = js_api.JsApi()
window_listener = None


def get_index_url():
    if hasattr(sys, "_MEIPASS"):
        # py-tools.exe
        base_path = sys._MEIPASS
        index_path = os.path.join(base_path, "gui/index.html")
        server_url = f"file://{index_path}"
    else:
        # pnpm dev
        # uv run main.py
        server_url = "http://localhost:5173"
        # server_url = "http://localhost:8097"
        # base_path = os.path.dirname(os.path.abspath(__file__))
        # index_path = os.path.join(base_path, "../dist/index.html")
        # server_url = f"file://{index_path}"
    return server_url

def run():
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
    print(webview.settings, flush=True)

    parser = argparse.ArgumentParser()
    parser.add_argument("--verbose", action="store_true", help="verbose")
    args = parser.parse_args()
    debug = args.verbose
    print(f'verbose: {args.verbose}')

    window = webview.create_window(
        title='PyTools',
        url=get_index_url(),
        js_api=api,
        text_select=True,
        draggable=True,
        zoomable=False,
        confirm_close=False,
    )

    # events
    WindowEventListener(window, api)

    webview.start(debug=debug)
    # webview.start(debug=False)
