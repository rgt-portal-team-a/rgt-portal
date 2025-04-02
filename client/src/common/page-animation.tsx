/* eslint-disable @typescript-eslint/no-empty-object-type */
import { AnimatePresence, motion } from "framer-motion";

interface IAnimation {
  children: React.ReactNode;
  key: string;
  initial?: {};
  animate?: {};
  transition?: {};
  classname?: string;
}
export const AnimationWrapper = ({
  children,
  key,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition = { duration: 2 },
  classname,
}: IAnimation) => {
  return (
    <AnimatePresence>
      <motion.div
        key={key}
        initial={initial}
        animate={animate}
        transition={transition}
        className={classname}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
