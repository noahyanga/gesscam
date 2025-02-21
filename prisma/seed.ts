// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('GESSCAM2025', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@community.com' },
    update: {},
    create: {
      email: 'gesscam23@gmail.com',
      username: 'Admin',
      password: adminPassword,
      role: 'admin'
    }
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@community.com' },
    update: {},
    create: {
      email: 'user@community.com',
      username: 'user1',
      password: userPassword,
      role: 'user'
    }
  })

  // Delete existing page content to avoid conflicts
  await prisma.pageContent.deleteMany()
  await prisma.category.deleteMany()
  await prisma.newsPost.deleteMany()
  await prisma.galleryImage.deleteMany()

  // Create/update page content with upsert
  const pages = [
    {
      pageSlug: 'home',
      title: 'Welcome to GESSCAM',
      heroImage: '/images/gesscam.svg',
      content: 'Home page content...',
      images: []
    },
    {
      pageSlug: 'about',
      title: 'About Our Community',
      heroImage: '/images/map.svg',
      content: 'About page content...',
      images: []
    },
    {
      pageSlug: 'news',
      title: 'Latest News',
      heroImage: '/images/land.svg',
      content: 'News page content...',
      images: []
    },
    {
      pageSlug: 'gallery',
      title: 'Community Gallery',
      heroImage: '/images/tree.png',
      content: 'Gallery page content...',
      images: []
    },
    {
      pageSlug: 'exec-body',
      title: 'Executive Body',
      heroImage: '/images/leader.png',
      content: 'Executive body page content...',
      images: []
    }
  ]

  for (const page of pages) {
    await prisma.pageContent.upsert({
      where: { pageSlug: page.pageSlug },
      update: page,
      create: page
    })
  }

  // Create categories
  const categories = await prisma.category.createMany({
    data: [
      { name: "Community Events", slug: "community-events" },
      { name: "Cultural News", slug: "cultural-news" },
      { name: "Sports", slug: "sports" },
      { name: "Fundraising", slug: "fundraising" },
      { name: "Workshops", slug: "workshops" },
    ],
  })

  // Get created categories with proper typing
  const allCategories = await prisma.category.findMany()
  const categoryMap: Record<string, string> = allCategories.reduce((acc: Record<string, string>, category) => {
    acc[category.slug] = category.id
    return acc
  }, {} as Record<string, string>)

  await prisma.aboutPost.createMany({
    data: [
      {
        title: "Background and Guiding Principles",
        content: `
          <p>The Greater Equatoria of South Sudan Community Association (GESSCAM Inc.) was first established in July 1999 and formally incorporated in November 2009. Originally named the Greater Equatoria Association of Manitoba, the organization underwent name changes in 2018 and 2025 to better reflect its charitable mission and South Sudanese heritage.</p>
          <p>Our guiding principles include:</p>
          <ul>
            <li>Equality of members with collegial interaction</li>
            <li>Transparency and accountability in all operations</li>
            <li>Freedom of expression and respect for diverse views</li>
            <li>Honesty and forthrightness in all dealings</li>
          </ul>
        `,
        date: new Date()
      },
      {
        title: "Our Commitments",
        content: `
          <p>GESSCAM Inc. is dedicated to:</p>
          <ul>
            <li>Non-discrimination based on nationality, religion, politics, or ethnicity</li>
            <li>Promoting cultural exchange and social integration</li>
            <li>Uniting all South Sudanese communities in Manitoba</li>
            <li>Advocating for Equatorian interests through COSSCOM collaboration</li>
          </ul>
        `,
        date: new Date()
      },
      {
        title: "Main Purposes",
        content: `
          <p>Our core objectives include:</p>
          <ol>
            <li>Providing settlement services including language training, employment support, and cultural orientation</li>
            <li>Poverty relief through emergency support, food banks, and essential services</li>
            <li>Operating a community food bank and clothing distribution program</li>
            <li>Promoting racial harmony and community unity</li>
            <li>Preserving and sharing Equatorian cultural heritage through educational programs</li>
            <li>Supporting ancillary activities that further these charitable goals</li>
          </ol>
        `,
        date: new Date()
      }
    ]
  });


  await prisma.homePost.createMany({
    data: [
      {
        title: "Our Mission",
        content:
          "<p>We are dedicated to fostering a strong and engaged community. Our mission is to create meaningful opportunities for collaboration, learning, and growth.</p>",
      },
    ]
  });


  const newsPosts = [
    {
      title: "Community Festival 2024",
      content: "Join us for our annual community festival...",
      image: "/images/jug.svg",
      categories: ["community-events"]
    },
    {
      title: "Local Sports Tournament",
      content: "Exciting sports events in our community!",
      image: "/images/jug.svg",
      categories: ["sports"]
    },
    {
      title: "Fundraising Event",
      content: "Support our cause at this year’s fundraising event.",
      image: "/images/jug.svg",
      categories: ["fundraising"]
    },
    {
      title: "Cultural Celebration",
      content: "Experience the diverse cultures of our community!",
      image: "/images/jug.svg",
      categories: ["cultural-news"]
    },
    {
      title: "Volunteer Day",
      content: "Join hands and make a difference in our community!",
      image: "/images/jug.svg",
      categories: ["community-events"]
    }
  ]

  for (const post of newsPosts) {
    // Create the news post first
    const createdPost = await prisma.newsPost.create({
      data: {
        title: post.title,
        content: post.content,
        image: post.image,
        date: new Date()
      }
    })

    // Now you can use `createdPost.id` for the `NewsPostCategory` join table
    await prisma.newsPostCategory.createMany({
      data: post.categories.map(slug => ({
        newsPostId: createdPost.id, // Use the created post's ID
        categoryId: categoryMap[slug] // Map slug to categoryId
      }))
    })
  }

  // Create gallery images with categories
  const galleryImages = [
    {
      title: 'Community Gathering',
      description: 'Our monthly meetup',
      imageUrl: '/images/land.svg',
      categories: ["community-events"]
    },
    {
      title: 'Folklorama',
      description: 'Annual cultural showcase',
      imageUrl: '/images/jug.svg',
      categories: ["community-events"]
    },

    {
      title: 'Workshop Session',
      description: 'Learning new skills together',
      imageUrl: '/images/tribe3.svg',
      categories: ["workshops"]
    }
  ]

  for (const image of galleryImages) {
    // Create the gallery image first
    const createdImage = await prisma.galleryImage.create({
      data: {
        title: image.title,
        description: image.description,
        imageUrl: image.imageUrl,
        date: new Date()
      }
    })

    // Now you can use `createdImage.id` for the `GalleryImageCategory` join table
    await prisma.galleryImageCategory.createMany({
      data: image.categories.map(slug => ({
        galleryImageId: createdImage.id, // Use the created image's ID
        categoryId: categoryMap[slug] // Map slug to categoryId
      }))
    })
  }


  // prisma/seed.ts
  await prisma.execMember.createMany({
    data: [
      {
        name: "Surur Yanga",
        position: "President",
        imageUrl: "/images/folk3.svg",
        order: 1
      },
      {
        name: "Member 2",
        position: "Vice President",
        imageUrl: "/images/tribe3.svg",
        order: 2
      },
      {
        name: "Member 3",
        position: "Secretary",
        imageUrl: "/images/tribe2.svg",
        order: 2
      },
      {
        name: "Member 4",
        position: "Government Representative",
        imageUrl: "/images/tribe.svg",
        order: 2
      },
      {
        name: "Member 5",
        position: "Event Organizer",
        imageUrl: "/images/tree.png",
        order: 2
      },

      // Add other members...
    ]
  })


}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
