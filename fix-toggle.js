const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const toggleCode = `
            <button class="mobile-toggle" aria-label="Toggle Navigation Menu">
                <span></span><span></span><span></span>
            </button>`;

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('mobile-toggle')) {
        const replacementPattern = /        <\/div>\s*<\/div>\s*<\/header>/;
        if (replacementPattern.test(content)) {
            content = content.replace(replacementPattern, toggleCode + '\n        </div>\n    </div>\n</header>');
            fs.writeFileSync(f, content);
            console.log('Fixed ' + f);
        } else {
            console.log('Pattern not matched for ' + f);
        }
    }
});
