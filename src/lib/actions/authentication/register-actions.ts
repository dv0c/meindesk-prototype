"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { db } from "../../db";

// You can also use zod for validation if you want stronger safety
export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim() || "Anonymous";

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  await db.user.create({
    data: {
      email,
      name,
      hashedPassword: hashedPassword,
    },
  });

  // You could auto-login here with NextAuth if you wanted,
  // but safer to just redirect to login for now
  redirect("/login");
}


