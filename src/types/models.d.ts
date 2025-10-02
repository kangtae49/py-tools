/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export type DialogType = "OPEN" | "FOLDER" | "SAVE";

export interface DialogOptions {
  dialog_type?: DialogType;
  directory?: string;
  allow_multiple?: boolean;
  save_filename?: string;
  file_types?: string[];
}
export interface DropFile {
  name: string;
  lastModified: number;
  lastModifiedDate: {
    [k: string]: unknown;
  };
  webkitRelativePath: string;
  size: number;
  type: string;
  pywebviewFullPath: string;
}
