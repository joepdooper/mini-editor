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
		this.editor.addEventListener('mouseup', () => {
			MiniEditor.activeEditor = this;
			MiniEditor.positionToolbar();
		});

		this.editor.addEventListener('paste', e => {
			e.preventDefault();
			const text = (e.clipboardData || window.clipboardData).getData('text/plain');
			document.execCommand('insertText', false, text);
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
		const sel = window.getSelection();
		if (!sel.rangeCount || sel.isCollapsed) return;

		if (cmd === 'link') {
			let url = prompt('Enter URL:');
			if (!url) return;
			if (!url.startsWith('http')) url = 'http://' + url;
			document.execCommand('createLink', false, url);

			const a = document.getSelection().focusNode?.parentNode;
			if (a && a.tagName === 'A') {
				a.setAttribute('contenteditable', 'false');
			}
		} else {
			document.execCommand(cmd, false, value);
		}

		MiniEditor.positionToolbar(); // Refresh position after action
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
		const left = rect.left + (rect.width / 2);

		MiniEditor.toolbar.style.top = `${top}px`;
		MiniEditor.toolbar.style.left = `${left}px`;
		MiniEditor.toolbar.style.position = 'absolute';
		MiniEditor.toolbar.style.display = 'block';

		clearTimeout(MiniEditor.hideTimeout);
		MiniEditor.hideTimeout = setTimeout(() => {
			MiniEditor.toolbar.style.display = 'none';
		}, 4000);
	}
}
