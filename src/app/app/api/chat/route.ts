// import { NextRequest, NextResponse } from "next/server";
// import clientPromise from "@/app/api/auth/mongodb";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const client = await clientPromise;
//     const db = client.db(process.env.DATABASE_NAME);
//     const chats = db.collection("chats");

//     const userIdCookie = req.cookies.get("userId");
//     const userId = userIdCookie?.value;

//     if (!userId) {
//       return NextResponse.json({ error: "User ID not found" }, { status: 401 });
//     }

//     const userMessage = body.content?.[0];
//     const title = userMessage?.content?.substring(0, 50) || "New Conversation";

//     const newChat = {
//       ...body,
//       userId, // ← Include the userId in each chat document
//       title,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     const result = await chats.insertOne(newChat);

//     return NextResponse.json({
//       message: "Chat created",
//       insertedId: result.insertedId,
//     });
//   } catch (error) {
//     console.error("POST /chat error:", error);
//     return NextResponse.json(
//       { error: "Failed to create chat" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     const client = await clientPromise;
//     const db = client.db(process.env.DATABASE_NAME);
//     const chats = db.collection("chats");

//     const userIdCookie = req.cookies.get("userId");
//     const userId = userIdCookie?.value;

//     if (!userId) {
//       return NextResponse.json({ error: "User ID not found" }, { status: 401 });
//     }

//     // Fetch only chats belonging to the user
//     const userChats = await chats
//       .find({ userId })
//       .sort({ createdAt: -1 }) // newest first
//       .toArray();

//     return NextResponse.json(userChats);
//   } catch (err) {
//     console.error("GET /chat error:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch chat history" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(req: NextRequest) {
//   try {
//     const { chatId } = await req.json();
//     const client = await clientPromise;
//     const db = client.db(process.env.DATABASE_NAME);
//     const chats = db.collection("chats");

//     const userIdCookie = req.cookies.get("userId");
//     const userId = userIdCookie?.value;

//     if (!userId) {
//       return NextResponse.json({ error: "User ID not found" }, { status: 401 });
//     }

//     const result = await chats.deleteOne({ _id: chatId, userId });

//     if (result.deletedCount === 0) {
//       return NextResponse.json({ error: "Chat not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Chat deleted" });
//   } catch (error) {
//     console.error("DELETE /chat error:", error);
//     return NextResponse.json(
//       { error: "Failed to delete chat" },
//       { status: 500 }
//     );
//   }
// }

// export async function PATCH(req: NextRequest) {
//   try {
//     const { chatId, content } = await req.json();
//     const client = await clientPromise;
//     const db = client.db(process.env.DATABASE_NAME);
//     const chats = db.collection("chats");

//     const userIdCookie = req.cookies.get("userId");
//     const userId = userIdCookie?.value;

//     if (!userId) {
//       return NextResponse.json({ error: "User ID not found" }, { status: 401 });
//     }

//     const result = await chats.updateOne(
//       { _id: chatId, userId },
//       { $set: { content, updatedAt: new Date() } }
//     );

//     if (result.modifiedCount === 0) {
//       return NextResponse.json({ error: "Chat not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Chat updated" });
//   } catch (error) {
//     console.error("PATCH /chat error:", error);
//     return NextResponse.json(
//       { error: "Failed to update chat" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(req: NextRequest) {
//   try {
//     const { chatId, title } = await req.json();
//     const client = await clientPromise;
//     const db = client.db(process.env.DATABASE_NAME);
//     const chats = db.collection("chats");

//     const userIdCookie = req.cookies.get("userId");
//     const userId = userIdCookie?.value;

//     if (!userId) {
//       return NextResponse.json({ error: "User ID not found" }, { status: 401 });
//     }

//     const result = await chats.updateOne(
//       { _id: chatId, userId },
//       { $set: { title, updatedAt: new Date() } }
//     );

//     if (result.modifiedCount === 0) {
//       return NextResponse.json({ error: "Chat not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Chat title updated" });
//   } catch (error) {
//     console.error("PUT /chat error:", error);
//     return NextResponse.json(
//       { error: "Failed to update chat title" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/api/auth/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);
    const chats = db.collection("chats");

    const userIdCookie = req.cookies.get("userId");
    const userId = userIdCookie?.value;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    // Get initial title from the first message or use default
    const title = body.title || "New Conversation";

    const newChat = {
      content: body.content || [],
      userId,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Here is a problem, there is no chatbot answer inserted. The good choice would be to here just create the chat and with put add the first message
    const result = await chats.insertOne(newChat);

    return NextResponse.json({
      message: "Chat created",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("POST /chat error:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);
    const chats = db.collection("chats");

    const userIdCookie = req.cookies.get("userId");
    const userId = userIdCookie?.value;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    // Fetch only chats belonging to the user
    const userChats = await chats
      .find({ userId })
      .sort({ createdAt: -1 }) // newest first
      .toArray();

    return NextResponse.json(userChats);
  } catch (err) {
    console.error("GET /chat error:", err);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { chatId } = await req.json();
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);
    const chats = db.collection("chats");

    const userIdCookie = req.cookies.get("userId");
    const userId = userIdCookie?.value;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const result = await chats.deleteOne({ _id: new ObjectId(chatId), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Chat deleted" });
  } catch (error) {
    console.error("DELETE /chat error:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
