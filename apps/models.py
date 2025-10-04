from pydantic import BaseModel
from enum import Enum
from typing import List






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
    lastModified: int
    lastModifiedDate: dict
    webkitRelativePath: str
    size: int
    type: str
    pywebviewFullPath: str
