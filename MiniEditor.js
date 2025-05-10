class MiniEditor {
	static editors = [];
	static toolbar = null;
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

		document.querySelectorAll(editorSelector).forEach(el => new MiniEditor(el));
		MiniEditor.bindToolbarButtons();
	}

	setup() {
		this.editor.addEventListener('mouseup', () => this.updateEditorState());
		document.addEventListener('selectionchange', () => this.updateEditorState());
		this.editor.addEventListener('paste', e => this.handlePaste(e));
		this.editor.addEventListener('input', () => this.updateHiddenInput());
	}

	updateEditorState() {
		const sel = window.getSelection();
		if (sel.toString().trim()) {
			MiniEditor.activeEditor = this;
			MiniEditor.positionToolbar();
			this.updateHiddenInput();
		}
	}

	handlePaste(e) {
		e.preventDefault();
		const text = (e.clipboardData || window.clipboardData).getData('text/plain');
		document.execCommand('insertText', false, text);
		this.updateHiddenInput();
	}

	updateHiddenInput() {
		const targetInput = document.querySelector(`#input_${this.editor.dataset.id}`);
		if (targetInput) {
			let html = this.editor.innerHTML.trim();
			if (this.editor.lastChild?.tagName === 'BR') html = html.slice(0, -4);
			targetInput.value = html;
		}
	}

	static bindToolbarButtons() {
		MiniEditor.toolbar.querySelectorAll('[data-cmd]').forEach(btn => {
			btn.addEventListener('click', () => {
				const cmd = btn.dataset.cmd;
				MiniEditor.executeCommand(cmd, btn.dataset.value);
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
		let wrapper = document.createElement({
			'bold': 'b',
			'italic': 'i',
			'underline': 'u',
			'link': () => {
				const url = prompt('Enter URL:');
				if (!url) return null;
				const a = document.createElement('a');
				a.href = url.startsWith('http') ? url : `http://${url}`;
				a.target = '_blank';
				a.rel = 'noopener noreferrer';
				return a;
			}
		}[cmd] || cmd);

		if (!wrapper) return;
		if (typeof wrapper === 'function') wrapper = wrapper();

		wrapper.appendChild(content);
		range.insertNode(wrapper);
		range.setStartAfter(wrapper);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);

		MiniEditor.positionToolbar();
		MiniEditor.activeEditor.updateHiddenInput();
	}

	static positionToolbar() {
		const sel = window.getSelection();
		if (!sel.rangeCount || sel.isCollapsed) {
			MiniEditor.toolbar.style.removeProperty('display');
			return;
		}

		const rect = sel.getRangeAt(0).getBoundingClientRect();
		const toolbarWidth = MiniEditor.toolbar.offsetWidth;
		const top = rect.top + window.scrollY - 50;
		const left = rect.left + rect.width / 2 - toolbarWidth / 2;

		Object.assign(MiniEditor.toolbar.style, {
			top: `${top}px`,
			left: `${left}px`,
			position: 'absolute'
		});

		MiniEditor.toolbar.style.removeProperty('display');

		clearTimeout(MiniEditor.hideTimeout);
		MiniEditor.hideTimeout = setTimeout(() => {
			MiniEditor.toolbar.style.display = 'none';
		}, 4000);
	}
}