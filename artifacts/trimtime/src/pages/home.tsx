import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/shared";
import { ArrowRight, CalendarCheck, Sparkles, ShieldCheck, Clock3 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <Layout hideNav>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">

        {/* Background texture */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] mix-blend-multiply" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center">

          {/* Icon mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-10"
          >
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 rounded-[22px] bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/25">
                <CalendarCheck className="w-9 h-9" strokeWidth={1.75} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              </div>
            </div>
          </motion.div>

          {/* App name */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
            className="text-sm font-semibold uppercase tracking-widest text-primary/70 mb-4"
          >
            TrimTime
          </motion.p>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.15]"
          >
            Clients request a time.
            <br />
            <span className="text-primary">You choose what works.</span>
          </motion.h1>

          {/* Supporting lines */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: "easeOut" }}
            className="mb-12 space-y-2"
          >
            <p className="text-lg text-muted-foreground">
              Customers pick a service and send you a request.
            </p>
            <p className="text-lg text-muted-foreground">
              You accept, decline, or suggest a different time — it's that simple.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-5"
          >
            <Link href="/book" className="w-full sm:w-auto block">
              <Button size="lg" className="w-full text-base group px-8">
                Request an Appointment
                <ArrowRight className="ml-2 w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto block">
              <Button size="lg" variant="outline" className="w-full text-base bg-white/50 backdrop-blur-sm border-2 px-8">
                I'm the Barber →
              </Button>
            </Link>
          </motion.div>

          {/* Reassurance */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-sm text-muted-foreground/70"
          >
            No account needed · Takes less than a minute
          </motion.p>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full text-left"
          >
            {[
              {
                icon: ShieldCheck,
                title: "You're always in control",
                desc: "Clients can't book themselves in. Every request goes through you first.",
              },
              {
                icon: Clock3,
                title: "See your day clearly",
                desc: "All your requests and confirmed appointments in one easy place.",
              },
              {
                icon: CalendarCheck,
                title: "Built for independent barbers",
                desc: "No bloated software. Just what you actually need to run your schedule.",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm border border-border/40 p-6 rounded-2xl shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center mb-4 text-primary">
                  <feature.icon className="w-4.5 h-4.5" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-base mb-1.5 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
