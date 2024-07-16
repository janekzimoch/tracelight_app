import React from "react";
import Link from "next/link";

export default function Span({
  span,
}: {
  span: {
    title: string;
    description: string;
  };
}) {
  return (
    <div className="relative bg-white col-span-2 overflow-hidden border border-solid transition-transform duration-300 ease-in-out rounded-lg shadow-sm group hover:shadow-md ">
      <Link href="#" className="absolute inset-0 z-10" prefetch={false}>
        <span className="sr-only">View</span>
      </Link>
      <div className="p-4 bg-background">
        <h3 className="text-xl font-bold">{span.title}</h3>
        <p className="text-sm text-muted-foreground">{span.description}</p>
      </div>
    </div>
  );
}
