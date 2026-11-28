import Image from "next/image";
import spbLogo from "@/public/spb-logo.png";

export function BrandMark({ className = "" }: { className?: string }) {
  return <Image src={spbLogo} alt="SPB" className={`brand-mark ${className}`} unoptimized />;
}
