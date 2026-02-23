'use client';

// app/page.tsx
// Public landing page — no auth logic here.
// Admin login is a dedicated /login page. Session state is
// read via a server-side check that passes an `isLoggedIn` prop,
// OR we use a lightweight client hook. We keep it simple: the nav
// just links to /login and /dashboard; the server layout guards those.

import { Church, BookOpen, Heart, Users, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-deep/95 backdrop-blur-sm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Church className="w-7 h-7 text-gold" />
              <span className="font-serif text-lg leading-tight">
                Church of Christ <span className="text-gold">at Redcross</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#about"    className="text-white/80 hover:text-gold transition-colors">About</a>
              <a href="#beliefs"  className="text-white/80 hover:text-gold transition-colors">Beliefs</a>
              <a href="#services" className="text-white/80 hover:text-gold transition-colors">Services</a>
              <a href="#contact"  className="text-white/80 hover:text-gold transition-colors">Contact</a>
            </div>
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-gold transition-colors flex items-center gap-1.5"
            >
              Admin
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center justify-center bg-primary-deep overflow-hidden pt-16">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
              <Church className="w-10 h-10 text-gold" />
            </div>
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-4">Welcome to</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Church of Christ<br />
              <span className="text-gold">at Redcross</span>
            </h1>
            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
              A congregation rooted in scripture, united in love, and committed to serving God and one another.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gold hover:bg-amber text-primary-deep font-semibold transition-colors">
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors">
                Find Us
              </a>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/30 mx-auto" />
          </div>
        </section>

        {/* ── About ────────────────────────────────────────────── */}
        <section id="about" className="py-20 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Who We Are</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-heading">About Our Congregation</h2>
              <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
            </div>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4 text-body leading-relaxed">
                <p>
                  The Church of Christ at Redcross is a New Testament church striving to follow the pattern of the early church as found in the Bible. We are part of the broader Churches of Christ movement — a non-denominational fellowship of Christians united by faith in Jesus Christ alone.
                </p>
                <p>
                  Our congregation gathers to worship God in spirit and in truth, to edify one another, and to reach out to our community with the gospel of Christ. We believe the Bible is the inspired word of God and our only guide in matters of faith and practice.
                </p>
                <p>
                  Located at Redcross, Blantyre, Malawi, we warmly welcome all who seek to know God and grow in their walk with Christ.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: BookOpen, label: 'Bible-Based',  desc: 'Scripture is our only creed and guide' },
                  { icon: Heart,    label: 'Welcoming',    desc: "All are welcome in God's family" },
                  { icon: Users,    label: 'Community',    desc: 'Growing together in faith and love' },
                  { icon: Church,   label: 'Worship',      desc: 'Honouring God in spirit and truth' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="rounded-xl border border-neutral-surface bg-primary-warm p-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mx-auto">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <p className="font-medium text-heading text-sm">{label}</p>
                    <p className="text-caption text-xs leading-snug">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Beliefs ──────────────────────────────────────────── */}
        <section id="beliefs" className="py-20 px-4 bg-primary-warm border-y border-neutral-surface">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">What We Believe</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-heading">Our Core Beliefs</h2>
              <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'The Bible',          body: 'We believe the Bible is the inspired, authoritative word of God and our complete guide for faith and practice.' },
                { title: 'One God',            body: 'We believe in one God — Father, Son, and Holy Spirit — as revealed throughout the scriptures.' },
                { title: 'Jesus Christ',       body: 'We confess that Jesus Christ is the Son of God, our Lord and Saviour, who died and rose again for our redemption.' },
                { title: 'Baptism',            body: 'We believe in baptism by immersion for the remission of sins, as taught and practiced in the New Testament church.' },
                { title: "The Lord's Supper",  body: "We observe the Lord's Supper every first day of the week, remembering Christ's sacrifice as He commanded." },
                { title: 'Simple Worship',     body: 'Our worship is acappella, prayer-centred, and modelled on the New Testament pattern — no creeds but Christ.' },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-xl border border-neutral-surface bg-background p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    <h3 className="font-serif text-base text-heading">{title}</h3>
                  </div>
                  <p className="text-body text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Service Times ────────────────────────────────────── */}
        <section id="services" className="py-20 px-4 bg-background">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Join Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-heading mb-4">Service Times</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mb-12" />
            <div className="space-y-4 text-left">
              {[
                { day: 'Sunday',    time: '10:00 AM', label: 'Morning Worship Service' },
                { day: 'Sunday',    time: '5:00 PM',  label: 'Evening Service' },
                { day: 'Wednesday', time: '6:00 PM',  label: 'Bible Study' },
              ].map(({ day, time, label }) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-neutral-surface bg-primary-warm px-6 py-4">
                  <div>
                    <p className="font-medium text-heading">{label}</p>
                    <p className="text-caption text-sm">{day}</p>
                  </div>
                  <p className="font-serif text-xl text-gold">{time}</p>
                </div>
              ))}
            </div>
            <p className="text-caption text-sm mt-6">All are welcome. Come as you are.</p>
          </div>
        </section>

        {/* ── Contact ──────────────────────────────────────────── */}
        <section id="contact" className="py-20 px-4 bg-primary-deep text-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Get In Touch</p>
              <h2 className="font-serif text-3xl sm:text-4xl">Find Us</h2>
              <div className="w-16 h-0.5 bg-gold mx-auto mt-4" />
            </div>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              {[
                { icon: MapPin, label: 'Address', value: 'Redcross, Blantyre\nMalawi' },
                { icon: Phone,  label: 'Phone',   value: '+265 — — —' },
                { icon: Mail,   label: 'Email',   value: 'info@cocredcross.org' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center mx-auto">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-xs text-white/50 uppercase tracking-wide">{label}</p>
                  <p className="text-white/90 text-sm leading-snug whitespace-pre-line">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-primary-deep border-t border-white/10 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Church className="w-4 h-4 text-gold/50" />
          <span className="font-serif text-white/60 text-sm">Church of Christ at Redcross</span>
        </div>
        <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} Church of Christ at Redcross. All rights reserved.</p>
      </footer>
    </div>
  );
}