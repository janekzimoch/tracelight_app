import React from "react";
import Link from "next/link";
import { SpanType } from "../page";

export default function Span({ span }: { span: SpanType }) {
  return (
    <div className="relative bg-white col-span-2 overflow-hidden border border-solid transition-transform duration-300 ease-in-out rounded-lg shadow-sm group hover:shadow-md ">
      <Link href="#" className="absolute inset-0 z-10" prefetch={false}>
        <span className="sr-only">View</span>
      </Link>
      <div className="p-4 bg-background">
        <h3 className="text-xl font-bold">{span.role}</h3>
        <p className="text-sm text-muted-foreground truncate">{span.content}</p>
      </div>
    </div>
  );
}
