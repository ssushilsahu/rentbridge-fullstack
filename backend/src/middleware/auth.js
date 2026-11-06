import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Login required" });
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    if (req.user.role === "tenant") req.user.role = "customer";
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
