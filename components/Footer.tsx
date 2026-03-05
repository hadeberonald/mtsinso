import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-support text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-display text-xl font-bold">M</span>
              </div>
              <div>
                <span className="font-display text-2xl text-white leading-none">Mtsinso</span>
                <span className="block text-xs text-white/40 uppercase tracking-widest mt-0.5">Motors</span>
              </div>
            </div>
            <p className="text-white/50 mb-6 max-w-sm text-sm leading-relaxed">
              Your trusted vehicle dealership. We offer a carefully selected range of quality vehicles with financing options to suit every budget.
            </p>
            <div className="space-y-1.5 text-white/50 text-sm">
              <p>admin@mtsinso.co.za</p>
              <p>072 692 1127</p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">Navigation</h3>
            <ul className="space-y-3">
              {[
                { href: '/',         label: 'Home' },
                { href: '/vehicles', label: 'Browse Vehicles' },
                { href: '/about',    label: 'About Us' },
                { href: '/contact',  label: 'Contact' },
                { href: '/auth/login', label: 'Staff Login' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/50 hover:text-white transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">Services</h3>
            <ul className="space-y-3 text-white/50 text-sm">
              {['Vehicle Sales', 'Finance Options', 'Trade-Ins', 'Quality Inspection', 'Test Drives'].map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} Mtsinso Car Sales. All rights reserved.</p>
          <p className="text-white/20 text-xs">Quality vehicles. Honest service.</p>
        </div>
      </div>
    </footer>
  )
}
