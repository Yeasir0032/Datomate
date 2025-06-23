import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { adminIncrement, db } from "@/lib/firebase-admin";

const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API || "",
});

// Helper function to convert Buffer to GenerativeContent blob for Gemini
function fileToGenerativePart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userContext = formData.get("context") as string | null;
    const userid = formData.get("userid") as string | null;
    const scannerId = formData.get("scannerId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded.", success: false },
        { status: 400 }
      );
    }
    if (!userContext) {
      return NextResponse.json(
        { error: "No context provided.", success: false },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imagePart = fileToGenerativePart(buffer, file.type);
    const contents = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imagePart.inlineData.data,
        },
      },
      { text: userContext },
    ];
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: contents,
    });
    const geminiText = await result.text;

    let extractedData = {};
    let summaryText = geminiText;
    if (geminiText) {
      // Attempt to parse JSON from the Gemini response if it's formatted as a code block
      try {
        const jsonMatch = geminiText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          extractedData = JSON.parse(jsonMatch[1]);
          // Remove the JSON block from the summary text
          summaryText = geminiText.replace(jsonMatch[0], "").trim();
          try {
            await db.doc(`Users/${userid}`).update({
              totalscans: adminIncrement(1),
            });
            await db.doc(`Users/${userid}/Scanners/${scannerId}`).update({
              lastUsed: new Date().toISOString(),
              scans: adminIncrement(1),
            });
            const snapshot = await db
              .collection(`Users/${userid}/Scanners/${scannerId}/Docs`)
              .add({
                data: extractedData,
                scannedAt: new Date().toISOString(),
              });
          } catch (error) {
            console.error(error);
          }

          return NextResponse.json(
            {
              success: true,
              geminiText: summaryText,
              extractedData: extractedData,
              message: "File processed by Gemini successfully!",
            },
            { status: 200 }
          );
        }
      } catch (jsonError) {
        console.warn("Could not parse JSON from Gemini response:", jsonError);
        return new NextResponse("Could not parse JSON. AI ERROR", {
          status: 500,
        });
      }
    }
    return new NextResponse("AI ERROR", {
      status: 500,
    });
  } catch (error: any) {
    console.error("Error processing document with Gemini:", error);
    return NextResponse.json(
      {
        error: "Failed to process document with Gemini API.",
        details: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
