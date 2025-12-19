import { neon } from '@neondatabase/serverless'

let sqlInstance: ReturnType<typeof neon> | null = null

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  if (!sqlInstance) {
    sqlInstance = neon(process.env.DATABASE_URL)
  }
  return sqlInstance
}

export const sql = new Proxy(function() {} as any, {
  apply(_target, _thisArg, args) {
    return getSql().apply(null, args as any)
  },
  get(_target, prop) {
    const instance = getSql()
    const value = instance[prop as keyof typeof instance]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  }
}) as ReturnType<typeof neon>

export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS product_keys (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        key_value TEXT NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        order_id VARCHAR(255),
        customer_email VARCHAR(255),
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(key_value, product_id)
      )
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_product_keys_product_id ON product_keys(product_id)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_product_keys_is_used ON product_keys(is_used)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_product_keys_order_id ON product_keys(order_id)
    `

    await sql`
      CREATE TABLE IF NOT EXISTS customer_passwords (
        id SERIAL PRIMARY KEY,
        customer_id VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_customer_passwords_customer_id ON customer_passwords(customer_id)
    `

    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE DEFAULT 'admin',
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username)
    `

    await sql`
      CREATE TABLE IF NOT EXISTS homepage_content (
        id INTEGER PRIMARY KEY DEFAULT 1,
        content TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  } catch (error) {
    throw error
  }
}

