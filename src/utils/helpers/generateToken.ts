import jwt from "jsonwebtoken";

export const generateToken = (userObj: { id: string; role: string }) => {
  const { id, role } = userObj;

  return jwt.sign(
    { userId: id, role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};
