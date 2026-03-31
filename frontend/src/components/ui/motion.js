export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const softFade = {
  hidden: { opacity: 0, scale: 0.98, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const viewportOnce = {
  once: true,
  amount: 0.18,
};

export const cardHover = {
  rest: {
    y: 0,
    rotateX: 0,
    rotateY: 0,
    boxShadow: "0 22px 60px rgba(17,17,17,0.08)",
  },
  hover: {
    y: -12,
    rotateX: 2,
    rotateY: -2,
    boxShadow: "0 30px 80px rgba(17,17,17,0.15), 0 0 0 1px rgba(17,17,17,0.06)",
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
