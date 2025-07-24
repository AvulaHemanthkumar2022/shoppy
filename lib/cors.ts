import { NextApiRequest, NextApiResponse } from "next";

// lib/cors.ts
export function enableCors(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // <- must match frontend
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true; // signal to exit early
  }
  return false; // continue
}


