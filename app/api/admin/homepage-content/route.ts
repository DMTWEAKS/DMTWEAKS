import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { defaultHomepageContent, type HomepageContent } from '@/lib/homepage-content'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  try {
    const result = await sql`
      SELECT content FROM homepage_content 
      WHERE id = 1
      LIMIT 1
    `

    const resultArray = Array.isArray(result) ? result : []
    const firstResult = resultArray.length > 0 ? resultArray[0] : null
    
    if (firstResult && typeof firstResult === 'object' && 'content' in firstResult && firstResult.content) {
      const parsedContent = typeof firstResult.content === 'string' 
        ? JSON.parse(firstResult.content) 
        : firstResult.content
      
      const mergedContent: HomepageContent = {
        ...defaultHomepageContent,
        ...parsedContent,
        hero: { ...defaultHomepageContent.hero, ...(parsedContent.hero || {}) },
        stats: parsedContent.stats || defaultHomepageContent.stats,
        whyChoose: { ...defaultHomepageContent.whyChoose, ...(parsedContent.whyChoose || {}) },
        howItWorks: { ...defaultHomepageContent.howItWorks, ...(parsedContent.howItWorks || {}) },
        benefits: { ...defaultHomepageContent.benefits, ...(parsedContent.benefits || {}) },
        testimonials: { ...defaultHomepageContent.testimonials, ...(parsedContent.testimonials || {}) },
        products: { ...defaultHomepageContent.products, ...(parsedContent.products || {}) },
        cta: { ...defaultHomepageContent.cta, ...(parsedContent.cta || {}) },
        gamingPC: { ...defaultHomepageContent.gamingPC, ...(parsedContent.gamingPC || {}) },
        performance: { ...defaultHomepageContent.performance, ...(parsedContent.performance || {}) },
      }
      
      return NextResponse.json({
        success: true,
        data: mergedContent,
      })
    }

    return NextResponse.json({
      success: true,
      data: defaultHomepageContent,
    })
  } catch (error: any) {
    if (error.message?.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        data: defaultHomepageContent,
      })
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch homepage content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError
  
  try {
    const body = await request.json()
    const content: HomepageContent = body.content

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    await sql`
      CREATE TABLE IF NOT EXISTS homepage_content (
        id INTEGER PRIMARY KEY DEFAULT 1,
        content TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      INSERT INTO homepage_content (id, content, updated_at)
      VALUES (1, ${JSON.stringify(content)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) 
      DO UPDATE SET 
        content = ${JSON.stringify(content)},
        updated_at = CURRENT_TIMESTAMP
    `

    return NextResponse.json({
      success: true,
      message: 'Homepage content saved successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save homepage content' },
      { status: 500 }
    )
  }
}

