// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@community.com' },
    update: {},
    create: {
      email: 'admin@community.com',
      username: 'admin',
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
      heroImage: '/images/jug.svg',
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
      heroImage: '/images/folk.svg',
      content: 'Gallery page content...',
      images: []
    },
    {
      pageSlug: 'schedule',
      title: 'Event Schedule',
      heroImage: '/images/tribe3.svg',
      content: 'Schedule page content...',
      images: []
    },
    {
      pageSlug: 'membership',
      title: 'Membership',
      heroImage: '/images/tribe.svg',
      content: 'Membership page content...',
      images: []
    },
    {
      pageSlug: 'exec-body',
      title: 'Executive Body',
      heroImage: '/images/tribe2.svg',
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
      { name: "Gallery Highlights", slug: "gallery-highlights" },
    ],
  })

  // Get created categories with proper typing
  const allCategories = await prisma.category.findMany()
  const categoryMap: Record<string, string> = allCategories.reduce((acc: Record<string, string>, category) => {
    acc[category.slug] = category.id
    return acc
  }, {} as Record<string, string>)


  // Create about us headings
  await prisma.aboutPost.createMany({
    data: [
      {
        title: "Our History",
        content: "<p>The Greater Equatoria of South Sudan Community Association was founded in 1999...</p>",
        date: new Date()
      },
      {
        title: "Our Mission",
        content: "<p>We strive to create a vibrant community by...</p>",
        date: new Date()
      },
      {
        title: "Our Values",
        content: "<ul><li>Unity</li><li>Transparency</li><li>Cultural Pride</li></ul>",
        date: new Date()
      }
    ]
  });

  await prisma.homePost.createMany({
    data: [
      {
        title: "Our Mission",
        content: "<p>We strive to create a vibrant community by...</p>",
      },
      {
        title: "Our Values",
        content: "<ul><li>Unity</li><li>Transparency</li><li>Cultural Pride</li></ul>"
      }
    ]
  });





  // Create news posts with categories
  const newsPosts = [
    {
      title: "Community Festival 2024",
      content: "Join us for our annual community festival...",
      image: "/images/jug.svg",
      categories: ["community-events", "cultural-news"]
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
    await prisma.newsPost.create({
      data: {
        title: post.title,
        content: post.content,
        image: post.image,
        date: new Date(),
        categories: {
          connect: post.categories.map(slug => ({ id: categoryMap[slug] }))
        }
      }
    })
  }

  // Create gallery images with categories
  const galleryImages = [
    {
      title: 'Community Gathering',
      description: 'Our monthly meetup',
      imageUrl: '/images/land.svg',
      categories: ["community-events", "gallery-highlights"]
    },
    {
      title: 'Workshop Session',
      description: 'Learning new skills together',
      imageUrl: '/images/folk2.svg',
      categories: ["workshops"]
    }
  ]

  for (const image of galleryImages) {
    await prisma.galleryImage.create({
      data: {
        title: image.title,
        description: image.description,
        imageUrl: image.imageUrl,
        categories: {
          connect: image.categories.map(slug => ({ id: categoryMap[slug] }))
        }
      }
    })
  }

  // prisma/seed.ts
  await prisma.execMember.createMany({
    data: [
      {
        name: "Surur Yanga",
        position: "President",
        imageUrl: "/images/folk.svg",
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
        imageUrl: "/images/globe.svg",
        order: 2
      },
      {
        name: "Member 5",
        position: "Event Organizer",
        imageUrl: "/images/window.svg",
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
