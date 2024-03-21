jest.mock('./fileUtils', () => ({
  getEditorForFile: jest.fn(),
}));

import * as fs from 'fs';
import * as yaml from "js-yaml";
import { App, Editor, TFile } from "obsidian";
import * as fileUtils from './fileUtils';
import { updateSection } from "./textUtils";

const testCases = yaml.load(fs.readFileSync('src/textUtils.testCases.yml')) as any[];

let existingContent: string;
let modifiedContent: string;

const mockFile: TFile = {
} as unknown as TFile;
const mockApp: App = {
  vault: {
    read: jest.fn().mockResolvedValue(''),
    modify: jest.fn().mockImplementation((_file, contents) => {
      modifiedContent = contents;
    })
  },
  workspace: {
  }
} as unknown as App;

const appendEditor: Editor = {
  replaceRange: jest.fn().mockImplementation((text, from, to) => {
    modifiedContent = [existingContent, text].join("")
  })
} as unknown as Editor;
const sliceEditor: Editor = {
  replaceRange: jest.fn().mockImplementation((text, from, to) => {
    const lines = existingContent.split("\n")
    const prefix = lines.slice(0, from.line).join("\n") + "\n"
    const suffix = lines.slice(to.line).join("\n")
    modifiedContent = prefix + text + suffix
  })
} as unknown as Editor;
const mockEditors = { appendEditor, sliceEditor }

describe("updateSection", () => {
  testCases.forEach((testCase: any) => {
    if (!testCase.existingContent) {
      it.todo(testCase.test);
      return
    }
    it(testCase.test, async () => {
      existingContent = testCase.existingContent;
      modifiedContent = '';

      (fileUtils.getEditorForFile as jest.Mock).mockImplementation((app: App, file: TFile) => testCase.editor ? mockEditors[testCase.editor] : null)

      mockApp.vault.read = jest.fn().mockResolvedValue(testCase.existingContent);

      await updateSection(mockApp, mockFile, testCase.heading, testCase.sectionContent);

      expect(modifiedContent).toMatch(testCase.expectedContent);
      // assert that there is only a single newline at the end of the modified content
      expect(modifiedContent.endsWith("\n\n")).toBe(false);
    });
  })
});
