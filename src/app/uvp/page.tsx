import type { Metadata } from "next";
import { ToolFrame } from "@/components/hub/ToolFrame";
import { TOOL_BY_SLUG } from "@/lib/tools";

const tool = TOOL_BY_SLUG["uvp"];

export const metadata: Metadata = { title: tool.name, description: tool.description };

export default function Page() {
  return <ToolFrame slug="uvp" />;
}
