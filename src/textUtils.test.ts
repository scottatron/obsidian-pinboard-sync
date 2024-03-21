import * as yaml from "js-yaml";
import { App, TFile } from "obsidian";
import { updateSection } from "./textUtils";

const testCases = `
- test: file is not open, section does not already exist, trailing newline
  existingContent: |+
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none
  heading: "## Pinboard"
  sectionContent: |-
    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
  expectedContent: |+
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
- test: file is not open, section does not already exist, no trailing newline
  existingContent: |-
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none
  heading: "## Pinboard"
  sectionContent: |-
    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
  expectedContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
- test: file is not open, section already exists, no new links, trailing newline
  existingContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
  heading: "## Pinboard"
  sectionContent: |-
    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
  expectedContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
- test: file is not open, section already exists, no new links, no trailing newline
  existingContent: |-
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
  heading: "## Pinboard"
  sectionContent: |-
    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
  expectedContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
- test: file is not open, section already exists, new links, trailing newline
  existingContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
  heading: "## Pinboard"
  sectionContent: |-
    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    [Link 3](https://example.com)
  expectedContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    [Link 3](https://example.com)
- test: file is not open, section already exists, no new links, section below, trailing newline
  existingContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    ## Another Section

    lorem ipsum
  heading: "## Pinboard"
  sectionContent: |-
    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
  expectedContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    ## Another Section

    lorem ipsum
- test: file is not open, section already exists, no new links, section below, no trailing newline
  existingContent: |-
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    ## Another Section

    lorem ipsum
  heading: "## Pinboard"
  sectionContent: |-
    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)
  expectedContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    ## Another Section

    lorem ipsum
- test: file is not open, section already exists, new links, section below, trailing newline
  existingContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    ## Another Section

    lorem ipsum
  heading: "## Pinboard"
  sectionContent: |-
    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    [Link 3](https://example.com)
  expectedContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    [Link 3](https://example.com)

    ## Another Section

    lorem ipsum
- test: file is not open, section already exists, new links, section below, no trailing newline
  existingContent: |-
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    ## Another Section

    lorem ipsum
  heading: "## Pinboard"
  sectionContent: |-
    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    [Link 3](https://example.com)
  expectedContent: |
    [[Thursday]]

    - y:
      - foo
    - t:
      - bar
    - b:
      - none

    ## Pinboard

    [Link 1](https://example.com)

    [Link 2](https://example.com)

    [Link 3](https://example.com)

    ## Another Section

    lorem ipsum
`

const parsedTestCases = yaml.load(testCases);

jest.mock('./fileUtils', () => ({
  getEditorForFile: jest.fn()
}));

let modifiedContent: string

const mockFile: TFile = {
} as unknown as TFile;
const mockApp: App = {
  vault: {
    read: jest.fn().mockResolvedValue(''),
    modify: jest.fn().mockImplementation((_file, contents) => {
      modifiedContent = contents;
    })
  },
} as unknown as App;


describe("updateSection", () => {
  parsedTestCases.forEach((testCase: any) => {
    if (!testCase.existingContent) return
    it(testCase.test, async () => {
      // Arrange
      modifiedContent = '';

      mockApp.vault.read = jest.fn().mockResolvedValue(testCase.existingContent);

      // Act
      await updateSection(mockApp, mockFile, testCase.heading, testCase.sectionContent);

      // Assert
      expect(modifiedContent).toMatch(testCase.expectedContent);
      // assert that there is only a single newline at the end of the modified content
      // expect(modifiedContent.endsWith('\n')).toBe(true);
      expect(modifiedContent.endsWith("\n\n")).toBe(false);
    });
  })
});
