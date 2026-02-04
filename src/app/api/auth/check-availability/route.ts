import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, email } = await request.json();

    if (!username && !email) {
      return NextResponse.json(
        { error: "Username or email is required" },
        { status: 400 }
      );
    }

    // In production, check against database
    // For demo purposes, we'll simulate availability checks
    
    // Simulate username availability check
    if (username) {
      // Reserved usernames for demo
      const reservedUsernames = ["admin", "support", "vellon", "test", "user"];
      
      if (reservedUsernames.includes(username.toLowerCase())) {
        return NextResponse.json(
          { error: "This username is not available" },
          { status: 400 }
        );
      }

      if (username.length < 3) {
        return NextResponse.json(
          { error: "Username must be at least 3 characters" },
          { status: 400 }
        );
      }

      if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        return NextResponse.json(
          { error: "Username can only contain letters, numbers, dots, and underscores" },
          { status: 400 }
        );
      }
    }

    // Simulate email validation
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address" },
          { status: 400 }
        );
      }

      // Simulate disposable email check (demo)
      const disposableEmails = ["tempmail.com", "throwaway.com"];
      const domain = email.split("@")[1];
      if (disposableEmails.includes(domain)) {
        return NextResponse.json(
          { error: "Please use a permanent email address" },
          { status: 400 }
        );
      }
    }

    // In production, query database:
    // const existingUser = await db.user.findFirst({
    //   where: {
    //     OR: [
    //       { username: username.toLowerCase() },
    //       { email: email.toLowerCase() }
    //     ]
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: "Available",
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
