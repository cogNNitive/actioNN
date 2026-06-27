# Transformation: Generic Document Normalizer

## Purpose
Transform any source document into a normalized, structured format with front matter metadata, preserving the original content while organizing it into clear semantic sections.

## Instructions
1. Extract the author from the source document if explicitly stated or deducible; otherwise, omit the field.
2. Extract the document's creation date if present; otherwise, use the current system date.
3. Set the modification date to the current system date.
4. Assign version 1.0.0 as the initial value.
5. Generate a 1-2 line summary of the document's central topic.
6. Identify and cite every source referenced or quoted in the document, including the original file name, and any explicit attribution (author, publication, URL) found in the text.
7. Preserve the full content organized into the appropriate semantic sections according to the document type (e.g., introduction, development, conclusions for a report; arguments and counterarguments for a debate; etc.).
8. If the document contains tabular data, preserve it as Markdown tables.
9. Do not add, invent, or modify any information from the original content.

## Template
---
author: "[Author or 'Unknown']"
creation_date: "[Original creation date or current date]"
modification_date: "[Current system date]"
version: "1.0.0"
tags: ["[tag1]", "[tag2]"]
language: "[en|es|...]"
source: "[Original filename or source identifier]"
---

# [Document Title]

> **Summary:** [1-2 line summary of the content]

## Content

[Full document content organized into semantic sections with appropriate headings (##, ###, etc.)]

## Sources

[List of sources cited throughout the document, with original filenames and any explicit attributions found]

---
*Processed on [current date] | Version [version]*
