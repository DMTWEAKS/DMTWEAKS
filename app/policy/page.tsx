import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/storefront/Header'
import Footer from '@/components/storefront/Footer'

const DISCORD_URL = 'https://discord.gg/PwxWSsZzUP'

export const metadata: Metadata = {
  title: 'Store Policy | DM Tweaks',
  description: 'Refunds, keys and hardware changes at DM Tweaks.',
}

const SECTIONS = [
  {
    title: '1. No refunds',
    body: [
      "Our tools, keys and guides are digital products delivered instantly, so all sales are final. We don't offer refunds once your purchase has been delivered. Services can't be refunded once work on your PC has started.",
      "If you're unsure whether a product fits your PC, ask us in Discord before buying.",
    ],
  },
  {
    title: '2. Your key is your responsibility',
    body: [
      "After you buy, save your key somewhere safe, like a password manager or a note you won't lose. Don't share it with anyone. We are not responsible for keys that are lost, deleted, shared or stolen.",
    ],
  },
  {
    title: '3. Lost keys and hardware changes',
    body: [
      "Keys are tied to your PC. If you lose your key, or change your hardware, your old key won't work and you'll need to buy a new one.",
    ],
  },
  {
    title: '4. Need a new key? Ask for a discount',
    body: [
      "If you're a past customer who needs a new key, open a ticket in our Discord with your original order details and ask for a discount. Discounts are given case by case and aren't guaranteed.",
    ],
  },
]

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">Store Policy</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Please read this before you buy. By purchasing from DM Tweaks, you agree to these terms.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: September 26, 2026</p>
          </div>

          <div className="mt-12 rounded-xl border border-primary bg-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground">The short version</h2>
            <ol className="mt-4 space-y-3 text-base text-muted-foreground">
              <li className="flex gap-3"><span className="font-bold text-primary">1</span>All sales are final. No refunds.</li>
              <li className="flex gap-3"><span className="font-bold text-primary">2</span>Keeping your key safe is your responsibility.</li>
              <li className="flex gap-3"><span className="font-bold text-primary">3</span>Lost your key or changed hardware? You&apos;ll need a new key, but you can ask us for a discount.</li>
            </ol>
          </div>

          <div className="mt-12 space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-base leading-7 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            <section>
              <h2 className="text-2xl font-bold text-foreground">5. Contact us</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Questions about your order or this policy? Reach us on Discord and we&apos;ll help.
              </p>
              <Link
                href={DISCORD_URL}
                className="mt-5 inline-flex rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Open a ticket on Discord
              </Link>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
