const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'client', 'public', 'images', 'services');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function downloadImage(url, filename) {
    const dest = path.join(outDir, filename);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`unexpected response ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(dest, buffer);
    return `/images/services/${filename}`;
}

const items = [
  { slug: "spiral-binding", title: "Spiral Binding", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/spiral-binding-A4/691d6d90c0d31_1763536272.jpeg?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=8f551e7650755ccb3880f70043b87800431253e75be5223fc3680799bbef8785" },
  { slug: "plan-print-outs", title: "Plan Printouts", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/plan-print-outs/691d6dba67380_1763536314.jpeg?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=dc207d440708808c4ba15f86d7b36b657ac8b6ab5d61b44ef200742e3fda0a06" },
  { slug: "business-cards", title: "Business Cards", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/business-cards/691d6d656a5aa_1763536229.jpeg?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=7f6fd4bbc92d3d63c2a8566fb7ed1760c065c95459586d6307cb9d9e9c3f6bb9" },
  { slug: "a4-printouts", title: "A4 Printouts", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/a4-printouts/691d6de545934_1763536357.jpeg?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=a1846e886da89c022f9ca922b2191a24318639d8bc6ea7358fbedb49c5949dfd" },
  { slug: "perfect-binding", title: "Perfect Binding", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/perfect-binding/699eb6f507ee0_1772009205.webp?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=b2cfda67114a39c3d1f320df0801bbb6bcb3c6ad5a347acf5dbb9983a72819ee" },
  { slug: "brochures", title: "Brochures", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/brochures/69e856a75403a_1776834215.webp?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=100afd762bf6808aed953c614419654dde9293b471bf5bb470941072fd51bcc1" },
  { slug: "certificates", title: "Certificates", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/certificates/69d8976fa09d2_1775802223.jpeg?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=4c876adb392585a53d54881c64df68c9c5fa2037b615c6d6908ee4cf96e0c97d" },
  { slug: "wiro-binding", title: "Wiro Binding", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/wiro-binding-A4/69a69b6be18ab_1772526443.webp?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=ff73175eae08da437f2e0bf1fad3a800c6cf6bf60b5ab6f1094a6f704dfb248e" },
  { slug: "soft-binding", title: "Soft Binding", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/soft-binding/69b2a0146c949_1773314068.webp?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=7e78d0cefc134d2a8ac102306c4ed1cc50f0e6f3772966a70374748a7ee7efb1" },
  { slug: "document-ocr", title: "Document OCR", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/document-ocr/6a89f88a7b2d2_1787426954.webp?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=749d6e721cd99e5b95bcf14bb99150f8602be49a6dd1fcef2dd1d2a6356ccfb0" },
  { slug: "rexin-binding", title: "Rexin Binding", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/rexin-binding/6996b6dbe767a_1771484891.webp?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=b6bc64a060a9b1a6b3619734facdbd8e4ce258fa4994d80b4f9033691dad07d3" },
  { slug: "moroccan-hard-binding", title: "Moroccan Hard Binding", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/moroccon-hard-binding/69b2a0446dc46_1773314116.webp?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=a1923db6e317eafc9dd1a906b9c5b52681a2ed7d2277a8a917ede93ade8b51e5" },
  { slug: "hard-binding", title: "Hard Binding", url: "https://s3.ap-south-1.amazonaws.com/asx-laravel/uploads/superitem/hard-binding/69d7524f81f43_1775718991.webp?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUZGPXZPHUIWWUAXZ%2F20260830%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260830T073025Z&X-Amz-SignedHeaders=host&X-Amz-Expires=2100&X-Amz-Signature=c532234864979963a5f97866f6822301b9dc244e41fe50230846abb830ce2064" }
];

async function run() {
    const services = [];
    
    for (const item of items) {
        console.log(`Downloading: ${item.title}`);
        try {
            const ext = item.url.includes('.webp') ? '.webp' : '.jpg';
            const localPath = await downloadImage(item.url, item.slug + ext);
            services.push({
                title: item.title,
                icon: 'print', // default icon
                image: localPath,
                description: item.title
            });
        } catch (e) {
            console.error(`Failed to download ${item.title}:`, e.message);
        }
    }
    
    console.log("-----------------------");
    console.log("REACT ARRAY:");
    console.log(JSON.stringify(services, null, 2));
}

run();
