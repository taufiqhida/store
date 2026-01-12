const mariadb = require('mariadb');

async function main() {
    console.log('📝 Menambahkan artikel contoh...');

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    try {
        const articles = [
            {
                title: 'Tips Memilih Layanan Streaming yang Tepat',
                slug: 'tips-memilih-layanan-streaming',
                content: `Memilih layanan streaming yang tepat bisa jadi membingungkan dengan banyaknya pilihan yang ada saat ini. Berikut beberapa tips yang bisa membantu Anda:

1. **Pertimbangkan Konten yang Anda Suka**
Netflix cocok untuk film dan serial original, Spotify untuk musik, dan YouTube Premium untuk video kreator.

2. **Bandingkan Harga**
Pastikan harga sesuai dengan budget Anda. Opsi sharing biasanya lebih terjangkau.

3. **Cek Kualitas Streaming**
Pastikan layanan mendukung kualitas yang Anda inginkan (HD, 4K, dll).

4. **Perhatikan Fitur Offline**
Beberapa layanan memungkinkan download untuk ditonton offline.

Semoga tips ini membantu! Jika ada pertanyaan, jangan ragu hubungi kami via WhatsApp.`,
                image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
                isPublished: true
            },
            {
                title: 'Keuntungan Menggunakan ChatGPT Plus',
                slug: 'keuntungan-chatgpt-plus',
                content: `ChatGPT Plus adalah versi premium dari ChatGPT yang menawarkan berbagai keuntungan:

🚀 **Akses ke GPT-4**
Model AI terbaru dan paling canggih dari OpenAI dengan kemampuan reasoning yang lebih baik.

⚡ **Response Lebih Cepat**
Tidak perlu antri saat server sibuk, akses prioritas kapan saja.

🎨 **Fitur Premium**
Termasuk DALL-E untuk generate gambar, Code Interpreter, dan akses ke Plugin.

💼 **Produktivitas Meningkat**
Cocok untuk pekerja, pelajar, dan profesional yang butuh bantuan AI sehari-hari.

Dapatkan ChatGPT Plus dengan harga terjangkau hanya di Taufiq Store!`,
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
                isPublished: true
            },
            {
                title: 'Cara Aman Bertransaksi Online',
                slug: 'cara-aman-bertransaksi-online',
                content: `Keamanan dalam bertransaksi online sangat penting. Berikut tips agar transaksi Anda aman:

🔒 **Gunakan Toko Terpercaya**
Pastikan membeli dari toko yang memiliki reputasi baik dan testimoni positif.

📱 **Verifikasi Via WhatsApp**
Komunikasi langsung via WhatsApp memberikan keamanan ekstra dan respons cepat.

💳 **Pilih Metode Pembayaran Aman**
Gunakan metode pembayaran yang familiar seperti transfer bank atau e-wallet.

📝 **Simpan Bukti Transaksi**
Selalu simpan kode pemesanan dan bukti transfer untuk referensi.

✅ **Garansi Produk**
Pilih produk bergaransi untuk keamanan ekstra jika terjadi masalah.

Taufiq Store selalu mengutamakan keamanan dan kepuasan pelanggan!`,
                image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
                isPublished: true
            }
        ];

        for (const art of articles) {
            // Check if exists
            const existing = await conn.query('SELECT id FROM Article WHERE slug = ?', [art.slug]);

            if (existing.length > 0) {
                console.log(`- ${art.title}: sudah ada, skip`);
            } else {
                await conn.query(
                    'INSERT INTO Article (title, slug, content, image, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                    [art.title, art.slug, art.content, art.image, art.isPublished ? 1 : 0]
                );
                console.log(`✅ ${art.title}: ditambahkan`);
            }
        }

        console.log('\n🎉 Artikel berhasil ditambahkan!');
        console.log('📖 Buka http://localhost:5174/artikel untuk melihat');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await conn.end();
    }
}

main();
