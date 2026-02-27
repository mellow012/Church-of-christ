'use client';

import { BookOpen, Heart, Users, MapPin, Phone, Mail, ArrowRight, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = ['about', 'beliefs', 'services', 'contact'];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-deep/90 backdrop-blur-md border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gold/40 shrink-0 bg-white">
                <Image src="/coc-logo.jpg" alt="COC Redcross" width={36} height={36}
                  className="w-full h-full object-cover" priority />
              </div>
              <span className="font-bold text-base leading-tight hidden sm:block">
                <span className="text-gold">Church of Christ</span>
                <span className="text-white/70 font-medium"> at Redcross</span>
              </span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              {navLinks.map((id) => (
                <a key={id} href={`#${id}`}
                  className="text-white/65 hover:text-gold transition-colors font-medium capitalize tracking-wide">
                  {id}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login"
                className="text-sm text-white/55 hover:text-gold transition-colors flex items-center gap-1.5 font-medium">
                Admin <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="md:hidden p-1.5 rounded-lg text-white/60 hover:text-gold hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gold/10 bg-primary-deep/95 backdrop-blur-md px-4 py-3 space-y-1">
            {navLinks.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-white/70 hover:text-gold hover:bg-white/5
                           transition-colors font-medium capitalize text-sm tracking-wide"
              >
                {id}
              </a>
            ))}
          </div>
        )}
      </nav>

      <main>
        {/* ══════════════════════════════════════════════════
            HERO — full-bleed church photo, text in a card
            ══════════════════════════════════════════════════ */}
        <section className="relative min-h-screen overflow-hidden">

          {/* Full-bleed photo — NO overlay, fully clear */}
          <Image
            src="/church-hero.jpg"
            alt="Church of Christ at Redcross building"
            fill
            className="object-cover object-[center_40%]"
            priority
            quality={95}
          />

          {/* Only a very subtle top scrim so nav text stays readable */}
          <div className="absolute top-0 left-0 right-0 h-28
            bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

          {/* Text card — centered in the hero */}
          <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pt-16">
            <div className="w-full max-w-sm bg-primary-deep/80 backdrop-blur-md
                            border border-gold/25 rounded-2xl
                            px-6 py-6 shadow-2xl shadow-black/40 text-center">

              {/* Logo */}
              <div className="w-14 h-14 mx-auto mb-3 rounded-full overflow-hidden ring-2 ring-gold/50">
                <Image src="/coc-logo.jpg" alt="COC" width={56} height={56}
                  className="w-full h-full object-cover" />
              </div>

              <p className="text-[10px] text-gold/70 font-bold tracking-[0.2em] uppercase mb-1">Welcome to</p>
              <h1 className="font-bold text-2xl text-white leading-tight mb-2">
                Church of Christ<br />
                <span className="text-gold">at Redcross</span>
              </h1>

              <p className="text-white/65 text-xs leading-relaxed mb-5">
                Rooted in scripture, united in love, and committed to serving God and one another.
              </p>

              <div className="flex items-center justify-center gap-2">
                <a href="#about"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                             bg-gold hover:bg-amber text-primary-deep font-bold text-xs
                             transition-all duration-200 shadow-md shadow-black/20">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a href="#services"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                             border border-white/25 hover:border-gold/50 text-white/80
                             hover:text-gold text-xs font-medium transition-all duration-200">
                  Service Times
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Service strip ─────────────────────────────── */}
        <section className="bg-primary-deep border-b border-gold/20 py-5 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm">
              {[
                { label: 'English Service',              time: '07:00 – 09:00 AM' },
                { label: 'Chichewa Service',             time: '09:30 – 11:00 AM' },
                { label: 'Combined (Last Sunday)',       time: '08:00 – 11:00 AM' },
                { label: 'Bible Study (Wed)',            time: '06:00 – 07:00 PM' },
              ].map(({ label, time }, i, arr) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  <span className="text-white/55 font-medium">{label}</span>
                  <span className="text-gold font-bold">{time}</span>
                  {i < arr.length - 1 && <div className="w-px h-4 bg-white/10 ml-3 hidden lg:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── About ────────────────────────────────────────── */}
        <section id="about" className="py-24 px-4 bg-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-gold text-[11px] font-bold tracking-[0.2em] uppercase mb-2">Who We Are</p>
              <h2 className="font-bold text-3xl sm:text-4xl text-heading">About Our Congregation</h2>
              <div className="w-14 h-0.5 bg-gold mx-auto mt-5 rounded-full" />
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-5 text-body leading-relaxed">
                <p>The Church of Christ at Redcross is a New Testament church striving to follow the pattern of the early church as found in the Bible. We are part of the broader Churches of Christ movement — a non-denominational fellowship of Christians united by faith in Jesus Christ alone.</p>
                <p>Our congregation gathers to worship God in spirit and in truth, to edify one another, and to reach out to our community with the gospel of Christ. We believe the Bible is the inspired word of God and our only guide in matters of faith and practice.</p>
                <p>Located at Redcross, Blantyre, Malawi, we warmly welcome all who seek to know God and grow in their walk with Christ.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: BookOpen, label: 'Bible-Based', desc: 'Scripture is our only creed and guide' },
                  { icon: Heart,    label: 'Welcoming',   desc: "All are welcome in God's family" },
                  { icon: Users,    label: 'Community',   desc: 'Growing together in faith and love' },
                  { icon: MapPin,   label: 'Local Roots', desc: 'Serving Redcross and beyond' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="rounded-2xl border border-neutral-surface bg-primary-warm p-5
                    text-center space-y-2.5 hover:border-gold/30 hover:shadow-md hover:shadow-gold/10 transition-all duration-200">
                    <div className="w-11 h-11 rounded-xl bg-gold/12 flex items-center justify-center mx-auto">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <p className="font-bold text-heading text-sm">{label}</p>
                    <p className="text-caption text-xs leading-snug">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Beliefs ──────────────────────────────────────── */}
        <section id="beliefs" className="py-24 px-4 bg-primary-warm border-y border-neutral-surface">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-gold text-[11px] font-bold tracking-[0.2em] uppercase mb-2">What We Believe</p>
              <h2 className="font-bold text-3xl sm:text-4xl text-heading">Our Core Beliefs</h2>
              <div className="w-14 h-0.5 bg-gold mx-auto mt-5 rounded-full" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'The Bible',      body: 'We believe the Bible is the inspired, authoritative word of God and our complete guide for faith and practice.' },
                { title: 'One God',        body: 'We believe in one God — Father, Son, and Holy Spirit — as revealed throughout the scriptures.' },
                { title: 'Jesus Christ',   body: 'We confess that Jesus Christ is the Son of God, our Lord and Saviour, who died and rose again for our redemption.' },
                { title: 'Baptism',        body: 'We believe in baptism by immersion for the remission of sins, as taught and practiced in the New Testament church.' },
                { title: "Lord's Supper",  body: "We observe the Lord's Supper every first day of the week, remembering Christ's sacrifice as He commanded." },
                { title: 'Simple Worship', body: 'Our worship is acappella, prayer-centred, and modelled on the New Testament pattern — no creeds but Christ.' },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-2xl border border-neutral-surface bg-background p-6 space-y-3
                  hover:border-gold/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-gold shrink-0" />
                    <h3 className="font-bold text-base text-heading">{title}</h3>
                  </div>
                  <p className="text-body text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Service Times ────────────────────────────────── */}
        <section id="services" className="py-24 px-4 bg-background">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gold text-[11px] font-bold tracking-[0.2em] uppercase mb-2">Join Us</p>
            <h2 className="font-bold text-3xl sm:text-4xl text-heading mb-4">Service Times</h2>
            <div className="w-14 h-0.5 bg-gold mx-auto mb-14 rounded-full" />
            <div className="space-y-3 text-left">
              {[
                { day: 'Sunday',    time: '07:00 – 09:00 AM', label: 'English Service' },
                { day: 'Sunday',    time: '09:30 – 11:00 AM', label: 'Chichewa Service' },
                { day: 'Sunday',    time: '08:00 – 11:00 AM', label: 'Combined Service (Last Sunday of Month)' },
                { day: 'Wednesday', time: '06:00 – 07:00 PM', label: 'Bible Study' },
              ].map(({ day, time, label }) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-neutral-surface
                  bg-primary-warm px-6 py-4 hover:border-gold/30 hover:bg-gold/5 transition-all duration-150">
                  <div>
                    <p className="font-bold text-heading">{label}</p>
                    <p className="text-caption text-sm">{day}</p>
                  </div>
                  <p className="font-bold text-lg text-gold tabular-nums">{time}</p>
                </div>
              ))}
            </div>
            <p className="text-caption text-sm mt-8 italic">All are welcome. Come as you are.</p>
          </div>
        </section>

        {/* ── Contact ──────────────────────────────────────── */}
        <section id="contact" className="py-24 px-4 bg-primary-deep text-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-gold text-[11px] font-bold tracking-[0.2em] uppercase mb-2">Get In Touch</p>
              <h2 className="font-bold text-3xl sm:text-4xl">Find Us</h2>
              <div className="w-14 h-0.5 bg-gold mx-auto mt-5 rounded-full" />
            </div>
            <div className="grid sm:grid-cols-3 gap-5 text-center">
              {[
                { icon: MapPin, label: 'Address', value: 'Redcross, Blantyre\nMalawi' },
                { icon: Phone,  label: 'Phone',   value: '+265 — — —' },
                { icon: Mail,   label: 'Social',  value: 'churchofchristatredcross\nFacebook · YouTube' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-7 space-y-3
                  hover:border-gold/30 hover:bg-gold/5 transition-all duration-200">
                  <div className="w-11 h-11 rounded-xl bg-gold/15 flex items-center justify-center mx-auto">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{label}</p>
                  <p className="text-white/85 text-sm leading-snug whitespace-pre-line font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-primary-deep border-t border-gold/15 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-gold/30">
            <Image src="/coc-logo.jpg" alt="COC" width={28} height={28} className="w-full h-full object-cover" />
          </div>
          <span className="text-white/50 text-sm font-medium">Church of Christ at Redcross</span>
        </div>
        <p className="text-white/25 text-xs">
          &copy; {new Date().getFullYear()} Church of Christ at Redcross. All rights reserved.
        </p>
      </footer>
    </div>
  );
}