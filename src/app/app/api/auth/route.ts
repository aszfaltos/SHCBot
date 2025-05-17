import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/api/auth/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  const body = await req.json();
  const { mode, email, password, username } = body;

  if (!mode || !["login", "register"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME!);
    const users = db.collection("users");

    if (mode === "login") {
      const user = await users.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: "1d",
      });

      // Create user object to return (excluding sensitive data)
      const userToReturn = {
        _id: user._id,
        username: user.username,
        email: user.email,
        likes: 0,
        dislikes: 0,
        messages: 0,
      };

      const res = NextResponse.json({
        message: "Login successful",
        token,
        user: userToReturn,
      });

      // Set cookies with user data
      res.cookies.set("userId", user._id.toString(), {
        path: "/",
        httpOnly: false, // Client-side JS needs to access
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      });

      res.cookies.set("name", user.username, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });

      res.cookies.set("email", user.email, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });

      return res;
    }

    if (mode === "register") {
      const existing = await users.findOne({ email });
      if (existing) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await users.insertOne({
        username,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      });

      // Create user object to return
      const userToReturn = {
        _id: result.insertedId,
        username,
        email,
      };

      const res = NextResponse.json({
        message: "User registered successfully",
        user: userToReturn,
      });

      // Set cookies with user data
      res.cookies.set("userId", result.insertedId.toString(), {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });

      res.cookies.set("name", username, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });

      res.cookies.set("email", email, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });

      return res;
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const body = await req.json();
  const { mode, email, password, username } = body;

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME!);
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Create user object to return (excluding sensitive data)
    const userToReturn = {
      _id: user._id,
      username: user.username,
      email: user.email,
      likes: 0,
      dislikes: 0,
      messages: 0,
    };

    const res = NextResponse.json({
      message: "Login successful",
      token,
      user: userToReturn,
    });

    // Set cookies with user data
    res.cookies.set("userId", user._id.toString(), {
      path: "/",
      httpOnly: false, // Client-side JS needs to access
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    res.cookies.set("name", user.username, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    res.cookies.set("email", user.email, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return res;

  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME!);
    const users = db.collection("users");
    const chats = db.collection("chats");

    const userId = req.cookies.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const objectId = new ObjectId(userId);

    // Delete all chats linked to the user
    await chats.deleteMany({ userId });

    // Delete the user
    const result = await users.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clear cookies
    const res = NextResponse.json({
      message: "User and chats deleted successfully",
    });

    res.cookies.set("userId", "", { path: "/", maxAge: 0 });
    res.cookies.set("name", "", { path: "/", maxAge: 0 });
    res.cookies.set("email", "", { path: "/", maxAge: 0 });

    return res;
  } catch (err) {
    console.error("DELETE /auth error:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

