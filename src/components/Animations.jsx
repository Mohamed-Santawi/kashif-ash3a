import React from "react";
import { motion, useAnimation, useInView } from "framer-motion";

// Fade in animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animated Card Component
export const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated Section Component
export const AnimatedSection = ({ children, className = "", ...props }) => (
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    className={className}
    {...props}
  >
    {children}
  </motion.section>
);

// Animated Text Component
export const AnimatedText = ({
  children,
  className = "",
  delay = 0,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Floating Animation Component
export const FloatingCard = ({ children, className = "", ...props }) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
      rotate: [0, 1, -1, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Pulse Animation Component
export const PulseCard = ({ children, className = "", ...props }) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      ],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Gradient Background Component
export const GradientBackground = ({ children, className = "", ...props }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    className={`bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

// Glass Morphism Card
export const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={`backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl shadow-xl ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

// Animated Counter Component
export const AnimatedCounter = ({ value, duration = 2, className = "" }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min(
        (currentTime - startTime) / (duration * 1000),
        1
      );
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {count.toLocaleString()}
    </motion.span>
  );
};

// In-view Reveal (stable) - animates on scroll but renders immediately
export const Reveal = ({
  children,
  className = "",
  initial = { opacity: 0, y: 24 },
  animate = { opacity: 1, y: 0 },
  duration = 0.6,
  delay = 0,
  once = true,
  margin = "-10% 0px -10% 0px",
  as = "div",
  ...props
}) => {
  const Tag = as;
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { margin, once });

  React.useEffect(() => {
    if (isInView) controls.start(animate);
  }, [isInView, controls, animate]);

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={controls}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      <Tag>{children}</Tag>
    </motion.div>
  );
};

// Convenience wrappers
export const InViewSection = ({ children, className = "", ...props }) => (
  <Reveal as="section" className={className} {...props} />
);

export const InViewCard = ({ children, className = "", ...props }) => (
  <Reveal
    className={`rounded-2xl ${className}`}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    {...props}
  >
    {children}
  </Reveal>
);

export const InViewText = ({ children, className = "", ...props }) => (
  <Reveal
    as="div"
    className={className}
    initial={{ opacity: 0, y: 12 }}
    {...props}
  >
    {children}
  </Reveal>
);
