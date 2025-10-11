import unittest
from apps import js_api
from apps.sub import convert_sub

class MyTestCase(unittest.TestCase):
    def test_get_subs(self):
        # self.assertEqual(True, False)  # add assertion here
        api = js_api.JsApi()
        api.get_subs('C:\\Users\\kkt\\Downloads\\english\\1초면 구분합니다! ｜ 원어민만 느끼는 뉘앙스 구분법 [bfsY18cvveo].mp4')

    # def test_convert_sub(self):
    #     convert_sub('C:\\Users\\kkt\\Downloads\\english\\Forrest.Gump.1994.720p.BrRip.x264.YIFY.en.srt')
    #     # api.convert_sub('C:\\Users\\kkt\\Downloads\\english\\Forrest.Gump.1994.720p.BrRip.x264.YIFY.en.vtt')


if __name__ == '__main__':
    unittest.main()
