const fs = require('fs');
const files = ['dashboard.html', 'orders.html', 'wholesale-order.html'];
const linksCode = `
            <li><a href="index.html" class="nav-link">Main Site</a></li>
            <li><a href="quick-print.html" class="nav-link">Quick Print</a></li>`;

files.forEach(f => {
    try {
        let content = fs.readFileSync(f, 'utf8');
        if (!content.includes('Main Site')) {
            content = content.replace('<li><a href="dashboard.html"', linksCode + '\n            <li><a href="dashboard.html"');
            fs.writeFileSync(f, content);
            console.log('Fixed dashboard nav-menu in ' + f);
        }
    } catch(e) {
        console.log(e);
    }
});
