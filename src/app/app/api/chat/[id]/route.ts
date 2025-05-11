import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/api/auth/mongodb";
import { ObjectId } from "mongodb";

// GET a specific chat by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chatId = id;
  try {
    if (!ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);
    const chats = db.collection("chats");

    const userIdCookie = req.cookies.get("userId");
    const userId = userIdCookie?.value;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const chat = await chats.findOne({
      _id: new ObjectId(chatId),
      userId,
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error(`GET /chat/${chatId} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chatId = id;
  try {
    if (!ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    const { content } = await req.json();
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);
    const chats = db.collection("chats");

    const userIdCookie = req.cookies.get("userId");
    const userId = userIdCookie?.value;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const contentArray = Array.isArray(content) ? content : [content];
    // Generate a demo chatbot response
    const botResponse = generateBotResponse(contentArray);
    const updatedContent = [
      ...contentArray,
      {
        role: "assistant",
        id: new ObjectId().toString(),
        content: botResponse,
        timestamp: new Date().toISOString(),
      },
    ];

    const result = await chats.updateOne(
      { _id: new ObjectId(chatId), userId },
      { $set: { content: updatedContent, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Chat updated",
      botResponse,
      updatedContent,
    });
  } catch (error) {
    console.error(`PATCH /api/chat/${chatId} error:`, error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    );
  }
}

// Helper function to generate a demo bot response
function generateBotResponse(
  userContent: string | { content: string } | { content: string }[]
): string {
  // If content is an array, get the last user message
  const userMessage = Array.isArray(userContent)
    ? userContent[userContent.length - 1]?.content || ""
    : typeof userContent === "string"
    ? userContent
    : userContent?.content || "";

  // Simple demo responses based on user input
  if (
    userMessage.toLowerCase().includes("hello") ||
    userMessage.toLowerCase().includes("hi")
  ) {
    return "Hello there! How can I help you today?";
  } else if (userMessage.toLowerCase().includes("help")) {
    return "I'm here to help! What do you need assistance with?";
  } else if (userMessage.toLowerCase().includes("thank")) {
    return "You're welcome! Is there anything else you'd like to know?";
  } else if (userMessage.toLowerCase().includes("bye")) {
    return "Goodbye! Feel free to chat again anytime.";
  } else if (userMessage.toLowerCase().includes("?")) {
    return "That's an interesting question. While I'm just a demo bot right now, I'd be happy to try answering that in the future!";
  } else {
    return "I'm a demo chatbot. In the full version, I'll be able to provide more helpful responses to messages like yours!";
  }
}

// UPDATE a specific chat's title
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chatId = id;
  try {
    if (!ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    const { title } = await req.json();
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);
    const chats = db.collection("chats");

    const userIdCookie = req.cookies.get("userId");
    const userId = userIdCookie?.value;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const result = await chats.updateOne(
      { _id: new ObjectId(chatId), userId },
      { $set: { title, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Chat title updated" });
  } catch (error) {
    console.error(`PUT /chat/${chatId} error:`, error);
    return NextResponse.json(
      { error: "Failed to update chat title" },
      { status: 500 }
    );
  }
}

// DELETE a specific chat
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chatId = id;
  try {
    if (!ObjectId.isValid(chatId)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);
    const chats = db.collection("chats");

    const userIdCookie = req.cookies.get("userId");
    const userId = userIdCookie?.value;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const result = await chats.deleteOne({
      _id: new ObjectId(chatId),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Chat deleted" });
  } catch (error) {
    console.error(`DELETE /chat/${chatId} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
