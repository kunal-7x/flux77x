import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalPortalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
  footer?: React.ReactNode;
}

const ModalPortal = ({ open, onClose, children, title, maxWidth = "max-w-md", footer }: ModalPortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            style={{ zIndex: 9998, background: "hsl(228 16% 6% / 0.8)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] ${maxWidth} flex flex-col max-h-[85vh]`}
            style={{
              zIndex: 9999,
              background: "linear-gradient(160deg, hsl(228 14% 18% / 0.95), hsl(228 14% 14% / 0.95))",
              backdropFilter: "blur(40px) saturate(1.5)",
              borderRadius: "20px",
              border: "1px solid hsl(0 0% 100% / 0.08)",
              boxShadow: "0 25px 80px -12px hsl(228 16% 4% / 0.8), inset 0 1px 0 hsl(0 0% 100% / 0.04)",
            }}
          >
            {title && (
              <div className="flex items-center justify-between p-6 pb-0 flex-shrink-0">
                <h2 className="text-foreground font-bold text-lg">{title}</h2>
                <button onClick={onClose} className="icon-button w-8 h-8"><X size={14} /></button>
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
              {children}
            </div>
            {footer && (
              <div className="flex-shrink-0 p-6 pt-0 border-t border-border/20">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ModalPortal;
