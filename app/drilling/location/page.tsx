import Link from "next/link";

export const metadata = {
  title:
    "\u0418\u0437\u0431\u043e\u0440 \u043d\u0430 \u043c\u044f\u0441\u0442\u043e \u0437\u0430 \u0441\u043e\u043d\u0434\u0430\u0436 | Sondi.bg",
  description:
    "\u041a\u0430\u043a \u0441\u0435 \u0438\u0437\u0431\u0438\u0440\u0430 \u043c\u044f\u0441\u0442\u043e \u0437\u0430 \u0441\u043e\u043d\u0434\u0430\u0436 \u0441\u043f\u043e\u0440\u0435\u0434 \u0440\u0435\u043b\u0435\u0444\u0430, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f\u0442\u0430, \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u0442\u0435 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438 \u0438 \u043b\u043e\u043a\u0430\u043b\u043d\u043e\u0442\u043e \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435.",
};

const text = {
  eyebrow:
    "\u0421\u043e\u043d\u0434\u0430\u0436\u0438 \u00b7 \u0418\u0437\u0431\u043e\u0440 \u043d\u0430 \u043c\u044f\u0441\u0442\u043e",

  hero1:
    "\u0414\u043e\u0431\u0440\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430",

  hero2:
    "\u0437\u0430\u043f\u043e\u0447\u0432\u0430 \u0441 \u0434\u043e\u0431\u0440\u0430 \u043a\u0430\u0440\u0442\u0438\u043d\u0430.",

  intro:
    "\u0421\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u043d\u0435 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0437\u0430\u043f\u043e\u0447\u0432\u0430 \u0441 \u0432\u044a\u043f\u0440\u043e\u0441\u0430 \u201e\u043a\u044a\u0434\u0435 \u0438\u043c\u0430 \u043c\u044f\u0441\u0442\u043e \u0437\u0430 \u043c\u0430\u0448\u0438\u043d\u0430\u0442\u0430\u201c. \u041f\u044a\u0440\u0432\u043e \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u0440\u0430\u0437\u0431\u0435\u0440\u0435 \u043a\u0430\u043a \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u044f\u0442 \u0442\u0435\u0440\u0435\u043d\u044a\u0442, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f\u0442\u0430 \u0438 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u0442\u0435 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438 \u043f\u043e\u0434 \u043d\u0435\u0433\u043e.",

  mapButton:
    "\u041f\u0440\u043e\u0432\u0435\u0440\u0438 \u043c\u044f\u0441\u0442\u043e \u043d\u0430 \u043a\u0430\u0440\u0442\u0430 \u2192",

  back:
    "\u2190 \u041a\u044a\u043c \u0421\u043e\u043d\u0434\u0430\u0436\u0438",

  pointA: "\u0422\u043e\u0447\u043a\u0430 A",
  pointB: "\u0422\u043e\u0447\u043a\u0430 B",
  pointC: "\u0422\u043e\u0447\u043a\u0430 C",

  surface:
    "\u043f\u043e\u0432\u044a\u0440\u0445\u043d\u043e\u0441\u0442\u043d\u0438 \u043d\u0430\u0441\u043b\u0430\u0433\u0438",

  aquifer:
    "\u043f\u0435\u0440\u0441\u043f\u0435\u043a\u0442\u0438\u0432\u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0437\u043e\u043d\u0430",

  structure:
    "\u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u043d\u0430 \u0437\u043e\u043d\u0430",

  example:
    "\u041f\u0440\u0438\u043c\u0435\u0440\u043d\u0430 \u043b\u043e\u0433\u0438\u043a\u0430",

  exampleText:
    "\u041d\u0430\u0439-\u0434\u043e\u0431\u0440\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430 \u043d\u0435 \u0435 \u043d\u0435\u043f\u0440\u0435\u043c\u0435\u043d\u043d\u043e \u043c\u044f\u0441\u0442\u043e\u0442\u043e \u0441 \u043d\u0430\u0439-\u0441\u0438\u043b\u0435\u043d \u0435\u0434\u0438\u043d\u0438\u0447\u0435\u043d \u0441\u0438\u0433\u043d\u0430\u043b. \u0412\u0430\u0436\u043d\u0430 \u0435 \u0432\u0440\u044a\u0437\u043a\u0430\u0442\u0430 \u043c\u0435\u0436\u0434\u0443 \u0442\u0435\u0440\u0435\u043d\u0430, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f\u0442\u0430 \u0438 \u043f\u0440\u043e\u0441\u043b\u0435\u0434\u0438\u043c\u0430\u0442\u0430 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u0432 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430.",

  principle:
    "\u041e\u0441\u043d\u043e\u0432\u043d\u0438\u044f\u0442 \u043f\u0440\u0438\u043d\u0446\u0438\u043f",

  principleTitle:
    "\u0415\u0434\u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u0441\u0430\u043c\u0430 \u043f\u043e \u0441\u0435\u0431\u0435 \u0441\u0438 \u0440\u044f\u0434\u043a\u043e \u0435 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u0430.",

  principleText:
    "\u0414\u043e\u0431\u0440\u0430\u0442\u0430 \u043f\u0440\u0435\u043f\u043e\u0440\u044a\u043a\u0430 \u0438\u0434\u0432\u0430 \u043e\u0442 \u0441\u044a\u0432\u043f\u0430\u0434\u0435\u043d\u0438\u0435 \u043d\u0430 \u043d\u044f\u043a\u043e\u043b\u043a\u043e \u043d\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043c\u0438 \u043f\u0440\u0438\u0437\u043d\u0430\u043a\u0430. \u0422\u043e\u0432\u0430 \u043d\u0430\u043c\u0430\u043b\u044f\u0432\u0430 \u0440\u0438\u0441\u043a\u0430 \u043e\u0442 \u0438\u0437\u0431\u043e\u0440 \u0441\u0430\u043c\u043e \u043f\u043e \u0435\u0434\u0438\u043d\u0438\u0447\u043d\u0430 \u0430\u043d\u043e\u043c\u0430\u043b\u0438\u044f.",

  mistake:
    "\u0427\u0435\u0441\u0442\u0430 \u0433\u0440\u0435\u0448\u043a\u0430",

  mistakeTitle:
    "\u041d\u0430\u0439-\u0441\u0438\u043b\u043d\u0430\u0442\u0430 \u0440\u0435\u0430\u043a\u0446\u0438\u044f \u043d\u0435 \u0432\u0438\u043d\u0430\u0433\u0438 \u0435 \u043d\u0430\u0439-\u0434\u043e\u0431\u0440\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e.",

  mistakeP1:
    "\u0421\u0438\u043b\u0435\u043d \u043b\u043e\u043a\u0430\u043b\u0435\u043d \u043e\u0442\u0433\u043e\u0432\u043e\u0440 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0435 \u0441\u0432\u044a\u0440\u0437\u0430\u043d \u0441 \u0433\u043b\u0438\u043d\u0430, \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f, \u043b\u0438\u0442\u043e\u043b\u043e\u0436\u043a\u0438 \u043a\u043e\u043d\u0442\u0430\u043a\u0442 \u0438\u043b\u0438 \u043b\u043e\u043a\u0430\u043b\u043d\u043e \u0443\u0434\u0435\u0431\u0435\u043b\u044f\u0432\u0430\u043d\u0435 \u043d\u0430 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430\u0442\u0430.",

  mistakeP2:
    "\u0417\u0430\u0442\u043e\u0432\u0430 \u0438\u0437\u0431\u043e\u0440\u044a\u0442 \u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u043e\u0442\u0447\u0438\u0442\u0430 \u0446\u044f\u043b\u043e\u0441\u0442\u043d\u0430\u0442\u0430 \u0433\u0435\u043e\u043c\u0435\u0442\u0440\u0438\u044f, \u0441\u044a\u0441\u0435\u0434\u043d\u0438\u0442\u0435 \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f \u0438 \u0440\u0435\u0430\u043b\u043d\u0438\u044f \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442.",

  next:
    "\u0421\u043b\u0435\u0434\u0432\u0430\u0449\u0430 \u0442\u0435\u043c\u0430",

  depth:
    "\u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0438 \u0434\u0435\u0431\u0438\u0442",

  depthText:
    "\u0421\u043b\u0435\u0434 \u043a\u0430\u0442\u043e \u043c\u044f\u0441\u0442\u043e\u0442\u043e \u0435 \u0438\u0437\u0431\u0440\u0430\u043d\u043e, \u0441\u043b\u0435\u0434\u0432\u0430\u0449\u0438\u044f\u0442 \u0432\u044a\u043f\u0440\u043e\u0441 \u0435 \u043a\u043e\u043b\u043a\u043e \u0434\u044a\u043b\u0431\u043e\u043a\u043e \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u0441\u043e\u043d\u0434\u0438\u0440\u0430 \u0438 \u043a\u0430\u043a\u0432\u043e \u0440\u0435\u0430\u043b\u043d\u043e \u043e\u0437\u043d\u0430\u0447\u0430\u0432\u0430 \u043e\u0447\u0430\u043a\u0432\u0430\u043d\u0438\u044f\u0442 \u0434\u0435\u0431\u0438\u0442.",

  continue:
    "\u041f\u0440\u043e\u0434\u044a\u043b\u0436\u0438 \u2192",
};

const cards = [
  {
    number: "01",
    title:
      "\u0420\u0435\u043b\u0435\u0444 \u0438 \u0434\u0435\u043d\u0438\u0432\u0435\u043b\u0430\u0446\u0438\u044f",
    body:
      "\u041f\u043e-\u043d\u0438\u0441\u043a\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430 \u043f\u043e\u043d\u044f\u043a\u043e\u0433\u0430 \u0435 \u043f\u043e-\u0431\u043b\u0430\u0433\u043e\u043f\u0440\u0438\u044f\u0442\u043d\u0430, \u043d\u043e \u0442\u043e\u0432\u0430 \u043d\u0435 \u0435 \u0443\u043d\u0438\u0432\u0435\u0440\u0441\u0430\u043b\u043d\u043e \u043f\u0440\u0430\u0432\u0438\u043b\u043e. \u0412\u0430\u0436\u043d\u0430 \u0435 \u0432\u0440\u044a\u0437\u043a\u0430\u0442\u0430 \u043c\u0435\u0436\u0434\u0443 \u0440\u0435\u043b\u0435\u0444\u0430 \u0438 \u043f\u0440\u0435\u0434\u043f\u043e\u043b\u0430\u0433\u0430\u0435\u043c\u0430\u0442\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430.",
  },
  {
    number: "02",
    title:
      "\u0413\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0441\u0440\u0435\u0434\u0430",
    body:
      "\u0421\u043a\u0430\u043b\u0438\u0442\u0435 \u0438 \u0441\u0435\u0434\u0438\u043c\u0435\u043d\u0442\u0438\u0442\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0442 \u043a\u0430\u043a \u0432\u043e\u0434\u0430\u0442\u0430 \u0441\u0435 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430 \u0438 \u0434\u0432\u0438\u0436\u0438. \u041f\u043e\u0440\u043e\u0432\u0438\u0442\u0435, \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u043d\u0438\u0442\u0435 \u0438 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0438\u0442\u0435 \u0441\u0440\u0435\u0434\u0438 \u0438\u043c\u0430\u0442 \u0440\u0430\u0437\u043b\u0438\u0447\u043d\u043e \u043f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u0435.",
  },
  {
    number: "03",
    title:
      "\u041f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d\u0430 \u043d\u0435\u043f\u0440\u0435\u043a\u044a\u0441\u043d\u0430\u0442\u043e\u0441\u0442",
    body:
      "\u041f\u0435\u0440\u0441\u043f\u0435\u043a\u0442\u0438\u0432\u043d\u0430\u0442\u0430 \u0437\u043e\u043d\u0430 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u043f\u0440\u043e\u0441\u043b\u0435\u0434\u0438 \u043c\u0435\u0436\u0434\u0443 \u0441\u044a\u0441\u0435\u0434\u043d\u0438 \u0442\u043e\u0447\u043a\u0438 \u0438 \u0432 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430, \u0430 \u043d\u0435 \u0434\u0430 \u0441\u0435 \u0440\u0430\u0437\u0433\u043b\u0435\u0436\u0434\u0430 \u0441\u0430\u043c\u043e \u043a\u0430\u0442\u043e \u0435\u0434\u0438\u043d\u0438\u0447\u0435\u043d \u043c\u0430\u043a\u0441\u0438\u043c\u0443\u043c.",
  },
  {
    number: "04",
    title:
      "\u041a\u043e\u043d\u0442\u0440\u043e\u043b \u043e\u0442 \u0434\u0432\u0435 \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f",
    body:
      "\u041a\u043e\u0433\u0430\u0442\u043e \u0438\u043c\u0430 \u0434\u0432\u0435 \u043f\u0440\u0435\u0441\u0438\u0447\u0430\u0449\u0438 \u0441\u0435 \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u0442\u0435\u043b\u043d\u0438 \u043b\u0438\u043d\u0438\u0438, \u043e\u0431\u0449\u0430\u0442\u0430 \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043a\u0430 \u0442\u043e\u0447\u043a\u0430 \u0434\u0430\u0432\u0430 \u043f\u043e-\u0441\u0438\u043b\u0435\u043d \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d \u0430\u0440\u0433\u0443\u043c\u0435\u043d\u0442 \u043e\u0442 \u0435\u0434\u0438\u043d\u0438\u0447\u043d\u043e \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0435.",
  },
  {
    number: "05",
    title:
      "\u041f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u043d\u043e \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435 \u043f\u0440\u0435\u0434\u0438 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435",
    body:
      "\u041f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u043d\u043e\u0442\u043e \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0435 \u043f\u043e\u043c\u0430\u0433\u0430 \u0434\u0430 \u0441\u0435 \u0438\u0437\u0431\u0435\u0440\u0435 \u043f\u043e-\u043e\u0431\u043e\u0441\u043d\u043e\u0432\u0430\u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u0438 \u0434\u0430 \u0441\u0435 \u043d\u0430\u043c\u0430\u043b\u0438 \u0440\u0438\u0441\u043a\u044a\u0442 \u043e\u0442 \u043f\u0440\u0430\u0437\u0435\u043d \u0441\u043e\u043d\u0434\u0430\u0436. \u0422\u043e \u043d\u0435 \u0435 \u0430\u0431\u0441\u043e\u043b\u044e\u0442\u043d\u0430 \u0433\u0430\u0440\u0430\u043d\u0446\u0438\u044f, \u043d\u043e \u0435 \u0432\u0430\u0436\u043d\u0430 \u0441\u0442\u044a\u043f\u043a\u0430 \u0437\u0430 \u0438\u0437\u0431\u044f\u0433\u0432\u0430\u043d\u0435 \u043d\u0430 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435 \u043d\u0430 \u0441\u043b\u0443\u0447\u0430\u0435\u043d \u043f\u0440\u0438\u043d\u0446\u0438\u043f.",
  },
];

function TerrainVisual() {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-[#cfe5e9] bg-[#dff3f7] shadow-[0_30px_70px_rgba(28,82,94,.14)]">
      <div className="absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b from-[#dff6fb] to-[#eefbfc]" />

      <div className="absolute left-[8%] top-[13%] h-3 w-3 animate-pulse rounded-full bg-[#4d9aac]" />
      <div className="absolute right-[13%] top-[19%] h-2 w-2 animate-pulse rounded-full bg-[#74b6c4] [animation-delay:700ms]" />

      <svg
        viewBox="0 0 900 560"
        className="relative z-10 block h-auto w-full"
        aria-label="terrain"
      >
        <defs>
          <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8ab79" />
            <stop offset="100%" stopColor="#98764d" />
          </linearGradient>

          <linearGradient id="rock" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8c8175" />
            <stop offset="100%" stopColor="#655e58" />
          </linearGradient>

          <linearGradient id="water" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5db9cc" stopOpacity=".18" />
            <stop offset="45%" stopColor="#2f97ad" stopOpacity=".8" />
            <stop offset="100%" stopColor="#66c3d4" stopOpacity=".25" />
          </linearGradient>
        </defs>

        <path
          d="M0 170 C130 145, 225 190, 330 155 C460 110, 565 170, 690 140 C775 120, 840 145, 900 130 L900 560 L0 560 Z"
          fill="url(#soil)"
        />

        <path
          d="M0 275 C190 245, 330 305, 470 275 C620 240, 760 280, 900 245 L900 560 L0 560 Z"
          fill="#aa8a62"
          opacity=".92"
        />

        <path
          d="M0 390 C170 345, 335 420, 490 365 C640 315, 760 385, 900 330 L900 560 L0 560 Z"
          fill="url(#rock)"
        />

        <path
          d="M80 335 C220 295, 350 345, 490 310 C610 280, 720 320, 845 275"
          stroke="url(#water)"
          strokeWidth="52"
          strokeLinecap="round"
          fill="none"
          className="animate-[pulse_3.5s_ease-in-out_infinite]"
        />

        <path
          d="M490 240 C520 285, 540 330, 560 380 C578 425, 608 470, 655 520"
          stroke="#3d6067"
          strokeWidth="9"
          strokeDasharray="16 14"
          fill="none"
          opacity=".7"
        />

        <g>
          <line x1="260" y1="112" x2="260" y2="490" stroke="#163f49" strokeWidth="5" />
          <circle cx="260" cy="112" r="15" fill="#f3a94c" />
          <circle cx="260" cy="112" r="28" fill="none" stroke="#f3a94c" strokeWidth="3" opacity=".35" />
          <text x="230" y="88" fill="#153943" fontSize="22" fontWeight="700">
            {text.pointA}
          </text>
        </g>

        <g>
          <line x1="500" y1="105" x2="500" y2="485" stroke="#163f49" strokeWidth="5" />
          <circle cx="500" cy="105" r="15" fill="#1f91a8" />
          <circle
            cx="500"
            cy="105"
            r="30"
            fill="none"
            stroke="#1f91a8"
            strokeWidth="3"
            opacity=".38"
            className="animate-ping"
          />
          <text x="470" y="78" fill="#153943" fontSize="22" fontWeight="700">
            {text.pointB}
          </text>
        </g>

        <g>
          <line x1="720" y1="128" x2="720" y2="490" stroke="#163f49" strokeWidth="5" />
          <circle cx="720" cy="128" r="15" fill="#f3a94c" />
          <circle cx="720" cy="128" r="28" fill="none" stroke="#f3a94c" strokeWidth="3" opacity=".35" />
          <text x="690" y="100" fill="#153943" fontSize="22" fontWeight="700">
            {text.pointC}
          </text>
        </g>

        <text x="48" y="208" fill="#614d35" fontSize="20" fontWeight="700">
          {text.surface}
        </text>

        <text x="58" y="360" fill="#194f5b" fontSize="20" fontWeight="700">
          {text.aquifer}
        </text>

        <text x="575" y="430" fill="#e7f5f7" fontSize="18" fontWeight="700">
          {text.structure}
        </text>
      </svg>

      <div className="absolute bottom-5 left-5 right-5 z-20 rounded-2xl border border-white/60 bg-white/80 p-4 backdrop-blur-md">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8e9b]">
          {text.example}
        </div>

        <div className="mt-2 text-sm leading-6 text-[#46666d]">
          {text.exampleText}
        </div>
      </div>
    </div>
  );
}

export default function DrillingLocationPage() {
  return (
    <main className="min-h-screen bg-[#f8fbfc] text-[#153943]">
      <section className="overflow-hidden border-b border-[#d8e9ed] bg-[#e8f6f8]">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-7 py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-10 lg:py-24">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#438594]">
              {text.eyebrow}
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">
              {text.hero1}
              <br />
              {text.hero2}
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5f7b82]">
              {text.intro}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/map"
                className="inline-flex bg-[#153d47] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1d505b]"
              >
                {text.mapButton}
              </Link>

              <Link
                href="/drilling"
                className="inline-flex border border-[#a8ccd4] px-7 py-3.5 text-sm font-semibold text-[#2d6976] transition hover:bg-white"
              >
                {text.back}
              </Link>
            </div>
          </div>

          <div className="animate-[float_7s_ease-in-out_infinite]">
            <TerrainVisual />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <div className="sticky top-28">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5994a0]">
                {text.principle}
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
                {text.principleTitle}
              </h2>

              <p className="mt-5 leading-8 text-[#647d84]">
                {text.principleText}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {cards.map((item) => (
              <div
                key={item.number}
                className="group rounded-2xl border border-[#dce9ec] bg-white p-7 transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(25,75,85,.08)]"
              >
                <div className="text-xs font-semibold tracking-[0.2em] text-[#68a5b2]">
                  {item.number}
                </div>

                <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-[#687f85]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#102f37]">
        <div className="mx-auto max-w-[1180px] px-7 py-20 text-white lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#8bc8d3]">
                {text.mistake}
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
                {text.mistakeTitle}
              </h2>
            </div>

            <div className="space-y-5 text-[16px] leading-8 text-white/65">
              <p>{text.mistakeP1}</p>
              <p>{text.mistakeP2}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-20 lg:px-10">
        <div className="rounded-[26px] border border-[#d5e8eb] bg-[#eff9fa] p-8 md:p-12">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#548f9c]">
            {text.next}
          </div>

          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.035em]">
                {text.depth}
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-[#647d84]">
                {text.depthText}
              </p>
            </div>

            <Link
              href="/drilling/depth"
              className="inline-flex shrink-0 bg-[#153d47] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              {text.continue}
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </main>
  );
}
