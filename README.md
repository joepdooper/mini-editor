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
    <button data-cmd="bold">Bold</button>
    <button data-cmd="italic">Italic</button>
    <button data-cmd="underline">Underline</button>
    <button data-cmd="link">Link</button>
</div>

<div class="editor-block" contenteditable="true" data-id="1"></div>
<input type="hidden" id="input_1" name="content_1">

<div class="editor-block" contenteditable="true" data-id="2"></div>
<input type="hidden" id="input_2" name="content_2">
```

```javascript
document.addEventListener('DOMContentLoaded', () => {
    MiniEditor.initAll('.editor-block', '#toolbar');
});
```