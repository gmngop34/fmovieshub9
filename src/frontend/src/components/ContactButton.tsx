import { Mail, MessageCircle, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useGetContactInfo } from "../hooks/useQueries";

export function ContactButton() {
  const [open, setOpen] = useState(false);
  const { data: contactInfo } = useGetContactInfo();

  const info =
    contactInfo || "Email: support@freemovieshub.com\nTelegram: @FreeMoviesHUB";

  const lines = info.split("\n");

  return (
    <>
      {/* Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            data-ocid="contact.modal"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-[90] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#141414]">
              <h3 className="text-white font-semibold text-sm">Contact Us</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close contact popup"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {lines.map((line) => {
                const isEmail = line.toLowerCase().includes("email");
                const isPhone =
                  line.toLowerCase().includes("phone") ||
                  line.toLowerCase().includes("telegram") ||
                  line.toLowerCase().includes("whatsapp");
                const Icon = isEmail ? Mail : isPhone ? Phone : MessageCircle;
                return (
                  <div key={line} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00dd55]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-[#00dd55]" />
                    </div>
                    <p className="text-gray-300 text-sm break-words">{line}</p>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-white/10 bg-[#141414]">
              <p className="text-gray-500 text-xs text-center">
                We typically respond within 24 hours
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        type="button"
        data-ocid="contact.open_modal_button"
        onClick={() => setOpen(!open)}
        className="floating-btn"
        aria-label="Contact us"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </>
  );
}
