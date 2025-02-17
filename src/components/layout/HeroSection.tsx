import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/button";

interface HeroProps {
  title: string;
  subtitle?: string;
  heroImage: string;
  buttonText?: string;
  buttonLink?: string;
  isAdmin?: boolean;
  onEditClick?: () => void;
}

export default function HeroSection({
  title,
  subtitle,
  heroImage,
  buttonText,
  buttonLink,
  isAdmin = false,
  onEditClick
}: HeroProps) {
  return (
    <section className="relative h-[75vh] flex items-center justify-center">
      <Image
        src={heroImage}
        alt={title}
        fill
        style={{ objectFit: "cover" }}
        priority
        className="z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ss-black/70 to-ss-black/30 z-10"></div>
      <div className="relative z-20 text-center text-ss-white max-w-4xl px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xl md:text-3xl mb-10 leading-relaxed">{subtitle}</p>
        )}
        {buttonText && buttonLink && (
          <Button className="bg-ss-blue hover:bg-ss-red text-ss-white text-lg py-3 px-8 rounded-full transition-all ease-in-out duration-300 hover:scale-105">
            <Link href={buttonLink}>{buttonText}</Link>
          </Button>
        )}

        {/* Show Edit Button for Admins */}
        {isAdmin && onEditClick && (
          <button
            onClick={onEditClick}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit Image
          </button>
        )}
      </div>
    </section>
  );
}

