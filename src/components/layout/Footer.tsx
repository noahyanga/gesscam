import Link from 'next/link';
import Button from "@/components/ui/button";
import { FacebookIcon, TwitterIcon, InstagramIcon, Mail, DollarSign, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-ss-blue text-ss-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-3xl font-bold mb-4 border-b-2 border-ss-yellow inline-block pb-2">Contact</h3>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-ss-yellow" />
              <a href="mailto:info@gesscam.ca" className="text-xl hover:text-ss-yellow transition-colors duration-300">info@gesscam.ca</a>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-ss-yellow" />
              <a href="mailto:admin@gesscam.ca" className="text-xl hover:text-ss-yellow transition-colors duration-300">admin@gesscam.ca</a>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-ss-yellow" />
              <a href="tel:+1234567890" className="text-xl hover:text-ss-yellow transition-colors duration-300">(123) 456-8890</a>
            </div>

          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold mb-4 border-b-2 border-ss-yellow inline-block pb-2">Donate</h3>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-ss-yellow" />
              <a href="mailto:info@gesscam.ca" className="text-xl hover:text-ss-yellow transition-colors duration-300">donate@gesscam.ca</a>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold mb-4 border-b-2 border-ss-yellow inline-block pb-2">Address</h3>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-ss-yellow flex-shrink-0 mt-1" />
              <p className='text-xl'>192 Dagmar Street<br />Winnipeg, Manitoba, R3A 0Z3</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold mb-4 border-b-2 border-ss-yellow inline-block pb-2">Follow Us</h3>
            <div className="mr-8 flex space-x-4">
              <Button variant="text" className="hover:bg-ss-yellow hover:text-ss-white transition-colors duration-300">
                <Link href="#" aria-label="Facebook">
                  <FacebookIcon className="w-8 h-8" />
                </Link>
              </Button>
              <Button variant="text" className="hover:bg-ss-yellow hover:text-ss-white transition-colors duration-300">
                <Link href="#" aria-label="Twitter">
                  <TwitterIcon className="w-8 h-8" />
                </Link>
              </Button>
              <Button variant="text" className="hover:bg-ss-yellow hover:text-ss-white transition-colors duration-300">
                <Link href="#" aria-label="Instagram">
                  <InstagramIcon className="w-8 h-8" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-ss-white/20 text-center">
          <p>&copy; 2025 GESSCAM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

