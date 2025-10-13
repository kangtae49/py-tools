from typing import List
from enum import Enum
from pydantic import BaseModel


class DialogType(str, Enum):
    OPEN = "OPEN"
    FOLDER = "FOLDER"
    SAVE = "SAVE"

class DialogOptions(BaseModel):
    dialog_type: DialogType = DialogType.OPEN
    directory: str = ''
    allow_multiple: bool = False
    save_filename: str = ''
    file_types: List[str] = []

class DropFile(BaseModel):
    name: str
    last_modified: int
    last_modified_date: dict
    webkit_relative_path: str
    size: int
    type: str
    pywebview_full_path: str


class Sub(BaseModel):
    fullpath: str
    subtype: str
    lang: str
    priority: int
    src: str

