const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function migrateAdmins() {
    console.log('🔄 Creating default super admin...')

    try {
        // Check if super admin already exists
        const existingAdmin = await prisma.adminUser.findUnique({
            where: { username: 'admin' }
        })

        if (existingAdmin) {
            console.log('✅ Super admin already exists.')
            await prisma.$disconnect()
            return
        }

        // Create default super admin
        const hashedPassword = await bcrypt.hash('password123', 10)
        await prisma.adminUser.create({
            data: {
                username: 'admin',
                password: hashedPassword,
                name: 'Super Admin',
                role: 'SUPER_ADMIN',
                permissions: '["*"]',
                isActive: true
            }
        })

        console.log('✅ Created super admin')
        console.log('   Username: admin')
        console.log('   Password: password123')

    } catch (error) {
        console.error('❌ Error:', error.message)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

migrateAdmins()
