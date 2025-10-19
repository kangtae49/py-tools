import os
import sys
import json
import string

from webview import Window
from apps.listeners.drop_files_listener import DropFilesListener
from apps.js_api import JsApi


class WindowEventListener:
    def __init__(self, window: Window, js_api: JsApi):
        self.window = window
        self.js_api = js_api
        window.events.before_show += self.on_before_show
        window.events.initialized += self.on_initialized
        window.events.shown += self.on_shown
        window.events.loaded += self.on_loaded
        window.events.closing += self.on_closing
        window.events.closed += self.on_closed

    def on_initialized(self, renderer):
        # return False to cancel initialization
        print(f'GUI is initialized with renderer: {renderer}')
    def on_before_show(self, window):
        # custom_event("before_show")
        print('on_before_show', window.native)

    def on_shown(self):
        self.custom_event("shown")
        print('on_show')

    def on_loaded(self):
        print('on_loaded')
        DropFilesListener(self.window)
        # add_dnd_listener(self.window)
        # if not hasattr(sys, "_MEIPASS"):
        #     js_code = """
        #     const s = document.createElement('script');
        #     s.src = "http://localhost:8097";
        #     document.head.appendChild(s);
        #     """
        #     self.window.evaluate_js(js_code)

    def on_closing(self):
        print('closing')
        self.js_api.unload()

    def on_closed(self):
        print('closed')


    def custom_event(self, event_name: str):
        print(f'pywebview window is {event_name}')
        tmpl = string.Template("""
            window.dispatchEvent(new CustomEvent("window-event", 
                {
                    detail: $event_name
                }
            ))
        """)
        print(tmpl.substitute(event_name=json.dumps(event_name)))
        self.window.evaluate_js(tmpl.substitute(event_name=json.dumps(event_name)))


    def add_window_event_listener(self):
        self.window.events.before_show += self.on_before_show
        self.window.events.initialized += self.on_initialized
        self.window.events.shown += self.on_shown
        self.window.events.loaded += self.on_loaded
        self.window.events.closing += self.on_closing
        self.window.events.closed += self.on_closed
