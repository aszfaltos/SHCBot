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
    console.log(contentArray);
    // Generate a demo chatbot response
    const botResponse = await generateBotResponse(contentArray);
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

// Helper function to generate a bot response
async function generateBotResponse(
  userContent:
    | string
    | { role: string; content: string }
    | { role: string; content: string }[]
): Promise<string> {
  // If content is an array, get the last user message
  let chatHistory = Array.isArray(userContent)
    ? userContent
    : typeof userContent === "string"
    ? [{ role: "user", content: userContent }]
    : [userContent || { role: "user", content: "" }];

  // Get the last user message if chatHistory is an array
  const lastUserMessage = chatHistory[chatHistory.length - 1]?.content || "";
  chatHistory = chatHistory.slice(0, chatHistory.length - 1);

  // Prepare chat history in the format expected by the API
  const formattedHistory = Array.isArray(chatHistory)
    ? chatHistory.map((msg) => ({ role: msg.role, content: msg.content }))
    : [];

  try {
    // Call the AI server API
    const response = await fetch(
      `${process.env.AI_API_URL || "http://localhost:8000"}/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: lastUserMessage,
          chat_history: formattedHistory,
        }),
      }
    );

    if (!response.ok) {
      console.error("Error from AI server:", response.statusText);
      return "I'm sorry, I encountered an error while processing your request.";
    }

    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error("Error calling AI service:", error);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    return "I'm sorry, I'm having trouble connecting to my knowledge base right now.";
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
