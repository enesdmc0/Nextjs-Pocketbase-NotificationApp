import { pb } from "../../lib/pb";
import type { NextApiRequest, NextApiResponse } from 'next'
import CryptoJS from "crypto-js";

const createUser = async (email: string, password: string) => {
  try {
    const hashEmail = CryptoJS.MD5(email).toString();
    const hashPassword = CryptoJS.MD5(password).toString();

    const newUser = await pb.collection("users").create({
      id: hashEmail.slice(0, 15),
      username: hashEmail,
      email: hashEmail + "@example.com",
      emailVisibility: true,
      password: hashPassword,
      passwordConfirm: hashPassword,
    });
    console.log(hashEmail.slice(0, 15), "---------- new user id --------");
    console.log(newUser, "new user created");
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("User creation failed");
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { email, password } = JSON.parse(req.body);
      const hashEmail = CryptoJS.MD5(email.toLowerCase()).toString();
      const hashPassword = CryptoJS.MD5(password.toLowerCase()).toString();

      pb.authStore.clear();

      let authData = await pb
          .collection("users")
          .authWithPassword(hashEmail + "@example.com", hashPassword)
          .catch((error) => {
            console.error("Login attempt -----authData----- Error", error);
            return null;
          });

      if (!authData && !pb.authStore.isValid) {
        console.log("-----User not found, creating new user ---------");
        await createUser(email, password);

        authData = await pb
            .collection("users")
            .authWithPassword(hashEmail + "@example.com", hashPassword)
            .catch((error) => {
              console.error("Post-creation login attempt -----authDataAfterCreation----- Error", error);
              return null;
            });
      }

      if (authData && pb.authStore.isValid) {
        console.log(authData, "--------Login successful-------");

        const authToken = pb.authStore.exportToCookie();
        console.log(authToken, "--------authToken-------")

        res.setHeader('Set-Cookie', `pb_auth=${authData.token}; Path=/; `);
        return res.status(200).json({ message: `Logged in successfully` });
      } else {
        console.log("Authentication failed");
        return res.status(401).json({ message: "Authentication failed" });
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      return res.status(500).json({ message: "Server error" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
