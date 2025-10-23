#!/usr/bin/env tsx
/**
 * Script to create a test user for authentication
 * 
 * Usage:
 *   npm install -g tsx
 *   tsx scripts/create-test-user.ts
 * 
 * Or:
 *   npx tsx scripts/create-test-user.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🔐 Creating test user...\n')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@studio2.com' }
    })

    if (existingUser) {
      console.log('⚠️  User with email test@studio2.com already exists!')
      console.log('📧 Email:', existingUser.email)
      console.log('👤 Name:', existingUser.name)
      console.log('🎭 Role:', existingUser.role)
      console.log('\nIf you need to reset the password, delete this user first.')
      return
    }

    // Hash the password
    const password = 'Test123!'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: 'test@studio2.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'Coach',
        license: 'Standard',
        organization: 'Test Organization',
        emailVerified: new Date(), // Mark as verified
      }
    })

    console.log('✅ Test user created successfully!\n')
    console.log('📋 Login Credentials:')
    console.log('─────────────────────────────────')
    console.log('📧 Email:    test@studio2.com')
    console.log('🔑 Password: Test123!')
    console.log('─────────────────────────────────')
    console.log('\n👤 User Details:')
    console.log('   ID:', user.id)
    console.log('   Name:', user.name)
    console.log('   Role:', user.role)
    console.log('   License:', user.license)
    console.log('   Organization:', user.organization)
    console.log('\n🚀 You can now log in at: /auth/login')

  } catch (error) {
    console.error('❌ Error creating test user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createTestUser()
