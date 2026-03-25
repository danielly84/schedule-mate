import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/shared";
import { ArrowRight, Calendar, Scissors, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <Layout hideNav>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        
        {/* Background Image / Texture */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* landing page hero scenic barber shop interior */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          
          {/* Decorative blur orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] mix-blend-multiply" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-20 h-20 mb-8 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/20 rotate-3"
          >
            <Scissors className="w-10 h-10" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight leading-tight"
          >
            TrimTime
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-4 font-light"
          >
            A simple way to manage appointment requests.
          </motion.p>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="text-base text-muted-foreground/80 max-w-lg mb-12"
          >
            Clients request a time. You can accept, decline, or suggest a different one. No complicated calendars, just simple scheduling.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/book" className="w-full sm:w-auto block">
              <Button size="lg" className="w-full text-base group">
                <Calendar className="mr-2 w-5 h-5" />
                Book Appointment
                <ArrowRight className="ml-2 w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/dashboard" className="w-full sm:w-auto block">
              <Button size="lg" variant="outline" className="w-full text-base bg-white/50 backdrop-blur-sm border-2">
                Open Barber Dashboard
              </Button>
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full text-left"
          >
            {[
              { icon: Clock, title: "Request based", desc: "Clients don't book directly. They request a slot, you stay in control." },
              { icon: Calendar, title: "Easy scheduling", desc: "See your day at a glance without clunky calendar interfaces." },
              { icon: Scissors, title: "For Independents", desc: "Built specifically for independent barbers and stylists." }
            ].map((feature, i) => (
              <div key={i} className="glass p-6 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-4 text-foreground">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
