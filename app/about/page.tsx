import Link from "next/link";

export const metadata = {
  title:
    "\u0417\u0430 SONDI.BG | \u041f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f \u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u0438",
  description:
    "SONDI.BG \u0435 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433, \u0441\u043e\u043d\u0434\u0430\u0436\u0438 \u0438 \u043f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u043d\u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0438.",
};

const copy = {
  eyebrow: "\u0417\u0410 SONDI.BG",

  title1: "SONDI.BG \u0435 \u0441\u044a\u0437\u0434\u0430\u0434\u0435\u043d\u0430,",

  title2:
    "\u0437\u0430 \u0434\u0430 \u043d\u0430\u043f\u0440\u0430\u0432\u0438 \u0441\u043b\u043e\u0436\u043d\u0430\u0442\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043f\u043e\u043b\u0435\u0437\u043d\u0430.",

  intro:
    "SONDI.BG \u0435 \u0431\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0430 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438 \u0432\u043e\u0434\u0438, \u0433\u0435\u043e\u043b\u043e\u0433\u0438\u044f \u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u0438. \u0421\u044a\u0431\u0438\u0440\u0430\u043c\u0435 \u0440\u0430\u0437\u043f\u0440\u044a\u0441\u043d\u0430\u0442\u0430 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430 \u0438 \u043d\u0430\u0443\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f, \u0441\u0432\u044a\u0440\u0437\u0432\u0430\u043c\u0435 \u044f \u0441 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e \u0438 \u044f \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u044f\u043c\u0435 \u0442\u0430\u043a\u0430, \u0447\u0435 \u0434\u0430 \u0431\u044a\u0434\u0435 \u043f\u043e\u043b\u0435\u0437\u043d\u0430 \u043f\u0440\u0438 \u0440\u0435\u0430\u043b\u043d\u0438 \u0440\u0435\u0448\u0435\u043d\u0438\u044f.",

  map:
    "\u041e\u0442\u0432\u043e\u0440\u0438 \u043a\u0430\u0440\u0442\u0430\u0442\u0430 \u2192",

  drilling:
    "\u041d\u0430\u0443\u0447\u0438 \u043f\u043e\u0432\u0435\u0447\u0435 \u0437\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0438\u0442\u0435",

  whyLabel:
    "\u0417\u0410\u0429\u041e \u0421\u042a\u0417\u0414\u0410\u0414\u041e\u0425\u041c\u0415 SONDI.BG",

  whyTitle:
    "\u0417\u0430\u0449\u043e\u0442\u043e \u0432\u0430\u0436\u043d\u0430\u0442\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0441\u044a\u0449\u0435\u0441\u0442\u0432\u0443\u0432\u0430, \u043d\u043e \u0447\u0435\u0441\u0442\u043e \u0435 \u0442\u0440\u0443\u0434\u043d\u0430 \u0437\u0430 \u043d\u0430\u043c\u0438\u0440\u0430\u043d\u0435 \u0438 \u0440\u0430\u0437\u0431\u0438\u0440\u0430\u043d\u0435.",

  whyText:
    "\u0414\u0430\u043d\u043d\u0438\u0442\u0435 \u0437\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438 \u0441\u0430 \u0440\u0430\u0437\u043f\u0440\u044a\u0441\u043d\u0430\u0442\u0438 \u043c\u0435\u0436\u0434\u0443 \u043a\u0430\u0440\u0442\u0438, \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438, \u043f\u043b\u0430\u043d\u043e\u0432\u0435, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432\u0438 \u043c\u0440\u0435\u0436\u0438 \u0438 \u043d\u0430\u0443\u0447\u043d\u0438 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u0446\u0438. SONDI.BG \u0435 \u0441\u044a\u0437\u0434\u0430\u0434\u0435\u043d\u0430, \u0437\u0430 \u0434\u0430 \u043e\u0431\u0435\u0434\u0438\u043d\u0438 \u0442\u0430\u0437\u0438 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0432 \u0435\u0434\u043d\u0430 \u043e\u0431\u0449\u0430 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d\u0430 \u043a\u0430\u0440\u0442\u0438\u043d\u0430 \u0438 \u0434\u0430 \u044f \u043d\u0430\u043f\u0440\u0430\u0432\u0438 \u043f\u043e-\u0434\u043e\u0441\u0442\u044a\u043f\u043d\u0430 \u0437\u0430 \u0430\u043d\u0430\u043b\u0438\u0437, \u0441\u0440\u0430\u0432\u043d\u0435\u043d\u0438\u0435 \u0438 \u043f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u2014 \u043a\u0430\u043a\u0442\u043e \u0437\u0430 \u0448\u0438\u0440\u043e\u043a \u043a\u0440\u044a\u0433 \u043f\u043e\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043b\u0438, \u0442\u0430\u043a\u0430 \u0438 \u0437\u0430 \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442\u0438, \u043f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u0438\u0441\u0442\u0438 \u0438 \u043e\u0431\u0443\u0447\u0430\u0432\u0430\u0449\u0438 \u0441\u0435.",

  methodLabel:
    "\u041a\u0410\u041a \u0420\u0410\u0411\u041e\u0422\u0418\u041c",

  methodTitle:
    "\u0421\u044a\u0431\u0438\u0440\u0430\u043c\u0435, \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0432\u0430\u043c\u0435, \u0441\u0432\u044a\u0440\u0437\u0432\u0430\u043c\u0435 \u0438 \u043e\u0431\u044f\u0441\u043d\u044f\u0432\u0430\u043c\u0435.",

  expertLabel:
    "\u041a\u0410\u041a\u0412\u041e \u0418\u0417\u0413\u0420\u0410\u0416\u0414\u0410\u041c\u0415",

  expertTitle:
    "\u041f\u043e\u0432\u0435\u0447\u0435 \u043e\u0442 \u043a\u0430\u0440\u0442\u0430 \u2014 \u0440\u0430\u0437\u0432\u0438\u0432\u0430\u0449\u0430 \u0441\u0435 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 \u0437\u0430 \u0440\u0430\u0431\u043e\u0442\u0430 \u0441 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u0438.",

  expertText:
    "SONDI.BG \u043e\u0431\u0435\u0434\u0438\u043d\u044f\u0432\u0430 \u0438\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u0430 \u043a\u0430\u0440\u0442\u0430, \u043f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u043d\u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0438, \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0438 \u0445\u0438\u0434\u0440\u043e\u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f, \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433, \u0440\u0435\u0441\u0443\u0440\u0441\u043d\u0438 \u0434\u0430\u043d\u043d\u0438, \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438, \u0440\u0430\u0437\u043b\u043e\u043c\u043d\u0438 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0438 \u0438 \u043f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0430 \u0431\u0430\u0437\u0430 \u0437\u043d\u0430\u043d\u0438\u044f. \u041f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430\u0442\u0430 \u0441\u0435 \u0440\u0430\u0437\u0448\u0438\u0440\u044f\u0432\u0430 \u043f\u043e\u0441\u0442\u0435\u043f\u0435\u043d\u043d\u043e \u0441 \u043d\u043e\u0432\u0438 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u0446\u0438 \u0438 \u043f\u043e-\u043f\u043e\u0434\u0440\u043e\u0431\u043d\u0438 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d\u0438 \u0432\u0440\u044a\u0437\u043a\u0438, \u0437\u0430 \u0434\u0430 \u0434\u0430\u0432\u0430 \u0432\u0441\u0435 \u043f\u043e-\u043f\u044a\u043b\u043d\u0430 \u043a\u0430\u0440\u0442\u0438\u043d\u0430 \u0437\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e.",

  limitsLabel:
    "\u041a\u0410\u041a\u0412\u041e \u041d\u0415 \u041e\u0411\u0415\u0429\u0410\u0412\u0410\u041c\u0415",

  limitsTitle:
    "\u041d\u0435 \u043e\u0431\u0435\u0449\u0430\u0432\u0430\u043c\u0435 \u0441\u0438\u0433\u0443\u0440\u043d\u0430 \u0432\u043e\u0434\u0430. \u0414\u0430\u0432\u0430\u043c\u0435 \u043f\u043e-\u0434\u043e\u0431\u0440\u0430 \u043e\u0441\u043d\u043e\u0432\u0430 \u0437\u0430 \u0440\u0435\u0448\u0435\u043d\u0438\u0435.",

  limitsText:
    "\u041d\u0438\u0442\u043e \u0435\u0434\u043d\u0430 \u043a\u0430\u0440\u0442\u0430, \u0431\u0430\u0437\u0430 \u0434\u0430\u043d\u043d\u0438 \u0438\u043b\u0438 \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u0435\u043d \u0430\u043d\u0430\u043b\u0438\u0437 \u043d\u0435 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0433\u0430\u0440\u0430\u043d\u0442\u0438\u0440\u0430 \u0432\u043e\u0434\u0430, \u0442\u043e\u0447\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0438\u043b\u0438 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u0435\u043d \u0434\u0435\u0431\u0438\u0442 \u043f\u0440\u0435\u0434\u0438 \u0440\u0435\u0430\u043b\u043d\u043e\u0442\u043e \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435 \u0438 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435. \u041d\u0430\u0448\u0430\u0442\u0430 \u0446\u0435\u043b \u0435 \u0434\u0430 \u043d\u0430\u043c\u0430\u043b\u0438\u043c \u043d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u043e\u0442\u043e, \u0434\u0430 \u043f\u043e\u043a\u0430\u0436\u0435\u043c \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u0442\u0435 \u0444\u0430\u043a\u0442\u0438 \u0438 \u0434\u0430 \u043f\u043e\u043c\u043e\u0433\u043d\u0435\u043c \u0438\u0437\u0431\u043e\u0440\u044a\u0442 \u0434\u0430 \u0431\u044a\u0434\u0435 \u043f\u043e-\u043e\u0431\u043e\u0441\u043d\u043e\u0432\u0430\u043d, \u0430 \u043d\u0435 \u0441\u043b\u0443\u0447\u0430\u0435\u043d.",

  closing:
    "\u0417\u0430\u043f\u043e\u0447\u043d\u0435\u0442\u0435 \u043e\u0442 \u043c\u044f\u0441\u0442\u043e\u0442\u043e, \u043a\u043e\u0435\u0442\u043e \u0432\u0438 \u0438\u043d\u0442\u0435\u0440\u0435\u0441\u0443\u0432\u0430.",

  closingText:
    "\u041e\u0442\u0432\u043e\u0440\u0435\u0442\u0435 \u043a\u0430\u0440\u0442\u0430\u0442\u0430, \u0438\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u0442\u043e\u0447\u043a\u0430 \u0438 \u0432\u0438\u0436\u0442\u0435 \u043a\u0430\u043a\u0432\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f SONDI.BG \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0432\u044a\u0440\u0436\u0435 \u0441 \u043d\u0435\u044f.",
};

const principles = [
  {
    number: "01",
    title:
      "\u0420\u0430\u0431\u043e\u0442\u0438\u043c \u0441 \u043f\u0440\u043e\u0441\u043b\u0435\u0434\u0438\u043c\u0438 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u0446\u0438",
    text:
      "\u0418\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043c\u0435 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0438 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438 \u0434\u0430\u043d\u043d\u0438, \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438, \u043f\u043b\u0430\u043d\u043e\u0432\u0435, \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u043a\u0430\u0440\u0442\u0438 \u0438 \u043d\u0430\u0443\u0447\u043d\u0438 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u0446\u0438, \u043a\u0430\u0442\u043e \u043f\u0430\u0437\u0438\u043c \u043f\u0440\u043e\u0438\u0437\u0445\u043e\u0434\u0430 \u0438 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442\u0430 \u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f\u0442\u0430.",
  },
  {
    number: "02",
    title:
      "\u0421\u0432\u044a\u0440\u0437\u0432\u0430\u043c\u0435 \u0434\u0430\u043d\u043d\u0438\u0442\u0435 \u0441 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u043e\u0442\u043e \u043c\u044f\u0441\u0442\u043e",
    text:
      "\u041a\u0430\u0440\u0442\u0438\u0442\u0435 \u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0442\u0435 \u0441\u0430\u043c\u0438 \u043f\u043e \u0441\u0435\u0431\u0435 \u0441\u0438 \u0441\u0430 \u0440\u0430\u0437\u043f\u0440\u044a\u0441\u043d\u0430\u0442\u0438. SONDI.BG \u0433\u0438 \u0441\u044a\u043f\u043e\u0441\u0442\u0430\u0432\u044f \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435\u043d\u043e, \u0437\u0430 \u0434\u0430 \u043f\u043e\u043a\u0430\u0436\u0435 \u043a\u043e\u0438 \u0434\u0430\u043d\u043d\u0438 \u0441\u0430 \u043f\u0440\u0438\u043b\u043e\u0436\u0438\u043c\u0438 \u043a\u044a\u043c \u0438\u0437\u0431\u0440\u0430\u043d\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430.",
  },
  {
    number: "03",
    title:
      "\u041e\u0442\u0434\u0435\u043b\u044f\u043c\u0435 \u0444\u0430\u043a\u0442\u0438\u0442\u0435 \u043e\u0442 \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f\u0442\u0430",
    text:
      "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u0442\u0435 \u0434\u0430\u043d\u043d\u0438 \u0441\u0435 \u043f\u043e\u043a\u0430\u0437\u0432\u0430\u0442 \u043a\u0430\u0442\u043e \u0444\u0430\u043a\u0442\u0438, \u0430 \u043e\u0446\u0435\u043d\u043a\u0438\u0442\u0435 \u0438 \u043f\u0440\u0435\u043f\u043e\u0440\u044a\u043a\u0438\u0442\u0435 \u2014 \u043a\u0430\u0442\u043e \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f. \u0422\u0430\u043a\u0430 \u043f\u043e\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043b\u044f\u0442 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0440\u0430\u0437\u043b\u0438\u0447\u0438 \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u043a\u0430 \u043e\u0442 \u0438\u0437\u0432\u043e\u0434\u0430.",
  },
];

function AboutVisual() {
  return (
    <svg viewBox="0 0 760 500" className="h-full w-full">
      <defs>
        <linearGradient id="surface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9c59e" />
          <stop offset="100%" stopColor="#b59c76" />
        </linearGradient>

        <linearGradient id="rock" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9e856d" />
          <stop offset="100%" stopColor="#746459" />
        </linearGradient>
      </defs>

      <rect width="760" height="500" rx="28" fill="#eaf6f8" />

      <path
        d="M0 135 C120 96 220 143 330 108 C470 64 585 115 760 66 L760 500 L0 500 Z"
        fill="url(#surface)"
      />

      <path
        d="M0 235 C150 193 245 255 370 215 C500 174 605 225 760 188 L760 500 L0 500 Z"
        fill="url(#rock)"
      />

      <path
        d="M20 322 C165 265 290 345 430 288 C555 238 645 272 740 236"
        fill="none"
        stroke="#40a2b7"
        strokeWidth="40"
        opacity=".65"
        className="animate-pulse"
      />

      <path
        d="M100 210 C200 160 260 185 365 150 C465 116 550 126 670 94"
        fill="none"
        stroke="#267c8e"
        strokeWidth="3"
        strokeDasharray="10 9"
        className="about-flow"
      />

      <line
        x1="382"
        y1="84"
        x2="382"
        y2="390"
        stroke="#173f49"
        strokeWidth="8"
      />

      <rect
        x="371"
        y="300"
        width="22"
        height="74"
        rx="8"
        fill="#e9f6f8"
        stroke="#31889a"
        strokeWidth="4"
      />

      {[
        [128, 180],
        [260, 206],
        [382, 135],
        [510, 154],
        [632, 116],
      ].map(([x, y], index) => (
        <g key={index}>
          <circle
            cx={x}
            cy={y}
            r="9"
            fill="#1a8298"
          />
          <circle
            cx={x}
            cy={y}
            r="19"
            fill="none"
            stroke="#1a8298"
            strokeWidth="2"
            opacity=".25"
            className="animate-ping"
          />
        </g>
      ))}

      <rect
        x="49"
        y="36"
        width="180"
        height="73"
        rx="14"
        fill="white"
        opacity=".94"
      />

      <rect
        x="70"
        y="57"
        width="95"
        height="10"
        rx="5"
        fill="#4f94a2"
      />

      <rect
        x="70"
        y="79"
        width="132"
        height="7"
        rx="3.5"
        fill="#c6dfe4"
      />

      <rect
        x="545"
        y="350"
        width="165"
        height="104"
        rx="16"
        fill="white"
        opacity=".94"
      />

      <path
        d="M567 420 L592 397 L614 405 L640 376 L665 387 L690 365"
        fill="none"
        stroke="#2c91a6"
        strokeWidth="5"
      />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8fbfc] text-[#153943]">
      <section className="border-b border-[#d7e9ed] bg-[#e5f5f8]">
        <div className="mx-auto grid max-w-[1320px] gap-14 px-7 py-24 lg:grid-cols-[1fr_.92fr] lg:items-center lg:px-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#438594]">
              {copy.eyebrow}
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">
              {copy.title1}
              <br />
              {copy.title2}
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#5f7b82]">
              {copy.intro}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/map"
                className="inline-flex bg-[#153d47] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                {copy.map}
              </Link>

              <Link
                href="/drilling"
                className="inline-flex border border-[#9fcbd4] px-7 py-3.5 text-sm font-semibold text-[#2b6874] transition hover:bg-white"
              >
                {copy.drilling}
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#cfe5e9] bg-white shadow-[0_28px_70px_rgba(32,86,98,.10)]">
            <AboutVisual />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-12 px-7 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5b949f]">
            {copy.whyLabel}
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
            {copy.whyTitle}
          </h2>
        </div>

        <p className="text-lg leading-9 text-[#627d84]">
          {copy.whyText}
        </p>
      </section>

      <section className="border-y border-[#dbeaed] bg-white">
        <div className="mx-auto max-w-[1180px] px-7 py-20 lg:px-10">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5b949f]">
              {copy.methodLabel}
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              {copy.methodTitle}
            </h2>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden border border-[#dce9ec] bg-[#dce9ec] md:grid-cols-3">
            {principles.map((item) => (
              <div key={item.number} className="bg-white p-8 md:p-9">
                <div className="text-xs font-semibold tracking-[0.2em] text-[#63a1ae]">
                  {item.number}
                </div>

                <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em]">
                  {item.title}
                </h3>

                <p className="mt-4 text-[15px] leading-7 text-[#6a8187]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#153d47] text-white">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-7 py-20 lg:grid-cols-[.75fr_1.25fr] lg:px-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.26em] text-[#83c4d1]">
              {copy.expertLabel}
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              {copy.expertTitle}
            </h2>
          </div>

          <p className="text-lg leading-9 text-white/70">
            {copy.expertText}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-20 lg:px-10">
        <div className="rounded-[28px] border border-[#d7e8eb] bg-[#eef8fa] p-8 md:p-12">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4d8e9b]">
            {copy.limitsLabel}
          </div>

          <h2 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.035em]">
            {copy.limitsTitle}
          </h2>

          <p className="mt-5 max-w-4xl leading-8 text-[#637d84]">
            {copy.limitsText}
          </p>
        </div>
      </section>

      <style>{`
        @keyframes aboutFlow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -38; }
        }

        .about-flow {
          animation: aboutFlow 2.4s linear infinite;
        }
      `}</style>
    </main>
  );
}
