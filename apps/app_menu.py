import string
import json
import webview
from webview.menu import Menu, MenuAction, MenuSeparator

def go_menu(menu: str):
    window = webview.active_window()
    tmpl = string.Template("""
        window.dispatchEvent(new CustomEvent("click-menu", 
            {
                detail: $menu
            }
        ))
    """)
    print(tmpl.substitute(menu=json.dumps(menu)))
    window.evaluate_js(tmpl.substitute(menu=json.dumps(menu)))

app_menu = [
    Menu(
        'Media', [
            MenuAction('Music Player', lambda: go_menu('music-player'))
        ]

    )
]