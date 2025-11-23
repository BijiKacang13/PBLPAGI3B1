import Image from "next/image";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 py-2 md:py-3 px-3 md:px-6 bg-white shadow flex justify-between items-center">
    <div className="flex items-center gap-2 md:gap-3">

        <img
        src="/logo.png"
        alt="Logo Yayasan"
        width={70}
        height={70}
        className="object-contain md:w-18 md:h-18"
        />

        <div className="w-[2px] h-10 bg-[#1A3E85]"></div>


        <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1">
        <h1 className="text-3xl font-extrabold text-[#1A3E85] tracking-wide">
              SIA
        </h1>
        <p className="text-[10px] md:text-[10px] font-semibold text-[#1A3E85] tracking-wide leading-tight mt-1">
              <span className="block text-left">YAYASAN</span>
              <span className="block text-left">DARUSSALAM</span>
            </p>
        </div>
        </div>
    </div>

    <ProfileDropdown />
    </nav>
  );
}
