# -*- mode: python ; coding: utf-8 -*-
name = 'py-tools' # py-tools.exe
pathex = ['.\\dist']
icon = '.\\src\\assets\\py-tools.ico'
added_files = [
    ('.\\gui', 'gui'),
]

block_cipher = None

a = Analysis(['.\\main.py'],
             pathex=pathex,
             binaries=[],
             datas=added_files,
             hiddenimports=['clr'],
             hookspath=[],
             hooksconfig={},
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)

exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          [],
          name=name,
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          upx_exclude=[],
          icon=icon,
          runtime_tmpdir=None,
          console=False,
          disable_windowed_traceback=False,
          target_arch=None,
          codesign_identity=None,
          entitlements_file=None )
