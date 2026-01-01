// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('online-quizzes');
    const users = db.collection('users');

    // Find user
    const user = await users.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check password
    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Block unapproved teachers
    if (user.role === 'teacher' && !user.isValidated) {
      return NextResponse.json({ error: 'Teacher account pending admin approval' }, { status: 403 });
    }

    // Remove password from response
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      message: 'Login successful!',
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}