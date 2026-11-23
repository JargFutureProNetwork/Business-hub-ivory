import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Canvas Lab",
  description:
    "Interactive Business Model Canvas with a live feasibility score and an AI business-model diagnostic.",
};

export default function CanvasLayout({ children }: LayoutProps<"/canvas">) {
  return children;
}
