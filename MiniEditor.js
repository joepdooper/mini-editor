class MiniEditor {
	static editors = [];
	static toolbar = null;
	static activeEditor = null;
	static hideTimeout = null;

	constructor(editableElement) {
		this.editor = editableElement;
		MiniEditor.editors.push(this);
		this.setup();
	}

	static initAll(editorSelector, toolbarSelector) {
		MiniEditor.toolbar = document.querySelector(toolbarSelector);
		if (!MiniEditor.toolbar) {
			console.warn('MiniEditor: toolbar not found:', toolbarSelector);
			return;
		}

		document.querySelectorAll(editorSelector).forEach(el => {
			new MiniEditor(el);
		});

		MiniEditor.bindToolbarButtons();
	}

	setup() {
		// Check selection and position toolbar on both mouse events and focus events
		const showToolbarIfSelection = () => {
			MiniEditor.activeEditor = this;
			setTimeout(() => {
				const sel = window.getSelection();
				if (sel.rangeCount && !sel.isCollapsed && sel.toString().trim() !== '') {
					// Only show toolbar if there is text selected
					MiniEditor.positionToolbar();
				} else {
					MiniEditor.toolbar.style.display = 'none'; // Hide toolbar if no selection
				}
			}, 0);
		};

		// Listen for mouseup, focus, and selection change to ensure immediate update
		this.editor.addEventListener('mouseup', showToolbarIfSelection);
		this.editor.addEventListener('keyup', showToolbarIfSelection); // For keyboard input
		document.addEventListener('selectionchange', showToolbarIfSelection); // To handle selection updates

		this.editor.addEventListener('paste', e => {
			e.preventDefault();
			const text = (e.clipboardData || window.clipboardData).getData('text/plain');
			document.execCommand('insertText', false, text); // Optional for paste
		});

		this.editor.addEventListener('input', () => {
			const targetInput = document.querySelector(`#input_${this.editor.dataset.id}`);
			if (targetInput) {
				let html = this.editor.innerHTML.trim();
				if (this.editor.lastChild?.tagName === 'BR') {
					html = html.slice(0, -4);
				}
				targetInput.value = html;
			}
		});
	}

	static bindToolbarButtons() {
		MiniEditor.toolbar.querySelectorAll('[data-cmd]').forEach(btn => {
			btn.addEventListener('click', () => {
				const cmd = btn.dataset.cmd;
				const val = btn.dataset.value || null;
				MiniEditor.executeCommand(cmd, val);
			});
		});
	}

	static executeCommand(cmd, value = null) {
		const editor = MiniEditor.activeEditor?.editor;
		if (!editor) return;

		const sel = window.getSelection();
		if (!sel.rangeCount || sel.isCollapsed) return;

		const range = sel.getRangeAt(0);
		const content = range.extractContents();
		let wrapper;

		switch (cmd) {
			case 'bold':
				wrapper = document.createElement('b');
				break;
			case 'italic':
				wrapper = document.createElement('i');
				break;
			case 'underline':
				wrapper = document.createElement('u');
				break;
			case 'link':
				let url = prompt('Enter URL:');
				if (!url) return;
				if (!url.startsWith('http')) url = 'http://' + url;
				wrapper = document.createElement('a');
				wrapper.href = url;
				wrapper.target = '_blank';
				wrapper.rel = 'noopener noreferrer';
				wrapper.setAttribute('contenteditable', 'false');
				break;
			default:
				console.warn('MiniEditor: Unknown command', cmd);
				return;
		}

		wrapper.appendChild(content);
		range.insertNode(wrapper);

		// Move selection after the inserted node
		range.setStartAfter(wrapper);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);

		MiniEditor.positionToolbar();
	}

	static positionToolbar() {
		const sel = window.getSelection();
		if (!sel.rangeCount || sel.isCollapsed) {
			MiniEditor.toolbar.style.display = 'none';
			return;
		}

		const range = sel.getRangeAt(0);
		const rect = range.getBoundingClientRect();
		const top = rect.top + window.scrollY - 50;

		// Just REMOVE the inline style
		MiniEditor.toolbar.style.removeProperty('display');

		// Now it's visible and styled
		const toolbarWidth = MiniEditor.toolbar.offsetWidth;
		const left = rect.left + (rect.width / 2) - (toolbarWidth / 2);

		MiniEditor.toolbar.style.top = `${top}px`;
		MiniEditor.toolbar.style.left = `${left}px`;
		MiniEditor.toolbar.style.position = 'absolute';

		clearTimeout(MiniEditor.hideTimeout);
		MiniEditor.hideTimeout = setTimeout(() => {
			MiniEditor.toolbar.style.display = 'none';
		}, 3000);
	}
}