import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const careers = await prisma.career.findMany({ orderBy: { title: 'asc' } });
  return NextResponse.json(careers);
}
