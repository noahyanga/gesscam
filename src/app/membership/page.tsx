import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Button from "@/components/ui/button"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import Link from 'next/link'

export default function News() {
  const newsItems = [
    {
      title: "Surur Yanga",
      excerpt: "Chief Executive Officer",
      image: "/folk.svg?height=200&width=400"
    },
    {
      title: "Member 2",
      excerpt: "We're excited to announce our new program connecting South Sudanese youth with successful professionals in various fields.",
      image: "/folk2.svg?height=200&width=400"
    },
    {
      title: "Member 3",
      excerpt: "In partnership with local health authorities, we're organizing a vaccination drive for our community members.",
      image: "/folk3.svg?height=200&width=400"
    },
]


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="relative h-[40vh] flex items-center justify-center">
          <Image 
            src="/tribe.svg?height=400&width=1920" 
            alt="GESSCAM news" 
            fill 
            style={{objectFit: "cover"}}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ss-black/70 to-ss-black/30"></div>
          <h1 className="relative z-10 text-4xl md:text-6xl font-bold text-ss-white text-center">Memberships</h1>
        </section>

        <section className="py-16 bg-gradient-to-b from-ss-white to-ss-blue/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((item, index) => (
                <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <Image 
                      src={item.image || "/placeholder.svg"} 
                      alt={item.title} 
                      width={200} 
                      height={100} 
                      className="rounded-t-lg"
                    />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-4xl md:text-4xl font-bold text-ss-blue mb-2">{item.title}</CardTitle>
                    <p className="md:text-2xl text-ss-black">{item.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


