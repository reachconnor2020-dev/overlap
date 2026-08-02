import Link from 'next/link';
import Button from '@/components/Button';
import VennMark from '@/components/VennMark';

export default function LandingPage() {
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <span className="font-display text-xl italic">Overlap</span>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline">
            Log in
          </Link>
          <Link href="/signup">
            <Button variant="secondary" className="px-5 py-2">
              Create account
            </Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-24 pt-8 md:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
            For couples, not for dating
          </p>
          <h1 className="font-display text-5xl italic leading-[1.05] md:text-6xl">
            Find the couple friends you actually click with.
          </h1>
          <p className="mt-6 max-w-md text-base text-ink/80">
            Overlap matches you and your partner with other couples based on what
            you both share — hobbies, interests, values, politics. Strictly
            platonic, always. No hearts, no flames, no ambiguity.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/signup">
              <Button>Find your overlap</Button>
            </Link>
            <a href="#how" className="text-sm font-medium hover:underline">
              How it works
            </a>
          </div>
        </div>
        <div className="flex justify-center">
          <VennMark
            size={440}
            labelA="You two"
            labelB="Them two"
            exampleA="rock climbing, sushi"
            exampleB="wine tasting, true crime"
            overlapLabel="board games, climate policy, tacos"
            animated
          />
        </div>
      </section>

      <section id="how" className="border-t border-line bg-paperDim">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl italic">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
            <div>
              <div className="mb-4 h-1 w-10 bg-circleA" />
              <h3 className="font-display text-xl">One profile, two people</h3>
              <p className="mt-2 text-sm text-ink/75">
                You and your partner build a single shared profile: a bio, a
                photo, and the interests, hobbies, and values that describe you
                as a pair.
              </p>
            </div>
            <div>
              <div className="mb-4 h-1 w-10 bg-overlap" />
              <h3 className="font-display text-xl">We rank by what overlaps</h3>
              <p className="mt-2 text-sm text-ink/75">
                Every other couple on Overlap gets scored against you by how
                much you actually have in common — not by looks, by shared
                ground.
              </p>
            </div>
            <div>
              <div className="mb-4 h-1 w-10 bg-circleB" />
              <h3 className="font-display text-xl">Both couples say yes</h3>
              <p className="mt-2 text-sm text-ink/75">
                If your two couples both express interest, it's a match, and a
                chat opens up. No pressure, no swiping past strangers who
                already passed on you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-xl font-display text-3xl italic">
          Making couple friends shouldn't be this hard.
        </h2>
        <div className="mt-8">
          <Link href="/signup">
            <Button>Get started — it's free</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink/60">
        Overlap is built for platonic friendship between couples. Romantic or
        sexual intent isn't what this is for.
      </footer>
    </main>
  );
}
