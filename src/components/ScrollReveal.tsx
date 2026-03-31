import { motion, type Variant } from "framer-motion";
import { type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

interface Props {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
  once = true,
}: Props) {
  const offset = offsets[direction];

  const hidden: Variant = { opacity: 0, x: offset.x, y: offset.y };
  const visible: Variant = {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration, delay, ease: [0.25, 0.1, 0.25, 1] as const },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
      variants={{ hidden, visible }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
