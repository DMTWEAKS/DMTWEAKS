
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { initDatabase } from '../lib/db'

async function main() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ Error: DATABASE_URL environment variable is not set')
      console.error('Please create a .env.local file with your DATABASE_URL')
      process.exit(1)
    }

    console.log('Initializing database...')
    await initDatabase()
    console.log('✅ Database initialized successfully!')
    console.log('Tables created:')
    console.log('  - product_keys')
    console.log('  - customer_passwords')
    console.log('  - admin_users')
    console.log('  - homepage_content')
    console.log('\nNext steps:')
    console.log('  1. Set up admin password: POST /api/admin/auth/setup')
    console.log('  2. Login to admin panel and configure homepage content')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Failed to initialize database:', error.message)
    console.error(error)
    process.exit(1)
  }
}

main()

