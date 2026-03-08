import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const main = async () => {
  console.log('Seeding database...');

  // Create seller user
  const passwordHash = await bcrypt.hash('Seller123', SALT_ROUNDS);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@amazonclone.com' },
    update: {},
    create: {
      name: 'Demo Seller',
      email: 'seller@amazonclone.com',
      passwordHash,
      role: 'SELLER',
      emailVerified: true,
    },
  });
  console.log(`  Seller: ${seller.email}`);

  // Create categories
  const categoryData = [
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop' },
    { name: 'Books', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop' },
    { name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
    { name: 'Clothing', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop' },
    { name: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1461896836934-bd45ba3b5173?w=400&h=300&fit=crop' },
    { name: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const slug = slugify(cat.name);
    const created = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: cat.name, slug, image: cat.image },
    });
    categories[cat.name] = created.id;
  }

  // Create subcategories
  const subCategoryData = [
    { name: 'Headphones', parent: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop' },
    { name: 'Laptops', parent: 'Electronics', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop' },
    { name: 'Phones', parent: 'Electronics', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop' },
    { name: 'Fiction', parent: 'Books', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop' },
    { name: 'Non-Fiction', parent: 'Books', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop' },
  ];

  for (const sub of subCategoryData) {
    const slug = slugify(sub.name);
    const created = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: sub.name, slug, image: sub.image, parentId: categories[sub.parent] },
    });
    categories[sub.name] = created.id;
  }
  console.log(`  Categories: ${Object.keys(categories).length}`);

  // Create products
  const productData = [
    {
      name: 'AirPods Max',
      description: 'High-fidelity audio with Active Noise Cancellation. The Apple-designed H1 chip powers computational audio for a breakthrough listening experience. Includes a Digital Crown for natural volume control and a breathable knit-mesh canopy spanning the headband for comfort.',
      price: 549.00,
      compareAtPrice: 599.00,
      stock: 45,
      ratingAvg: 4.5,
      ratingCount: 1283,
      category: 'Headphones',
      images: [
        { url: 'https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=600&h=600&fit=crop', alt: 'AirPods Max front view' },
        { url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop', alt: 'AirPods Max side view' },
        { url: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600&h=600&fit=crop', alt: 'AirPods Max with case' },
      ],
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones. Up to 30 hours of battery life with quick charging. Multipoint connection lets you switch between devices seamlessly.',
      price: 348.00,
      compareAtPrice: 399.99,
      stock: 120,
      ratingAvg: 4.7,
      ratingCount: 3421,
      category: 'Headphones',
      images: [
        { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop', alt: 'Sony WH-1000XM5 front' },
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', alt: 'Sony WH-1000XM5 on stand' },
      ],
    },
    {
      name: 'MacBook Pro 16-inch M3 Max',
      description: 'Supercharged by M3 Max chip with 14-core CPU and up to 40-core GPU. Stunning 16.2-inch Liquid Retina XDR display. Up to 22 hours of battery life. Thunderbolt 4 ports, HDMI, SDXC card slot, and MagSafe charging.',
      price: 3499.00,
      stock: 15,
      ratingAvg: 4.8,
      ratingCount: 892,
      category: 'Laptops',
      images: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop', alt: 'MacBook Pro front view' },
        { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=600&fit=crop', alt: 'MacBook Pro open' },
        { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop', alt: 'MacBook Pro side' },
      ],
    },
    {
      name: 'Dell XPS 15',
      description: 'Stunning 15.6-inch OLED InfinityEdge display with 3.5K resolution. Powered by 13th Gen Intel Core i7 processor and NVIDIA GeForce RTX 4060. 16GB RAM and 512GB SSD. Precision crafted from machined aluminum and carbon fiber.',
      price: 1799.99,
      compareAtPrice: 1999.99,
      stock: 30,
      ratingAvg: 4.4,
      ratingCount: 567,
      category: 'Laptops',
      images: [
        { url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop', alt: 'Dell XPS 15 front' },
        { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop', alt: 'Dell XPS 15 on desk' },
        { url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop', alt: 'Dell XPS 15 open' },
      ],
    },
    {
      name: 'iPhone 15 Pro Max',
      description: 'Forged in titanium with a textured matte glass back. Features the A17 Pro chip for incredible performance. 48MP main camera with 5x Telephoto. Action button for quick access to your favorite feature. USB-C with USB 3 speeds.',
      price: 1199.00,
      stock: 3,
      ratingAvg: 4.6,
      ratingCount: 5234,
      category: 'Phones',
      images: [
        { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop', alt: 'iPhone 15 Pro Max front' },
        { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop', alt: 'iPhone 15 Pro Max back' },
        { url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=600&fit=crop', alt: 'iPhone 15 Pro Max camera' },
      ],
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Galaxy AI is here. Search like never before with Circle to Search. Live Translate breaks language barriers during calls. Titanium frame with embedded S Pen. 200MP adaptive pixel camera captures stunning detail day and night.',
      price: 1299.99,
      compareAtPrice: 1419.99,
      stock: 50,
      ratingAvg: 4.5,
      ratingCount: 2891,
      category: 'Phones',
      images: [
        { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop', alt: 'Galaxy S24 Ultra front' },
        { url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&h=600&fit=crop', alt: 'Galaxy S24 Ultra back' },
        { url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=600&fit=crop', alt: 'Galaxy S24 Ultra with S Pen' },
      ],
    },
    {
      name: 'The Great Gatsby',
      description: 'A masterpiece of American fiction, F. Scott Fitzgerald\'s The Great Gatsby is a tragic love story, a mystery, and a social commentary on American life during the Jazz Age. This classic edition features the original cover art and new foreword.',
      price: 12.99,
      compareAtPrice: 16.99,
      stock: 500,
      ratingAvg: 4.3,
      ratingCount: 12450,
      category: 'Fiction',
      images: [
        { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop', alt: 'The Great Gatsby cover' },
        { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop', alt: 'The Great Gatsby open pages' },
      ],
    },
    {
      name: 'Atomic Habits',
      description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
      price: 16.99,
      stock: 200,
      ratingAvg: 4.8,
      ratingCount: 89234,
      category: 'Non-Fiction',
      images: [
        { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop', alt: 'Atomic Habits cover' },
        { url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=600&fit=crop', alt: 'Atomic Habits on shelf' },
      ],
    },
    {
      name: 'Sapiens: A Brief History of Humankind',
      description: 'In Sapiens, Dr. Yuval Noah Harari spans the whole of human history, from the very first humans to walk the earth to the radical breakthroughs of the Cognitive, Agricultural, and Scientific Revolutions.',
      price: 18.99,
      compareAtPrice: 24.99,
      stock: 150,
      ratingAvg: 4.6,
      ratingCount: 45230,
      category: 'Non-Fiction',
      images: [
        { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop', alt: 'Sapiens book cover' },
        { url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&h=600&fit=crop', alt: 'Sapiens on desk' },
      ],
    },
    {
      name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
      description: '7-in-1 functionality: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. 6-quart capacity serves up to 6 people. 13 one-touch smart programs for easy cooking. Stainless steel inner pot.',
      price: 89.99,
      compareAtPrice: 109.99,
      stock: 80,
      ratingAvg: 4.7,
      ratingCount: 34567,
      category: 'Home & Kitchen',
      images: [
        { url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&h=600&fit=crop', alt: 'Instant Pot front view' },
        { url: 'https://images.unsplash.com/photo-1583778176476-4a8b02e64b41?w=600&h=600&fit=crop', alt: 'Instant Pot in kitchen' },
      ],
    },
    {
      name: 'Dyson V15 Detect Cordless Vacuum',
      description: 'Intelligently adapts suction power to the dust it detects. Laser reveals dust you can\'t normally see. LCD screen shows scientific proof of a deep clean. Up to 60 minutes of runtime. HEPA filtration captures 99.97% of particles.',
      price: 749.99,
      stock: 25,
      ratingAvg: 4.5,
      ratingCount: 2345,
      category: 'Home & Kitchen',
      images: [
        { url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&h=600&fit=crop', alt: 'Dyson V15 Detect full view' },
        { url: 'https://images.unsplash.com/photo-1527515637462-cee1395c108c?w=600&h=600&fit=crop', alt: 'Dyson V15 Detect in use' },
      ],
    },
    {
      name: 'Levi\'s 501 Original Fit Jeans',
      description: 'The original jean since 1873. The 501 Original Fit sits at the waist, is regular through the thigh, and has a straight leg. Button fly. 100% cotton denim. The jean that started it all — an authentic American icon.',
      price: 59.50,
      compareAtPrice: 69.50,
      stock: 300,
      ratingAvg: 4.4,
      ratingCount: 15678,
      category: 'Clothing',
      images: [
        { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop', alt: 'Levi\'s 501 front' },
        { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop', alt: 'Levi\'s 501 detail' },
        { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=600&fit=crop', alt: 'Levi\'s 501 folded' },
      ],
    },
    {
      name: 'Nike Air Max 270',
      description: 'The Nike Air Max 270 features Nike\'s biggest heel Air unit yet for a super soft ride. The sleek design delivers a look that\'s just as iconic as its predecessors. Mesh and synthetic upper for breathability and support.',
      price: 150.00,
      stock: 65,
      ratingAvg: 4.5,
      ratingCount: 8901,
      category: 'Clothing',
      images: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', alt: 'Nike Air Max 270 side' },
        { url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=600&fit=crop', alt: 'Nike Air Max 270 pair' },
        { url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop', alt: 'Nike Air Max 270 top' },
      ],
    },
    {
      name: 'YETI Rambler 26 oz Bottle',
      description: 'The Rambler 26 oz Bottle is kitchen-grade stainless steel with double-wall vacuum insulation. Keeps drinks cold or hot. Fits most car cup holders. Dishwasher safe. TripleHaul cap is leakproof and easy to carry.',
      price: 40.00,
      stock: 200,
      ratingAvg: 4.8,
      ratingCount: 6543,
      category: 'Sports & Outdoors',
      images: [
        { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop', alt: 'YETI Rambler 26 oz' },
        { url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&h=600&fit=crop', alt: 'YETI Rambler outdoors' },
      ],
    },
    {
      name: 'Fitbit Charge 6',
      description: 'Get a detailed look at your health and fitness with built-in GPS, continuous heart rate tracking, Daily Readiness Score, and stress management tools. 7-day battery life. Water resistant to 50m. Works with Google apps.',
      price: 159.95,
      compareAtPrice: 179.95,
      stock: 90,
      ratingAvg: 4.3,
      ratingCount: 4567,
      category: 'Sports & Outdoors',
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop', alt: 'Fitbit Charge 6 front' },
        { url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop', alt: 'Fitbit Charge 6 on wrist' },
      ],
    },
    {
      name: 'CeraVe Moisturizing Cream',
      description: 'Developed with dermatologists, CeraVe Moisturizing Cream has a unique formula with 3 essential ceramides (1, 3, 6-II) to help restore and maintain the skin\'s natural barrier. MVE Delivery Technology provides 24-hour hydration.',
      price: 16.99,
      compareAtPrice: 19.99,
      stock: 400,
      ratingAvg: 4.7,
      ratingCount: 78901,
      category: 'Beauty & Personal Care',
      images: [
        { url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop', alt: 'CeraVe Moisturizing Cream' },
        { url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop', alt: 'CeraVe Cream close-up' },
      ],
    },
    {
      name: 'Revlon One-Step Hair Dryer & Volumizer',
      description: 'Designed to deliver gorgeous volume and brilliant shine in a single step. Unique oval brush design smooths hair while the round edges create volume. 3 heat/speed settings plus cool option. Ionic technology reduces frizz and static.',
      price: 34.99,
      compareAtPrice: 59.99,
      stock: 150,
      ratingAvg: 4.5,
      ratingCount: 23456,
      category: 'Beauty & Personal Care',
      images: [
        { url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop', alt: 'Revlon Hair Dryer' },
        { url: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=600&h=600&fit=crop', alt: 'Revlon Hair Dryer in use' },
      ],
    },
    {
      name: 'Bose SoundLink Flex Bluetooth Speaker',
      description: 'Deep, clear, immersive sound with PositionIQ technology that automatically detects orientation and adjusts sound. IP67 waterproof and dustproof. Up to 12 hours of battery. Built-in microphone for calls. Rugged and portable design.',
      price: 149.00,
      stock: 70,
      ratingAvg: 4.6,
      ratingCount: 3421,
      category: 'Electronics',
      images: [
        { url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop', alt: 'Bose SoundLink Flex front' },
        { url: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&h=600&fit=crop', alt: 'Bose SoundLink Flex outdoor' },
        { url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&h=600&fit=crop', alt: 'Bose SoundLink Flex close-up' },
      ],
    },
    {
      name: 'Kindle Paperwhite (11th Gen)',
      description: 'The thinnest, lightest Kindle Paperwhite yet with a 6.8-inch display and thinner borders. Adjustable warm light for comfortable reading day and night. Up to 10 weeks of battery life. IPX8 waterproof — read in the bath or by the pool.',
      price: 139.99,
      compareAtPrice: 149.99,
      stock: 100,
      ratingAvg: 4.7,
      ratingCount: 15678,
      category: 'Electronics',
      images: [
        { url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop', alt: 'Kindle Paperwhite front' },
        { url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=600&fit=crop', alt: 'Kindle Paperwhite reading' },
      ],
    },
    {
      name: 'Yoga Mat Premium 6mm',
      description: 'Extra thick 6mm yoga mat with superior cushioning for joint support. Non-slip textured surface ensures stability during any pose. Lightweight and easy to carry with included strap. Free from harmful phthalates and latex.',
      price: 29.99,
      compareAtPrice: 39.99,
      stock: 250,
      ratingAvg: 4.4,
      ratingCount: 5678,
      category: 'Sports & Outdoors',
      images: [
        { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop', alt: 'Yoga Mat rolled' },
        { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop', alt: 'Yoga Mat in use' },
        { url: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=600&fit=crop', alt: 'Yoga Mat flat' },
      ],
    },
    {
      name: 'KitchenAid Artisan Stand Mixer',
      description: 'The iconic KitchenAid Stand Mixer with 5-quart stainless steel bowl. 10 optimized speeds for nearly any task or recipe. Tilt-head design allows easy access to bowl and beaters. Power hub for optional attachments.',
      price: 379.99,
      compareAtPrice: 449.99,
      stock: 2,
      ratingAvg: 4.8,
      ratingCount: 12345,
      category: 'Home & Kitchen',
      images: [
        { url: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&h=600&fit=crop', alt: 'KitchenAid Stand Mixer' },
        { url: 'https://images.unsplash.com/photo-1583778176476-4a8b02e64b41?w=600&h=600&fit=crop', alt: 'KitchenAid with attachments' },
      ],
    },
    {
      name: 'Dune by Frank Herbert',
      description: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides — who would become known as Muad\'Dib — and his family\'s acceptance of stewardship of the planet and its valuable spice melange. A sweeping science fiction epic.',
      price: 14.99,
      stock: 350,
      ratingAvg: 4.7,
      ratingCount: 34567,
      category: 'Fiction',
      images: [
        { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop', alt: 'Dune book cover' },
        { url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=600&fit=crop', alt: 'Dune on bookshelf' },
      ],
    },
    {
      name: 'Patagonia Better Sweater Fleece Jacket',
      description: 'Made of 100% recycled polyester fleece. Sweater-knit face and a fleece interior for warmth. Stand-up collar with a zipper garage. Zippered hand-warmer pockets and internal chest pocket. Fair Trade Certified sewn.',
      price: 139.00,
      stock: 45,
      ratingAvg: 4.6,
      ratingCount: 4321,
      category: 'Clothing',
      images: [
        { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop', alt: 'Patagonia Fleece front' },
        { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop', alt: 'Patagonia Fleece detail' },
        { url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop', alt: 'Patagonia Fleece back' },
      ],
    },
    {
      name: 'The Ordinary Niacinamide 10% + Zinc 1%',
      description: 'A high-strength vitamin and mineral blemish formula. Niacinamide (vitamin B3) reduces the appearance of skin blemishes and congestion. Zinc PCA balances visible aspects of sebum activity. Suitable for oily and blemish-prone skin.',
      price: 6.50,
      stock: 600,
      ratingAvg: 4.4,
      ratingCount: 56789,
      category: 'Beauty & Personal Care',
      images: [
        { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop', alt: 'The Ordinary Niacinamide' },
        { url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop', alt: 'The Ordinary serum close-up' },
      ],
    },
  ];

  let productCount = 0;
  for (const product of productData) {
    const slug = slugify(product.name);
    const categoryId = categories[product.category];

    if (!categoryId) {
      console.warn(`  Skipping product "${product.name}" — category "${product.category}" not found`);
      continue;
    }

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  Skipping product "${product.name}" — already exists`);
      continue;
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        stock: product.stock,
        ratingAvg: product.ratingAvg,
        ratingCount: product.ratingCount,
        sellerId: seller.id,
        categoryId,
        images: {
          create: product.images.map((img, index) => ({
            url: img.url,
            alt: img.alt,
            displayOrder: index,
          })),
        },
      },
    });
    productCount++;
  }

  console.log(`  Products: ${productCount}`);
  console.log('Seeding complete.');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
