// Script untuk generate PWA icons dari logo.png
// Jalankan dengan: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Sizes yang dibutuhkan untuk PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating PWA icons...');
console.log('');
console.log('Untuk menggunakan script ini, Anda perlu:');
console.log('1. Install sharp: npm install sharp --save-dev');
console.log('2. Pastikan logo.png ada di folder public/');
console.log('3. Jalankan: node scripts/generate-icons.js');
console.log('');
console.log('Alternatif manual:');
console.log('- Gunakan online tool seperti https://www.pwabuilder.com/imageGenerator');
console.log('- Upload logo.png dan download semua ukuran icon');
console.log('- Taruh di folder public/icons/');
console.log('');
console.log('Icon yang dibutuhkan:');
sizes.forEach(size => {
    console.log(`  - icon-${size}x${size}.png`);
});

// Check if sharp is installed
try {
    const sharp = require('sharp');

    const inputPath = path.join(__dirname, '../public/logo.png');
    const outputDir = path.join(__dirname, '../public/icons');

    // Create icons directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate each size
    sizes.forEach(async (size) => {
        const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

        try {
            await sharp(inputPath)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .png()
                .toFile(outputPath);

            console.log(`✓ Generated icon-${size}x${size}.png`);
        } catch (err) {
            console.error(`✗ Failed to generate icon-${size}x${size}.png:`, err.message);
        }
    });

} catch (e) {
    console.log('Sharp not installed. Please install it first:');
    console.log('npm install sharp --save-dev');
}
