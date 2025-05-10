class MiniEditor {
	constructor(editorId, toolbarId) {
		this.editor = document.getElementById(editorId);
		this.toolbar = document.getElementById(toolbarId);
		this.init();
	}

	init() {
		this.bindToolbarButtons();
		this.handlePaste();
		this.editor.addEventListener('mouseup', () => this.positionToolbar());
	}

	bindToolbarButtons() {
		this.toolbar.querySelectorAll('[data-cmd]').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const cmd = btn.dataset.cmd;
				const value = btn.dataset.value || null;
				this.executeCommand(cmd, value);
			});
		});
	}

	executeCommand(cmd, value = null) {
		if (cmd === 'link') {
			const url = prompt('Enter URL:');
			if (url) this.insertLink(url);
			return;
		}

		this.wrapSelection(cmd, value);
	}

	wrapSelection(tag, value = null) {
		const sel = window.getSelection();
		if (!sel.rangeCount || sel.isCollapsed) return;
		const range = sel.getRangeAt(0);
		const el = document.createElement(tag);
		if (value) el.setAttribute('value', value);
		range.surroundContents(el);
	}

	insertLink(url) {
		const sel = window.getSelection();
		if (!sel.rangeCount || sel.isCollapsed) return;
		const range = sel.getRangeAt(0);
		const a = document.createElement('a');
		a.href = url.startsWith('http') ? url : `http://${url}`;
		a.textContent = range.toString();
		a.setAttribute('contenteditable', 'false');
		range.deleteContents();
		range.insertNode(a);
	}

	handlePaste() {
		this.editor.addEventListener('paste', (e) => {
			e.preventDefault();
			const text = (e.clipboardData || window.clipboardData).getData('text/plain');
			document.execCommand('insertText', false, text); // fallback
		});
	}

	positionToolbar() {
		const selection = window.getSelection();
		if (!selection.rangeCount || selection.isCollapsed) {
			this.toolbar.style.display = 'none';
			return;
		}

		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();
		this.toolbar.style.top = `${rect.top + window.scrollY - 50}px`;
		this.toolbar.style.left = `${rect.left + rect.width / 2}px`;
		this.toolbar.style.position = 'absolute';
		this.toolbar.style.display = 'block';

		clearTimeout(this.hideTimeout);
		this.hideTimeout = setTimeout(() => {
			this.toolbar.style.display = 'none';
		}, 4000);
	}
}
