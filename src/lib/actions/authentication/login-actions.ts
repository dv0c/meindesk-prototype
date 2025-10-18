import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Missing email or password");
  }

  const result = await signIn("credentials", {
    email,
    password,
    redirect: true,
    callbackUrl: "/dashboard",
  });

  if (result?.error) {
    throw new Error("Invalid email or password");
  }

}