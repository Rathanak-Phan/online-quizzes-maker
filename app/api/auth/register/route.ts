// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection('users');

    // Check if email already exists
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Set role and validation status
    const userRole = role === 'teacher' ? 'teacher' : 'user';
    const isValidated = userRole === 'teacher' ? false : true;

    // Insert user into MongoDB
    const result = await users.insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
      isValidated,
      adSkipping: false, // Default: no ad-skipping
      image: null,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: userRole === 'teacher'
        ? 'Teacher account created! Awaiting admin approval.'
        : 'Account created successfully! Please log in.',
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}