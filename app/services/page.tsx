"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

import { createClient } from "@/lib/supabase-browser";

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

type ProviderRecord = {
  id: string;
  company_name: string;
  services: string[];
  work_regions: string[];
  works_nationwide: boolean;
  max_depth: string | null;
  diameters: string | null;
  drilling_method: string | null;
  equipment: string | null;
  presentation: string | null;
  created_at: string;
};

type ProviderContacts = {
  phone: string;
  email: string | null;
  website_or_facebook: string | null;
};


type PublicProviderMedia = {
  id: string;
  media_type: "image" | "video";
  storage_path: string;
  caption: string | null;
  sort_order: number;
  preview_url?: string;
};

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

  useEffect(() => {
    const value =
      new URLSearchParams(
        window.location.search
      ).get("tab");

    if (
      value === "request" ||
      value === "provider"
    ) {
      setTab(value);
    } else {
      setTab("find");
    }
  }, []);

  function changeTab(nextTab: Tab) {
    setTab(nextTab);

    const url = new URL(window.location.href);

    if (nextTab === "find") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", nextTab);
    }

    window.history.pushState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`
    );
  }

  const [region, setRegion] =
    useState("");

  const [service, setService] =
    useState("");

  const [searchedRegion, setSearchedRegion] =
    useState("");

  const [searchedService, setSearchedService] =
    useState("");

  const [hasSearched, setHasSearched] =
    useState(false);

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [providers, setProviders] =
    useState<ProviderRecord[]>([]);


  const [
    selectedProvider,
    setSelectedProvider,
  ] = useState<ProviderRecord | null>(
    null
  );

  const [
    selectedProviderMedia,
    setSelectedProviderMedia,
  ] = useState<PublicProviderMedia[]>([]);

  const [
    selectedProviderMediaLoading,
    setSelectedProviderMediaLoading,
  ] = useState(false);

  const [
    selectedProviderMediaError,
    setSelectedProviderMediaError,
  ] = useState("");

  const [
    selectedProviderAuthenticated,
    setSelectedProviderAuthenticated,
  ] = useState(false);


  const [
    selectedProviderContacts,
    setSelectedProviderContacts,
  ] = useState<ProviderContacts | null>(
    null
  );

  const [providersLoading, setProvidersLoading] =
    useState(true);

  const [providersError, setProvidersError] =
    useState("");

  const [requestSubmitting, setRequestSubmitting] =
    useState(false);

  const [requestMessage, setRequestMessage] =
    useState("");

  const [providerSubmitting, setProviderSubmitting] =
    useState(false);

  const [providerMessage, setProviderMessage] =
    useState("");

  const [successPopup, setSuccessPopup] =
    useState<{
      title: string;
      text: string;
    } | null>(null);

  const [authPopup, setAuthPopup] =
    useState<{
      title: string;
      text: string;
    } | null>(null);

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

  useEffect(() => {
    let active = true;

    async function loadProviders() {
      setProvidersLoading(true);
      setProvidersError("");

      const { data, error } =
        await supabase.rpc(
          "get_public_service_providers"
        );

      if (!active) return;

      if (error) {
        console.error("service_providers load error", error);
        setProviders([]);
        setProvidersError(
          "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0437\u0430\u0440\u0435\u0434\u0438\u043c \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b\u0438\u0442\u0435."
        );
      } else {
        setProviders((data || []) as ProviderRecord[]);
      }

      setProvidersLoading(false);
    }

    void loadProviders();

    return () => {
      active = false;
    };
  }, [supabase]);

  const filteredProviders = useMemo(() => {
    if (!hasSearched) {
      return [];
    }

    return providers.filter(item => {
      const regionMatches =
        !searchedRegion ||
        (
          searchedRegion === "all"
            ? item.works_nationwide
            : item.works_nationwide ||
              item.work_regions.includes(searchedRegion)
        );

      const serviceMatches =
        !searchedService ||
        item.services.includes(searchedService);

      return regionMatches && serviceMatches;
    });
  }, [
    providers,
    searchedRegion,
    searchedService,
    hasSearched,
  ]);

  async function openProviderProfile(
    provider: ProviderRecord
  ) {
    setSelectedProvider(provider);
    setSelectedProviderMedia([]);
    setSelectedProviderMediaError("");
    setSelectedProviderMediaLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setSelectedProviderAuthenticated(
      Boolean(user)
    );

    setSelectedProviderContacts(null);

    if (user) {
      const {
        data: contactsData,
        error: contactsError,
      } = await supabase.rpc(
        "get_service_provider_contacts",
        {
          provider_uuid: provider.id,
        }
      );

      if (contactsError) {
        console.error(
          "provider contacts load error",
          contactsError
        );
      } else {
        const contacts =
          Array.isArray(contactsData) &&
          contactsData.length > 0
            ? contactsData[0]
            : null;

        setSelectedProviderContacts(
          contacts as ProviderContacts | null
        );
      }
    }

    const { data, error } =
      await supabase
        .from("service_provider_media")
        .select(
          "id, media_type, storage_path, caption, sort_order"
        )
        .eq("provider_id", provider.id)
        .eq("status", "approved")
        .order("sort_order", {
          ascending: true,
        });

    if (error) {
      console.error(
        "provider media load error",
        error
      );

      setSelectedProviderMediaError(
        "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0437\u0430\u0440\u0435\u0434\u0438\u043c \u0441\u043d\u0438\u043c\u043a\u0438\u0442\u0435 \u0438 \u0432\u0438\u0434\u0435\u043e\u0442\u043e."
      );

      setSelectedProviderMediaLoading(
        false
      );

      return;
    }

    const rows =
      (data || []) as PublicProviderMedia[];

    const withUrls =
      await Promise.all(
        rows.map(async item => {
          const { data: signed } =
            await supabase.storage
              .from("provider-media")
              .createSignedUrl(
                item.storage_path,
                3600
              );

          return {
            ...item,
            preview_url:
              signed?.signedUrl || "",
          };
        })
      );

    setSelectedProviderMedia(
      withUrls
    );

    setSelectedProviderMediaLoading(
      false
    );
  }

  function closeProviderProfile() {
    setSelectedProvider(null);
    setSelectedProviderMedia([]);
    setSelectedProviderMediaError("");
    setSelectedProviderMediaLoading(false);
    setSelectedProviderAuthenticated(false);
    setSelectedProviderContacts(null);
  }

  function goToAuth(path: "/login" | "/register") {
    const returnTo =
      `${window.location.pathname}${window.location.search}${window.location.hash}`;

    document.cookie =
      `ai_smm_auth_next=${encodeURIComponent(returnTo)}; path=/; max-age=3600; samesite=lax`;

    window.location.href = path;
  }

  async function requireUser(
    title: string,
    text: string
  ) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      setAuthPopup({
        title,
        text,
      });

      return null;
    }

    return user;
  }

  async function submitRequest(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (requestSubmitting) return;

    const form = event.currentTarget;

    setRequestMessage("");

    const user = await requireUser(
      "Необходима е регистрация",
      "За да публикувате заявка за услуга, трябва да имате акаунт в SONDI.BG."
    );

    if (!user) return;

    const data = new FormData(form);

    const requestedService = String(
      data.get("service") || ""
    ).trim();

    const requestedRegion = String(
      data.get("region") || ""
    ).trim();

    const description = String(
      data.get("description") || ""
    ).trim();

    const phone = String(
      data.get("contact_phone") || ""
    ).trim();

    const email = String(
      data.get("contact_email") || ""
    ).trim();

    if (!requestedService) {
      setRequestMessage(
        "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u0443\u0441\u043b\u0443\u0433\u0430."
      );
      return;
    }

    if (!requestedRegion) {
      setRequestMessage(
        "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043e\u0431\u043b\u0430\u0441\u0442."
      );
      return;
    }

    if (description.length < 10) {
      setRequestMessage(
        "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435\u0442\u043e \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0435 \u043f\u043e\u043d\u0435 10 \u0441\u0438\u043c\u0432\u043e\u043b\u0430."
      );
      return;
    }

    if (!phone && !email) {
      setRequestMessage(
        "\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0442\u0435\u043b\u0435\u0444\u043e\u043d \u0438\u043b\u0438 \u0438\u043c\u0435\u0439\u043b \u0437\u0430 \u043a\u043e\u043d\u0442\u0430\u043a\u0442."
      );
      return;
    }

    setRequestSubmitting(true);
    setRequestMessage("");

    const { error } = await supabase
      .from("service_requests")
      .insert({
        owner_id: user.id,
        service: requestedService,
        region: requestedRegion,
        locality:
          String(data.get("locality") || "").trim() || null,
        desired_period:
          String(data.get("desired_period") || "").trim() || null,
        estimated_depth:
          String(data.get("estimated_depth") || "").trim() || null,
        machine_access:
          String(data.get("machine_access") || "unknown"),
        description,
        contact_phone: phone || null,
        contact_email: email || null,
        status: "pending",
      });

    setRequestSubmitting(false);

    if (error) {
      console.error("service request insert error", error);
      setRequestMessage(
        "\u0413\u0440\u0435\u0448\u043a\u0430: " + error.message
      );
      return;
    }

    form.reset();

    setRequestMessage(
      "\u0417\u0430\u044f\u0432\u043a\u0430\u0442\u0430 \u0435 \u0438\u0437\u043f\u0440\u0430\u0442\u0435\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0438 \u0449\u0435 \u0431\u044a\u0434\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0430 \u0441\u043b\u0435\u0434 \u043f\u0440\u0435\u0433\u043b\u0435\u0434."
    );

    setSuccessPopup({
      title:
        "\u0417\u0430\u044f\u0432\u043a\u0430\u0442\u0430 \u0435 \u0438\u0437\u043f\u0440\u0430\u0442\u0435\u043d\u0430",
      text:
        "\u0411\u043b\u0430\u0433\u043e\u0434\u0430\u0440\u0438\u043c! \u0412\u0430\u0448\u0430\u0442\u0430 \u0437\u0430\u044f\u0432\u043a\u0430 \u0435 \u043f\u0440\u0438\u0435\u0442\u0430 \u0438 \u0449\u0435 \u0431\u044a\u0434\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0430 \u0441\u043b\u0435\u0434 \u043f\u0440\u0435\u0433\u043b\u0435\u0434."
    });
  }

  async function submitProvider(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (providerSubmitting) return;

    const form = event.currentTarget;

    setProviderMessage("");

    const user = await requireUser(
      "Необходима е регистрация",
      "За да публикувате профил на изпълнител, трябва да имате акаунт в SONDI.BG."
    );

    if (!user) return;

    const data = new FormData(form);

    const selectedServices = data
      .getAll("services")
      .map(value => String(value))
      .filter(Boolean);

    if (selectedServices.length === 0) {
      setProviderMessage(
        "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043f\u043e\u043d\u0435 \u0435\u0434\u043d\u0430 \u0443\u0441\u043b\u0443\u0433\u0430."
      );
      return;
    }

    if (
      !allBulgaria &&
      providerRegions.length === 0
    ) {
      setProviderMessage(
        "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043f\u043e\u043d\u0435 \u0435\u0434\u043d\u0430 \u043e\u0431\u043b\u0430\u0441\u0442 \u0438\u043b\u0438 \u201e\u0420\u0430\u0431\u043e\u0442\u044f \u0432 \u0446\u044f\u043b\u0430 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f\u201c."
      );
      return;
    }

    setProviderSubmitting(true);
    setProviderMessage("");

    const { error } = await supabase
      .from("service_providers")
      .insert({
        owner_id: user.id,
        company_name:
          String(data.get("company_name") || "").trim(),
        phone:
          String(data.get("phone") || "").trim(),
        email:
          String(data.get("email") || "").trim() || null,
        website_or_facebook:
          String(
            data.get("website_or_facebook") || ""
          ).trim() || null,
        services: selectedServices,
        work_regions:
          allBulgaria ? [] : providerRegions,
        works_nationwide: allBulgaria,
        max_depth:
          String(data.get("max_depth") || "").trim() || null,
        diameters:
          String(data.get("diameters") || "").trim() || null,
        drilling_method:
          String(data.get("drilling_method") || "").trim() || null,
        equipment:
          String(data.get("equipment") || "").trim() || null,
        presentation:
          String(data.get("presentation") || "").trim() || null,
        status: "pending",
      });

    setProviderSubmitting(false);

    if (error) {
      console.error("service provider insert error", error);
      setProviderMessage(
        "\u0413\u0440\u0435\u0448\u043a\u0430: " + error.message
      );
      return;
    }

    form.reset();
    setAllBulgaria(false);
    setProviderRegions([]);

    setProviderMessage(
      "\u041f\u0440\u043e\u0444\u0438\u043b\u044a\u0442 \u0435 \u0438\u0437\u043f\u0440\u0430\u0442\u0435\u043d \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0438 \u0449\u0435 \u0431\u044a\u0434\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d \u0441\u043b\u0435\u0434 \u043f\u0440\u0435\u0433\u043b\u0435\u0434."
    );

    setSuccessPopup({
      title:
        "\u041f\u0440\u043e\u0444\u0438\u043b\u044a\u0442 \u0435 \u0438\u0437\u043f\u0440\u0430\u0442\u0435\u043d",
      text:
        "\u0411\u043b\u0430\u0433\u043e\u0434\u0430\u0440\u0438\u043c! \u0412\u0430\u0448\u0438\u044f\u0442 \u043f\u0440\u043e\u0444\u0438\u043b \u0435 \u043f\u0440\u0438\u0435\u0442 \u0438 \u0449\u0435 \u0431\u044a\u0434\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d \u0441\u043b\u0435\u0434 \u043f\u0440\u0435\u0433\u043b\u0435\u0434."
    });
  }

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
        onClick={() => changeTab(value)}
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
                  onClick={() => {
                    setSearchedRegion(region);
                    setSearchedService(service);
                    setHasSearched(true);
                  }}
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
                    {!hasSearched
                      ? "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043a\u0440\u0438\u0442\u0435\u0440\u0438\u0438"
                      : searchedRegion === "all"
                        ? T.wholeCountry
                        : searchedRegion
                          ? `${T.region}: ${searchedRegion}`
                          : T.allRegions}
                  </div>
                </div>

                {!hasSearched ? (
                  <div className="mt-8 rounded-[22px] border border-dashed border-[#bfd6d9] bg-[#f7fbfb] px-6 py-12 text-center">
                    <h3 className="text-xl font-bold text-[#234951]">
                      {"\u041d\u0430\u043c\u0435\u0440\u0435\u0442\u0435 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#6a8187]">
                      {"\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u0440\u0435\u0433\u0438\u043e\u043d \u0438/\u0438\u043b\u0438 \u0443\u0441\u043b\u0443\u0433\u0430 \u0438 \u043d\u0430\u0442\u0438\u0441\u043d\u0435\u0442\u0435 \u201e\u0422\u044a\u0440\u0441\u0438\u201c."}
                    </p>
                  </div>
                ) : providersLoading ? (
                  <div className="mt-8 rounded-[22px] border border-[#d9e7e9] bg-[#f7fbfb] px-6 py-12 text-center text-sm text-[#6a8187]">
                    {"\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b\u0438..."}
                  </div>
                ) : providersError ? (
                  <div className="mt-8 rounded-[22px] border border-[#efd6d6] bg-[#fff8f8] px-6 py-8 text-center text-sm text-[#934b4b]">
                    {providersError}
                  </div>
                ) : filteredProviders.length > 0 ? (
                  <div className="mt-8 grid gap-4">
                    {filteredProviders.map(item => (
                      <article
                        key={item.id}
                        className="rounded-[22px] border border-[#d9e7e9] bg-[#fbfdfd] p-5 sm:p-6"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-[#173f48]">
                              {item.company_name}
                            </h3>

                            <div className="mt-2 text-sm font-semibold text-[#397061]">
                              {item.works_nationwide
                                ? T.wholeCountry
                                : item.work_regions.join(", ")}
                            </div>
                          </div>

                          {item.max_depth && (
                            <div className="rounded-xl bg-[#edf7f4] px-3 py-2 text-xs font-bold text-[#28634f]">
                              {T.maxDepth}: {item.max_depth}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.services.map((s, index) => (
                            <span
                              key={`${item.id}-${index}`}
                              className="rounded-full border border-[#d4e5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#456761]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        {item.presentation && (
                          <p className="mt-4 text-sm leading-6 text-[#597278]">
                            {item.presentation}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap items-center justify-end gap-4 border-t border-[#e2ecee] pt-4 text-sm">

                          <button
                            type="button"
                            onClick={() => {
                              void openProviderProfile(
                                item
                              );
                            }}
                            className="inline-flex items-center justify-center rounded-xl bg-[#173f48] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#225764]"
                          >
                            {"\u0412\u0438\u0436 \u043f\u0440\u043e\u0444\u0438\u043b"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 rounded-[22px] border border-dashed border-[#bfd6d9] bg-[#f7fbfb] px-6 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e4f3ef] text-2xl">
                      {"\u26cf"}
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-[#234951]">
                      {T.waiting}
                    </h3>

                    <button
                      type="button"
                      onClick={() => changeTab("provider")}
                      className="mt-6 rounded-2xl border border-[#bddbd2] bg-white px-5 py-3 font-bold text-[#187356]"
                    >
                      {T.addFree}
                    </button>
                  </div>
                )}
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

              {requestMessage && (
                <div
                  className={
                    "mt-6 rounded-2xl border px-5 py-4 text-sm font-semibold " +
                    (
                      requestMessage.startsWith("\u0417\u0430\u044f\u0432\u043a\u0430\u0442\u0430 \u0435")
                        ? "border-[#b9ddcf] bg-[#eef8f4] text-[#176344]"
                        : "border-[#efcccc] bg-[#fff5f5] text-[#9a4242]"
                    )
                  }
                >
                  {requestMessage}
                </div>
              )}

              <form
                className="mt-8 grid gap-5 sm:grid-cols-2"
                onSubmit={submitRequest}
                noValidate
              >
                <div>
                  <FieldLabel>
                    {T.whatService}
                  </FieldLabel>

                  <Select required name="service">
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

                  <Select required name="region">
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
                    name="locality"
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
                    name="desired_period"
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
                    name="estimated_depth"
                    placeholder={
                      T.depthHelp
                    }
                  />
                </div>

                <div>
                  <FieldLabel>
                    {T.machineAccess}
                  </FieldLabel>

                  <Select
                    name="machine_access"
                    defaultValue="unknown"
                  >
                    <option value="unknown">
                      {T.unknown}
                    </option>
                    <option value="yes">
                      {T.yes}
                    </option>
                    <option value="limited">
                      {T.limited}
                    </option>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel>
                    {T.description}
                  </FieldLabel>

                  <textarea
                    name="description"
                    required
                    minLength={10}
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
                    name="contact_phone"
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
                    name="contact_email"
                    type="email"
                    placeholder={
                      T.emailHelp
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={requestSubmitting}
                    className="rounded-2xl bg-[#173f48] px-6 py-3.5 font-bold text-white transition hover:bg-[#0f333b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {requestSubmitting
                      ? "\u0418\u0437\u043f\u0440\u0430\u0449\u0430\u043d\u0435..."
                      : T.publishRequest}
                  </button>

                  <div className="mt-3 text-xs leading-5 text-[#789096]">
                    {"\u0417\u0430\u044f\u0432\u043a\u0430\u0442\u0430 \u0449\u0435 \u0431\u044a\u0434\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0430 \u0441\u043b\u0435\u0434 \u043f\u0440\u0435\u0433\u043b\u0435\u0434."}
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

              {providerMessage && (
                <div
                  className={
                    "mt-6 rounded-2xl border px-5 py-4 text-sm font-semibold " +
                    (
                      providerMessage.startsWith("\u041f\u0440\u043e\u0444\u0438\u043b\u044a\u0442 \u0435")
                        ? "border-[#b9ddcf] bg-[#eef8f4] text-[#176344]"
                        : "border-[#efcccc] bg-[#fff5f5] text-[#9a4242]"
                    )
                  }
                >
                  {providerMessage}
                </div>
              )}

              <form
                id="provider-form"
                className="mt-8"
                onSubmit={submitProvider}
                noValidate
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>
                      {T.company}
                    </FieldLabel>
                    <Input
                      name="company_name"
                      required
                      minLength={2}
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
                      name="phone"
                      required
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
                      name="email"
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
                      name="website_or_facebook"
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
                              name="work_regions"
                              value={item}
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
                            name="services"
                            value={item}
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
                      name="max_depth"
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
                      name="diameters"
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
                      name="drilling_method"
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
                      name="equipment"
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
                    name="presentation"
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
                type="submit"
                form="provider-form"
                disabled={providerSubmitting}
                className="min-w-[280px] rounded-2xl bg-[#16825c] px-8 py-3.5 font-bold text-white transition hover:bg-[#126d4d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {providerSubmitting
                  ? "\u0418\u0437\u043f\u0440\u0430\u0449\u0430\u043d\u0435..."
                  : T.sendApproval}
              </button>

              <div className="mt-3 max-w-2xl text-center text-xs leading-5 text-[#789096]">
                {providerMessage ||
                  "\u041f\u0440\u043e\u0444\u0438\u043b\u044a\u0442 \u0449\u0435 \u0431\u044a\u0434\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d \u0441\u043b\u0435\u0434 \u043f\u0440\u0435\u0433\u043b\u0435\u0434."}
              </div>
            </div>

          </section>
        )}
      </div>

      {authPopup && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#102f36]/50 px-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-popup-title"
        >
          <div className="w-full max-w-md rounded-[28px] border border-[#d6e8e5] bg-white p-7 text-center shadow-[0_30px_90px_rgba(17,57,66,.30)] sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f5f6] text-3xl text-[#297784]">
              {"→"}
            </div>

            <h3
              id="auth-popup-title"
              className="mt-5 text-2xl font-bold text-[#173f48]"
            >
              {authPopup.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#617a80]">
              {authPopup.text}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => goToAuth("/register")}
                className="rounded-2xl bg-[#16825c] px-5 py-3.5 font-bold text-white transition hover:bg-[#126d4d]"
              >
                {"Регистрация"}
              </button>

              <button
                type="button"
                onClick={() => goToAuth("/login")}
                className="rounded-2xl bg-[#173f48] px-5 py-3.5 font-bold text-white transition hover:bg-[#102f36]"
              >
                {"Вход"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAuthPopup(null)}
              className="mt-4 px-5 py-2 text-sm font-semibold text-[#72898f] transition hover:text-[#173f48]"
            >
              {"Отказ"}
            </button>
          </div>
        </div>
      )}

      {successPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102f36]/45 px-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-[28px] border border-[#d6e8e5] bg-white p-7 text-center shadow-[0_30px_90px_rgba(17,57,66,.28)] sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f6ef] text-3xl text-[#16825c]">
              {"\u2713"}
            </div>

            <h3 className="mt-5 text-2xl font-bold text-[#173f48]">
              {successPopup.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#617a80]">
              {successPopup.text}
            </p>

            <button
              type="button"
              onClick={() =>
                setSuccessPopup(null)
              }
              className="mt-7 min-w-[140px] rounded-2xl bg-[#16825c] px-7 py-3 font-bold text-white transition hover:bg-[#126d4d]"
            >
              {"OK"}
            </button>
          </div>
        </div>
      )}

      {selectedProvider && (
        <div
          className="fixed inset-0 z-[120] overflow-y-auto bg-[#102f36]/70 px-3 py-4 backdrop-blur-sm sm:px-6 sm:py-8"
          role="dialog"
          aria-modal="true"
          onMouseDown={event => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeProviderProfile();
            }
          }}
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={closeProviderProfile}
                className="rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm font-bold text-[#34545c] shadow-lg"
              >
                {"\u2715 \u0417\u0430\u0442\u0432\u043e\u0440\u0438"}
              </button>
            </div>

            <section className="overflow-hidden rounded-[30px] border border-[#d9e7e9] bg-white shadow-[0_24px_90px_rgba(8,35,42,.25)]">
              <header className="border-b border-[#e2ecee] bg-[#f7fbfb] p-6 sm:p-8">
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#56858e]">
                  {"\u0418\u0417\u041f\u042a\u041b\u041d\u0418\u0422\u0415\u041b"}
                </div>

                <h2 className="mt-2 text-3xl font-bold text-[#173f48] sm:text-4xl">
                  {selectedProvider.company_name}
                </h2>

                <div className="mt-3 inline-flex rounded-full border border-[#b9ddcf] bg-[#eef8f4] px-3 py-1.5 text-xs font-bold text-[#176344]">
                  {"\u041e\u0434\u043e\u0431\u0440\u0435\u043d \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b"}
                </div>
              </header>

              <div className="p-6 sm:p-8">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                    {"\u0423\u0441\u043b\u0443\u0433\u0438"}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedProvider.services.map(
                      (
                        providerService,
                        index
                      ) => (
                        <span
                          key={index}
                          className="rounded-full border border-[#d4e5e1] bg-[#f7fbfa] px-3 py-1.5 text-sm font-semibold text-[#456761]"
                        >
                          {providerService}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f6fafb] p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                      {"\u0420\u0430\u0439\u043e\u043d \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0430"}
                    </div>

                    <div className="mt-2 font-semibold text-[#405c63]">
                      {selectedProvider.works_nationwide
                        ? "\u0426\u044f\u043b\u0430 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f"
                        : selectedProvider.work_regions.join(
                            ", "
                          )}
                    </div>
                  </div>

                  {selectedProvider.max_depth && (
                    <div className="rounded-2xl bg-[#f6fafb] p-4">
                      <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                        {"\u041c\u0430\u043a\u0441. \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430"}
                      </div>

                      <div className="mt-2 font-semibold text-[#405c63]">
                        {selectedProvider.max_depth}
                      </div>
                    </div>
                  )}

                  {selectedProvider.diameters && (
                    <div className="rounded-2xl bg-[#f6fafb] p-4">
                      <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                        {"\u0414\u0438\u0430\u043c\u0435\u0442\u0440\u0438"}
                      </div>

                      <div className="mt-2 font-semibold text-[#405c63]">
                        {selectedProvider.diameters}
                      </div>
                    </div>
                  )}

                  {selectedProvider.drilling_method && (
                    <div className="rounded-2xl bg-[#f6fafb] p-4">
                      <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                        {"\u041c\u0435\u0442\u043e\u0434 \u043d\u0430 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435"}
                      </div>

                      <div className="mt-2 font-semibold text-[#405c63]">
                        {selectedProvider.drilling_method}
                      </div>
                    </div>
                  )}
                </div>

                {selectedProvider.equipment && (
                  <div className="mt-7">
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                      {"\u0422\u0435\u0445\u043d\u0438\u043a\u0430"}
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4d686f]">
                      {selectedProvider.equipment}
                    </p>
                  </div>
                )}

                {selectedProvider.presentation && (
                  <div className="mt-7">
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                      {"\u041f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u044f\u043d\u0435"}
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#4d686f]">
                      {selectedProvider.presentation}
                    </p>
                  </div>
                )}

                <div className="mt-8 border-t border-[#e2ecee] pt-7">
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                    {"\u0421\u043d\u0438\u043c\u043a\u0438 \u0438 \u0432\u0438\u0434\u0435\u043e"}
                  </div>

                  {selectedProviderMediaLoading ? (
                    <div className="mt-4 rounded-2xl bg-[#f6fafb] p-5 text-sm text-[#607980]">
                      {"\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435..."}
                    </div>
                  ) : selectedProviderMediaError ? (
                    <div className="mt-4 rounded-2xl border border-[#efd6d6] bg-[#fff8f8] p-5 text-sm text-[#934b4b]">
                      {selectedProviderMediaError}
                    </div>
                  ) : selectedProviderMedia.length > 0 ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {selectedProviderMedia.map(
                        item => (
                          <div
                            key={item.id}
                            className="overflow-hidden rounded-2xl border border-[#d9e7e9] bg-[#f7fafb]"
                          >
                            <div className="aspect-video bg-[#dfeaec]">
                              {item.preview_url ? (
                                item.media_type ===
                                "image" ? (
                                  <img
                                    src={
                                      item.preview_url
                                    }
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <video
                                    src={
                                      item.preview_url
                                    }
                                    controls
                                    preload="metadata"
                                    className="h-full w-full bg-black object-contain"
                                  />
                                )
                              ) : null}
                            </div>

                            {item.caption && (
                              <div className="p-3 text-sm text-[#526d74]">
                                {item.caption}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-[#71878d]">
                      {"\u041d\u044f\u043c\u0430 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0438 \u0441\u043d\u0438\u043c\u043a\u0438 \u0438\u043b\u0438 \u0432\u0438\u0434\u0435\u043e."}
                    </div>
                  )}
                </div>

                <div className="mt-8 border-t border-[#e2ecee] pt-7">
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                    {"\u041a\u043e\u043d\u0442\u0430\u043a\u0442"}
                  </div>

                  {selectedProviderAuthenticated &&
                  selectedProviderContacts ? (
                    <div className="mt-4 rounded-2xl bg-[#eef7f4] p-5">
                      <div className="flex flex-wrap gap-5 text-sm">
                        <a
                          href={`tel:${selectedProviderContacts?.phone || ""}`}
                          className="font-bold text-[#167454]"
                        >
                          {selectedProviderContacts?.phone}
                        </a>

                        {selectedProviderContacts?.email && (
                          <a
                            href={`mailto:${selectedProviderContacts.email}`}
                            className="font-semibold text-[#356b76]"
                          >
                            {selectedProviderContacts.email}
                          </a>
                        )}

                        {selectedProviderContacts?.website_or_facebook && (
                          <span className="font-semibold text-[#356b76]">
                            {
                              selectedProviderContacts.website_or_facebook
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] p-5 text-sm text-[#607980]">
                      {"\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u0438\u0442\u0435 \u0441\u0430 \u0434\u043e\u0441\u0442\u044a\u043f\u043d\u0438 \u0441\u043b\u0435\u0434 \u0432\u0445\u043e\u0434 \u0432 SONDI.BG."}

                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() =>
                            goToAuth("/login")
                          }
                          className="inline-flex rounded-xl bg-[#173f48] px-4 py-2.5 font-bold text-white"
                        >
                          {"\u0412\u043b\u0435\u0437 \u0438\u043b\u0438 \u0441\u0435 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u0439"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end border-t border-[#e2ecee] pt-7">
                  <button
                    type="button"
                    onClick={
                      closeProviderProfile
                    }
                    className="rounded-xl bg-[#173f48] px-5 py-3 text-sm font-bold text-white"
                  >
                    {"\u0417\u0430\u0442\u0432\u043e\u0440\u0438 \u043f\u0440\u043e\u0444\u0438\u043b\u0430"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

    </main>
  );
}
