import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from 'react';

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

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden px-6"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-ss-blue/80 to-purple-500/80">
        {heroImage && (
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover mix-blend-multiply"
            priority
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-3xl"
      >
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-base md:text-lg text-white mb-4">
            {subtitle}
          </p>
        )}

        {/* Main Button */}
        {buttonText && buttonLink && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-4"
          >
            <Link href={buttonLink}>
              <Button className="bg-white text-black hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-4 md:py-5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                {buttonText}
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Admin Edit Button */}
        {isAdmin && onEditClick && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEditClick}
            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm px-5 py-3 rounded-full border border-white/20 transition-all duration-300 text-sm md:text-base"
          >
            Edit Hero
          </motion.button>
        )}
      </motion.div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer group flex flex-col items-center gap-2"
        onClick={scrollToContent}
      >
        <span className="text-white text-xs md:text-lg font-medium tracking-wider uppercase group-hover:opacity-50 transition-opacity duration-300 text-center">
          Scroll to explore
        </span>
        <ChevronDown className="w-8 md:w-14 h-8 md:h-14 text-white opacity-80 group-hover:opacity-50 transition-all duration-300 animate-bounce" />
      </div>
    </motion.section>
  );
}

