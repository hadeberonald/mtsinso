import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Image
              src="/logo.png"
              alt="IC Cars Logo"
              width={150}
              height={75}
              className="object-contain mb-6"
            />
            <p className="text-gray-400 mb-4 max-w-md">
              Your trusted car dealership in Pretoria. We offer a wide selection of quality vehicles 
              with financing options available.
            </p>
            <div className="space-y-2 text-gray-400">
              <p>505 Rachel de Beer Street, Pretoria North, Pretoria, 0116</p>
              <p>072 692 1127</p>
              <p>admin@iccars.co.za</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold font-display text-xl mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Browse Vehicles
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-400 hover:text-gold transition-colors duration-300">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gold font-display text-xl mb-4">Services</h3>
            <ul className="space-y-3 text-gray-400">
              <li>Vehicle Sales</li>
              <li>Finance Options</li>
              <li>Trade-Ins</li>
              <li>Quality Inspection</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-light mt-12 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} IC Cars. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
