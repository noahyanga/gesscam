import Link from 'next/link';
import { FacebookIcon, TwitterIcon, InstagramIcon, Mail, DollarSign, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="relative bg-gradient-to-t from-ss-blue to-ss-blue/90 text-ss-white">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ss-yellow via-ss-white to-ss-yellow opacity-100" />

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Contact Section */}
          <div className="space-y-6">
            <div className="relative">
              <h3 className="text-3xl font-bold text-ss-white">
                Contact
              </h3>
              <div className="mt-2 h-0.5 w-12 bg-ss-yellow" />
            </div>

            <div className="space-y-4">
              <a href="mailto:gesscam@gmail.com"
                className="group flex items-center space-x-3 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-all duration-200">
                <Mail className="w-5 h-5 text-ss-yellow group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xl text-gray-100 group-hover:text-ss-yellow transition-colors duration-200">
                  gesscam23@gmail.com
                </span>
              </a>


              <a href="tel:+2042188245"
                className="group flex items-center space-x-3 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-all duration-200">
                <Mail className="w-5 h-5 text-ss-yellow group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xl text-gray-100 group-hover:text-ss-yellow transition-colors duration-200">
                  (204) 218-8245
                </span>
              </a>
            </div>
          </div>

          {/* Donate Section */}
          <div className="space-y-6">
            <div className="relative">
              <h3 className="text-3xl font-bold text-ss-white">
                Donate
              </h3>
              <div className="mt-2 h-0.5 w-12 bg-ss-yellow" />
            </div>

            <a href="mailto:gesscam@gmail.com"
              className="group flex items-center space-x-3 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-all duration-200">
              <DollarSign className="w-5 h-5 text-ss-yellow group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xl text-gray-100 group-hover:text-ss-yellow transition-colors duration-200">
                gesscam23@gmail.com
              </span>
            </a>
          </div>



          {/* Address Section */}
          <div className="space-y-6">
            <div className="relative">
              <h3 className="text-3xl font-bold text-ss-white">
                Address
              </h3>
              <div className="mt-2 h-0.5 w-12 bg-ss-yellow" />
            </div>

            <div className="group flex items-start space-x-3 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-all duration-200">
              <MapPin className="w-5 h-5 text-ss-yellow flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-xl text-gray-100 group-hover:text-ss-yellow transition-colors duration-200">
                <p>192 Dagmar Street</p>
                <p>Winnipeg, Manitoba</p>
                <p>R3A 0Z3</p>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-6">
            <div className="relative">
              <h3 className="text-3xl font-bold text-ss-white">
                Follow Us
              </h3>
              <div className="mt-2 h-0.5 w-12 bg-ss-yellow" />
            </div>

            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/profile.php?id=61573386839369"
                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 group">
                <FacebookIcon className="w-10 h-10 group-hover:text-ss-yellow group-hover:scale-110 transition-all duration-200" />
              </Link>

            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-gray-300 text-center text-sm">
            &copy; {new Date().getFullYear()} GESSCAM. All rights reserved.
          </p>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
