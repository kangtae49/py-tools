import os
import sys
import webview
from apps import js_api

def run():

    if hasattr(sys, "_MEIPASS"):
        # py-tools.exe
        base_path = sys._MEIPASS
        index_path = os.path.join(base_path, "gui/index.html")
        server_url = f"file://{index_path}"
        debug = False
    else:
        # pnpm dev
        # uv run main.py
        server_url = "http://localhost:5173"
        debug = True
        # base_path = os.path.dirname(os.path.abspath(__file__))
        # index_path = os.path.join(base_path, "../dist/index.html")
        # server_url = f"file://{index_path}"
    api = js_api.JsApi()
    win = webview.create_window(
        title='PyTools',
        url=server_url,
        js_api=api,
    )

    # webview.start(debug=debug)
    webview.start(debug=True)
