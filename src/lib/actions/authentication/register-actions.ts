"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { db } from "../../db";

// You can also use zod for validation if you want stronger safety
export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim() || "Anonymous";
  const username = (formData.get("username") as string)?.trim();

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (!username) {
    throw new Error("Username is required");
  }

  if (username.length < 3) {
    throw new Error("Username must be at least 3 characters");
  }

  // Check if user already exists (email or username)
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { email },
        { username: { equals: username, mode: "insensitive" } }
      ]
    },
  });

  if (existingUser) {
    if (existingUser.email === email) throw new Error("Email already registered");
    throw new Error("Username already taken");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  await db.user.create({
    data: {
      email,
      name,
      username,
      hashedPassword: hashedPassword,
    },
  });

  // You could auto-login here with NextAuth if you wanted,
  // but safer to just redirect to login for now
  redirect("/login");
}


