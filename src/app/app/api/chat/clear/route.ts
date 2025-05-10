import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // adjust if needed
import { ObjectId } from "mongodb";

export async function DELETE(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);
    const chats = db.collection("chats");

    const userIdCookie = req.cookies.get("userId");
    const userId = userIdCookie?.value;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const result = await chats.deleteMany({ userId });

    return NextResponse.json({
      message: "Deleted chats",
      count: result.deletedCount,
    });
  } catch (error) {
    console.error("DELETE /chat/clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear chats" },
      { status: 500 }
    );
  }
}
