import { Globe, BarChart3, Shield, Sparkles, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  return (
    <div className="hidden lg:flex flex-col w-16 bg-sidebar border-r border-sidebar-border items-center py-6 gap-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6"
      >
        <Shield className="w-5 h-5 text-white" />
      </motion.div>

      <NavItem icon={Globe} active label="Map" />
      <NavItem icon={BarChart3} label="Analytics" />
      <NavItem icon={Activity} label="Trends" />
      <NavItem icon={Sparkles} label="AI" />

      <div className="mt-auto">
        <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
          <span className="text-xs font-semibold text-sidebar-foreground">IR</span>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, active, label }) {
  return (
    <div // eslint-disable-line
      className={`relative group w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
        active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      }`}
    >
      <Icon className="w-[18px] h-[18px]" />
      <div className="absolute left-14 px-2 py-1 bg-foreground text-background text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    </div>
  );
}