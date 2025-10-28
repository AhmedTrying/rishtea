import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // Prefer admin client for storage writes if configured
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? createAdminClient() 
      : await createClient()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `product-${timestamp}-${randomString}.${fileExtension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      const hint = process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? undefined 
        : 'Storage RLS blocked. Add SUPABASE_SERVICE_ROLE_KEY or relax bucket policies.'
      return NextResponse.json(
        { error: hint || 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Prefer admin client for storage writes if configured
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? createAdminClient() 
      : await createClient()

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')

    if (!fileName) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
    }

    const { error } = await supabase.storage
      .from('product-images')
      .remove([fileName])

    if (error) {
      console.error('Supabase delete error:', error)
      const hint = process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? undefined 
        : 'Storage RLS blocked. Add SUPABASE_SERVICE_ROLE_KEY or relax bucket policies.'
      return NextResponse.json(
        { error: hint || 'Failed to delete image' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Image deleted successfully' })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}