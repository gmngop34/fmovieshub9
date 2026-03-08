import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  Film,
  Home,
  Sparkles,
  Star,
  TrendingUp,
  Tv,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Home", to: "/", icon: Home, ocid: "sidebar.home_link" },
  { label: "Movies", to: "/movies", icon: Film, ocid: "sidebar.movies_link" },
  { label: "TV Series", to: "/tv", icon: Tv, ocid: "sidebar.tv_link" },
  { label: "Anime", to: "/anime", icon: Zap, ocid: "sidebar.anime_link" },
  {
    label: "Trending",
    to: "/trending",
    icon: TrendingUp,
    ocid: "sidebar.trending_link",
  },
  {
    label: "Top IMDb",
    to: "/top-imdb",
    icon: Star,
    ocid: "sidebar.topimdb_link",
  },
  {
    label: "New Release",
    to: "/new-release",
    icon: Sparkles,
    ocid: "sidebar.newrelease_link",
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleNav(to: string) {
    navigate({ to });
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-72 bg-[#0a0a0a] border-r border-white/10 z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
              <span className="brand-text text-lg">FreeMoviesHUB</span>
              <button
                type="button"
                data-ocid="sidebar.close_button"
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <motion.button
                    key={item.to}
                    type="button"
                    data-ocid={item.ocid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleNav(item.to)}
                    className={`sidebar-item w-full text-left ${isActive ? "active" : ""}`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </motion.button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10">
              <p className="text-gray-500 text-xs">
                © {new Date().getFullYear()} FreeMoviesHUB
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
