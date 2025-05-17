import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/api/auth/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messageId, reaction } = body;
    
    if (!messageId || !reaction || !["like", "dislike"].includes(reaction)) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME!);
    const messages = db.collection("messages");
    const users = db.collection("users");
    
    // Get user ID from cookies
    const userId = req.cookies.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Find the user
    const user = await users.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Check if user has already reacted to this message
    const existingReaction = await messages.findOne({
      messageId,
      userId: new ObjectId(userId)
    });

    // Update user stats
    const updateQuery: any = { 
        $inc: { messages: 1 } // Always increment message count for any reaction activity
    };
    
    // Add corresponding reaction count
    if (reaction === "like") {
    updateQuery.$inc.likes = 1;
    } else if (reaction === "dislike") {
    updateQuery.$inc.dislikes = 1;
    }
    
    // Update user stats
    await users.updateOne(
    { _id: new ObjectId(userId) },
    updateQuery
    );
    
    // Store or update the reaction
    await messages.updateOne(
    { messageId, userId: new ObjectId(userId) },
    { 
        $set: { 
        reaction,
        updatedAt: new Date() 
        }
    },
    { upsert: true } // Create if doesn't exist, update if it does
    );
    
    return NextResponse.json({
    message: "Reaction recorded successfully",
    reactionType: reaction
    });
        
    
  } catch (error) {
    console.error("Error in POST /api/message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all reactions for a message
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const messageId = url.searchParams.get("messageId");
    
    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME!);
    const messages = db.collection("messages");
    
    // Get current user ID from cookies
    const userId = req.cookies.get("userId")?.value;
    
    // Count reactions by type
    const reactions = await messages.aggregate([
      { $match: { messageId } },
      { $group: { _id: "$reaction", count: { $sum: 1 } } }
    ]).toArray();
    
    // Format the response with proper typing
    const formattedReactions: {
      like: number;
      dislike: number;
      userReactions: Array<{type: string; reactionId: string}>;
    } = {
      like: 0,
      dislike: 0,
      userReactions: []
    };
    
    reactions.forEach(item => {
      if (item._id === "like" || item._id === "dislike") {
        formattedReactions[item._id as "like" | "dislike"] = item.count;
      }
    });
    
    // If user is logged in, check their reactions to this message
    if (userId) {
      const userReaction = await messages.find({
        messageId,
        userId: new ObjectId(userId)
      }).toArray();
      
      formattedReactions.userReactions = userReaction.map(reaction => ({
        type: reaction.reaction,
        reactionId: reaction._id.toString()
      }));
    }
    
    return NextResponse.json(formattedReactions);
    
  } catch (error) {
    console.error("Error in GET /api/message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



// Delete a reaction
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const messageId = url.searchParams.get("messageId");
    console.log("messageid",messageId )
    
    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }
    
    const userId = req.cookies.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME!);
    const messages = db.collection("messages");
    
    // Find the existing reaction to know which counter to decrement
    const existingReaction = await messages.findOne({
      messageId,
      userId: new ObjectId(userId)
    });
    
    if (!existingReaction) {
      return NextResponse.json({ error: "Reaction not found" }, { status: 404 });
    }
    
    // Delete the reaction
    await messages.deleteOne({
      messageId,
      userId: new ObjectId(userId)
    });
    
    // Update user stats
    if (existingReaction.reaction === "like" || existingReaction.reaction === "dislike") {
      const users = db.collection("users");
      const updateQuery: any = {
        $inc: { messages: -1 } // Decrement message count
      };
      
        updateQuery.$inc[existingReaction.reaction + "s"] = -1;
      
      await users.updateOne(
        { _id: new ObjectId(userId) },
        updateQuery
      );
    }
    
    return NextResponse.json({
      message: "Reaction removed successfully"
    });
    
  } catch (error) {
    console.error("Error in DELETE /api/message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}