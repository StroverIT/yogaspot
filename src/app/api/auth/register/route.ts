import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { trackServerEvent } from '@/lib/server-analytics';

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[register] DATABASE_URL:', process.env.DATABASE_URL);
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: (role ?? 'client') as any,
      },
    });

    const isStudioSignup = createdUser.role === 'business';
    await trackServerEvent({
      eventName: isStudioSignup ? 'studio_signup_completed' : 'signup_completed',
      userId: createdUser.id,
      metadata: {
        role: createdUser.role,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Register error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

