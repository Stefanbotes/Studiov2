
import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSchemaIds, getSchemaById, getLeadershipWorkflowData, getClinicalWorkflowData } from '@/lib/schema-pack'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const schemaId = searchParams.get('id')
  const format = searchParams.get('format') || 'full'
  
  if (schemaId) {
    // Return specific schema data
    const schema = getSchemaById(schemaId)
    
    if (!schema) {
      return NextResponse.json(
        { error: 'Schema not found', schemaId },
        { status: 404 }
      )
    }
    
    if (format === 'leadership') {
      const leadershipData = getLeadershipWorkflowData(schemaId)
      return NextResponse.json({
        schemaId,
        type: 'leadership',
        data: leadershipData
      })
    }
    
    if (format === 'clinical') {
      const clinicalData = getClinicalWorkflowData(schemaId)
      return NextResponse.json({
        schemaId,
        type: 'clinical',
        data: clinicalData
      })
    }
    
    // Return full schema data
    const leadershipData = getLeadershipWorkflowData(schemaId)
    const clinicalData = getClinicalWorkflowData(schemaId)
    
    return NextResponse.json({
      schemaId,
      leadership: leadershipData,
      clinical: clinicalData,
      metadata: schema.metadata
    })
  }
  
  // Return list of all available schemas
  const schemaIds = getAvailableSchemaIds()
  const schemas = schemaIds.map(id => {
    const leadershipData = getLeadershipWorkflowData(id)
    const clinicalData = getClinicalWorkflowData(id)
    
    return {
      id,
      name: leadershipData?.schema_name || clinicalData?.schema_name || id,
      domain: leadershipData?.schema_domain || clinicalData?.schema_domain || '',
      leadershipPersona: leadershipData?.leadership_persona || '',
      healthyPersona: leadershipData?.healthy_persona || '',
      coreNeeds: clinicalData?.core_needs || ''
    }
  })
  
  return NextResponse.json({
    total: schemas.length,
    schemas
  })
}
