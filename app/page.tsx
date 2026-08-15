import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-4xl px-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold mb-6">
          A
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Ask Once.<br />
          <span className="gradient-text">Multiple AIs Think.</span><br />
          One Verified Answer Returns.
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          The first AI Operating System that routes your queries across multiple AI models,
          verifies responses through consensus, and delivers certified answers.
        </p>
        <Link href="/dashboard">
          <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all">
            Launch Dashboard →
          </button>
        </Link>
      </div>
    </div>
  )
}
