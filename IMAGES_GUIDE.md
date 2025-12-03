# Panduan Menambahkan Gambar untuk Website

## Struktur Folder Gambar

```
frontend/public/images/
├── hero/
│   ├── banner-1.jpg (1920x1080px - Hero banner koleksi musim ini)
│   ├── banner-2.jpg (1920x1080px - Hero banner baggy jeans)
│   └── banner-3.jpg (1920x1080px - Hero banner diskon)
├── categories/
│   ├── mens-bottoms.jpg (400x600px - Celana pria)
│   ├── womens-bottoms.jpg (400x600px - Celana wanita)
│   ├── jackets.jpg (400x600px - Jaket denim)
│   └── accessories.jpg (400x600px - Aksesoris)
└── promo/
    ├── fit-guide.jpg (600x400px - Panduan fitting)
    ├── membership.jpg (600x400px - Program member)
    └── store-locator.jpg (600x400px - Temukan toko)
```

## Rekomendasi Gambar

### Hero Banners (1920x1080px)
- **banner-1.jpg**: Model mengenakan koleksi terbaru, background lifestyle
- **banner-2.jpg**: Close-up baggy jeans dengan styling casual
- **banner-3.jpg**: Multiple produk dengan badge diskon

### Category Cards (400x600px - Portrait)
- **mens-bottoms.jpg**: Model pria dengan celana jeans
- **womens-bottoms.jpg**: Model wanita dengan celana jeans
- **jackets.jpg**: Model dengan jaket denim
- **accessories.jpg**: Flat lay aksesoris (belt, bag, etc)

### Promotional Banners (600x400px - Landscape)
- **fit-guide.jpg**: Ilustrasi berbagai fitting jeans
- **membership.jpg**: Kartu member atau benefit visual
- **store-locator.jpg**: Foto toko atau peta

## Sumber Gambar Gratis

1. **Unsplash** (https://unsplash.com)
   - Search: "denim jeans", "fashion model", "clothing"
   - Lisensi: Gratis untuk komersial

2. **Pexels** (https://pexels.com)
   - Search: "jeans fashion", "denim wear"
   - Lisensi: Gratis untuk komersial

3. **Pixabay** (https://pixabay.com)
   - Search: "denim", "fashion"
   - Lisensi: Gratis untuk komersial

## Cara Menambahkan Gambar

1. Download gambar dari sumber di atas
2. Resize sesuai ukuran yang direkomendasikan
3. Rename file sesuai nama di struktur folder
4. Copy ke folder yang sesuai di `frontend/public/images/`

## Tools Resize Gambar Online

- **Squoosh** (https://squoosh.app) - Resize dan compress
- **ResizeImage.net** (https://resizeimage.net) - Simple resize
- **TinyPNG** (https://tinypng.com) - Compress PNG/JPG

## Catatan

- Gambar akan di-fallback ke placeholder jika tidak tersedia
- Format yang didukung: JPG, PNG, WebP
- Usahakan ukuran file < 500KB untuk loading cepat
- Gunakan nama file huruf kecil dan tanpa spasi
