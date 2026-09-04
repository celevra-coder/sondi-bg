"use client";

import {
  useMemo,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

const REGIONS = [
  "\u0411\u043b\u0430\u0433\u043e\u0435\u0432\u0433\u0440\u0430\u0434",
  "\u0411\u0443\u0440\u0433\u0430\u0441",
  "\u0412\u0430\u0440\u043d\u0430",
  "\u0412\u0435\u043b\u0438\u043a\u043e \u0422\u044a\u0440\u043d\u043e\u0432\u043e",
  "\u0412\u0438\u0434\u0438\u043d",
  "\u0412\u0440\u0430\u0446\u0430",
  "\u0413\u0430\u0431\u0440\u043e\u0432\u043e",
  "\u0414\u043e\u0431\u0440\u0438\u0447",
  "\u041a\u044a\u0440\u0434\u0436\u0430\u043b\u0438",
  "\u041a\u044e\u0441\u0442\u0435\u043d\u0434\u0438\u043b",
  "\u041b\u043e\u0432\u0435\u0447",
  "\u041c\u043e\u043d\u0442\u0430\u043d\u0430",
  "\u041f\u0430\u0437\u0430\u0440\u0434\u0436\u0438\u043a",
  "\u041f\u0435\u0440\u043d\u0438\u043a",
  "\u041f\u043b\u0435\u0432\u0435\u043d",
  "\u041f\u043b\u043e\u0432\u0434\u0438\u0432",
  "\u0420\u0430\u0437\u0433\u0440\u0430\u0434",
  "\u0420\u0443\u0441\u0435",
  "\u0421\u0438\u043b\u0438\u0441\u0442\u0440\u0430",
  "\u0421\u043b\u0438\u0432\u0435\u043d",
  "\u0421\u043c\u043e\u043b\u044f\u043d",
  "\u0421\u043e\u0444\u0438\u044f \u0028\u043e\u0431\u043b\u0430\u0441\u0442\u0029",
  "\u0421\u043e\u0444\u0438\u044f-\u0433\u0440\u0430\u0434",
  "\u0421\u0442\u0430\u0440\u0430 \u0417\u0430\u0433\u043e\u0440\u0430",
  "\u0422\u044a\u0440\u0433\u043e\u0432\u0438\u0449\u0435",
  "\u0425\u0430\u0441\u043a\u043e\u0432\u043e",
  "\u0428\u0443\u043c\u0435\u043d",
  "\u042f\u043c\u0431\u043e\u043b",
];

const SERVICES = [
  "\u0421\u043e\u043d\u0434\u0430\u0436\u0438 \u0437\u0430 \u0432\u043e\u0434\u0430",
  "\u0418\u0437\u0433\u0440\u0430\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438",
  "\u041f\u043e\u0447\u0438\u0441\u0442\u0432\u0430\u043d\u0435 \u043d\u0430 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438",
  "\u041f\u043e\u0447\u0438\u0441\u0442\u0432\u0430\u043d\u0435 \u0438 \u0432\u044a\u0437\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430\u043d\u0435 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0438",
  "\u0417\u0430\u0434\u044a\u043b\u0431\u043e\u0447\u0430\u0432\u0430\u043d\u0435 \u043d\u0430 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438",
  "\u0420\u0435\u043c\u043e\u043d\u0442 \u043d\u0430 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438",
  "\u041e\u0431\u0441\u0430\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0438",
  "\u0424\u0438\u043b\u0442\u044a\u0440\u043d\u0438 \u043a\u043e\u043b\u043e\u043d\u0438",
  "\u0420\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0432\u0430\u043d\u0435 \u0438 \u043f\u0440\u043e\u0434\u0443\u0445\u0432\u0430\u043d\u0435 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0438",
  "\u0412\u0438\u0434\u0435\u043e\u0434\u0438\u0430\u0433\u043d\u043e\u0441\u0442\u0438\u043a\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0438 \u0438 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438",
  "\u041c\u043e\u043d\u0442\u0430\u0436 \u0438 \u043f\u043e\u0434\u043c\u044f\u043d\u0430 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u043d\u0438 \u043f\u043e\u043c\u043f\u0438",
  "\u041e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435 \u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0438 \u0438 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438",
  "\u041f\u0440\u043e\u0431\u043d\u043e \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435",
  "\u0414\u0440\u0443\u0433\u0438 \u0443\u0441\u043b\u0443\u0433\u0438 \u0437\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u0438 \u0438 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438",
];

const T = {
  brand: "\u0053\u004f\u004e\u0044\u0049\u002e\u0042\u0047 \u0423\u0421\u041b\u0423\u0413\u0418",
  title: "\u0421\u043e\u043d\u0434\u0430\u0436\u0438 \u0437\u0430 \u0432\u043e\u0434\u0430 \u0438 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438",
  intro:
    "\u041d\u0430\u043c\u0435\u0440\u0435\u0442\u0435 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b \u0437\u0430 \u0432\u0430\u0448\u0438\u044f \u0440\u0430\u0439\u043e\u043d, \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u0439\u0442\u0435 \u043a\u0430\u043a\u0432\u0430 \u0443\u0441\u043b\u0443\u0433\u0430 \u0442\u044a\u0440\u0441\u0438\u0442\u0435 \u0438\u043b\u0438 \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0435\u0442\u0435 \u0431\u0435\u0437\u043f\u043b\u0430\u0442\u043d\u043e \u0441\u0432\u043e\u0438\u0442\u0435 \u0441\u043e\u043d\u0434\u0430\u0436\u043d\u0438 \u0443\u0441\u043b\u0443\u0433\u0438 \u0432 SONDI.BG.",
  find: "\u041d\u0430\u043c\u0435\u0440\u0438 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b",
  request: "\u0422\u044a\u0440\u0441\u044f \u0443\u0441\u043b\u0443\u0433\u0430",
  provider: "\u041f\u0440\u0435\u0434\u043b\u0430\u0433\u0430\u043c \u0443\u0441\u043b\u0443\u0433\u0438",
  region: "\u0420\u0435\u0433\u0438\u043e\u043d",
  allRegions: "\u0412\u0441\u0438\u0447\u043a\u0438 \u0440\u0435\u0433\u0438\u043e\u043d\u0438",
  wholeCountry: "\u0426\u044f\u043b\u0430 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f",
  service: "\u0423\u0441\u043b\u0443\u0433\u0430",
  allServices: "\u0412\u0441\u0438\u0447\u043a\u0438 \u0443\u0441\u043b\u0443\u0433\u0438",
  search: "\u0422\u044a\u0440\u0441\u0438",
  providers: "\u0418\u0417\u041f\u042a\u041b\u041d\u0418\u0422\u0415\u041b\u0418",
  providersTitle: "\u0421\u043e\u043d\u0434\u0430\u0436\u0438\u0441\u0442\u0438 \u0438 \u0444\u0438\u0440\u043c\u0438",
  waiting: "\u041e\u0447\u0430\u043a\u0432\u0430\u043c\u0435 \u043f\u044a\u0440\u0432\u0438\u0442\u0435 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b\u0438",
  addFree: "\u0414\u043e\u0431\u0430\u0432\u0438 \u043f\u0440\u043e\u0444\u0438\u043b \u0431\u0435\u0437\u043f\u043b\u0430\u0442\u043d\u043e",
  findHelp:
    "\u0418\u0437\u0431\u0435\u0440\u0438 \u043e\u0431\u043b\u0430\u0441\u0442\u0442\u0430, \u0432 \u043a\u043e\u044f\u0442\u043e \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u0438\u0437\u0432\u044a\u0440\u0448\u0438 \u0443\u0441\u043b\u0443\u0433\u0430\u0442\u0430. \u0424\u0438\u0440\u043c\u0438\u0442\u0435 \u0441\u0435 \u043f\u043e\u043a\u0430\u0437\u0432\u0430\u0442 \u0441\u043f\u043e\u0440\u0435\u0434 \u0440\u0435\u0433\u0438\u043e\u043d\u0438\u0442\u0435, \u0432 \u043a\u043e\u0438\u0442\u043e \u0440\u0430\u0431\u043e\u0442\u044f\u0442.",
  clients: "\u0417\u0410 \u041a\u041b\u0418\u0415\u041d\u0422\u0418",
  requestTitle: "\u0422\u044a\u0440\u0441\u044f \u0443\u0441\u043b\u0443\u0433\u0430",
  requestHelp:
    "\u041e\u043f\u0438\u0448\u0435\u0442\u0435 \u043a\u0430\u043a\u0432\u043e \u0432\u0438 \u0435 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e. \u0417\u0430\u044f\u0432\u043a\u0430\u0442\u0430 \u0449\u0435 \u0431\u044a\u0434\u0435 \u0432\u0438\u0434\u0438\u043c\u0430 \u0437\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b\u0438, \u043a\u043e\u0438\u0442\u043e \u0440\u0430\u0431\u043e\u0442\u044f\u0442 \u0432 \u0438\u0437\u0431\u0440\u0430\u043d\u0438\u044f \u0440\u0435\u0433\u0438\u043e\u043d.",
  whatService: "\u041a\u0430\u043a\u0432\u0430 \u0443\u0441\u043b\u0443\u0433\u0430 \u0442\u044a\u0440\u0441\u0438\u0442\u0435?",
  chooseService: "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u0443\u0441\u043b\u0443\u0433\u0430",
  province: "\u041e\u0431\u043b\u0430\u0441\u0442",
  chooseProvince: "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043e\u0431\u043b\u0430\u0441\u0442",
  town: "\u041d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e",
  townExample: "\u041d\u0430\u043f\u0440. \u0441. \u041c\u0430\u0440\u043a\u043e\u0432\u043e",
  period: "\u0416\u0435\u043b\u0430\u043d \u043f\u0435\u0440\u0438\u043e\u0434",
  periodExample: "\u041d\u0430\u043f\u0440. \u0441\u0435\u043f\u0442\u0435\u043c\u0432\u0440\u0438",
  depth: "\u041e\u0440\u0438\u0435\u043d\u0442\u0438\u0440\u043e\u0432\u044a\u0447\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430",
  depthHelp: "\u0410\u043a\u043e \u0435 \u0438\u0437\u0432\u0435\u0441\u0442\u043d\u0430",
  machineAccess: "\u0414\u043e\u0441\u0442\u044a\u043f \u0437\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u043d\u0430 \u043c\u0430\u0448\u0438\u043d\u0430",
  unknown: "\u041d\u0435 \u0437\u043d\u0430\u043c",
  yes: "\u0414\u0430",
  limited: "\u041e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d",
  description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
  descriptionHelp:
    "\u041e\u043f\u0438\u0448\u0435\u0442\u0435 \u043d\u0430\u043a\u0440\u0430\u0442\u043a\u043e \u043e\u0431\u0435\u043a\u0442\u0430 \u0438 \u0443\u0441\u043b\u0443\u0433\u0430\u0442\u0430, \u043a\u043e\u044f\u0442\u043e \u0442\u044a\u0440\u0441\u0438\u0442\u0435...",
  phone: "\u0422\u0435\u043b\u0435\u0444\u043e\u043d",
  phoneHelp: "\u0422\u0435\u043b\u0435\u0444\u043e\u043d \u0437\u0430 \u043a\u043e\u043d\u0442\u0430\u043a\u0442",
  email: "\u0418\u043c\u0435\u0439\u043b",
  emailHelp: "\u0418\u043c\u0435\u0439\u043b \u0437\u0430 \u043a\u043e\u043d\u0442\u0430\u043a\u0442",
  publishRequest: "\u041f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u0439 \u0437\u0430\u044f\u0432\u043a\u0430",
  pendingForm:
    "\u0424\u043e\u0440\u043c\u0430\u0442\u0430 \u0449\u0435 \u0431\u044a\u0434\u0435 \u0430\u043a\u0442\u0438\u0432\u0438\u0440\u0430\u043d\u0430 \u0441\u043b\u0435\u0434 \u0441\u0432\u044a\u0440\u0437\u0432\u0430\u043d\u0435\u0442\u043e \u0441\u044a\u0441 \u0441\u0438\u0441\u0442\u0435\u043c\u0430\u0442\u0430 \u0437\u0430 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0435.",
  contractors: "\u0417\u0410 \u0418\u0417\u041f\u042a\u041b\u041d\u0418\u0422\u0415\u041b\u0418",
  providerTitle: "\u041f\u0440\u0435\u0434\u043b\u0430\u0433\u0430\u043c \u0443\u0441\u043b\u0443\u0433\u0438",
  providerHelp:
    "\u0421\u044a\u0437\u0434\u0430\u0439\u0442\u0435 \u0431\u0435\u0437\u043f\u043b\u0430\u0442\u0435\u043d \u043f\u0440\u043e\u0444\u0438\u043b \u0438 \u043f\u043e\u0441\u043e\u0447\u0435\u0442\u0435 \u0441\u0430\u043c\u043e \u0440\u0435\u0433\u0438\u043e\u043d\u0438\u0442\u0435, \u0432 \u043a\u043e\u0438\u0442\u043e \u0440\u0430\u0431\u043e\u0442\u0438\u0442\u0435. \u041d\u0435 \u0435 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e \u0434\u0430 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u043d\u0430 \u0444\u0438\u0440\u043c\u0430\u0442\u0430.",
  company: "\u0418\u043c\u0435 / \u0444\u0438\u0440\u043c\u0430",
  companyHelp: "\u0418\u043c\u0435 \u043d\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b\u044f",
  site: "\u0421\u0430\u0439\u0442 / Facebook",
  optional: "\u041f\u043e \u0436\u0435\u043b\u0430\u043d\u0438\u0435",
  workRegions: "\u0412 \u043a\u043e\u0438 \u0440\u0435\u0433\u0438\u043e\u043d\u0438 \u0440\u0430\u0431\u043e\u0442\u0438\u0442\u0435?",
  nationwide: "\u0420\u0430\u0431\u043e\u0442\u044f \u0432 \u0446\u044f\u043b\u0430 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f",
  selected: "\u0418\u0437\u0431\u0440\u0430\u043d\u043e",
  noneSelected: "\u041d\u0435 \u0441\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u0438 \u0440\u0435\u0433\u0438\u043e\u043d\u0438",
  servicesLabel: "\u0423\u0441\u043b\u0443\u0433\u0438",
  maxDepth: "\u041c\u0430\u043a\u0441\u0438\u043c\u0430\u043b\u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430",
  maxDepthHelp: "\u041d\u0430\u043f\u0440. 250 m",
  diameters: "\u0414\u0438\u0430\u043c\u0435\u0442\u0440\u0438",
  diametersHelp: "\u041d\u0430\u043f\u0440. 125 / 160 / 200 mm",
  method: "\u041c\u0435\u0442\u043e\u0434 \u043d\u0430 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435",
  methodHelp: "\u0420\u043e\u0442\u0430\u0446\u0438\u043e\u043d\u043d\u043e, \u0432\u044a\u0437\u0434\u0443\u0445, \u043f\u0440\u043e\u043c\u0438\u0432\u043a\u0430...",
  equipment: "\u0422\u0435\u0445\u043d\u0438\u043a\u0430",
  equipmentHelp: "\u0421\u043e\u043d\u0434\u0430\u0436\u043d\u0438 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0438 / \u043e\u0431\u043e\u0440\u0443\u0434\u0432\u0430\u043d\u0435",
  presentation: "\u041f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u044f\u043d\u0435",
  presentationHelp:
    "\u041e\u043f\u0438\u0448\u0435\u0442\u0435 \u043e\u043f\u0438\u0442\u0430, \u0443\u0441\u043b\u0443\u0433\u0438\u0442\u0435 \u0438 \u043d\u0430\u0447\u0438\u043d\u0430 \u0441\u0438 \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0430...",
  sendApproval: "\u0418\u0437\u043f\u0440\u0430\u0442\u0438 \u043f\u0440\u043e\u0444\u0438\u043b \u0437\u0430 \u043e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u0435",
  providerPending:
    "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f\u0442\u0430 \u0438 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0435\u0442\u043e \u0449\u0435 \u0431\u044a\u0434\u0430\u0442 \u0431\u0435\u0437\u043f\u043b\u0430\u0442\u043d\u0438. \u0424\u043e\u0440\u043c\u0430\u0442\u0430 \u0449\u0435 \u0431\u044a\u0434\u0435 \u0430\u043a\u0442\u0438\u0432\u0438\u0440\u0430\u043d\u0430 \u0441\u043b\u0435\u0434 \u0441\u0432\u044a\u0440\u0437\u0432\u0430\u043d\u0435\u0442\u043e \u0441\u044a\u0441 Supabase.",
};

type Tab = "find" | "request" | "provider";

function FieldLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-[#294a53]">
      {children}
    </label>
  );
}

function Input(
  props: InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-2xl border border-[#d7e5e8] bg-white px-4 py-3 text-[15px] text-[#173943] outline-none transition focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2] " +
        (props.className || "")
      }
    />
  );
}

function Select(
  props: SelectHTMLAttributes<HTMLSelectElement>
) {
  const {
    children,
    className,
    ...rest
  } = props;

  return (
    <select
      {...rest}
      className={
        "w-full rounded-2xl border border-[#d7e5e8] bg-white px-4 py-3 text-[15px] text-[#173943] outline-none transition focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2] " +
        (className || "")
      }
    >
      {children}
    </select>
  );
}

export default function ServicesPage() {
  const [tab, setTab] =
    useState<Tab>("find");

  const [region, setRegion] =
    useState("");

  const [service, setService] =
    useState("");

  const [allBulgaria, setAllBulgaria] =
    useState(false);

  const [
    providerRegions,
    setProviderRegions,
  ] = useState<string[]>([]);

  const visibleRegionText =
    useMemo(() => {
      if (allBulgaria) {
        return T.wholeCountry;
      }

      if (
        providerRegions.length === 0
      ) {
        return T.noneSelected;
      }

      return providerRegions.join(", ");
    }, [
      allBulgaria,
      providerRegions,
    ]);

  function toggleProviderRegion(
    item: string
  ) {
    setProviderRegions(current =>
      current.includes(item)
        ? current.filter(
            value => value !== item
          )
        : [...current, item]
    );
  }

  function tabButton(
    value: Tab,
    label: string
  ) {
    return (
      <button
        type="button"
        onClick={() => setTab(value)}
        className={
          "rounded-2xl px-5 py-3 text-sm font-bold transition " +
          (
            tab === value
              ? "bg-[#143f49] text-white shadow-lg shadow-[#143f49]/15"
              : "bg-white text-[#365d66] ring-1 ring-[#d9e7e9] hover:bg-[#f3f9fa]"
          )
        }
      >
        {label}
      </button>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f9fa] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[32px] border border-[#d8e8ea] bg-white shadow-[0_24px_80px_rgba(25,74,82,.08)]">
          <div className="bg-[linear-gradient(135deg,#e7f5f5_0%,#f8fcfc_55%,#eef7f1_100%)] px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
            <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#4e8795]">
              {T.brand}
            </div>

            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-[#153943] sm:text-5xl">
              {T.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5b757d]">
              {T.intro}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {tabButton("find", T.find)}
              {tabButton(
                "request",
                T.request
              )}
              {tabButton(
                "provider",
                T.provider
              )}
            </div>

          </div>
        </section>

        {tab === "find" && (
          <section className="mt-8">
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <aside className="rounded-[26px] border border-[#d9e7e9] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#173f48]">
                  {T.find}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6a8187]">
                  {T.findHelp}
                </p>

                <div className="mt-6">
                  <FieldLabel>
                    {T.region}
                  </FieldLabel>

                  <Select
                    value={region}
                    onChange={event =>
                      setRegion(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      {T.allRegions}
                    </option>

                    <option value="all">
                      {T.wholeCountry}
                    </option>

                    {REGIONS.map(
                      (
                        item,
                        index
                      ) => (
                        <option
                          value={item}
                          key={`${index}-${item}`}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </Select>
                </div>

                <div className="mt-5">
                  <FieldLabel>
                    {T.service}
                  </FieldLabel>

                  <Select
                    value={service}
                    onChange={event =>
                      setService(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      {T.allServices}
                    </option>

                    {SERVICES.map(
                      (
                        item,
                        index
                      ) => (
                        <option
                          value={item}
                          key={`${index}-${item}`}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </Select>
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-2xl bg-[#16825c] px-5 py-3.5 font-bold text-white transition hover:bg-[#126d4d]"
                >
                  {T.search}
                </button>
              </aside>

              <div className="rounded-[26px] border border-[#d9e7e9] bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
                      {T.providers}
                    </div>

                    <h2 className="mt-2 text-2xl font-bold text-[#173f48]">
                      {T.providersTitle}
                    </h2>
                  </div>

                  <div className="text-sm text-[#73898e]">
                    {region === "all"
                      ? T.wholeCountry
                      : region
                        ? `${T.region}: ${region}`
                        : T.allRegions}
                  </div>
                </div>

                <div className="mt-8 rounded-[22px] border border-dashed border-[#bfd6d9] bg-[#f7fbfb] px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e4f3ef] text-2xl">
                    {"\u26cf"}
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#234951]">
                    {T.waiting}
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setTab("provider")
                    }
                    className="mt-6 rounded-2xl border border-[#bddbd2] bg-white px-5 py-3 font-bold text-[#187356]"
                  >
                    {T.addFree}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "request" && (
          <section className="mt-8">
            <div className="rounded-[26px] border border-[#d9e7e9] bg-white p-6 sm:p-8 lg:p-10">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
                {T.clients}
              </div>

              <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#173f48]">
                {T.requestTitle}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6a8187]">
                {T.requestHelp}
              </p>

              <form
                className="mt-8 grid gap-5 sm:grid-cols-2"
                onSubmit={event =>
                  event.preventDefault()
                }
              >
                <div>
                  <FieldLabel>
                    {T.whatService}
                  </FieldLabel>

                  <Select required>
                    <option value="">
                      {T.chooseService}
                    </option>

                    {SERVICES.map(
                      (
                        item,
                        index
                      ) => (
                        <option
                          value={item}
                          key={`r-${index}`}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </Select>
                </div>

                <div>
                  <FieldLabel>
                    {T.province}
                  </FieldLabel>

                  <Select required>
                    <option value="">
                      {T.chooseProvince}
                    </option>

                    {REGIONS.map(
                      (
                        item,
                        index
                      ) => (
                        <option
                          value={item}
                          key={`p-${index}`}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </Select>
                </div>

                <div>
                  <FieldLabel>
                    {T.town}
                  </FieldLabel>
                  <Input
                    placeholder={
                      T.townExample
                    }
                  />
                </div>

                <div>
                  <FieldLabel>
                    {T.period}
                  </FieldLabel>
                  <Input
                    placeholder={
                      T.periodExample
                    }
                  />
                </div>

                <div>
                  <FieldLabel>
                    {T.depth}
                  </FieldLabel>
                  <Input
                    placeholder={
                      T.depthHelp
                    }
                  />
                </div>

                <div>
                  <FieldLabel>
                    {T.machineAccess}
                  </FieldLabel>

                  <Select>
                    <option>
                      {T.unknown}
                    </option>
                    <option>
                      {T.yes}
                    </option>
                    <option>
                      {T.limited}
                    </option>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel>
                    {T.description}
                  </FieldLabel>

                  <textarea
                    rows={5}
                    placeholder={
                      T.descriptionHelp
                    }
                    className="w-full rounded-2xl border border-[#d7e5e8] bg-white px-4 py-3 text-[15px] text-[#173943] outline-none transition focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2]"
                  />
                </div>

                <div>
                  <FieldLabel>
                    {T.phone}
                  </FieldLabel>
                  <Input
                    type="tel"
                    placeholder={
                      T.phoneHelp
                    }
                  />
                </div>

                <div>
                  <FieldLabel>
                    {T.email}
                  </FieldLabel>
                  <Input
                    type="email"
                    placeholder={
                      T.emailHelp
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled
                    className="rounded-2xl bg-[#173f48] px-6 py-3.5 font-bold text-white opacity-60"
                  >
                    {T.publishRequest}
                  </button>

                  <div className="mt-3 text-xs leading-5 text-[#789096]">
                    {T.pendingForm}
                  </div>
                </div>
              </form>
            </div>

          </section>
        )}

        {tab === "provider" && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[26px] border border-[#d9e7e9] bg-white p-6 sm:p-8">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
                {T.contractors}
              </div>

              <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#173f48]">
                {T.providerTitle}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6a8187]">
                {T.providerHelp}
              </p>

              <form
                className="mt-8"
                onSubmit={event =>
                  event.preventDefault()
                }
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>
                      {T.company}
                    </FieldLabel>
                    <Input
                      placeholder={
                        T.companyHelp
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      {T.phone}
                    </FieldLabel>
                    <Input
                      type="tel"
                      placeholder={
                        T.phoneHelp
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      {T.email}
                    </FieldLabel>
                    <Input
                      type="email"
                      placeholder={
                        T.emailHelp
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      {T.site}
                    </FieldLabel>
                    <Input
                      placeholder={T.optional}
                    />
                  </div>
                </div>

                <div className="mt-7">
                  <FieldLabel>
                    {T.workRegions}
                  </FieldLabel>

                  <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#cfe2dd] bg-[#f1f8f6] p-4">
                    <input
                      type="checkbox"
                      checked={allBulgaria}
                      onChange={event => {
                        const checked =
                          event.target
                            .checked;

                        setAllBulgaria(
                          checked
                        );

                        if (checked) {
                          setProviderRegions(
                            []
                          );
                        }
                      }}
                      className="h-5 w-5"
                    />

                    <span className="font-bold text-[#275b4c]">
                      {T.nationwide}
                    </span>
                  </label>

                  {!allBulgaria && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {REGIONS.map(
                        (
                          item,
                          index
                        ) => (
                          <label
                            key={`region-${index}`}
                            className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#dce8ea] px-3 py-2.5 text-sm text-[#426069]"
                          >
                            <input
                              type="checkbox"
                              checked={providerRegions.includes(
                                item
                              )}
                              onChange={() =>
                                toggleProviderRegion(
                                  item
                                )
                              }
                            />
                            {item}
                          </label>
                        )
                      )}
                    </div>
                  )}

                  <div className="mt-3 text-xs leading-5 text-[#71878d]">
                    {T.selected}
                    {": "}
                    {visibleRegionText}
                  </div>
                </div>

                <div className="mt-7">
                  <FieldLabel>
                    {T.servicesLabel}
                  </FieldLabel>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {SERVICES.map(
                      (
                        item,
                        index
                      ) => (
                        <label
                          key={`service-${index}`}
                          className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#dce8ea] px-3 py-3 text-sm leading-5 text-[#426069]"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5"
                          />
                          {item}
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>
                      {T.maxDepth}
                    </FieldLabel>
                    <Input
                      placeholder={
                        T.maxDepthHelp
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      {T.diameters}
                    </FieldLabel>
                    <Input
                      placeholder={
                        T.diametersHelp
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      {T.method}
                    </FieldLabel>
                    <Input
                      placeholder={
                        T.methodHelp
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel>
                      {T.equipment}
                    </FieldLabel>
                    <Input
                      placeholder={
                        T.equipmentHelp
                      }
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <FieldLabel>
                    {T.presentation}
                  </FieldLabel>

                  <textarea
                    rows={5}
                    placeholder={
                      T.presentationHelp
                    }
                    className="w-full rounded-2xl border border-[#d7e5e8] bg-white px-4 py-3 text-[15px] text-[#173943] outline-none transition focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2]"
                  />
                </div>

              </form>
            </div>

            <aside className="rounded-[26px] border border-[#d9e7e9] bg-white p-6">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a9299]">
                {"\u0413\u0410\u041b\u0415\u0420\u0418\u042f"}
              </div>

              <h3 className="mt-2 text-xl font-bold text-[#173f48]">
                {"\u0421\u043d\u0438\u043c\u043a\u0438 \u0438 \u0432\u0438\u0434\u0435\u0430 \u043e\u0442 \u0432\u0430\u0448\u0430\u0442\u0430 \u0440\u0430\u0431\u043e\u0442\u0430"}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#6a8187]">
                {"\u041f\u043e \u0436\u0435\u043b\u0430\u043d\u0438\u0435 \u043c\u043e\u0436\u0435\u0442\u0435 \u0434\u0430 \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u0435 \u0441\u043d\u0438\u043c\u043a\u0438 \u0438\u043b\u0438 \u043a\u0440\u0430\u0442\u043a\u0438 \u0432\u0438\u0434\u0435\u0430 \u043e\u0442 \u0438\u0437\u043f\u044a\u043b\u043d\u0435\u043d\u0438 \u043e\u0431\u0435\u043a\u0442\u0438, \u0442\u0435\u0445\u043d\u0438\u043a\u0430, \u0441\u043e\u043d\u0434\u0430\u0436\u0438 \u0438 \u043a\u043b\u0430\u0434\u0435\u043d\u0446\u0438."}
              </p>

              <div className="mt-6 rounded-2xl border border-dashed border-[#bfd6d9] bg-[#f7fbfb] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5f2f2] text-xl">
                    {"\ud83d\uddbc\ufe0f"}
                  </div>

                  <div>
                    <div className="font-bold text-[#244b53]">
                      {"\u0421\u043d\u0438\u043c\u043a\u0438"}
                    </div>

                    <div className="text-xs text-[#789096]">
                      {"\u0414\u043e 8 \u0441\u043d\u0438\u043c\u043a\u0438"}
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled
                  className="mt-4 block w-full text-sm text-[#6a8187] file:mr-4 file:rounded-xl file:border-0 file:bg-[#eaf4f2] file:px-4 file:py-2 file:font-semibold file:text-[#24634f]"
                />
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-[#bfd6d9] bg-[#f7fbfb] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5f2f2] text-xl">
                    {"\ud83c\udfa5"}
                  </div>

                  <div>
                    <div className="font-bold text-[#244b53]">
                      {"\u0412\u0438\u0434\u0435\u0430"}
                    </div>

                    <div className="text-xs text-[#789096]">
                      {"\u0414\u043e 3 \u043a\u0440\u0430\u0442\u043a\u0438 \u0432\u0438\u0434\u0435\u0430"}
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  accept="video/*"
                  multiple
                  disabled
                  className="mt-4 block w-full text-sm text-[#6a8187] file:mr-4 file:rounded-xl file:border-0 file:bg-[#eaf4f2] file:px-4 file:py-2 file:font-semibold file:text-[#24634f]"
                />
              </div>

              <div className="mt-4 text-xs leading-5 text-[#789096]">
                {"\u041a\u0430\u0447\u0432\u0430\u043d\u0435\u0442\u043e \u0449\u0435 \u0431\u044a\u0434\u0435 \u0430\u043a\u0442\u0438\u0432\u0438\u0440\u0430\u043d\u043e \u0441\u043b\u0435\u0434 \u0441\u0432\u044a\u0440\u0437\u0432\u0430\u043d\u0435\u0442\u043e \u0441\u044a\u0441 \u0441\u0438\u0441\u0442\u0435\u043c\u0430\u0442\u0430 \u0437\u0430 \u0444\u0430\u0439\u043b\u043e\u0432\u0435."}
              </div>
            </aside>

            <div className="lg:col-span-2 flex flex-col items-center pt-2">
              <button
                type="button"
                disabled
                className="min-w-[280px] rounded-2xl bg-[#16825c] px-8 py-3.5 font-bold text-white opacity-60"
              >
                {T.sendApproval}
              </button>

              <div className="mt-3 max-w-2xl text-center text-xs leading-5 text-[#789096]">
                {T.providerPending}
              </div>
            </div>

          </section>
        )}
      </div>
    </main>
  );
}
