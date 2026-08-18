const fs = require('fs');
const files = ['login.html', 'admin-login.html', 'signup.html', 'checkout.html'];
const navMenuCode = `
        <ul class="nav-menu">
            <li><a href="index.html" class="nav-link">Home</a></li>
            <li><a href="services.html" class="nav-link">Services</a></li>
            <li><a href="quick-print.html" class="nav-link">Quick Print</a></li>
            <li><a href="business.html" class="nav-link">Wholesale</a></li>
            <li><a href="contact.html" class="nav-link">Contact</a></li>
        </ul>`;

files.forEach(f => {
    try {
        let content = fs.readFileSync(f, 'utf8');
        if (!content.includes('nav-menu')) {
            content = content.replace('<div class="nav-actions">', navMenuCode + '\n        <div class="nav-actions">');
            fs.writeFileSync(f, content);
            console.log('Fixed nav-menu in ' + f);
        }
    } catch(e) {
        console.log(e);
    }
});
