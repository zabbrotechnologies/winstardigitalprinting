/* js/upload.js - File Upload Drag & Drop Parser, Previews & Page Estimator */

export class FileUploadHandler {
    constructor(options = {}) {
        this.dropZone = options.dropZone;
        this.fileInput = options.fileInput;
        this.fileListContainer = options.fileListContainer;
        this.onFilesChanged = options.onFilesChanged || (() => {});
        this.files = [];

        this.init();
    }

    init() {
        if (!this.dropZone || !this.fileInput) return;

        // Click to browse
        this.dropZone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
                this.fileInput.click();
            }
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileList(e.target.files);
        });

        // Drag events
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dropZone.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dropZone.classList.remove('drag-over');
            }, false);
        });

        this.dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            this.handleFileList(dt.files);
        });
    }

    handleFileList(fileList) {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];

        Array.from(fileList).forEach(file => {
            // Validate type & extension
            const ext = file.name.split('.').pop().toLowerCase();
            const isValidExt = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'].includes(ext);

            if (!isValidExt) {
                alert(`Unsupported file format: .${ext}. Please upload PDF, DOC, PPT or Image files.`);
                return;
            }

            // Estimate pages: PDFs random mock or estimate size-based, Images = 1 page
            let estimatedPages = 1;
            if (ext === 'pdf') {
                estimatedPages = Math.max(1, Math.floor(file.size / (150 * 1024))); // Rough estimate ~150KB per page
            } else if (['doc', 'docx', 'ppt', 'pptx'].includes(ext)) {
                estimatedPages = Math.max(1, Math.floor(file.size / (200 * 1024)));
            }

            const fileObj = {
                id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                name: file.name,
                size: this.formatBytes(file.size),
                rawSize: file.size,
                type: file.type || ext.toUpperCase(),
                extension: ext,
                pageCount: estimatedPages,
                rawFile: file,
                config: {
                    printType: 'bw',
                    paperSize: 'A4',
                    printSides: 'single',
                    paperGsm: '80gsm',
                    paperType: 'copier',
                    orientation: 'portrait',
                    copies: 1,
                    bindingType: 'none',
                    finishing: 'none',
                    pageRange: 'all',
                    instructions: ''
                }
            };

            this.files.push(fileObj);
        });

        this.renderFileList();
        this.onFilesChanged(this.files);
    }

    removeFile(id) {
        this.files = this.files.filter(f => f.id !== id);
        this.renderFileList();
        this.onFilesChanged(this.files);
    }

    renderFileList() {
        if (!this.fileListContainer) return;
        this.fileListContainer.innerHTML = '';

        if (this.files.length === 0) return;

        this.files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'uploaded-file-item';
            item.innerHTML = `
                <div class="uploaded-file-info">
                    <div class="file-icon-badge">${file.extension.toUpperCase()}</div>
                    <div>
                        <div style="font-weight: 700; font-size: 0.95rem; color: #FFF;">${file.name}</div>
                        <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                            ${file.size} &bull; Estimated ${file.pageCount} ${file.pageCount === 1 ? 'Page' : 'Pages'}
                        </div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button type="button" class="btn btn-outline btn-sm remove-file-btn" data-id="${file.id}">✕ Remove</button>
                </div>
            `;

            this.fileListContainer.appendChild(item);
        });

        // Add event listeners to remove buttons
        this.fileListContainer.querySelectorAll('.remove-file-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.removeFile(id);
            });
        });
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}
