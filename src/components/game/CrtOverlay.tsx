import React from 'react';
export function CrtOverlay() {
  return (
    <>
      <div className="crt-overlay fixed inset-0 z-50 pointer-events-none" />
      <div className="scanline" />
      <div className="fixed inset-0 pointer-events-none z-[60] bg-gradient-to-b from-transparent via-transparent to-black/20" />
      <div className="fixed inset-0 pointer-events-none z-[60] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
    </>
  );
}