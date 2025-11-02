import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function InstructionsModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-[#E8E4F0]/50 text-[#4A4458] hover:bg-white hover:border-[#FF2D95] hover:shadow-md transition-all shadow-sm font-semibold"
        >
          <Info className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-[#E8E4F0]/50 shadow-2xl overflow-hidden" style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFE4E8]/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#F8F5FF]/30 rounded-full blur-3xl" />
        </div>
        
        <DialogHeader className="relative">
          <DialogTitle className="text-[#4A4458] text-xl font-bold">
            How to interact with your pet's room
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4 relative">
          <InstructionItem
            title="Left Click + Drag"
            description="Rotate the camera"
          />
          <InstructionItem
            title="Two‑finger Scroll / Mouse Wheel"
            description="Zoom in and out"
          />
          <InstructionItem
            title="Action Buttons"
            description="Use Feed, Play, Walk, and Pet buttons to interact with your pet"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for each instruction item
function InstructionItem({ title, description }) {
  return (
    <div className="group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FFF5F7] to-[#F8F5FF] border-2 border-[#FFE4E8]/60 hover:border-[#FF2D95]/40 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 relative overflow-hidden">
      {/* Subtle hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFE4E8]/10 to-[#F8F5FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Bullet point with enhanced styling */}
      <div className="relative">
        <div className="w-2 h-2 bg-[#FF2D95] rounded-full mt-2 flex-shrink-0 shadow-sm" />
        <div className="absolute inset-0 bg-[#FF2D95]/30 rounded-full blur-sm" />
      </div>
      
      <div className="relative flex-1">
        <p className="font-semibold text-[#4A4458] text-base mb-1">{title}</p>
        <p className="text-sm text-[#6B6B6B]">{description}</p>
      </div>
    </div>
  );
}

