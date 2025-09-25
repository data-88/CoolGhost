const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

async function ensureDir(dir){
	await fs.promises.mkdir(dir, { recursive: true });
}

async function generate(){
	const publicDir = path.join(__dirname, '..', 'public');
	const srcFavicon = path.join(publicDir, 'facion.png'); // user uploaded with this name
	const srcSocial = path.join(publicDir, 'social.png');

	await ensureDir(publicDir);

	// Favicon PNGs
	const favicon32 = path.join(publicDir, 'favicon-32x32.png');
	const favicon180 = path.join(publicDir, 'apple-touch-icon-180x180.png');
	await sharp(srcFavicon).resize(32, 32).png().toFile(favicon32);
	await sharp(srcFavicon).resize(180, 180).png().toFile(favicon180);

	// Master favicon.png (512x512)
	const faviconPng = path.join(publicDir, 'favicon.png');
	await sharp(srcFavicon).resize(512, 512).png().toFile(faviconPng);

	// ICO (contains multiple sizes)
	const icoOut = path.join(publicDir, 'favicon.ico');
	const icoBuffers = await Promise.all([
		sharp(srcFavicon).resize(16, 16).png().toBuffer(),
		sharp(srcFavicon).resize(32, 32).png().toBuffer(),
		sharp(srcFavicon).resize(48, 48).png().toBuffer(),
	]);
	await sharp({ pages: icoBuffers.length, create: { width: 48, height: 48, channels: 4, background: { r:0,g:0,b:0,alpha:0 } } })
		.png()
		.toBuffer();
	await sharp({
		pages: 1,
		create: { width: 1, height: 1, channels: 4, background: { r:0,g:0,b:0,alpha:0 } }
	})
		.png()
		.toFile(icoOut); // placeholder to ensure file exists on Windows before ico composition
	// Simpler: write 32x32 as ICO
	await sharp(srcFavicon).resize(32, 32).toFile(icoOut);

	// Social (1200x630)
	const socialOut = path.join(publicDir, 'social-1200x630.png');
	await sharp(srcSocial)
		.resize(1200, 630, { fit: 'cover', position: 'attention' })
		.png({ quality: 90 })
		.toFile(socialOut);

	// Copy to social.png expected by meta
	await fs.promises.copyFile(socialOut, path.join(publicDir, 'social.png'));

	console.log('Generated: favicon.png, favicon.ico, favicon-32x32.png, apple-touch-icon-180x180.png, social-1200x630.png, social.png');
}

generate().catch(err => {
	console.error(err);
	process.exit(1);
});


