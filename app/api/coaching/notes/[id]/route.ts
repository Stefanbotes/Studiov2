
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const UpdateNoteSchema = z.object({
  content: z.string().min(1).optional(),
  order: z.number().int().optional(),
  isArchived: z.boolean().optional()
})

interface RouteParams {
  params: { id: string }
}

// PUT - Update coaching note
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = params.id
    const body = await req.json()
    const validatedData = UpdateNoteSchema.parse(body)

    // Verify note exists and user ownership
    const existingNote = await prisma.coachingNote.findFirst({
      where: {
        id: noteId,
        client: {
          userId: session.user.id
        }
      }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 }
      )
    }

    // Update note
    const updatedNote = await prisma.coachingNote.update({
      where: { id: noteId },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ note: updatedNote })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Update coaching note error:", error)
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    )
  }
}

// DELETE - Delete coaching note (soft delete)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = params.id

    // Verify note exists and user ownership
    const existingNote = await prisma.coachingNote.findFirst({
      where: {
        id: noteId,
        client: {
          userId: session.user.id
        }
      }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 }
      )
    }

    // Soft delete by archiving
    await prisma.coachingNote.update({
      where: { id: noteId },
      data: { isArchived: true }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Delete coaching note error:", error)
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    )
  }
}
