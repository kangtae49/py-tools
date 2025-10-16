import sys
import portalocker
import webview
from apps import app

def main():
    try:
        with portalocker.Lock("py-tools.lock", timeout=0):
            print("locked")
            app.run()
    except portalocker.exceptions.AlreadyLocked:
        print("LockException")
        html = """
        <html>
        <head>
            <style>
                html, body {margin: 0; padding: 0;}
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
            </style>
        </head>
        <body>
            <h1>PyTools is already running.</h1>
        </body>
        </html>
        """
        window = webview.create_window("PyTools", html=html, width=600, height=100, resizable=False)
        # def show_alert_and_close():
        #     window.evaluate_js('alert("App is already running.");')
            # window.destroy()

        # webview.start(func=show_alert_and_close)
        webview.start(debug=False)
        sys.exit(0)





if __name__ == "__main__":
    main()
