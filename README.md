# mini-editor

A lightweight, dependency-free WYSIWYG editor implemented in vanilla JavaScript.

### Features:

- Inline content editing with a floating formatting toolbar
- Supports bold, italic, underline, headings, blockquotes, and links
- Automatically positions toolbar based on text selection
- Handles plain text pasting to prevent unwanted formatting
- Syncs editable content with hidden inputs for form submission

```html
<div id="toolbar">
    <button data-cmd="strong">Bold</button>
    <button data-cmd="em">Italic</button>
    <button data-cmd="u">Underline</button>
    <button data-cmd="link">Link</button>
</div>
```