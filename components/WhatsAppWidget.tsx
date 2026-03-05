'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const WHATSAPP_NUMBER = '27795362485'

function WhatsAppSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("Hi Mtsinso Car Sales! I would like to find out more about your vehicles.")
  const [showBubble, setShowBubble] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => { if (!dismissed) setShowBubble(true) }, 4500)
    return () => clearTimeout(t)
  }, [dismissed])

  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
    setIsOpen(false)
  }

  return (
    <>
      {/* Attention bubble */}
      {showBubble && !isOpen && (
        <div className="fixed bottom-24 right-6 z-[90] cursor-pointer" onClick={() => { setIsOpen(true); setShowBubble(false) }}>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 text-sm text-support max-w-[190px] leading-snug font-medium">
            <button
              onClick={e => { e.stopPropagation(); setShowBubble(false); setDismissed(true) }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-muted hover:bg-support text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
            Chat with us on WhatsApp
            <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-r-0 border-t-8 border-l-transparent border-t-white" />
          </div>
        </div>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[90] w-80 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-[#25D366] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <WhatsAppSVG className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Mtsinso Car Sales</p>
                <p className="text-white/80 text-xs">Typically replies within minutes</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-[#ECE5DD] px-4 py-4">
            <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2.5 shadow-sm max-w-[85%] mb-4">
              <p className="text-sm text-support leading-relaxed">
                Hi there! How can we help you today? Send us a message and we will get back to you right away.
              </p>
              <p className="text-[10px] text-muted text-right mt-1">Mtsinso Car Sales</p>
            </div>

            <div className="bg-white rounded-2xl flex items-center gap-2 px-4 py-2 shadow-sm">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="flex-1 text-sm text-support resize-none outline-none bg-transparent leading-snug max-h-24"
                rows={2}
                placeholder="Type a message..."
              />
              <button
                onClick={openWhatsApp}
                className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#1da851] transition-colors"
              >
                <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setIsOpen(o => !o); setShowBubble(false) }}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-[#25D366] hover:bg-[#1da851] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? <X className="w-6 h-6" /> : <WhatsAppSVG className="w-7 h-7" />}
      </button>
    </>
  )
}
