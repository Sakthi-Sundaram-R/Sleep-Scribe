import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Animates a heading in word-by-word with a blur + rise, triggered on view.
// `gradient` words get the animated aurora gradient treatment.
export default function SplitText({
  text,
  gradient = [],
  gradientClass = "text-gradient",
  className,
  delay = 0,
  as: Tag = "h2",
}: {
  text: string;
  gradient?: string[];
  gradientClass?: string;
  className?: string;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
}) {
  const words = text.split(" ");
  const MotionTag = motion(Tag as keyof JSX.IntrinsicElements) as typeof motion.h2;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {words.map((w, i) => {
        const clean = w.replace(/[.,]/g, "");
        const isGradient = gradient.includes(clean);
        return (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
              show: {
                opacity: 1,
                y: "0em",
                filter: "blur(0px)",
                transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
              },
            }}
          >
            <span className={isGradient ? gradientClass : undefined}>{w}</span>
            {i < words.length - 1 ? " " : null}
          </motion.span>
        );
      })}
    </MotionTag>
  );
}

export function SplitChildren({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
