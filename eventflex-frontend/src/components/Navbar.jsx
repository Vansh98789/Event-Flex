import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import React from "react";
export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-900 text-white flex justify-between items-center shadow-lg">
      <Link to="/" className="text-2xl font-bold">EventFlex</Link>
      <ConnectButton />
    </nav>
  );
}
